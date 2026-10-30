export interface Perks {
  credits: number;
  lives: number;
  saber: number;
  shield: number;
}

export interface MetaState {
  points: number;
  perks: Perks;
  bestWave: number;
}

const KEY = 'tdwars_meta_v1';

export const PERK_DEFS = [
  { id: 'credits', name: 'Cargaison', desc: 'Crédits de départ', perLevel: 40, unit: 'cr', max: 5 },
  { id: 'lives', name: 'Boucliers renforcés', desc: 'Vies de départ', perLevel: 2, unit: ' vies', max: 5 },
  { id: 'saber', name: 'Cristal kyber', desc: 'Énergie du sabrelaser', perLevel: 25, unit: '%', max: 5 },
  { id: 'shield', name: 'Générateur de déflecteur', desc: 'Bouclier de la base', perLevel: 3, unit: ' pts', max: 5 },
] as const;

export type PerkId = (typeof PERK_DEFS)[number]['id'];

export function perkCost(level: number): number {
  return (level + 1) * 5;
}

export function loadMeta(): MetaState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MetaState;
      if (parsed && parsed.perks) {
      const p = parsed.perks as Partial<Perks>;
      return {
        points: parsed.points ?? 0,
        bestWave: parsed.bestWave ?? 0,
        perks: {
          credits: p.credits ?? 0,
          lives: p.lives ?? 0,
          saber: p.saber ?? 0,
          shield: p.shield ?? 0,
        },
      };
    }
    }
  } catch {
    /* storage indisponible */
  }
  return { points: 0, perks: { credits: 0, lives: 0, saber: 0, shield: 0 }, bestWave: 0 };
}

export function saveMeta(m: MetaState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* storage indisponible */
  }
}

export const RESPEC_TAX = 0.2;

export function respecPoints(m: MetaState): number {
  const spent = PERK_DEFS.reduce((total, p) => {
    const lvl = m.perks[p.id];
    return total + perkCost(0) * 0 + lvl * 0 + Array.from({ length: lvl }, (_, i) => perkCost(i)).reduce((a, b) => a + b, 0);
  }, 0);
  return Math.floor(spent * (1 - RESPEC_TAX));
}

export function resetAll(): MetaState {
  const fresh: MetaState = { points: 0, perks: { credits: 0, lives: 0, saber: 0, shield: 0 }, bestWave: 0 };
  saveMeta(fresh);
  return fresh;
}
