import type { EnemyKind, EnemyKindId, SectorDef, TowerKind, TowerKindId, Wave, WaveGroup } from './types';

export const GRID_W = 960;
export const GRID_H = 540;
export const CELL = 32;
export const PATH_WIDTH = 30;

export const START_CREDITS = 220;
export const START_LIVES = 20;

export const AUTO_WAVE_DELAY = 6;
export const EARLY_BONUS_RATIO = 0.6;

export type Theme = 'desert' | 'ice' | 'forest' | 'city';

export interface SectorDefX extends SectorDef {
  theme: Theme;
  subtitle: string;
}

export const SECTORS: SectorDefX[] = [
  {
    name: 'Dunes de Jakda',
    subtitle: 'Désert binaire — 1 voie',
    theme: 'desert',
    paths: [
      [
        { x: -40, y: 110 },
        { x: 240, y: 110 },
        { x: 240, y: 430 },
        { x: 520, y: 430 },
        { x: 520, y: 110 },
        { x: 800, y: 110 },
        { x: 800, y: 330 },
        { x: 1000, y: 330 },
      ],
    ],
    waves: [],
  },
  {
    name: 'Plaines gelées de Hotha',
    subtitle: 'Glaces éternelles — 1 voie, labyrinthe serré',
    theme: 'ice',
    paths: [
      [
        { x: -40, y: 60 },
        { x: 160, y: 60 },
        { x: 160, y: 250 },
        { x: 360, y: 250 },
        { x: 360, y: 90 },
        { x: 560, y: 90 },
        { x: 560, y: 300 },
        { x: 760, y: 300 },
        { x: 760, y: 140 },
        { x: 900, y: 140 },
        { x: 900, y: 460 },
        { x: 1000, y: 460 },
      ],
    ],
    waves: [],
  },
  {
    name: 'Canopées de Wuukir',
    subtitle: 'Jungle primitive — 2 voies',
    theme: 'forest',
    paths: [
      [
        { x: -40, y: 120 },
        { x: 200, y: 120 },
        { x: 200, y: 420 },
        { x: 440, y: 420 },
        { x: 440, y: 120 },
        { x: 700, y: 120 },
        { x: 700, y: 420 },
        { x: 1000, y: 420 },
      ],
      [
        { x: -40, y: 460 },
        { x: 120, y: 460 },
        { x: 120, y: 200 },
        { x: 560, y: 200 },
        { x: 560, y: 480 },
        { x: 820, y: 480 },
        { x: 820, y: 80 },
        { x: 1000, y: 80 },
      ],
    ],
    waves: [],
  },
  {
    name: 'Mégalopole de Corvann',
    subtitle: 'Cité-planète — 3 voies',
    theme: 'city',
    paths: [
      [
        { x: -40, y: 270 },
        { x: 160, y: 270 },
        { x: 160, y: 90 },
        { x: 400, y: 90 },
        { x: 400, y: 270 },
        { x: 640, y: 270 },
        { x: 640, y: 90 },
        { x: 1000, y: 90 },
      ],
      [
        { x: -40, y: 90 },
        { x: 160, y: 90 },
        { x: 160, y: 450 },
        { x: 400, y: 450 },
        { x: 400, y: 270 },
        { x: 640, y: 270 },
        { x: 640, y: 450 },
        { x: 1000, y: 450 },
      ],
      [
        { x: 480, y: -40 },
        { x: 480, y: 180 },
        { x: 200, y: 180 },
        { x: 200, y: 380 },
        { x: 760, y: 380 },
        { x: 760, y: 180 },
        { x: 1000, y: 180 },
      ],
    ],
    waves: [],
  },
];

