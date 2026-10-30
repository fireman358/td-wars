import { ALL_WAVES, AUTO_WAVE_DELAY, EARLY_BONUS_RATIO, ENEMIES, PATH_WIDTH, SECTORS, START_CREDITS, START_LIVES, TOWERS } from './config';
import { loadMeta, saveMeta, type MetaState } from './meta';
import { Enemy } from './enemy';
import { buildPath, dist, distToPath, type PathGeom } from './geom';
import { Sfx } from './sfx';
import { Tower } from './tower';
import type { EnemyKindId, TargetMode, TowerKindId, Vec } from './types';

export interface Projectile {
  pos: Vec;
  target: Enemy | null;
  tower: Tower;
  damage: number;
  speed: number;
  splash: number;
  slowFactor: number;
  slowDuration: number;
  color: string;
}

export interface ChainArc {
  from: Vec;
  to: Vec;
  life: number;
}

export interface Effect {
  pos: Vec;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
}

export type GameEvent =
  | { type: 'credits' | 'lives' | 'wave' | 'speed' | 'buildbar' | 'info' | 'sector' }
  | { type: 'victory' }
  | { type: 'defeat' };

interface QueuedSpawn {
  kindId: EnemyKindId;
  at: number;
  hpScale: number;
  speedScale: number;
  pathIndex: number;
}

export declare function pointOnPublic(p: PathGeom, d: number): Vec;

export class Engine {
  credits = START_CREDITS;
  lives = START_LIVES;
  shield = 0;
  maxShield = 0;
  shieldRegenTimer = 0;
  waveIndex = -1;
  waveActive = false;
  speed = 1;
  running = true;
  time = 0;
  sectorIndex = 0;
  autoTimer = -1;
  sfx = new Sfx();

  towers: Tower[] = [];
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  arcs: ChainArc[] = [];
  effects: Effect[] = [];

  spawnQueue: QueuedSpawn[] = [];
  paths: PathGeom[] = [];
  meta: MetaState = loadMeta();
  saberPos: Vec = { x: -100, y: -100 };
  saberActive = false;
  saberEnergy = 100;
  saberMax = 100;
  saberCooldown = 0;
  metaDirty = false;

  onEvent: (e: GameEvent) => void = () => {};

  constructor() {
    this.credits += this.meta.perks.credits * 40;
    this.lives += this.meta.perks.lives * 2;
    this.saberMax = 100 * (1 + this.meta.perks.saber * 0.25);
    this.saberEnergy = this.saberMax;
    this.maxShield = this.meta.perks.shield * 3;
    this.shield = this.maxShield;
    this.loadSector(0);
  }

  jumpToSector(index: number) {
    if (index < 0 || index >= SECTORS.length) return;
    this.credits = Math.max(this.credits, START_CREDITS + [0, 500, 1000, 1600][index]);
    this.loadSector(index);
  }

  loadSector(index: number) {
    this.sectorIndex = index;
    this.paths = SECTORS[index].paths.map(p => buildPath(p));
    const removed = this.towers.filter(t =>
      this.paths.some(p => distToPath(p, t.pos) < PATH_WIDTH / 2 + 14)
    );
    for (const t of removed) {
      this.credits += t.totalSpent;
    }
    if (removed.length > 0) {
      this.towers = this.towers.filter(t => !removed.includes(t));
    }
    this.waveIndex = this.sectorStartWave(index) - 1;
    this.waveActive = false;
    this.spawnQueue = [];
    this.autoTimer = -1;
    this.emit({ type: 'sector' });
  }

  sectorStartWave(index: number): number {
    let n = 0;
    for (let i = 0; i < index; i++) n += SECTORS[i].waves.length;
    return n;
  }

  get currentWave() {
    return ALL_WAVES[this.waveIndex] ?? null;
  }

  get sector(): (typeof SECTORS)[number] {
    return SECTORS[this.sectorIndex];
  }

