import { GRID_H, GRID_W, PATH_WIDTH, SECTORS } from './game/config';
import type { Engine } from './game/engine';
import type { Enemy } from './game/enemy';
import type { Tower } from './game/tower';
import type { Vec } from './game/types';

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

interface Flake {
  x: number;
  y: number;
  r: number;
  vy: number;
  drift: number;
}

export class Renderer {
  ctx: CanvasRenderingContext2D;
  selectedTower: Tower | null = null;
  buildPreview: { kindId: string; valid: boolean } | null = null;
  mouse: Vec = { x: -100, y: -100 };
  hyperT = 0;
  private stars: Star[] = [];
  private flakes: Flake[] = [];
  private t = 0;

  constructor(canvas: HTMLCanvasElement, private engine: Engine) {
    this.ctx = canvas.getContext('2d')!;
    for (let i = 0; i < 90; i++) {
      this.stars.push({
        x: Math.random() * GRID_W,
        y: Math.random() * GRID_H,
        r: Math.random() * 1.3 + 0.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 2,
      });
    }
    for (let i = 0; i < 60; i++) {
      this.flakes.push({
        x: Math.random() * GRID_W,
        y: Math.random() * GRID_H,
        r: Math.random() * 1.6 + 0.6,
        vy: 12 + Math.random() * 28,
        drift: Math.random() * 20 - 10,
      });
    }
  }

  draw(dt: number) {
    this.t += dt;
    if (this.hyperT > 0) this.hyperT -= dt;
    const ctx = this.ctx;
    this.drawTheme(ctx);
    this.drawPaths(ctx);
    this.drawRangePreview(ctx);
    for (const t of this.engine.towers) this.drawTower(ctx, t);
    for (const e of this.engine.enemies) this.drawEnemy(ctx, e);
    this.drawProjectiles(ctx);
    this.drawArcs(ctx);
    this.drawEffects(ctx);
    if (this.selectedTower) this.drawSelection(ctx);
    this.drawPortals(ctx);
    if (this.hyperT > 0) this.drawHyperspace(ctx, dt);
  }

  private theme(): string {
    return SECTORS[this.engine.sectorIndex].theme;
  }

  private drawTheme(ctx: CanvasRenderingContext2D) {
    switch (this.theme()) {
      case 'desert': this.drawDesert(ctx); break;
      case 'ice': this.drawIce(ctx); break;
      case 'forest': this.drawForest(ctx); break;
      case 'city': this.drawCity(ctx); break;
    }
  }