export const TOWERS: Record<TowerKindId, TowerKind> = {
  plasma: {
    id: 'plasma',
    name: 'Blaster léger',
    desc: 'Tir de blaster rapide mono-cible, polyvalent et bon marché.',
    color: '#3f7fd6',
    accent: '#8cd0ff',
    kind: 'single',
    levels: [
      { cost: 60, damage: 12, range: 110, fireRate: 2.2, projectileSpeed: 380, splashRadius: 0, slowFactor: 1, slowDuration: 0, chainTargets: 0 },
      { cost: 50, damage: 22, range: 125, fireRate: 2.6, projectileSpeed: 420, splashRadius: 0, slowFactor: 1, slowDuration: 0, chainTargets: 0 },
      { cost: 90, damage: 40, range: 140, fireRate: 3.0, projectileSpeed: 460, splashRadius: 0, slowFactor: 1, slowDuration: 0, chainTargets: 0 },
    ],
  },
  laser: {
    id: 'laser',
    name: 'Canon laser',
    desc: 'Rayon laser à fort dégât, cadence moyenne.',
    color: '#d63f3f',
    accent: '#ff9a8a',
    kind: 'single',
    levels: [
      { cost: 110, damage: 34, range: 130, fireRate: 1.1, projectileSpeed: 620, splashRadius: 0, slowFactor: 1, slowDuration: 0, chainTargets: 0 },
      { cost: 90, damage: 62, range: 145, fireRate: 1.3, projectileSpeed: 660, splashRadius: 0, slowFactor: 1, slowDuration: 0, chainTargets: 0 },
      { cost: 160, damage: 115, range: 160, fireRate: 1.5, projectileSpeed: 700, splashRadius: 0, slowFactor: 1, slowDuration: 0, chainTargets: 0 },
    ],
  },
  ion: {
    id: 'ion',
    name: 'Canon ionique',
    desc: 'Ralentit les cibles touchées grâce au gel ionique.',
    color: '#3fd6c9',
    accent: '#a8fff4',
    kind: 'slow',
    levels: [
      { cost: 80, damage: 6, range: 120, fireRate: 1.4, projectileSpeed: 340, splashRadius: 42, slowFactor: 0.55, slowDuration: 1.6, chainTargets: 0 },
      { cost: 70, damage: 10, range: 135, fireRate: 1.6, projectileSpeed: 360, splashRadius: 50, slowFactor: 0.45, slowDuration: 2.0, chainTargets: 0 },
      { cost: 120, damage: 16, range: 150, fireRate: 1.8, projectileSpeed: 380, splashRadius: 58, slowFactor: 0.35, slowDuration: 2.4, chainTargets: 0 },
    ],
  },
  missile: {
    id: 'missile',
    name: 'Torpilles à proton',
    desc: 'Torpilles à charge fracassante : dégâts de zone.',
    color: '#d69a3f',
    accent: '#ffe08a',
    kind: 'splash',
    levels: [
      { cost: 130, damage: 26, range: 140, fireRate: 0.8, projectileSpeed: 300, splashRadius: 60, slowFactor: 1, slowDuration: 0, chainTargets: 0 },
      { cost: 110, damage: 48, range: 155, fireRate: 0.9, projectileSpeed: 320, splashRadius: 72, slowFactor: 1, slowDuration: 0, chainTargets: 0 },
      { cost: 190, damage: 88, range: 170, fireRate: 1.0, projectileSpeed: 340, splashRadius: 85, slowFactor: 1, slowDuration: 0, chainTargets: 0 },
    ],
  },
  tesla: {
    id: 'tesla',
    name: 'Arc DEMP',
    desc: 'Décharge électromagnétique qui saute d\'un ennemi à l\'autre.',
    color: '#a64fd6',
    accent: '#dcb0ff',
    kind: 'chain',
    levels: [
      { cost: 150, damage: 18, range: 115, fireRate: 1.2, projectileSpeed: 0, splashRadius: 90, slowFactor: 1, slowDuration: 0, chainTargets: 3 },
      { cost: 130, damage: 30, range: 125, fireRate: 1.4, projectileSpeed: 0, splashRadius: 100, slowFactor: 1, slowDuration: 0, chainTargets: 4 },
      { cost: 220, damage: 52, range: 140, fireRate: 1.6, projectileSpeed: 0, splashRadius: 115, slowFactor: 1, slowDuration: 0, chainTargets: 6 },
    ],
  },
  rail: {
    id: 'rail',
    name: 'Turbo-laser orbital',
    desc: 'Portée extrême et dégâts massifs, cadence lente.',
    color: '#e6e6e6',
    accent: '#bfe6ff',
    kind: 'single',
    levels: [
      { cost: 200, damage: 90, range: 240, fireRate: 0.45, projectileSpeed: 900, splashRadius: 0, slowFactor: 1, slowDuration: 0, chainTargets: 0 },
      { cost: 170, damage: 160, range: 270, fireRate: 0.5, projectileSpeed: 950, splashRadius: 0, slowFactor: 1, slowDuration: 0, chainTargets: 0 },
      { cost: 300, damage: 290, range: 300, fireRate: 0.55, projectileSpeed: 1000, splashRadius: 0, slowFactor: 1, slowDuration: 0, chainTargets: 0 },
    ],
  },
};

export const BUILD_ORDER: TowerKindId[] = ['plasma', 'laser', 'ion', 'missile', 'tesla', 'rail'];

