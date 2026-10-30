export type TargetMode = 'first' | 'close' | 'fast' | 'strong';

export interface Vec {
  x: number;
  y: number;
}

export type TowerKindId =
  | 'extractor'
  | 'plasma'
  | 'ion'
  | 'missile'
  | 'laser'
  | 'tesla'
  | 'rail'
  | 'tractor'
  | 'axial';

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
  income?: number;
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
  kind: 'single' | 'splash' | 'slow' | 'chain' | 'income';
  tier: number;
  unlockSector: number;
  levels: TowerLevel[];
  specs?: TowerSpec[];
}

export interface TowerSpec {
  name: string;
  desc: string;
  mult: {
    damage?: number;
    range?: number;
    fireRate?: number;
    splashRadius?: number;
    slowFactor?: number;
    slowDuration?: number;
    chainTargets?: number;
  };
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
  entries: number;
  groups: WaveGroup[];
  reward: number;
}

export interface SectorDef {
  name: string;
  paths: Vec[][];
  waves: Wave[];
}