  private drawStars(ctx: CanvasRenderingContext2D, alpha = 1) {
    for (const s of this.stars) {
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(this.t * s.speed + s.phase));
      ctx.globalAlpha = tw * alpha;
      ctx.fillStyle = '#dce8ff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawDesert(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, 0, 0, GRID_H);
    g.addColorStop(0, '#2b1a3f');
    g.addColorStop(0.45, '#8a4a2f');
    g.addColorStop(0.7, '#d98e4a');
    g.addColorStop(1, '#e8b36a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, GRID_W, GRID_H);
    this.drawStars(ctx, 0.5);
    const s1 = ctx.createRadialGradient(700, 110, 5, 700, 110, 60);
    s1.addColorStop(0, 'rgba(255, 240, 190, 0.95)');
    s1.addColorStop(1, 'rgba(255, 240, 190, 0)');
    ctx.fillStyle = s1;
    ctx.beginPath();
    ctx.arc(700, 110, 60, 0, Math.PI * 2);
    ctx.fill();
    const s2 = ctx.createRadialGradient(770, 160, 4, 770, 160, 40);
    s2.addColorStop(0, 'rgba(255, 190, 120, 0.9)');
    s2.addColorStop(1, 'rgba(255, 190, 120, 0)');
    ctx.fillStyle = s2;
    ctx.beginPath();
    ctx.arc(770, 160, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(160, 90, 40, 0.5)';
    ctx.beginPath();
    ctx.moveTo(0, 470);
    ctx.quadraticCurveTo(180, 400, 380, 480);
    ctx.quadraticCurveTo(560, 540, 760, 470);
    ctx.lineTo(GRID_W, 540);
    ctx.lineTo(0, 540);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(120, 65, 30, 0.45)';
    ctx.beginPath();
    ctx.moveTo(0, 510);
    ctx.quadraticCurveTo(240, 460, 480, 520);
    ctx.quadraticCurveTo(720, 560, GRID_W, 505);
    ctx.lineTo(GRID_W, 540);
    ctx.lineTo(0, 540);
    ctx.closePath();
    ctx.fill();
  }

  private drawIce(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, 0, 0, GRID_H);
    g.addColorStop(0, '#0a1830');
    g.addColorStop(0.5, '#1e3a5f');
    g.addColorStop(1, '#7a9cbf');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, GRID_W, GRID_H);
    this.drawStars(ctx, 0.6);
    const aur = ctx.createLinearGradient(0, 0, 0, 220);
    aur.addColorStop(0, 'rgba(100, 220, 180, 0)');
    aur.addColorStop(0.6, 'rgba(100, 220, 180, 0.12)');
    aur.addColorStop(1, 'rgba(100, 220, 180, 0)');
    ctx.fillStyle = aur;
    ctx.fillRect(0, 0, GRID_W, 240);
    ctx.fillStyle = 'rgba(230, 240, 250, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, 460);
    ctx.quadraticCurveTo(200, 420, 420, 470);
    ctx.quadraticCurveTo(650, 515, 880, 455);
    ctx.lineTo(GRID_W, 540);
    ctx.lineTo(0, 540);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(180, 205, 225, 0.6)';
    for (const [bx, bh] of [[80, 60], [300, 42], [620, 66], [850, 50]] as const) {
      ctx.beginPath();
      ctx.moveTo(bx - 30, 470);
      ctx.lineTo(bx, 470 - bh);
      ctx.lineTo(bx + 30, 470);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (const f of this.flakes) {
      f.y += f.vy * 0.016;
      f.x += Math.sin(this.t + f.drift) * 0.3;
      if (f.y > GRID_H) f.y = -4;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawForest(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, 0, 0, GRID_H);
    g.addColorStop(0, '#0a1f14');
    g.addColorStop(0.6, '#14381f');
    g.addColorStop(1, '#1e4a2a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, GRID_W, GRID_H);
    const glow = ctx.createRadialGradient(480, 80, 20, 480, 80, 400);
    glow.addColorStop(0, 'rgba(180, 220, 130, 0.15)');
    glow.addColorStop(1, 'rgba(180, 220, 130, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, GRID_W, GRID_H);
    this.drawStars(ctx, 0.25);
    ctx.fillStyle = 'rgba(20, 45, 26, 0.9)';
    for (const [tx, tw] of [[60, 46], [180, 60], [330, 40], [700, 55], [860, 48], [940, 62]] as const) {
      ctx.beginPath();
      ctx.moveTo(tx - tw / 2, GRID_H);
      ctx.lineTo(tx - tw / 6, GRID_H * 0.25);
      ctx.lineTo(tx + tw / 6, GRID_H * 0.25);
      ctx.lineTo(tx + tw / 2, GRID_H);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(60, 110, 60, 0.5)';
    for (const [cx, cy, r] of [[100, 60, 50], [250, 40, 65], [820, 55, 58], [500, 30, 40]] as const) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawCity(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, 0, 0, GRID_H);
    g.addColorStop(0, '#05070f');
    g.addColorStop(0.55, '#0c1226');
    g.addColorStop(1, '#1a2340');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, GRID_W, GRID_H);
    this.drawStars(ctx, 0.9);
    const neb = ctx.createRadialGradient(200, 100, 10, 200, 100, 260);
    neb.addColorStop(0, 'rgba(90, 40, 160, 0.14)');
    neb.addColorStop(1, 'rgba(90, 40, 160, 0)');
    ctx.fillStyle = neb;
    ctx.fillRect(0, 0, GRID_W, GRID_H);
    for (let i = 0; i < 18; i++) {
      const bw = 34 + ((i * 53) % 50);
      const bh = 90 + ((i * 137) % 200);
      const bx = (i * 61) % (GRID_W + 40) - 20;
      ctx.fillStyle = i % 2 ? '#0b1020' : '#0e1530';
      ctx.fillRect(bx, GRID_H - bh, bw, bh);
      ctx.fillStyle = 'rgba(255, 220, 120, 0.75)';
      for (let wy = GRID_H - bh + 10; wy < GRID_H - 14; wy += 16) {
        for (let wx = bx + 6; wx < bx + bw - 6; wx += 12) {
          if ((wx * 7 + wy * 13) % 5 < 2) {
            ctx.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(this.t * 0.8 + wx + wy));
            ctx.fillRect(wx, wy, 3, 4);
          }
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  private drawHyperspace(ctx: CanvasRenderingContext2D, dt: number) {
    const k = Math.min(1, this.hyperT / 0.35);
    const cx = GRID_W / 2;
    const cy = GRID_H / 2;
    ctx.fillStyle = `rgba(2, 4, 12, ${0.85 * k})`;
    ctx.fillRect(0, 0, GRID_W, GRID_H);
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < 70; i++) {
      const a = (i * 137.5 * Math.PI) / 180;
      const len = 40 + ((i * 31) % 90) * k;
      const r0 = 30 + ((i * 17) % 120) * (1 - k * 0.3);
      ctx.strokeStyle = `rgba(200, 225, 255, ${0.35 + 0.5 * k})`;
      ctx.lineWidth = 1 + k;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      ctx.lineTo(Math.cos(a) * (r0 + len), Math.sin(a) * (r0 + len));
      ctx.stroke();
    }
    ctx.restore();
    void dt;
  }

  private drawPaths(ctx: CanvasRenderingContext2D) {
    const pts = SECTORS[this.engine.sectorIndex].paths;
    for (const p of pts) this.drawPath(ctx, p);
  }

  private drawPath(ctx: CanvasRenderingContext2D, pts: Vec[]) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(30, 35, 50, 0.55)';
    ctx.lineWidth = PATH_WIDTH + 10;
    this.stroke(ctx, pts);
    ctx.strokeStyle = '#131a2e';
    ctx.lineWidth = PATH_WIDTH;
    this.stroke(ctx, pts);
    ctx.strokeStyle = 'rgba(150, 190, 255, 0.16)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 12]);
    this.stroke(ctx, pts);
    ctx.setLineDash([]);
  }

  private stroke(ctx: CanvasRenderingContext2D, pts: Vec[]) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  }

  private drawPortals(ctx: CanvasRenderingContext2D) {
    const pts = SECTORS[this.engine.sectorIndex].paths;
    const t = this.t;
    pts.forEach((p) => {
      const start = p[0];
      const x = start.x < 0 ? 12 : start.x;
      const y = start.y;
      const pulse = 0.5 + 0.5 * Math.sin(t * 3);
      ctx.strokeStyle = `rgba(255, 60, 60, ${0.35 + pulse * 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 14 + pulse * 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(255, 60, 60, ${0.12 + pulse * 0.15})`;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
    });
    const last = pts[0];
    const end = last[last.length - 1];
    const pulse = 0.5 + 0.5 * Math.sin(t * 3);
    ctx.strokeStyle = `rgba(255, 210, 63, ${0.4 + pulse * 0.4})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(Math.min(end.x, GRID_W - 8), end.y, 10 + pulse * 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.arc(Math.min(end.x, GRID_W - 8), end.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawRangePreview(ctx: CanvasRenderingContext2D) {
    if (!this.buildPreview) return;
    ctx.fillStyle = this.buildPreview.valid ? 'rgba(110, 224, 138, 0.12)' : 'rgba(255, 80, 80, 0.12)';
    ctx.strokeStyle = this.buildPreview.valid ? 'rgba(110, 224, 138, 0.5)' : 'rgba(255, 80, 80, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.mouse.x, this.mouse.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.mouse.x, this.mouse.y, 110, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawSelection(ctx: CanvasRenderingContext2D) {
    const t = this.selectedTower!;
    ctx.strokeStyle = 'rgba(255, 210, 63, 0.5)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(t.pos.x, t.pos.y, t.stats.range, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private drawTower(ctx: CanvasRenderingContext2D, t: Tower) {
    const { x, y } = t.pos;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#0d1526';
    ctx.strokeStyle = 'rgba(90, 130, 190, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(70, 100, 150, 0.25)';
    ctx.fillRect(-11, 10, 22, 4);

    ctx.rotate(t.angle);
    const c = t.flash > 0 ? '#ffffff' : t.kind.color;
    switch (t.id) {
      case 'plasma':
        ctx.fillStyle = '#2b3a52';
        ctx.fillRect(0, -5, 20, 10);
        ctx.fillStyle = c;
        ctx.fillRect(16, -2.5, 6, 5);
        ctx.fillStyle = '#3a4c68';
        ctx.fillRect(2, -8, 6, 4);
        break;
      case 'laser':
        ctx.fillStyle = '#3a2430';
        ctx.fillRect(-2, -6, 24, 12);
        ctx.fillStyle = c;
        ctx.fillRect(18, -2, 8, 4);
        ctx.fillStyle = '#583a4a';
        ctx.fillRect(4, -10, 8, 5);
        break;
      case 'ion':
        ctx.fillStyle = '#1f3a3f';
        ctx.beginPath();
        ctx.arc(8, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(16, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = c;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(8, 0, 11, -0.8, 0.8);
        ctx.stroke();
        break;
      case 'missile':
        ctx.fillStyle = '#3a2f1c';
        ctx.fillRect(-4, -10, 16, 20);
        ctx.fillStyle = c;
        for (const dy of [-6, 0, 6]) {
          ctx.fillRect(8, dy - 1.5, 10, 3);
        }
        break;
      case 'tesla':
        ctx.fillStyle = '#2c1f3a';
        ctx.beginPath();
        ctx.arc(4, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(4, 0, 6 + i * 3, this.t * 4 + i, this.t * 4 + i + 2);
          ctx.stroke();
        }
        break;
      case 'tractor':
        ctx.fillStyle = '#3a3220';
        ctx.fillRect(-2, -7, 22, 14);
        ctx.strokeStyle = c;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(14 + i * 5, -4 + i * 2);
          ctx.lineTo(24 + i * 5, -1 + i * 2);
          ctx.stroke();
        }
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(10, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'axial':
        ctx.fillStyle = '#1e2a1a';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2c3a24';
        ctx.fillRect(6, -11, 18, 22);
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(22, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(216, 255, 176, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 8, this.t * 2, this.t * 2 + 2);
        ctx.stroke();
        break;
      case 'rail':
        ctx.fillStyle = '#33363c';
        ctx.fillRect(-2, -8, 26, 16);
        ctx.fillStyle = c;
        ctx.fillRect(20, -2, 8, 4);
        ctx.strokeStyle = 'rgba(191, 230, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(2, -6);
        ctx.lineTo(22, -6);
        ctx.moveTo(2, 6);
        ctx.lineTo(22, 6);
        ctx.stroke();
        break;
    }
    ctx.restore();

    if (t.level > 0) {
      for (let i = 0; i <= t.level; i++) {
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath();
        const a = -Math.PI / 2 + (i - 1) * 0.5;
        ctx.arc(x + Math.cos(a) * 19, y + Math.sin(a) * 19, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy) {
    const { x, y } = e.pos;
    const path = this.engine.paths[e.pathIndex];
    const ahead = this.engine.pointOnPublic(path, e.dist + 6);
    const dir = Math.atan2(ahead.y - y, ahead.x - x);
    ctx.save();
    ctx.translate(x, y);
    if (e.kind.cloak) ctx.globalAlpha = 0.5;
    ctx.rotate(dir);
    const body = e.hitFlash > 0 ? '#ffffff' : e.kind.color;
    const r = e.kind.radius;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 4;
    switch (e.kind.shape) {
      case 'drone':
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.arc(r * 0.55, 0, r * 0.22, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'soldier':
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.75, r * 0.95, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1c1e26';
        ctx.beginPath();
        ctx.ellipse(r * 0.28, 0, r * 0.32, r * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = body;
        ctx.fillRect(-r * 0.95, -r * 0.5, r * 0.5, r);
        ctx.fillStyle = '#8c8c99';
        ctx.fillRect(r * 0.1, -r * 0.9, r * 0.9, r * 0.22);
        break;
      case 'wing': {
        ctx.fillStyle = '#2f3640';
        ctx.beginPath();
        ctx.moveTo(r * 1.6, 0);
        ctx.lineTo(r * 0.4, -r * 0.35);
        ctx.lineTo(r * 0.4, r * 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = body;
        ctx.fillRect(-r * 0.2, -r * 0.55, r * 0.75, r * 1.1);
        ctx.fillStyle = '#3a4150';
        ctx.beginPath();
        ctx.moveTo(-r * 0.2, -r * 0.5);
        ctx.lineTo(-r * 1.3, -r * 1.2);
        ctx.lineTo(-r * 1.0, -r * 0.35);
        ctx.closePath();
        ctx.moveTo(-r * 0.2, r * 0.5);
        ctx.lineTo(-r * 1.3, r * 1.2);
        ctx.lineTo(-r * 1.0, r * 0.35);
        ctx.closePath();
        ctx.fill();
        const glow = 0.6 + 0.4 * Math.sin(this.t * 12 + e.phase);
        ctx.fillStyle = `rgba(120, 200, 255, ${glow})`;
        ctx.beginPath();
        ctx.arc(-r * 1.15, 0, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'tank':
        ctx.fillStyle = '#6e5136';
        ctx.fillRect(-r, -r * 0.45, r * 2, r * 0.9);
        ctx.fillStyle = body;
        ctx.fillRect(-r * 0.8, -r * 0.8, r * 1.6, r * 0.5);
        ctx.fillStyle = '#3d2c1a';
        ctx.fillRect(-r * 0.35, -r * 0.75, r * 1.5, r * 0.32);
        ctx.fillStyle = '#2c2013';
        ctx.beginPath();
        ctx.arc(-r * 0.6, r * 0.4, r * 0.32, 0, Math.PI * 2);
        ctx.arc(0, r * 0.45, r * 0.32, 0, Math.PI * 2);
        ctx.arc(r * 0.6, r * 0.4, r * 0.32, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'walker': {
        const step = Math.sin(this.t * 5 + e.phase) * r * 0.25;
        ctx.fillStyle = '#3d4450';
        for (const [lx, ly] of [[-r * 0.45, r * 0.35], [r * 0.45, r * 0.35]] as const) {
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(step * (lx > 0 ? 1 : -1) * 0.2);
          ctx.fillRect(-r * 0.12, 0, r * 0.24, r * 0.75);
          ctx.fillRect(-r * 0.3, r * 0.7, r * 0.6, r * 0.14);
          ctx.restore();
        }
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, -r * 0.9);
        ctx.lineTo(r * 0.7, -r * 0.6);
        ctx.lineTo(r * 0.8, r * 0.3);
        ctx.lineTo(-r * 0.5, r * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#20242c';
        ctx.beginPath();
        ctx.arc(r * 0.35, -r * 0.35, r * 0.18, 0, Math.PI * 2);
        ctx.arc(r * 0.05, -r * 0.45, r * 0.14, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'saucer':
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.25, r * 0.5, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'wedge':
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.moveTo(r * 1.3, -r * 0.5);
        ctx.lineTo(r * 1.3, r * 0.5);
        ctx.lineTo(-r * 1.5, r * 0.85);
        ctx.lineTo(-r * 1.5, -r * 0.85);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#9aa3c9';
        ctx.fillRect(-r * 1.5, -r * 0.3, r * 2.2, r * 0.6);
        ctx.fillStyle = 'rgba(120, 160, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(-r * 1.45, 0, r * 0.22, 0, Math.PI * 2);
        ctx.fill();
        for (const bridge of [-r * 0.55, -r * 0.05, r * 0.45]) {
          ctx.fillStyle = '#2b2f4a';
          ctx.fillRect(bridge, -r * 0.9, r * 0.3, r * 1.8);
        }
        break;
    }
    ctx.restore();
    ctx.shadowBlur = 0;

    if (e.kind.boss) {
      const glow = 0.4 + 0.3 * Math.sin(this.t * 2);
      ctx.strokeStyle = `rgba(214, 214, 255, ${glow})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.1, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (e.hp < e.maxHp) {
      const w = e.kind.radius * 2.6;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(x - w / 2, y - e.kind.radius - 12, w, 4);
      const pct = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = pct > 0.5 ? '#6fe08a' : pct > 0.25 ? '#ffd23f' : '#ff6b6b';
      ctx.fillRect(x - w / 2, y - e.kind.radius - 12, w * pct, 4);
    }
    if (e.slowUntil > 0) {
      ctx.strokeStyle = 'rgba(63, 214, 201, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, e.kind.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private drawProjectiles(ctx: CanvasRenderingContext2D) {
    for (const p of this.engine.projectiles) {
      ctx.save();
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawArcs(ctx: CanvasRenderingContext2D) {
    for (const a of this.engine.arcs) {
      ctx.strokeStyle = `rgba(220, 176, 255, ${a.life / 0.12})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#dcb0ff';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(a.from.x, a.from.y);
      const midX = (a.from.x + a.to.x) / 2 + (Math.random() - 0.5) * 14;
      const midY = (a.from.y + a.to.y) / 2 + (Math.random() - 0.5) * 14;
      ctx.quadraticCurveTo(midX, midY, a.to.x, a.to.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  private drawEffects(ctx: CanvasRenderingContext2D) {
    for (const e of this.engine.effects) {
      const k = e.life / e.maxLife;
      ctx.strokeStyle = e.color;
      ctx.globalAlpha = k;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.pos.x, e.pos.y, e.radius * (1.4 - k * 0.4), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}
