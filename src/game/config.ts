import type { EnemyKind, EnemyKindId, TowerKind, TowerKindId, Wave, WaveGroup } from './types';

export const GRID_W = 960;
export const GRID_H = 540;
export const CELL = 32;
export const PATH_WIDTH = 30;

export const PATH: { x: number; y: number }[] = [
  { x: -40, y: 110 },
  { x: 240, y: 110 },
  { x: 240, y: 430 },
  { x: 520, y: 430 },
  { x: 520, y: 110 },
  { x: 800, y: 110 },
  { x: 800, y: 330 },
  { x: 1000, y: 330 },
];

export const START_CREDITS = 220;
export const START_LIVES = 20;
export const MAX_WAVES = 25;

export const TOWERS: Record<TowerKindId, TowerKind> = {
  plasma: {
    id: 'plasma',
    name: 'Canon à plasma',
    desc: 'Tir rapide mono-cible, polyvalent et bon marché.',
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
    name: 'Laser à impulsion',
    desc: 'Faisceau perçant à fort dégât, cadence moyenne.',
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
    name: 'Lance-missiles',
    desc: 'Missiles à charge fracassante : dégâts de zone.',
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
    name: 'Canon électrique',
    desc: 'Arcs voltaïques qui sautent d\'un ennemi à l\'autre.',
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
    name: 'Rail orbital',
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
    name: 'Drone éclaireur',
    hp: 42, speed: 85, armor: 0, bounty: 6, leak: 1, radius: 10,
    color: '#7d8a99', shape: 'drone',
  },
  soldier: {
    id: 'soldier',
    name: 'Soldat blindé',
    hp: 90, speed: 55, armor: 2, bounty: 9, leak: 1, radius: 12,
    color: '#c9d4e0', shape: 'soldier',
  },
  fighter: {
    id: 'fighter',
    name: 'Chasseur stellaire',
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
    name: 'Destroyer lunaire',
    hp: 3800, speed: 22, armor: 14, bounty: 250, leak: 12, radius: 30,
    color: '#d6d6ff', shape: 'wedge', boss: true,
  },
};

function g(id: EnemyKindId, count: number, interval: number, delay: number, hpScale = 1, speedScale = 1): WaveGroup {
  return { id, count, interval, delay, hpScale, speedScale };
}

export const WAVES: Wave[] = [
  { name: 'Premiers vols', reward: 30, groups: [g('drone', 6, 1.1, 0)] },
  { name: 'Patrouille légère', reward: 35, groups: [g('drone', 8, 0.9, 0), g('soldier', 3, 1.4, 5)] },
  { name: 'Troupes au sol', reward: 40, groups: [g('soldier', 8, 1.0, 0), g('drone', 6, 0.8, 8)] },
  { name: 'Essaim rapide', reward: 50, groups: [g('fighter', 8, 0.7, 0), g('drone', 8, 0.7, 3)] },
  { name: 'Boss : Char renforcé', reward: 80, groups: [g('soldier', 6, 1.0, 0), g('tank', 1, 0, 6), g('drone', 8, 0.8, 10)] },
  { name: 'Blindage lourd', reward: 60, groups: [g('soldier', 8, 0.9, 0), g('tank', 2, 4, 6, 1.1)] },
  { name: 'Force de frappe', reward: 65, groups: [g('fighter', 10, 0.6, 0), g('soldier', 8, 1.0, 5)] },
  { name: 'Ombres dans le ciel', reward: 70, groups: [g('stealth', 5, 1.6, 0), g('drone', 10, 0.7, 6)] },
  { name: 'Marche implacable', reward: 85, groups: [g('walker', 2, 6, 0, 0.8), g('soldier', 10, 0.8, 4)] },
  { name: 'Boss : Régénérateur', reward: 110, groups: [g('healer', 1, 0, 0), g('tank', 3, 3, 2), g('fighter', 8, 0.6, 8)] },
  { name: 'Tempête d\'ions', reward: 90, groups: [g('stealth', 8, 1.2, 0), g('fighter', 10, 0.6, 6)] },
  { name: 'Colonne blindée', reward: 100, groups: [g('tank', 5, 2.4, 0, 1.1), g('soldier', 12, 0.7, 5)] },
  { name: 'Chirurgie mobile', reward: 110, groups: [g('healer', 2, 5, 0), g('walker', 2, 6, 3, 0.85), g('drone', 12, 0.5, 10)] },
  { name: 'Ciel noir de chasseurs', reward: 120, groups: [g('fighter', 18, 0.45, 0), g('stealth', 6, 1.0, 8)] },
  { name: 'Boss : Marcheur d\'assaut', reward: 160, groups: [g('walker', 3, 5, 0, 1.0), g('healer', 2, 6, 6), g('soldier', 12, 0.6, 10)] },
  { name: 'Ruée générale', reward: 130, groups: [g('drone', 16, 0.35, 0), g('soldier', 12, 0.6, 4), g('fighter', 10, 0.5, 12)] },
  { name: 'Mur d\'acier', reward: 140, groups: [g('tank', 8, 1.8, 0, 1.15), g('walker', 2, 6, 8, 0.9)] },
  { name: 'Sabotage furtif', reward: 150, groups: [g('stealth', 12, 0.9, 0, 1.1), g('healer', 2, 5, 6), g('fighter', 12, 0.5, 10)] },
  { name: 'Légion complète', reward: 170, groups: [g('soldier', 16, 0.5, 0, 1.2), g('tank', 6, 2, 4, 1.2), g('fighter', 10, 0.5, 14)] },
  { name: 'Boss : Jumaux régénérateurs', reward: 210, groups: [g('healer', 2, 4, 0), g('walker', 4, 4, 3, 1.0), g('tank', 6, 1.6, 10, 1.2)] },
  { name: 'Éclipse totale', reward: 190, groups: [g('stealth', 14, 0.7, 0, 1.2), g('fighter', 16, 0.4, 6)] },
  { name: 'Tremblement de sol', reward: 200, groups: [g('walker', 6, 3.5, 0, 1.1), g('tank', 8, 1.4, 5, 1.25)] },
  { name: 'Dernière garde', reward: 220, groups: [g('healer', 3, 4, 0), g('soldier', 20, 0.4, 4, 1.3), g('stealth', 10, 0.8, 10, 1.2)] },
  { name: 'Hypervitesse', reward: 240, groups: [g('fighter', 30, 0.3, 0, 1.3), g('drone', 20, 0.3, 8, 2.0), g('stealth', 12, 0.7, 14, 1.2)] },
  { name: 'Boss final : Destroyer lunaire', reward: 500, groups: [g('destroyer', 1, 0, 0), g('walker', 4, 4, 8, 1.1), g('fighter', 16, 0.45, 12, 1.2), g('healer', 2, 6, 20)] },
];
