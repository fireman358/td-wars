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


export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function genPathPoints(rng: () => number, laneIndex = 0, laneCount = 1): Vec[] {
  const allLevels = [90, 190, 280, 380, 470];
  for (let i = allLevels.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [allLevels[i], allLevels[j]] = [allLevels[j], allLevels[i]];
  }
  const count = 3 + Math.floor(rng() * 3);
  const ys = allLevels.slice(0, count);
  if (rng() > 0.5) ys.reverse();
  const anchors: number[] = [];
  let ax = 200 + Math.floor(rng() * 60);
  for (let i = 0; i < count - 1; i++) {
    anchors.push(ax);
    ax += 140 + Math.floor(rng() * 100);
  }
  // entree : slot dedie par voie, sans collision possible
  const entrySlots = [90, 210, 330, 450, 470];
  const entryY = laneCount <= 1 ? ys[0] : entrySlots[laneIndex % 3 + (laneCount > 3 ? 3 : 0)] ?? ys[0];
  const pts: Vec[] = [{ x: -40, y: entryY }, { x: anchors[0] - 60 - laneIndex * 20, y: entryY }];
  for (let i = 0; i < count - 1; i++) {
    pts.push({ x: anchors[i], y: ys[i] });
    pts.push({ x: anchors[i], y: ys[i + 1] });
  }
  // sorties : chaque voie debouche sur un lane distinct, proche des autres
  const exitY = laneCount <= 1 ? ys[count - 1] : 260 + (laneIndex - (laneCount - 1) / 2) * 40;
  pts.push({ x: 1000, y: exitY });
  return pts;
}
