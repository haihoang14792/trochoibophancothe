/**
 * Web Audio API synthesizer for sound effects
 * Fast, pure oscillator synthesis (zero external audio dependencies, zero latency)
 * Provides: Tick (✓), Boing (Elastic spring), Victory fanfare, Touch pop
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isSfxEnabled: boolean = true;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSfxEnabled(enabled: boolean) {
    this.isSfxEnabled = enabled;
  }

  public getSfxEnabled(): boolean {
    return this.isSfxEnabled;
  }

  /**
   * Sound: "TÍCH!" (✓)
   * High, crystal-clear marimba bell chime when a piece is snapped correctly.
   */
  public playTick() {
    if (!this.isSfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1046.5, now);
    osc1.frequency.exponentialRampToValueAtTime(1318.5, now + 0.08);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.4, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1567.98, now);
    osc2.frequency.exponentialRampToValueAtTime(2093.0, now + 0.08);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.28);
  }

  /**
   * Sound: "BOING!"
   * Cheerful, gentle cartoon spring bounce when dropped incorrectly.
   */
  public playBoing() {
    if (!this.isSfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.55;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);
    osc.frequency.linearRampToValueAtTime(320, now + 0.22);
    osc.frequency.linearRampToValueAtTime(370, now + 0.32);
    osc.frequency.linearRampToValueAtTime(280, now + 0.44);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(220, now);
    subOsc.frequency.exponentialRampToValueAtTime(110, now + 0.15);

    subGain.gain.setValueAtTime(0.2, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.2);
  }

  /**
   * Sound: Victory celebration fanfare melody (2-3 seconds)
   */
  public playVictoryMusic() {
    if (!this.isSfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.25 },
      { freq: 659.25, time: 0.18, dur: 0.25 },
      { freq: 783.99, time: 0.36, dur: 0.28 },
      { freq: 1046.5, time: 0.54, dur: 0.5 },
      { freq: 880.0, time: 0.9, dur: 0.25 },
      { freq: 1046.5, time: 1.1, dur: 0.25 },
      { freq: 1318.51, time: 1.35, dur: 0.9 },
    ];

    notes.forEach(({ freq, time, dur }) => {
      const noteOsc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      noteOsc.type = 'triangle';
      noteOsc.frequency.setValueAtTime(freq, now + time);

      noteGain.gain.setValueAtTime(0.001, now + time);
      noteGain.gain.linearRampToValueAtTime(0.28, now + time + 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      noteOsc.connect(noteGain);
      noteGain.connect(ctx.destination);

      noteOsc.start(now + time);
      noteOsc.stop(now + time + dur);

      const shimmerOsc = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmerOsc.type = 'sine';
      shimmerOsc.frequency.setValueAtTime(freq * 2, now + time);

      shimmerGain.gain.setValueAtTime(0.001, now + time);
      shimmerGain.gain.linearRampToValueAtTime(0.12, now + time + 0.03);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur * 0.7);

      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);
      shimmerOsc.start(now + time);
      shimmerOsc.stop(now + time + dur * 0.7);
    });
  }

  /**
   * Sound: Gentle click / touch bubble pop
   */
  public playTouchPop() {
    if (!this.isSfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }
}

export const soundEngine = new SoundEngine();
