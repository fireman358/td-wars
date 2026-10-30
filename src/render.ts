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
    this.drawProps(ctx);
    this.drawBase(ctx);
    this.drawRangePreview(ctx);
    for (const t of this.engine.towers) this.drawTower(ctx, t);
    for (const e of this.engine.enemies) this.drawEnemy(ctx, e);
    this.drawProjectiles(ctx);
    this.drawArcs(ctx);
    this.drawEffects(ctx);
    if (this.selectedTower) this.drawSelection(ctx);
    this.drawPortals(ctx);
    if (this.hyperT > 0) this.drawHyperspace(ctx, dt);
    this.drawSaber(ctx);
  }

  private drawSaber(ctx: CanvasRenderingContext2D) {
    if (!this.engine.saberActive) return;
    const { x, y } = this.engine.saberPos;
    const on = this.engine.saberEnergy > 0;
    const glow = on ? 1 : 0.4;
    ctx.save();
    ctx.shadowColor = `rgba(120, 220, 255, ${glow})`;
    ctx.shadowBlur = 16 * glow;
    ctx.strokeStyle = on ? '#bfe9ff' : '#5a7a8a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 20, this.t * 7, this.t * 7 + Math.PI * 1.5);
    ctx.stroke();
    ctx.strokeStyle = on ? '#e8f6ff' : '#7a8a94';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 14, this.t * 7, this.t * 7 + Math.PI * 1.5);
    ctx.stroke();
    ctx.restore();
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

  private drawSunBloom(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
    const bloom = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 4);
    bloom.addColorStop(0, color);
    bloom.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bloom;
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawProps(ctx: CanvasRenderingContext2D) {
    const seeded = (i: number) => ({ x: (i * 173 + 61) % GRID_W, y: (i * 97 + 130) % GRID_H });
    const theme = this.theme();
    for (let i = 0; i < 12; i++) {
      const p = seeded(i);
      const near = this.engine.paths.some(
        (pg) => pg.pts.some((pt, j) => j < pg.pts.length && Math.hypot(pt.x - p.x, pt.y - p.y) < 60)
      );
      if (near) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      if (theme === 'desert') {
        ctx.beginPath();
        ctx.ellipse(3, 5, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#5c3d1e';
        ctx.beginPath();
        ctx.arc(0, 0, 7 + (i % 4), 0, Math.PI * 2);
        ctx.fill();
      } else if (theme === 'ice') {
        ctx.beginPath();
        ctx.ellipse(3, 5, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#b9cfe6';
        ctx.beginPath();
        ctx.arc(0, 0, 4 + (i % 3) * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#7a94b8';
        ctx.beginPath();
        ctx.arc(0, -3, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (theme === 'forest') {
        ctx.beginPath();
        ctx.ellipse(3, 5, 11, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4a3520';
        ctx.fillRect(-2, -8, 4, 12);
        ctx.fillStyle = '#2c4a28';
        ctx.beginPath();
        ctx.arc(0, -10, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.ellipse(3, 5, 11, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2c3550';
        ctx.fillRect(-4, -8, 8, 12);
        ctx.fillStyle = 'rgba(255, 200, 90, 0.5)';
        ctx.fillRect(-2, -5, 2, 2);
      }
      ctx.restore();
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
    this.drawSunBloom(ctx, 700, 110, 60, 'rgba(255, 240, 190, 0.55)');
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
    for (const p of this.engine.paths) this.drawPath(ctx, p.pts);
  }

  private drawPath(ctx: CanvasRenderingContext2D, pts: Vec[]) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const theme = this.theme();
    const colors: Record<string, [string, string, string]> = {
      desert: ['#6b4a26', '#a8845a', 'rgba(60, 40, 20, 0.35)'],
      ice: ['#2c4a6e', '#9fb4cc', 'rgba(160, 200, 240, 0.4)'],
      forest: ['#2c4224', '#54663d', 'rgba(30, 50, 25, 0.4)'],
      city: ['#232a42', '#3c4a70', 'rgba(120, 150, 220, 0.35)'],
    };
    const [edge, fill, dash] = colors[theme] ?? colors.desert;
    ctx.strokeStyle = edge;
    ctx.lineWidth = PATH_WIDTH + 8;
    this.stroke(ctx, pts);
    ctx.strokeStyle = fill;
    ctx.lineWidth = PATH_WIDTH;
    this.stroke(ctx, pts);
    this.drawPathTexture(ctx, pts, theme);
    ctx.strokeStyle = dash;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 12]);
    this.stroke(ctx, pts);
    ctx.setLineDash([]);
  }

  private drawPathTexture(ctx: CanvasRenderingContext2D, pts: Vec[], theme: string) {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const steps = Math.floor(len / 26);
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        const r = 3 + ((x * 13 + y * 7) % 5);
        ctx.globalAlpha = 0.18 + ((x + y) % 3) * 0.06;
        if (theme === 'city') {
          ctx.fillStyle = '#2c3550';
          ctx.fillRect(x - 7, y - 7, 14, 14);
        } else {
          ctx.fillStyle = theme === 'ice' ? '#d8e6f2' : theme === 'forest' ? '#3d5230' : '#7a5c38';
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  private stroke(ctx: CanvasRenderingContext2D, pts: Vec[]) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  }

  private drawPortals(ctx: CanvasRenderingContext2D) {
    const pts = this.engine.paths.map((p) => p.pts);
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
  }

  private drawBase(ctx: CanvasRenderingContext2D) {
    const pts = this.engine.paths[0].pts;
    const end = pts[pts.length - 1];
    const x = Math.min(end.x - 4, GRID_W - 46);
    const y = end.y;
    const pulse = 0.5 + 0.5 * Math.sin(this.t * 2.4);
    ctx.save();
    ctx.translate(x, y);
    switch (this.theme()) {
      case 'desert': {
        ctx.fillStyle = '#c8b090';
        ctx.fillRect(-30, -8, 60, 22);
        ctx.fillStyle = '#8a7458';
        ctx.beginPath();
        ctx.arc(0, -8, 24, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#6e5a42';
        ctx.fillRect(6, -4, 10, 14);
        ctx.strokeStyle = `rgba(120, 190, 255, ${0.35 + pulse * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 6, 27, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        break;
      }
      case 'ice': {
        ctx.fillStyle = '#9fb4cc';
        ctx.fillRect(-26, -12, 52, 26);
        ctx.fillStyle = '#c9d8e8';
        ctx.fillRect(-26, -12, 52, 7);
        ctx.fillStyle = `rgba(90, 200, 255, ${0.5 + pulse * 0.3})`;
        ctx.fillRect(10, -8, 8, 16);
        break;
      }
      case 'forest': {
        ctx.fillStyle = '#3d5a35';
        ctx.fillRect(-18, -26, 36, 40);
        ctx.fillStyle = '#2c4a28';
        ctx.beginPath();
        ctx.arc(0, -26, 26, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 200, 100, ${0.5 + pulse * 0.3})`;
        ctx.fillRect(-10, -8, 8, 10);
        ctx.fillRect(4, -8, 8, 10);
        ctx.fillStyle = '#6b4a2c';
        ctx.fillRect(-24, 8, 48, 6);
        break;
      }
      case 'city': {
        ctx.fillStyle = '#cfd6e8';
        ctx.beginPath();
        ctx.moveTo(-4, -44);
        ctx.lineTo(28, 0);
        ctx.lineTo(-4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#8892b0';
        ctx.beginPath();
        ctx.moveTo(-4, -44);
        ctx.lineTo(28, 0);
        ctx.lineTo(-4, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = `rgba(120, 200, 255, ${0.35 + pulse * 0.35})`;
        ctx.beginPath();
        ctx.arc(2, -6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3a4358';
        ctx.fillRect(-26, -6, 24, 20);
        break;
      }
    }
    ctx.restore();
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
    const recoil = t.flash > 0 ? -Math.min(3, t.flash * 24) : 0;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x + 2, y + 5, 16, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(x, y);
    ctx.fillStyle = '#1a2436';
    ctx.strokeStyle = 'rgba(120, 160, 220, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(60, 90, 140, 0.5)';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(70, 100, 150, 0.25)';
    ctx.fillRect(-11, 10, 22, 4);

    ctx.rotate(t.angle);
    ctx.translate(recoil, 0);
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
      case 'extractor':
        ctx.rotate(0);
        ctx.fillStyle = '#2a2f38';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = c;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 13, this.t * 1.5, this.t * 1.5 + 2.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 8, -this.t * 2, -this.t * 2 + 1.6);
        ctx.stroke();
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();
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
    if (t.flash > 0 && t.kind.kind !== 'income') {
      const glowA = Math.min(1, t.flash * 8);
      ctx.save();
      ctx.shadowColor = t.kind.accent;
      ctx.shadowBlur = 14 * glowA;
      ctx.fillStyle = t.kind.accent;
      ctx.globalAlpha = glowA * 0.9;
      ctx.beginPath();
      ctx.arc(24, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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
    if (e.hp < e.maxHp || e.shield < e.maxShield) {
      const w = e.kind.radius * 2.6;
      const bx = x - w / 2;
      const by = y - e.kind.radius - 12;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(bx, by, w, 5);
      if (e.shield > 0) {
        ctx.fillStyle = '#4fc3f7';
        ctx.fillRect(bx, by, w * (e.shield / e.maxShield), 2);
      }
      const pct = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = pct > 0.5 ? '#6fe08a' : pct > 0.25 ? '#ffd23f' : '#ff6b6b';
      ctx.fillRect(bx, by + (e.maxShield > 0 ? 2 : 0), w * pct, e.maxShield > 0 ? 3 : 5);
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