  get waveNumber(): number {
    return this.waveIndex + 1;
  }

  get totalWaves(): number {
    return ALL_WAVES.length;
  }

  emit(e: GameEvent) { this.onEvent(e); }

  canStartWave(): boolean {
    return !this.waveActive && this.waveIndex < ALL_WAVES.length - 1 && this.running;
  }

  startWave() {
    if (!this.canStartWave()) return;
    let earlyBonus = 0;
    if (this.autoTimer > 0) {
      earlyBonus = Math.ceil(this.autoTimer * EARLY_BONUS_RATIO * 4);
      this.credits += earlyBonus;
      this.autoTimer = -1;
    }
    this.waveIndex++;
    const wave = ALL_WAVES[this.waveIndex];
    const entries = Math.min(wave.entries, this.paths.length);
    this.spawnQueue = [];
    for (const grp of wave.groups) {
      for (let i = 0; i < grp.count; i++) {
        const at = this.time + grp.delay + i * grp.interval;
        this.spawnQueue.push({
          kindId: grp.id,
          at,
          hpScale: grp.hpScale,
          speedScale: grp.speedScale,
          pathIndex: i % entries,
        });
      }
    }
    this.spawnQueue.sort((a, b) => a.at - b.at);
    this.waveActive = true;
    this.sfx.waveStart();
    this.emit({ type: 'credits' });
    this.emit({ type: 'wave' });
  }

  private spawn(s: QueuedSpawn) {
    const sc = this.waveScaling();
    const e = new Enemy(ENEMIES[s.kindId], s.hpScale * sc.hp, s.speedScale * sc.speed);
    e.pathIndex = s.pathIndex;
    this.enemies.push(e);
  }

  private waveScaling(): { hp: number; speed: number } {
    const w = Math.max(0, this.waveIndex);
    return { hp: 1 + w * 0.08, speed: 1 + Math.min(0.5, w * 0.015) };
  }

  isUnlocked(kindId: TowerKindId): boolean {
    return this.sectorIndex >= TOWERS[kindId].unlockSector;
  }

  placeTower(kindId: TowerKindId, pos: Vec): boolean {
    const kind = TOWERS[kindId];
    const cost = kind.levels[0].cost;
    if (!this.isUnlocked(kindId) || this.credits < cost) {
      this.sfx.error();
      return false;
    }
    for (const p of this.paths) {
      if (distToPath(p, pos) < PATH_WIDTH / 2 + 14) {
        this.sfx.error();
        return false;
      }
    }
    if (this.towers.some(t => dist(t.pos, pos) < 30)) {
      this.sfx.error();
      return false;
    }
    const t = new Tower(kindId, kind, { x: Math.round(pos.x), y: Math.round(pos.y) });
    this.towers.push(t);
    this.credits -= cost;
    this.sfx.build();
    this.emit({ type: 'credits' });
    this.emit({ type: 'buildbar' });
    return true;
  }

  buySpec(t: Tower, index: number): boolean {
    if (!t.canSpec()) return false;
    t.specIndex = index;
    t.flash = 0.4;
    this.sfx.build();
    this.emit({ type: 'info' });
    return true;
  }

  upgradeTower(t: Tower): boolean {
    const cost = t.upgradeCost();
    if (!t.canUpgrade() || this.credits < cost) {
      this.sfx.error();
      return false;
    }
    this.credits -= cost;
    t.totalSpent += cost;
    t.level++;
    t.flash = 0.3;
    this.sfx.build();
    this.emit({ type: 'credits' });
    this.emit({ type: 'info' });
    this.emit({ type: 'buildbar' });
    return true;
  }

  sellTower(t: Tower) {
    const idx = this.towers.indexOf(t);
    if (idx === -1) return;
    this.credits += t.sellValue();
    this.towers.splice(idx, 1);
    this.sfx.build();
    this.emit({ type: 'credits' });
    this.emit({ type: 'info' });
    this.emit({ type: 'buildbar' });
  }

