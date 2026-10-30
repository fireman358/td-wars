export interface Perks {
  credits: number;
  lives: number;
  saber: number;
}

export interface MetaState {
  points: number;
  perks: Perks;
  bestWave: number;
}

const KEY = 'tdwars_meta_v1';

export const PERK_DEFS = [
  { id: 'credits', name: 'Cargaison', desc: '+40 crédits de départ', max: 5 },
  { id: 'lives', name: 'Boucliers renforcés', desc: '+2 vies de départ', max: 5 },
  { id: 'saber', name: 'Cristal kyber', desc: '+25% énergie du sabre', max: 5 },
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
      if (parsed && parsed.perks) return parsed;
    }
  } catch {
    /* storage indisponible */
  }
  return { points: 0, perks: { credits: 0, lives: 0, saber: 0 }, bestWave: 0 };
}

export function saveMeta(m: MetaState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* storage indisponible */
  }
}
