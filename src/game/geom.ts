import type { Vec } from './types';

export function dist(a: Vec, b: Vec): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export interface PathGeom {
  pts: Vec[];
  cumLen: number[];
  total: number;
  dirs: Vec[];
}

export function buildPath(pts: Vec[]): PathGeom {
  const cumLen: number[] = [0];
  const dirs: Vec[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const d = dist(a, b);
    dirs.push({ x: (b.x - a.x) / d, y: (b.y - a.y) / d });
    total += d;
    cumLen.push(total);
  }
  return { pts, cumLen, total, dirs };
}

export function pointAt(p: PathGeom, d: number): Vec {
  const dist2 = clamp(d, 0, p.total);
  for (let i = 0; i < p.cumLen.length - 1; i++) {
    if (dist2 <= p.cumLen[i + 1]) {
      const t = dist2 - p.cumLen[i];
      return { x: p.pts[i].x + p.dirs[i].x * t, y: p.pts[i].y + p.dirs[i].y * t };
    }
  }
  const last = p.pts[p.pts.length - 1];
  return { x: last.x, y: last.y };
}

export function distToPath(p: PathGeom, v: Vec): number {
  let best = Infinity;
  for (let i = 0; i < p.pts.length - 1; i++) {
    const a = p.pts[i];
    const b = p.pts[i + 1];
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const t = clamp(((v.x - a.x) * abx + (v.y - a.y) * aby) / (abx * abx + aby * aby), 0, 1);
    const px = a.x + abx * t;
    const py = a.y + aby * t;
    best = Math.min(best, Math.hypot(v.x - px, v.y - py));
  }
  return best;
}
