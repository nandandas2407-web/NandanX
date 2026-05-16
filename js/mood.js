class MoodEngine {
  constructor() {
    this.currentMood = null;
    this.styleEl = null;
    this.listeners = [];
    this.glitchInterval = null;
    this.heartInterval = null;
    this.initialized = false;
    this.dependents = {};
  }

  init() {
    if (this.initialized) return this;
    this.initialized = true;
    return this;
  }

  setDependents(deps) {
    this.dependents = deps;
  }

  set(mood) {
    const cfg = NandanXConfig.moods[mood];
    if (!cfg) return this;
    this._cleanup();
    this.currentMood = mood;
    this._applyCSS(mood, cfg);
    this._applyToModules(cfg);
    this._updateVars(cfg);
    this.listeners.forEach(fn => fn(mood, cfg));
    NandanXUtils.emit(document.body, 'mood:change', { mood, config: cfg });
    return this;
  }

  _cleanup() {
    clearInterval(this.glitchInterval);
    clearInterval(this.heartInterval);
    document.body.style.animation = '';
    document.body.style.filter = '';
    const scanline = document.getElementById('nx-scanline');
    if (scanline) scanline.remove();
  }

  _applyCSS(mood, cfg) {
    if (this.styleEl) this.styleEl.remove();
    this.styleEl = document.createElement('style');
    this.styleEl.id = 'nx-mood-style';
    const varBlock = `:root { --nx-primary: ${cfg.colors[0]}; --nx-secondary: ${cfg.colors[1] || cfg.colors[0]}; --nx-accent: ${cfg.colors[2] || cfg.colors[0]}; --nx-mood-speed: ${cfg.speed}; --nx-mood-intensity: ${cfg.intensity}; }`;

    const moodCSS = {
      soft: `body { background: linear-gradient(135deg,#1a1a2e,#16213e,#0f3460) !important; } * { transition-timing-function: ${cfg.easing} !important; }`,
      hyper: `body { } button,a,[role=button] { animation: nx-hyper-pulse 0.4s ease infinite alternate; }
        @keyframes nx-hyper-pulse { from{box-shadow:0 0 5px ${cfg.colors[0]}} to{box-shadow:0 0 20px ${cfg.colors[0]},0 0 40px ${cfg.colors[1]}} }`,
      calm: `* { transition-duration: 1.2s !important; transition-timing-function: ${cfg.easing} !important; }`,
      aggressive: `body { } * { transition-duration: 0.1s !important; }
        button,a,[role=button] { animation: nx-agg-shake 0.15s infinite; }
        @keyframes nx-agg-shake { 0%,100%{transform:translateX(0)} 50%{transform:translateX(2px)} }`,
      broken: `body { animation: nx-broken-body 0.15s steps(3) infinite; }
        @keyframes nx-broken-body { 0%{transform:translate(0)} 33%{transform:translate(3px,-1px)} 66%{transform:translate(-2px,2px)} 100%{transform:translate(1px,-2px)} }`,
      romantic: `body { background: linear-gradient(135deg,#1a0a14,#2d0a1e,#1a0a14) !important; }`,
    };

    this.styleEl.textContent = varBlock + (moodCSS[mood] || '');
    document.head.appendChild(this.styleEl);

    if (mood === 'broken') {
      const scanline = NandanXUtils.create('div', { id: 'nx-scanline' }, {
        position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '999997',
        background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,0,0.03) 2px,rgba(0,255,0,0.03) 4px)',
        mixBlendMode: 'screen',
      });
      document.body.appendChild(scanline);
    }

    if (mood === 'romantic') this._spawnHearts(cfg);
  }

  _applyToModules(cfg) {
    if (this.dependents.cursor && this.dependents.cursor.initialized) {
      this.dependents.cursor.setMoodColors(cfg.colors);
    }
  }

  _updateVars(cfg) {
    document.documentElement.style.setProperty('--nx-primary', cfg.colors[0]);
    document.documentElement.style.setProperty('--nx-secondary', cfg.colors[1] || cfg.colors[0]);
    document.documentElement.style.setProperty('--nx-accent', cfg.colors[2] || cfg.colors[0]);
  }

  _spawnHearts(cfg) {
    const spawn = () => {
      const heart = NandanXUtils.create('div', { textContent: ['❤️','💕','💖','💗','💓'][Math.floor(Math.random() * 5)] }, {
        position: 'fixed', left: Math.random() * 100 + 'vw', bottom: '-40px',
        fontSize: NandanXUtils.randomBetween(16, 32) + 'px',
        pointerEvents: 'none', zIndex: '99998',
        animation: `nx-heart-float ${NandanXUtils.randomBetween(3, 6)}s ease-out forwards`,
        opacity: '0.8',
      });
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 6000);
    };
    if (!document.getElementById('nx-heart-kf')) {
      const s = document.createElement('style');
      s.id = 'nx-heart-kf';
      s.textContent = '@keyframes nx-heart-float { 0%{transform:translateY(0) rotate(0deg);opacity:.8} 100%{transform:translateY(-100vh) rotate(20deg);opacity:0} }';
      document.head.appendChild(s);
    }
    this.heartInterval = setInterval(spawn, 600);
    spawn();
  }

  transition(from, to, duration) {
    const d = duration || 800;
    document.body.style.transition = `filter ${d / 2}ms ease`;
    document.body.style.filter = 'brightness(0)';
    setTimeout(() => {
      this.set(to);
      document.body.style.filter = 'brightness(1)';
      setTimeout(() => { document.body.style.transition = ''; document.body.style.filter = ''; }, d / 2);
    }, d / 2);
    return this;
  }

  cycle(moods, interval) {
    let i = 0;
    this.set(moods[0]);
    const id = setInterval(() => { i = (i + 1) % moods.length; this.set(moods[i]); }, interval || 4000);
    return { stop: () => clearInterval(id) };
  }

  onChange(fn) {
    this.listeners.push(fn);
    return this;
  }

  define(name, config) {
    NandanXConfig.moods[name] = config;
    return this;
  }
}

var moodEngine = new MoodEngine();
if (typeof window !== 'undefined') window.NandanXMood = moodEngine;
