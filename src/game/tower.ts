import type { TargetMode, TowerKind, TowerKindId, Vec } from './types';

export const TARGET_LABELS: Record<TargetMode, string> = {
  first: 'Premier arrivé',
  close: 'Le plus proche',
  fast: 'Le plus rapide',
  strong: 'Le plus fort (PV)',
};

export class Tower {
  kind: TowerKind;
  id: TowerKindId;
  pos: Vec;
  level = 0;
  cooldown = 0;
  angle = -Math.PI / 2;
  totalSpent: number;
  kills = 0;
  flash = 0;
  targetMode: TargetMode = 'first';

  constructor(id: TowerKindId, kind: TowerKind, pos: Vec) {
    this.id = id;
    this.kind = kind;
    this.pos = pos;
    this.totalSpent = kind.levels[0].cost;
  }

  get stats() {
    return this.kind.levels[this.level];
  }

  canUpgrade(): boolean {
    return this.level < this.kind.levels.length - 1;
  }

  upgradeCost(): number {
    return this.canUpgrade() ? this.kind.levels[this.level + 1].cost : 0;
  }

  sellValue(): number {
    return Math.floor(this.totalSpent * 0.7);
  }
}
