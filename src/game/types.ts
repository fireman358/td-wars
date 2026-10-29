export interface Vec {
  x: number;
  y: number;
}

export type TowerKindId =
  | 'plasma'
  | 'laser'
  | 'ion'
  | 'missile'
  | 'tesla'
  | 'rail';

export type EnemyKindId =
  | 'drone'
  | 'soldier'
  | 'fighter'
  | 'tank'
  | 'walker'
  | 'stealth'
  | 'healer'
  | 'destroyer';

export interface TowerLevel {
  cost: number;
  damage: number;
  range: number;
  fireRate: number;
  projectileSpeed: number;
  splashRadius: number;
  slowFactor: number;
  slowDuration: number;
  chainTargets: number;
}

export interface TowerKind {
  id: TowerKindId;
  name: string;
  desc: string;
  color: string;
  accent: string;
  kind: 'single' | 'splash' | 'slow' | 'chain';
  levels: TowerLevel[];
}

export interface EnemyKind {
  id: EnemyKindId;
  name: string;
  hp: number;
  speed: number;
  armor: number;
  bounty: number;
  leak: number;
  radius: number;
  color: string;
  shape: 'drone' | 'soldier' | 'ship' | 'tank' | 'walker' | 'wing' | 'saucer' | 'wedge';
  healAura?: number;
  cloak?: boolean;
  boss?: boolean;
}

export interface WaveGroup {
  id: EnemyKindId;
  count: number;
  interval: number;
  delay: number;
  hpScale: number;
  speedScale: number;
}

export interface Wave {
  name: string;
  groups: WaveGroup[];
  reward: number;
}
