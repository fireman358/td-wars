import type { EnemyKind, Vec } from './types';

export class Enemy {
  kind: EnemyKind;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  dist: number;
  speedBase: number;
  slowUntil = 0;
  slowFactor = 1;
  alive = true;
  reachedEnd = false;
  pos: Vec = { x: 0, y: 0 };
  hitFlash = 0;
  phase = Math.random() * Math.PI * 2;
  pathIndex = 0;

  constructor(kind: EnemyKind, hpScale: number, speedScale: number, startDist = 0) {
    this.kind = kind;
    this.maxHp = Math.round(kind.hp * hpScale);
    this.hp = this.maxHp;
    this.maxShield = kind.armor > 0 ? Math.round(this.maxHp * 0.15) : 0;
    this.shield = this.maxShield;
    this.speedBase = kind.speed * speedScale;
    this.dist = startDist;
  }

  get speed(): number {
    return this.speedBase * this.slowFactor;
  }

  takeDamage(dmg: number): number {
    let effective = Math.max(1, dmg - this.kind.armor);
    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, effective);
      this.shield -= absorbed;
      effective -= absorbed;
      if (effective <= 0) {
        this.hitFlash = 0.08;
        return 0;
      }
    }
    this.hp -= effective;
    this.hitFlash = 0.12;
    if (this.hp <= 0 && this.alive) {
      this.alive = false;
      return this.kind.bounty;
    }
    return 0;
  }
}
