class AudioEngine {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this._sounds = new Map();
    this._masterGain = null;
    this._ambient = null;
  }

  init() {
    if (this.initialized) return this;
    this.initialized = true;
    return this;
  }

  _getCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this.ctx.createGain();
      this._masterGain.connect(this.ctx.destination);
      this._masterGain.gain.value = 0.5;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  _createOscillator(freq, type, duration, options) {
    const ctx = this._getCtx();
    const opts = Object.assign({ attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.3, volume: 0.3 }, options || {});
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(opts.volume, now + opts.attack);
    gain.gain.linearRampToValueAtTime(opts.volume * opts.sustain, now + opts.attack + opts.decay);
    gain.gain.setValueAtTime(opts.volume * opts.sustain, now + duration - opts.release);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    osc.connect(gain);
    gain.connect(this._masterGain);
    osc.start(now);
    osc.stop(now + duration);
    return osc;
  }

  tone(freq, duration, options) {
    this._createOscillator(freq || 440, 'sine', duration || 0.3, options);
    return this;
  }

  beep(options) {
    const opts = Object.assign({ freq: 800, duration: 0.1, type: 'square', volume: 0.2 }, options || {});
    this._createOscillator(opts.freq, opts.type, opts.duration, { volume: opts.volume });
    return this;
  }

  click() {
    const ctx = this._getCtx();
    const now = ctx.currentTime;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass'; filter.frequency.value = 1000;
    src.buffer = buf;
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    src.connect(filter); filter.connect(gain); gain.connect(this._masterGain);
    src.start(now);
    return this;
  }

  pop() {
    const ctx = this._getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain); gain.connect(this._masterGain);
    osc.start(now); osc.stop(now + 0.15);
    return this;
  }

  success() {
    const freqs = [523.25, 659.25, 783.99];
    freqs.forEach((f, i) => {
      setTimeout(() => this._createOscillator(f, 'sine', 0.3, { volume: 0.25, attack: 0.02 }), i * 100);
    });
    return this;
  }

  error() {
    const freqs = [200, 150];
    freqs.forEach((f, i) => {
      setTimeout(() => this._createOscillator(f, 'sawtooth', 0.2, { volume: 0.15 }), i * 80);
    });
    return this;
  }

  whoosh() {
    const ctx = this._getCtx();
    const dur = 0.4;
    const now = ctx.currentTime;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4000, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + dur);
    filter.Q.value = 0.5;
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.buffer = buf;
    src.connect(filter); filter.connect(gain); gain.connect(this._masterGain);
    src.start(now);
    return this;
  }

  notification() {
    const ctx = this._getCtx();
    const now = ctx.currentTime;
    [[880, 0], [1100, 0.12], [880, 0.24]].forEach(([f, t]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = f;
      g.gain.setValueAtTime(0, now + t);
      g.gain.linearRampToValueAtTime(0.2, now + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.1);
      osc.connect(g); g.connect(this._masterGain);
      osc.start(now + t); osc.stop(now + t + 0.12);
    });
    return this;
  }

  attachToClicks(target, sound) {
    VeloxUtils.parseSelector(target).forEach(el => {
      el.addEventListener('click', () => this[sound] ? this[sound]() : this.click());
    });
    return this;
  }

  attachToHovers(target, sound) {
    VeloxUtils.parseSelector(target).forEach(el => {
      el.addEventListener('mouseenter', () => this[sound] ? this[sound]() : this.beep());
    });
    return this;
  }

  attachToInputs(target) {
    VeloxUtils.parseSelector(target).forEach(el => {
      el.addEventListener('keydown', () => this.click());
    });
    return this;
  }

  setVolume(v) {
    if (this._masterGain) this._masterGain.gain.value = VeloxUtils.clamp(v, 0, 1);
    return this;
  }

  mute() { return this.setVolume(0); }
  unmute() { return this.setVolume(0.5); }

  chord(notes, duration, options) {
    notes.forEach(f => this._createOscillator(f, 'sine', duration || 0.5, options));
    return this;
  }

  arpeggio(notes, stepDuration, options) {
    notes.forEach((f, i) => {
      setTimeout(() => this._createOscillator(f, 'sine', stepDuration || 0.2, options), i * (stepDuration || 0.2) * 1000);
    });
    return this;
  }
}

var audioEngine = new AudioEngine();
if (typeof window !== 'undefined') window.VeloxAudio = audioEngine;