  towerAt(pos: Vec): Tower | null {
    return this.towers.find(t => dist(t.pos, pos) < 16) ?? null;
  }

  toggleSpeed() {
    this.speed = this.speed >= 5 ? 1 : this.speed + 1;
    this.emit({ type: 'speed' });
  }

  toggleSound() {
    this.sfx.enabled = !this.sfx.enabled;
  }

  updateSaber(d: number) {
    if (this.saberActive && this.saberEnergy > 0) {
      this.saberEnergy = Math.max(0, this.saberEnergy - d * 22);
      for (const en of this.enemies) {
        if (!en.alive) continue;
        if (dist(this.saberPos, en.pos) < 22 + en.kind.radius) {
          const earned = en.takeDamage(d * 95);
          en.hitFlash = 0.1;
          if (earned > 0) {
            this.credits += earned;
            this.emit({ type: 'credits' });
            this.sfx.boom();
          }
        }
      }
    } else if (!this.saberActive) {
      this.saberEnergy = Math.min(this.saberMax, this.saberEnergy + d * 9);
    }
  }

  awardMeta(): void {
    const reached = this.waveNumber;
    const gained = Math.floor(reached / 2) + (this.lives > 0 ? 10 : 0);
    this.meta.points += gained;
    if (reached > this.meta.bestWave) this.meta.bestWave = reached;
    saveMeta(this.meta);
  }

  update(dt: number) {
    if (!this.running) return;
    const d = dt * this.speed;
    this.time += d;
    this.updateSaber(d);
    if (this.maxShield > 0 && this.shield < this.maxShield) {
      this.shieldRegenTimer += d;
      if (this.shieldRegenTimer >= 12) {
        this.shieldRegenTimer = 0;
        this.shield = Math.min(this.maxShield, this.shield + 1);
      }
    }

    if (this.autoTimer >= 0) {
      this.autoTimer -= d;
      if (this.autoTimer <= 0) {
        this.autoTimer = -1;
        this.startWave();
      }
    }

    for (let i = this.spawnQueue.length - 1; i >= 0; i--) {
      const s = this.spawnQueue[i];
      if (this.time >= s.at) {
        this.spawn(s);
        this.spawnQueue.splice(i, 1);
      }
    }

    this.updateEnemies(d);
    this.updateTowers(d);
    this.updateProjectiles(d);
    this.updateEffects(d);

    if (this.waveActive && this.spawnQueue.length === 0 && this.enemies.length === 0) {
      this.waveActive = false;
      const wave = ALL_WAVES[this.waveIndex];
      this.credits += wave.reward;
      this.emit({ type: 'credits' });
      this.emit({ type: 'wave' });
      this.emit({ type: 'buildbar' });
      const sectorEnd = this.sectorStartWave(this.sectorIndex + 1) - 1;
      if (this.waveIndex >= sectorEnd) {
        if (this.sectorIndex >= SECTORS.length - 1) {
          this.running = false;
          this.awardMeta();
          this.sfx.victory();
          this.emit({ type: 'victory' });
        } else {
          this.loadSector(this.sectorIndex + 1);
          this.emit({ type: 'credits' });
          this.emit({ type: 'wave' });
          this.emit({ type: 'buildbar' });
        }
      } else {
        this.autoTimer = AUTO_WAVE_DELAY;
      }
    }
  }

