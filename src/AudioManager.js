/**
 * AudioManager - Web Audio API synthesized sound effects
 * No external audio files needed - generates all sounds procedurally.
 */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.masterGain = null;
    this._initialized = false;
  }

  /** Must be called from a user gesture (click/tap) to unlock audio on mobile */
  init() {
    if (this._initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
      this._initialized = true;
    } catch (e) {
      console.warn('AudioManager: Web Audio not available', e);
      this.enabled = false;
    }
  }

  _ensureContext() {
    if (!this._initialized) this.init();
    if (!this.ctx || !this.enabled) return false;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  /** Short noise burst - shoot / blaster */
  playShoot() {
    if (!this._ensureContext()) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Noise burst
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass to shape it
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 1.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.1);

    // Tonal click
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  /** Impact thud - ghost got hit */
  playHit() {
    if (!this._ensureContext()) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Low thud
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);

    // Crunch noise
    const bufferSize = ctx.sampleRate * 0.06;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.4, now);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    noise.connect(nGain);
    nGain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.08);
  }

  /** Whoosh - missed shot */
  playMiss() {
    if (!this._ensureContext()) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.3;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.2);
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.25);
  }

  /** Magical descending tone - capture complete */
  playCapture() {
    if (!this._ensureContext()) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Descending sparkle notes
    const notes = [880, 660, 440, 330, 220];
    notes.forEach((freq, i) => {
      const t = now + i * 0.12;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.25);
    });

    // Shimmer noise
    const bufLen = ctx.sampleRate * 0.8;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      const t = i / bufLen;
      d[i] = (Math.random() * 2 - 1) * (1 - t) * 0.08;
    }
    const shimmer = ctx.createBufferSource();
    shimmer.buffer = buf;

    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 4000;

    const sGain = ctx.createGain();
    sGain.gain.setValueAtTime(0.2, now);
    sGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    shimmer.connect(hpf);
    hpf.connect(sGain);
    sGain.connect(this.masterGain);
    shimmer.start(now);
    shimmer.stop(now + 0.9);
  }

  /** Eerie rising tone - ghost appears */
  playGhostAppear() {
    if (!this._ensureContext()) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Eerie rising tone
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.8);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.3);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.1);

    // Wobble overtone
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(160, now);
    osc2.frequency.exponentialRampToValueAtTime(600, now + 0.8);

    // LFO for warble
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 6;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 30;
    lfo.connect(lfoGain);
    lfoGain.connect(osc2.frequency);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.15, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.9);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);

    lfo.start(now);
    osc2.start(now);
    lfo.stop(now + 1.0);
    osc2.stop(now + 1.0);
  }

  setVolume(v) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, v));
    }
  }

  dispose() {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
    this._initialized = false;
  }
}
