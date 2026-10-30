export class Sfx {
  private ctx: AudioContext | null = null;
  enabled = true;
  musicEnabled = true;
  private musicPlaying = false;
  private musicNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private musicStopTimer = 0;

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

  private note(ctx: AudioContext, freq: number, start: number, dur: number, type: OscillatorType, vol: number, pan = 0) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const p = ctx.createStereoPanner();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    g.gain.setValueAtTime(0, ctx.currentTime + start);
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
    p.pan.setValueAtTime(pan, ctx.currentTime);
    osc.connect(g).connect(p).connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + dur + 0.05);
  }

  startMusic() {
    if (this.musicPlaying || !this.enabled || !this.musicEnabled) return;
    const ctx = this.ensure();
    if (!ctx) return;
    this.musicPlaying = true;
    this.playMarchCycle(ctx);
  }

  stopMusic() {
    this.musicPlaying = false;
    window.clearTimeout(this.musicStopTimer);
    for (const n of this.musicNodes) {
      try { n.osc.stop(); } catch { /* deja arrete */ }
    }
    this.musicNodes = [];
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) this.stopMusic();
    return this.musicEnabled;
  }

  private playMarchCycle(ctx: AudioContext) {
    if (!this.musicPlaying) return;
    // Marche heroiqie originale : mineur, ostinato cordes, fanfare cuivres
    // Gamme : La mineur naturelle. Aucune sequence de Williams.
    const N = (semi: number) => 220 * Math.pow(2, semi / 12); // base A3
    // ostinato rythmique (croches) : A A E E
    const ostinato = [0, 0, 7, 7, 0, 0, 12, 7];
    const ostDur = 0.18;
    for (let i = 0; i < 16; i++) {
      const s = i * ostDur;
      this.note(ctx, N(ostinato[i % 8]), s, ostDur * 0.9, 'sawtooth', 0.05, -0.4);
    }
    // fanfare cuivres : motif original (tierce montante + quarte, resolution)
    // La - Do - Mi - La (arpege mineur), puis Fa - Mi - Re (descente caracteristique originale)
    const fanfare: [number, number, number][] = [
      [0, 0.0, 0.5], [3, 0.25, 0.5], [7, 0.5, 0.5], [12, 0.75, 1.0],
      [8, 2.0, 0.4], [7, 2.4, 0.4], [5, 2.8, 0.9],
      [0, 3.6, 0.4], [3, 3.85, 0.4], [7, 4.1, 0.4], [10, 4.35, 1.2],
      [12, 5.6, 0.5], [10, 6.0, 0.5], [7, 6.4, 0.5], [3, 6.8, 1.2],
    ];
    for (const [semi, start, dur] of fanfare) {
      this.note(ctx, N(semi), start, dur, 'square', 0.07, 0.3);
      this.note(ctx, N(semi - 12), start, dur, 'square', 0.04, 0.3);
    }
    // timpani : La grave martele
    for (const t of [0, 0.75, 2.0, 3.6, 5.6]) {
      this.note(ctx, N(-24), t, 0.35, 'sine', 0.14, 0);
      this.note(ctx, N(-24) * 1.01, t, 0.35, 'sine', 0.1, 0);
    }
    this.musicStopTimer = window.setTimeout(() => {
      if (this.musicPlaying) this.playMarchCycle(ctx);
    }, 8000);
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