  private updateEnemies(d: number) {
    const healers = this.enemies.filter(e => e.alive && e.kind.healAura);
    for (const e of this.enemies) {
      if (!e.alive) continue;
      e.dist += e.speed * d;
      const path = this.paths[e.pathIndex];
      e.pos = this.pointOn(path, e.dist);
      if (e.slowUntil > 0) {
        e.slowUntil -= d;
        if (e.slowUntil <= 0) e.slowFactor = 1;
      }
      if (e.hitFlash > 0) e.hitFlash -= d;
      for (const h of healers) {
        if (h !== e && dist(h.pos, e.pos) < 90) {
          e.hp = Math.min(e.maxHp, e.hp + (h.kind.healAura ?? 0) * d);
        }
      }
      if (e.dist >= path.total) {
        e.alive = false;
        e.reachedEnd = true;
        if (this.shield > 0) {
          this.shield = Math.max(0, this.shield - e.kind.leak);
        } else {
          this.lives -= e.kind.leak;
        }
        this.sfx.leak();
        this.emit({ type: 'lives' });
        if (this.lives <= 0 && this.running) {
          this.running = false;
          this.awardMeta();
          this.sfx.defeat();
          this.emit({ type: 'defeat' });
        }
      }
    }
    this.enemies = this.enemies.filter(e => e.alive);
  }

  pointOnPublic(p: PathGeom, dd: number): Vec {
    return this.pointOn(p, dd);
  }

  private pointOn(p: PathGeom, dd: number): Vec {
    const t = Math.max(0, Math.min(p.total, dd));
    for (let i = 0; i < p.cumLen.length - 1; i++) {
      if (t <= p.cumLen[i + 1]) {
        const s = t - p.cumLen[i];
        return { x: p.pts[i].x + p.dirs[i].x * s, y: p.pts[i].y + p.dirs[i].y * s };
      }
    }
    const last = p.pts[p.pts.length - 1];
    return { x: last.x, y: last.y };
  }

  private updateTowers(d: number) {
    for (const t of this.towers) {
      if (t.flash > 0) t.flash -= d;
      if (t.kind.kind === 'income') {
        if (this.waveActive) {
          t.cooldown -= d;
          if (t.cooldown <= 0) {
            t.cooldown = 1;
            const inc = t.stats.income ?? 0;
            if (inc > 0) {
              this.credits += inc;
              this.emit({ type: 'credits' });
              t.flash = 0.2;
            }
          }
        }
        continue;
      }
      t.cooldown -= d;
      const target = this.pickTarget(t);
      if (target) {
        t.angle = Math.atan2(target.pos.y - t.pos.y, target.pos.x - t.pos.x);
        if (t.cooldown <= 0) {
          t.cooldown = 1 / t.stats.fireRate;
          t.flash = Math.max(t.flash, 0.08);
          this.fire(t, target);
        }
      }
    }
  }

  private effRange(t: Tower): number {
    let r = t.stats.range;
    let adjacent = false;
    for (const o of this.towers) {
      if (o !== t && o.kind.kind !== 'income' && o.id !== t.id && dist(o.pos, t.pos) < 46) {
        adjacent = true;
        break;
      }
    }
    if (adjacent) r *= 1.1;
    return r;
  }

