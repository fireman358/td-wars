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
  specIndex: number | null = null;

  constructor(id: TowerKindId, kind: TowerKind, pos: Vec) {
    this.id = id;
    this.kind = kind;
    this.pos = pos;
    this.totalSpent = kind.levels[0].cost;
  }

  get stats() {
    const base = { ...this.kind.levels[this.level] };
    if (this.specIndex !== null && this.kind.specs) {
      const m = this.kind.specs[this.specIndex].mult;
      if (m.damage) base.damage = Math.round(base.damage * m.damage);
      if (m.range) base.range = Math.round(base.range * m.range);
      if (m.fireRate) base.fireRate = Math.round(base.fireRate * m.fireRate * 10) / 10;
      if (m.splashRadius) base.splashRadius = Math.round(base.splashRadius * m.splashRadius);
      if (m.slowFactor) base.slowFactor = Math.round(base.slowFactor * m.slowFactor * 100) / 100;
      if (m.slowDuration) base.slowDuration = Math.round(base.slowDuration * m.slowDuration * 10) / 10;
      if (m.chainTargets) base.chainTargets += m.chainTargets;
    }
    return base;
  }

  get spec() {
    return this.specIndex !== null && this.kind.specs ? this.kind.specs[this.specIndex] : null;
  }

  canUpgrade(): boolean {
    return this.level < this.kind.levels.length - 1;
  }

  canSpec(): boolean {
    return this.level >= this.kind.levels.length - 1 && this.specIndex === null && !!this.kind.specs;
  }

  upgradeCost(): number {
    return this.canUpgrade() ? this.kind.levels[this.level + 1].cost : 0;
  }

  sellValue(): number {
    return Math.floor(this.totalSpent * 0.7);
  }
}