export const ENEMIES: Record<EnemyKindId, EnemyKind> = {
  drone: {
    id: 'drone',
    name: 'Sonde éclaireuse',
    hp: 42, speed: 85, armor: 0, bounty: 6, leak: 1, radius: 10,
    color: '#7d8a99', shape: 'drone',
  },
  soldier: {
    id: 'soldier',
    name: 'Trooper blindé',
    hp: 90, speed: 55, armor: 2, bounty: 9, leak: 1, radius: 12,
    color: '#e8e8e8', shape: 'soldier',
  },
  fighter: {
    id: 'fighter',
    name: 'Intercepteur à panneaux',
    hp: 70, speed: 145, armor: 0, bounty: 12, leak: 2, radius: 11,
    color: '#4fde7d', shape: 'wing',
  },
  tank: {
    id: 'tank',
    name: 'Char des sables',
    hp: 340, speed: 34, armor: 6, bounty: 26, leak: 3, radius: 17,
    color: '#b08050', shape: 'tank',
  },
  walker: {
    id: 'walker',
    name: 'Marcheur quadripode',
    hp: 620, speed: 30, armor: 10, bounty: 42, leak: 4, radius: 20,
    color: '#9aa7b5', shape: 'walker',
  },
  stealth: {
    id: 'stealth',
    name: 'Bombardier furtif',
    hp: 160, speed: 95, armor: 3, bounty: 20, leak: 2, radius: 13,
    color: '#6b5bd6', shape: 'saucer', cloak: true,
  },
  healer: {
    id: 'healer',
    name: 'Régénérateur',
    hp: 260, speed: 45, armor: 4, bounty: 30, leak: 2, radius: 15,
    color: '#ffd23f', shape: 'saucer', healAura: 22,
  },
  destroyer: {
    id: 'destroyer',
    name: 'Destroyer stellaire',
    hp: 3800, speed: 22, armor: 14, bounty: 250, leak: 12, radius: 30,
    color: '#d6d6ff', shape: 'wedge', boss: true,
  },
};

function g(id: EnemyKindId, count: number, interval: number, delay: number, hpScale = 1, speedScale = 1): WaveGroup {
  return { id, count, interval, delay, hpScale, speedScale };
}

function genWave(w: number, d: number, entries: number): Wave {
  const m = (1 + d * 0.55) * (1 + w * 0.09);
  const sp = 1 + d * 0.1 + w * 0.004;
  const reward = 30 + w * 8 + d * 60;
  const boss = w % 5 === 0;
  let groups: WaveGroup[];
  let name: string;

  if (w === 25) {
    name = 'Boss : Destroyer stellaire';
    groups = [
      g('destroyer', 1, 0, 0, m * 0.9, sp),
      g('walker', 2 + d * 2, 3.5, 6, m * 0.8, sp),
      g('fighter', 18, 0.4, 12, m, sp),
      g('healer', 3, 5, 20, m * 0.7, sp),
    ];
  } else if (boss) {
    name = w % 10 === 5 ? 'Boss : Charge blindée' : w === 20 ? 'Boss : Marcheurs d\'assaut' : 'Boss : Assaut lourd';
    if (w === 5) {
      groups = [g('tank', 1 + d, 3, 0, m), g('soldier', 12, 0.55, 4, m), g('drone', 10, 0.6, 10, m * 1.2)];
    } else if (w === 10) {
      groups = [g('healer', 1 + Math.floor(d / 2), 4, 0, m * 0.8), g('tank', 3 + d, 2.5, 3, m), g('fighter', 12, 0.5, 10, m)];
    } else if (w === 15) {
      groups = [g('walker', 2 + d, 4, 0, m * 0.8), g('healer', 1, 0, 6, m * 0.7), g('soldier', 16, 0.45, 10, m)];
    } else {
      groups = [g('walker', 3 + d, 3, 0, m * 0.9), g('stealth', 12, 0.7, 6, m), g('fighter', 16, 0.4, 14, m)];
    }
  } else {
    const p = w % 5;
    if (p === 1) {
      name = w < 10 ? 'Patrouille légère' : 'Escadron rapide';
      groups = [g(w % 6 === 1 ? 'drone' : 'fighter', 8 + w / 3, 0.55, 0, m), g('drone', 8, 0.7, 5, m * 1.1)];
    } else if (p === 2) {
      name = 'Troupes au sol';
      groups = [g('soldier', 10 + w / 2, 0.5, 0, m), g(w % 4 === 2 ? 'drone' : 'fighter', 8, 0.6, 6, m)];
    } else if (p === 3) {
      name = 'Force de frappe';
      groups = [g('fighter', 12 + w / 3, 0.45, 0, m), g('stealth', 5 + w / 6, 1.1, 5, m)];
    } else {
      name = 'Blindage lourd';
      groups = [g('tank', 3 + w / 5, 2, 0, m), g('soldier', 12, 0.5, 4, m), g(w % 3 === 4 ? 'healer' : 'stealth', 4, 1.2, 8, m)];
    }
  }
  return { name, entries, groups, reward };
}

for (let s = 0; s < SECTORS.length; s++) {
  const entries = SECTORS[s].paths.length;
  SECTORS[s].waves = Array.from({ length: 25 }, (_, i) => genWave(i + 1, s, entries));
}

export const ALL_WAVES: Wave[] = SECTORS.flatMap(s => s.waves);
export const MAX_WAVES = ALL_WAVES.length;
export const WAVES_PER_SECTOR = 25;
