import type { EnemyKind, EnemyKindId, SectorDef, TowerKind, TowerKindId, Wave, WaveGroup } from './types';

export const GRID_W = 960;
export const GRID_H = 540;
export const CELL = 32;
export const PATH_WIDTH = 30;

export const START_CREDITS = 220;
export const START_LIVES = 20;

export const AUTO_WAVE_DELAY = 6;
export const EARLY_BONUS_RATIO = 0.6;

export const SECTORS: SectorDef[] = [
  {
    name: 'Secteur 1 — Orbite de Jakda',
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
    waves: [] as Wave[],
  },
  {
    name: 'Secteur 2 — Ceinture de Groma',
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
    ],
    waves: [] as Wave[],
  },
  {
    name: 'Secteur 3 — Nébuleuse Vraau',
    paths: [
      [
        { x: -40, y: 80 },
        { x: 180, y: 80 },
        { x: 180, y: 300 },
        { x: 420, y: 300 },
        { x: 420, y: 460 },
        { x: 760, y: 460 },
        { x: 760, y: 200 },
        { x: 1000, y: 200 },
      ],
      [
        { x: -40, y: 500 },
        { x: 300, y: 500 },
        { x: 300, y: 240 },
        { x: 540, y: 240 },
        { x: 540, y: 80 },
        { x: 860, y: 80 },
        { x: 860, y: 340 },
        { x: 1000, y: 340 },
      ],
    ],
    waves: [] as Wave[],
  },
  {
    name: 'Secteur 4 — Cœur du Nova Empire',
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
    waves: [] as Wave[],
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

function wave(name: string, entries: number, reward: number, ...groups: WaveGroup[]): Wave {
  return { name, entries, reward, groups };
}

SECTORS[0].waves = [
  wave('Premiers vols', 1, 30, g('drone', 6, 1.1, 0)),
  wave('Patrouille légère', 1, 35, g('drone', 8, 0.9, 0), g('soldier', 3, 1.4, 5)),
  wave('Troupes au sol', 1, 40, g('soldier', 8, 1.0, 0), g('drone', 6, 0.8, 8)),
  wave('Essaim rapide', 1, 50, g('fighter', 8, 0.7, 0), g('drone', 8, 0.7, 3)),
  wave('Boss : Char renforcé', 1, 80, g('soldier', 6, 1.0, 0), g('tank', 1, 0, 6), g('drone', 8, 0.8, 10)),
  wave('Blindage lourd', 1, 60, g('soldier', 8, 0.9, 0), g('tank', 2, 4, 6, 1.1)),
  wave('Force de frappe', 1, 65, g('fighter', 10, 0.6, 0), g('soldier', 8, 1.0, 5)),
  wave('Ombres dans le ciel', 1, 70, g('stealth', 5, 1.6, 0), g('drone', 10, 0.7, 6)),
  wave('Marche implacable', 1, 85, g('walker', 2, 6, 0, 0.8), g('soldier', 10, 0.8, 4)),
  wave('Boss : Régénérateur', 1, 110, g('healer', 1, 0, 0), g('tank', 3, 3, 2), g('fighter', 8, 0.6, 8)),
  wave('Tempête d\'ions', 1, 90, g('stealth', 8, 1.2, 0), g('fighter', 10, 0.6, 6)),
  wave('Colonne blindée', 1, 100, g('tank', 5, 2.4, 0, 1.1), g('soldier', 12, 0.7, 5)),
  wave('Chirurgie mobile', 1, 110, g('healer', 2, 5, 0), g('walker', 2, 6, 3, 0.85), g('drone', 12, 0.5, 10)),
  wave('Ciel noir de chasseurs', 1, 120, g('fighter', 18, 0.45, 0), g('stealth', 6, 1.0, 8)),
  wave('Boss : Marcheur d\'assaut', 1, 160, g('walker', 3, 5, 0, 1.0), g('healer', 2, 6, 6), g('soldier', 12, 0.6, 10)),
  wave('Ruée générale', 1, 130, g('drone', 16, 0.35, 0), g('soldier', 12, 0.6, 4), g('fighter', 10, 0.5, 12)),
  wave('Mur d\'acier', 1, 140, g('tank', 8, 1.8, 0, 1.15), g('walker', 2, 6, 8, 0.9)),
  wave('Sabotage furtif', 1, 150, g('stealth', 12, 0.9, 0, 1.1), g('healer', 2, 5, 6), g('fighter', 12, 0.5, 10)),
  wave('Légion complète', 1, 170, g('soldier', 16, 0.5, 0, 1.2), g('tank', 6, 2, 4, 1.2), g('fighter', 10, 0.5, 14)),
  wave('Boss : Jumeaux régénérateurs', 1, 210, g('healer', 2, 4, 0), g('walker', 4, 4, 3, 1.0), g('tank', 6, 1.6, 10, 1.2)),
  wave('Éclipse totale', 1, 190, g('stealth', 14, 0.7, 0, 1.2), g('fighter', 16, 0.4, 6)),
  wave('Tremblement de sol', 1, 200, g('walker', 6, 3.5, 0, 1.1), g('tank', 8, 1.4, 5, 1.25)),
  wave('Dernière garde', 1, 220, g('healer', 3, 4, 0), g('soldier', 20, 0.4, 4, 1.3), g('stealth', 10, 0.8, 10, 1.2)),
  wave('Hypervitesse', 1, 240, g('fighter', 30, 0.3, 0, 1.3), g('drone', 20, 0.3, 8, 2.0), g('stealth', 12, 0.7, 14, 1.2)),
  wave('Boss final : Destroyer stellaire', 1, 500, g('destroyer', 1, 0, 0), g('walker', 4, 4, 8, 1.1), g('fighter', 16, 0.45, 12, 1.2), g('healer', 2, 6, 20)),
];

SECTORS[1].waves = [
  wave('Ceinture : premier contact', 1, 60, g('drone', 10, 0.7, 0), g('soldier', 6, 1.0, 5, 1.2)),
  wave('Essaim de sonde', 1, 70, g('drone', 14, 0.5, 0, 1.3), g('fighter', 8, 0.6, 6, 1.2)),
  wave('Phalange de troopers', 1, 80, g('soldier', 14, 0.6, 0, 1.4), g('tank', 2, 4, 8, 1.3)),
  wave('Pincement nord', 1, 90, g('fighter', 12, 0.5, 0, 1.4), g('stealth', 6, 1.2, 5, 1.3)),
  wave('Boss : Bélier lunaire', 1, 130, g('tank', 3, 3, 0, 1.5), g('soldier', 12, 0.6, 6, 1.4), g('healer', 1, 0, 10)),
];

SECTORS[2].waves = [
  wave('Assaut double', 2, 140, g('drone', 10, 0.5, 0, 1.5), g('soldier', 10, 0.6, 0, 1.5)),
  wave('Tenaille blindée', 2, 150, g('tank', 4, 2.5, 0, 1.6), g('fighter', 10, 0.5, 3, 1.5)),
  wave('Deux fronts furtifs', 2, 160, g('stealth', 8, 1.0, 0, 1.6), g('stealth', 8, 1.0, 4, 1.6), g('drone', 12, 0.5, 8, 1.6)),
  wave('Croisement de marcheurs', 2, 170, g('walker', 3, 4, 0, 1.4), g('walker', 3, 4, 5, 1.4), g('soldier', 14, 0.5, 10, 1.6)),
  wave('Boss : Jumeaux de fer', 2, 220, g('walker', 2, 4, 0, 1.6), g('walker', 2, 4, 4, 1.6), g('healer', 2, 5, 8), g('fighter', 12, 0.45, 12, 1.6)),
];

SECTORS[3].waves = [
  wave('Triple assaut léger', 3, 180, g('drone', 12, 0.45, 0, 1.7), g('fighter', 10, 0.45, 2, 1.7), g('soldier', 10, 0.5, 4, 1.7)),
  wave('Triangle blindé', 3, 200, g('tank', 4, 2.0, 0, 1.8), g('tank', 4, 2.0, 3, 1.8), g('stealth', 10, 0.8, 6, 1.7)),
  wave('Étreinte de la nébuleuse', 3, 220, g('walker', 4, 3, 0, 1.6), g('fighter', 14, 0.4, 3, 1.8), g('healer', 2, 4, 6)),
  wave('Trois fronts, une armée', 3, 250, g('soldier', 16, 0.4, 0, 2.0), g('tank', 5, 1.6, 3, 1.9), g('stealth', 12, 0.6, 6, 1.8)),
  wave('Boss final : Trinity Destroyer', 3, 600, g('destroyer', 1, 0, 0, 1.2), g('walker', 4, 3.5, 6, 1.7), g('fighter', 16, 0.4, 10, 1.8), g('healer', 3, 5, 16)),
];

export const ALL_WAVES: Wave[] = SECTORS.flatMap(s => s.waves);
export const MAX_WAVES = ALL_WAVES.length;
