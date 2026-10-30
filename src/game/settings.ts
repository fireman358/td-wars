export interface Settings {
  sfx: boolean;
  music: boolean;
  volume: number;
  graphics: '2d' | '2.5d' | 'iso';
}

const KEY = 'tdwars_settings_v1';

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Settings>;
      return {
        sfx: p.sfx ?? true,
        music: p.music ?? true,
        volume: p.volume ?? 0.8,
        graphics: p.graphics === '2d' ? '2d' : p.graphics === 'iso' ? 'iso' : '2.5d',
      };
    }
  } catch {
    /* storage indisponible */
  }
  return { sfx: true, music: true, volume: 0.8, graphics: '2.5d' };
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage indisponible */
  }
}
