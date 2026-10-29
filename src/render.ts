import { CELL, GRID_H, GRID_W, PATH, PATH_WIDTH } from './game/config';
import type { Engine } from './game/engine';
import type { Enemy } from './game/enemy';
import type { Tower } from './game/tower';
import type { Vec } from './game/types';

export class Renderer {
  ctx: CanvasRenderingContext2D;
  selectedTower: Tower | null = null;
  buildPreview: { kindId: string; valid: boolean } | null = null;
  mouse: Vec = { x: -100, y: -100 };

  constructor(canvas: HTMLCanvasElement, private engine: Engine) {
    this.ctx = canvas.getContext('2d')!;
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, GRID_W, GRID_H);
    this.drawBackground(ctx);
    this.drawPath(ctx);
    this.drawRangePreview(ctx);
    for (const t of this.engine.towers) this.drawTower(ctx, t);
    for (const e of this.engine.enemies) this.drawEnemy(ctx, e);
    this.drawProjectiles(ctx);
    this.drawArcs(ctx);
    this.drawEffects(ctx);
    if (this.selectedTower) this.drawSelection(ctx);
  }

  private drawBackground(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, 0, 0, GRID_H);
    g.addColorStop(0, '#0a0f1e');
    g.addColorStop(1, '#060a15');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, GRID_W, GRID_H);
    ctx.fillStyle = 'rgba(90, 130, 190, 0.06)';
    for (let x = 0; x < GRID_W; x += CELL) {
      for (let y = 0; y < GRID_H; y += CELL) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 40; i++) {
      const x = (i * 977 + 13) % GRID_W;
      const y = (i * 613 + 29) % GRID_H;
      ctx.fillRect(x, y, 1.4, 1.4);
    }
  }

  private drawPath(ctx: CanvasRenderingContext2D) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#131b2c';
    ctx.lineWidth = PATH_WIDTH + 8;
    this.strokePath(ctx);
    ctx.strokeStyle = '#1c2740';
    ctx.lineWidth = PATH_WIDTH;
    this.strokePath(ctx);
    ctx.strokeStyle = 'rgba(120, 170, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 10]);
    this.strokePath(ctx);
    ctx.setLineDash([]);

    const end = PATH[PATH.length - 1];
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.arc(end.x - 10, end.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 210, 63, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(end.x - 10, end.y, 12, 0, Math.PI * 2);
    ctx.stroke();
  }

  private strokePath(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(PATH[0].x, PATH[0].y);
    for (let i = 1; i < PATH.length; i++) ctx.lineTo(PATH[i].x, PATH[i].y);
    ctx.stroke();
  }

  private drawRangePreview(ctx: CanvasRenderingContext2D) {
    if (!this.buildPreview) return;
    const t = this.engine.towerAt(this.mouse);
    const e = this.engine;
    const range = 120;
    void t; void e;
    ctx.fillStyle = this.buildPreview.valid ? 'rgba(110, 224, 138, 0.12)' : 'rgba(255, 80, 80, 0.12)';
    ctx.strokeStyle = this.buildPreview.valid ? 'rgba(110, 224, 138, 0.5)' : 'rgba(255, 80, 80, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.mouse.x, this.mouse.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.mouse.x, this.mouse.y, range, 0, Math.PI * 2);
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
    ctx.strokeStyle = t.flash > 0 ? '#ffffff' : t.kind.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.rotate(t.angle);
    ctx.fillStyle = t.kind.color;
    ctx.fillRect(0, -3, 16, 6);
    ctx.fillStyle = t.kind.accent;
    ctx.fillRect(14, -2, 4, 4);
    if (t.level > 0) {
      ctx.rotate(-t.angle);
      for (let i = 0; i <= t.level; i++) {
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath();
        const a = -Math.PI / 2 + (i - 1) * 0.5;
        ctx.arc(Math.cos(a) * 17, Math.sin(a) * 17, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy) {
    const { x, y } = e.pos;
    ctx.save();
    ctx.translate(x, y);
    if (e.kind.cloak) ctx.globalAlpha = 0.55;
    const wobble = Math.sin(this.engine.time * 6 + e.phase) * 0.08;
    if (e.kind.shape === 'wing' || e.kind.shape === 'ship' || e.kind.shape === 'saucer') {
      ctx.rotate(Math.atan2(this.dirOf(e).y, this.dirOf(e).x));
    }
    ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : e.kind.color;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    const r = e.kind.radius;
    switch (e.kind.shape) {
      case 'drone':
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(-r, -r * 0.7);
        ctx.lineTo(-r * 0.4, 0);
        ctx.lineTo(-r, r * 0.7);
        ctx.closePath();
        ctx.fill();
        break;
      case 'soldier':
        ctx.fillRect(-r * 0.6, -r * 0.8, r * 1.2, r * 1.6);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(-r * 0.6, -r * 0.2, r * 1.2, r * 0.4);
        break;
      case 'wing':
        ctx.beginPath();
        ctx.moveTo(r * 1.4, 0);
        ctx.lineTo(-r, -r);
        ctx.lineTo(-r * 0.3, 0);
        ctx.lineTo(-r, r);
        ctx.closePath();
        ctx.fill();
        break;
      case 'tank':
        ctx.fillRect(-r, -r * 0.6, r * 2, r * 1.2);
        ctx.fillRect(-r * 0.5, -r * 1.1, r, r * 0.5);
        break;
      case 'walker':
        ctx.save();
        ctx.rotate(wobble);
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.2);
        ctx.lineTo(r * 0.8, r * 0.6);
        ctx.lineTo(-r * 0.8, r * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = e.kind.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, r * 0.5);
        ctx.lineTo(-r * 0.8, r);
        ctx.moveTo(r * 0.5, r * 0.5);
        ctx.lineTo(r * 0.8, r);
        ctx.stroke();
        break;
      case 'saucer':
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -r * 0.3, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'wedge':
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 0.7, r * 0.6);
        ctx.lineTo(0, r * 0.2);
        ctx.lineTo(-r * 0.7, r * 0.6);
        ctx.closePath();
        ctx.fill();
        break;
    }
    ctx.restore();

    if (e.hp < e.maxHp) {
      const w = e.kind.radius * 2.4;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(x - w / 2, y - e.kind.radius - 10, w, 4);
      const pct = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = pct > 0.5 ? '#6fe08a' : pct > 0.25 ? '#ffd23f' : '#ff6b6b';
      ctx.fillRect(x - w / 2, y - e.kind.radius - 10, w * pct, 4);
    }
    if (e.slowUntil > 0) {
      ctx.strokeStyle = 'rgba(63, 214, 201, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, e.kind.radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private dirOf(e: Enemy): Vec {
    void e;
    return { x: 1, y: 0 };
  }

  private drawProjectiles(ctx: CanvasRenderingContext2D) {
    for (const p of this.engine.projectiles) {
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  private drawArcs(ctx: CanvasRenderingContext2D) {
    for (const a of this.engine.arcs) {
      ctx.strokeStyle = `rgba(220, 176, 255, ${a.life / 0.12})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(a.from.x, a.from.y);
      const midX = (a.from.x + a.to.x) / 2 + (Math.random() - 0.5) * 14;
      const midY = (a.from.y + a.to.y) / 2 + (Math.random() - 0.5) * 14;
      ctx.quadraticCurveTo(midX, midY, a.to.x, a.to.y);
      ctx.stroke();
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