  private pickTarget(t: Tower): Enemy | null {
    let best: Enemy | null = null;
    let bestScore = Infinity;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (e.kind.cloak && t.id !== 'ion' && t.id !== 'tesla' && Math.random() > 0.35) {
        continue;
      }
      const dd = dist(t.pos, e.pos);
      if (dd > this.effRange(t)) continue;
      let score: number;
      switch (t.targetMode) {
        case 'close': score = dd; break;
        case 'fast': score = -e.speed; break;
        case 'strong': score = -e.hp; break;
        default: score = -e.dist;
      }
      if (score < bestScore) {
        best = e;
        bestScore = score;
      }
    }
    return best;
  }

  cycleTargetMode(t: Tower): TargetMode {
    const order: TargetMode[] = ['first', 'close', 'fast', 'strong'];
    t.targetMode = order[(order.indexOf(t.targetMode) + 1) % order.length];
    return t.targetMode;
  }

  private fire(t: Tower, target: Enemy) {
    const s = t.stats;
    if (t.kind.kind === 'chain') {
      const hit: Enemy[] = [target];
      let current = target;
      for (let i = 1; i < s.chainTargets; i++) {
        let next: Enemy | null = null;
        let nd = Infinity;
        for (const e of this.enemies) {
          if (!e.alive || hit.includes(e)) continue;
          const dd = dist(current.pos, e.pos);
          if (dd < s.splashRadius && dd < nd) {
            next = e;
            nd = dd;
          }
        }
        if (!next) break;
        hit.push(next);
        current = next;
      }
      let from: Vec = t.pos;
      let dmg = s.damage;
      for (const e of hit) {
        this.arcs.push({ from: { ...from }, to: { ...e.pos }, life: 0.12 });
        this.damage(e, dmg);
        from = e.pos;
        dmg *= 0.8;
      }
      this.sfx.shoot();
    } else {
      this.projectiles.push({
        pos: { ...t.pos },
        target,
        tower: t,
        damage: s.damage,
        speed: s.projectileSpeed,
        splash: s.splashRadius,
        slowFactor: s.slowFactor,
        slowDuration: s.slowDuration,
        color: t.kind.accent,
      });
      if (t.id === 'laser' || t.id === 'rail') this.sfx.laser();
      else this.sfx.shoot();
    }
  }

  private damage(e: Enemy, dmg: number): number {
    const earned = e.takeDamage(dmg);
    if (earned > 0) {
      this.credits += earned;
      this.emit({ type: 'credits' });
      this.sfx.boom();
      this.effects.push({ pos: { ...e.pos }, radius: e.kind.radius * 2, life: 0.3, maxLife: 0.3, color: '#ffd23f' });
    }
    return earned;
  }

  private updateProjectiles(d: number) {
    for (const p of this.projectiles) {
      if (!p.target || !p.target.alive) {
        p.target = this.nearestEnemy(p.pos, 60);
        if (!p.target) {
          p.pos.x += p.speed * d;
          continue;
        }
      }
      const t = p.target;
      const dx = t.pos.x - p.pos.x;
      const dy = t.pos.y - p.pos.y;
      const dd = Math.hypot(dx, dy);
      const step = p.speed * d;
      if (dd <= step + 6) {
        this.impact(p, t);
        p.speed = -1;
      } else {
        p.pos.x += (dx / dd) * step;
        p.pos.y += (dy / dd) * step;
      }
    }
    this.projectiles = this.projectiles.filter(p => p.speed > 0);
  }

  private nearestEnemy(pos: Vec, maxDist: number): Enemy | null {
    let best: Enemy | null = null;
    let bd = maxDist;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const dd = dist(pos, e.pos);
      if (dd < bd) {
        best = e;
        bd = dd;
      }
    }
    return best;
  }

  private impact(p: Projectile, t: Enemy) {
    if (p.splash > 0) {
      for (const e of this.enemies) {
        if (!e.alive) continue;
        const dd = dist(p.pos, e.pos);
        if (dd <= p.splash) {
          this.damage(e, p.damage);
          if (p.slowDuration > 0) {
            e.slowFactor = Math.min(e.slowFactor, p.slowFactor);
            e.slowUntil = Math.max(e.slowUntil, p.slowDuration);
          }
        }
      }
      this.effects.push({ pos: { ...p.pos }, radius: p.splash, life: 0.25, maxLife: 0.25, color: p.color });
    } else {
      this.damage(t, p.damage);
      if (p.slowDuration > 0) {
        t.slowFactor = Math.min(t.slowFactor, p.slowFactor);
        t.slowUntil = Math.max(t.slowUntil, p.slowDuration);
      }
      this.effects.push({ pos: { ...p.pos }, radius: 10, life: 0.15, maxLife: 0.15, color: p.color });
    }
  }

  private updateEffects(d: number) {
    for (const a of this.arcs) a.life -= d;
    this.arcs = this.arcs.filter(a => a.life > 0);
    for (const e of this.effects) e.life -= d;
    this.effects = this.effects.filter(e => e.life > 0);
  }
}
