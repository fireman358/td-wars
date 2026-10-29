export class Sfx {
  private ctx: AudioContext | null = null;
  enabled = true;

  private ensure(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.12, slide = 0) {
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide !== 0) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), ctx.currentTime + dur);
    }
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  }

  shoot() { this.tone(880, 0.06, 'square', 0.05, -300); }
  laser() { this.tone(1400, 0.1, 'sawtooth', 0.05, -900); }
  boom() { this.tone(120, 0.25, 'triangle', 0.14, -60); }
  build() { this.tone(520, 0.09, 'sine', 0.1, 200); }
  error() { this.tone(160, 0.15, 'square', 0.08, -40); }
  leak() { this.tone(220, 0.35, 'sawtooth', 0.12, -160); }
  waveStart() { this.tone(330, 0.12, 'triangle', 0.1, 120); setTimeout(() => this.tone(440, 0.14, 'triangle', 0.1, 160), 120); }
  victory() {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, 0.22, 'triangle', 0.12), i * 140));
  }
  defeat() {
    [392, 330, 262, 196].forEach((f, i) => setTimeout(() => this.tone(f, 0.3, 'sawtooth', 0.1), i * 180));
  }
}
