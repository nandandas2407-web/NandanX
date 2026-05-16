// NandanX — Safe Observer polyfills (no-op stubs for environments without these APIs)
(function () {
  var noop = function () {};
  var noopObserver = function () { return { observe: noop, unobserve: noop, disconnect: noop }; };
  if (typeof window === 'undefined') return;
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = function (cb, opts) { return { observe: noop, unobserve: noop, disconnect: noop }; };
  }
  if (!window.ResizeObserver) {
    window.ResizeObserver = function (cb) { return { observe: noop, unobserve: noop, disconnect: noop }; };
  }
  if (!window.MutationObserver) {
    window.MutationObserver = function (cb) { return { observe: noop, disconnect: noop, takeRecords: function(){ return []; } }; };
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (cb) { return setTimeout(cb, 16); };
    window.cancelAnimationFrame = clearTimeout;
  }
})();

var NandanXConfig = {
  version: '1.0.2',
  author: 'Nandan Das',

  defaults: {
    duration: 600,
    easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
    easingBounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    easingElastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    color: {
      primary: '#00f5ff',
      secondary: '#ff006e',
      accent: '#7c3aed',
      glow: 'rgba(0,245,255,0.4)',
    }
  },

  moods: {
    soft: {
      speed: 0.6, intensity: 0.4, particleCount: 20, glowStrength: 0.3,
      colors: ['#ffd6e7', '#c3aed6', '#a8d8ea'],
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      cursorStyle: 'soft', blur: 8,
    },
    hyper: {
      speed: 2.5, intensity: 1.0, particleCount: 120, glowStrength: 1.0,
      colors: ['#00f5ff', '#ff006e', '#ffe600', '#00ff88'],
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      cursorStyle: 'hyper', blur: 0,
    },
    calm: {
      speed: 0.4, intensity: 0.2, particleCount: 10, glowStrength: 0.15,
      colors: ['#e0f2fe', '#bae6fd', '#7dd3fc'],
      easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      cursorStyle: 'calm', blur: 4,
    },
    aggressive: {
      speed: 3.0, intensity: 1.5, particleCount: 200, glowStrength: 2.0,
      colors: ['#ff0000', '#ff4500', '#ff8c00'],
      easing: 'cubic-bezier(0.6, -0.28, 0.74, 0.05)',
      cursorStyle: 'aggressive', blur: 0,
    },
    broken: {
      speed: 1.8, intensity: 1.2, particleCount: 80, glowStrength: 0.8,
      colors: ['#00ff00', '#ff00ff', '#ffff00'],
      easing: 'steps(4)', cursorStyle: 'glitch', blur: 0, glitch: true,
    },
    romantic: {
      speed: 0.5, intensity: 0.6, particleCount: 40, glowStrength: 0.7,
      colors: ['#ff69b4', '#ff1493', '#ffc0cb', '#ffb6c1'],
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      cursorStyle: 'heart', blur: 6,
    },
  },

  particles: {
    ambient: { count: 60, speed: 0.3, size: [1, 3], opacity: [0.2, 0.6] },
    cursor: { count: 20, speed: 0.8, size: [2, 5], lifetime: 800 },
    explosion: { count: 40, speed: 4.0, size: [3, 8], lifetime: 600 },
    stars: { count: 150, speed: 0.1, size: [1, 2], opacity: [0.3, 1.0] },
  },

  physics: {
    gravity: 0.4, friction: 0.95, bounce: 0.7,
    magnetStrength: 0.25, elasticity: 0.15, airResistance: 0.99,
  },

  scroll: {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
    staggerDelay: 80,
  },

  tilt: {
    maxAngle: 15, perspective: 1000, scale: 1.05,
    speed: 300, glare: true, glareOpacity: 0.3,
  },

  emotion: {
    wpm: { slow: 20, normal: 40, fast: 80 },
    pauses: { short: 500, medium: 1500, long: 3000 },
    backspaceWeight: 2.5, burstThreshold: 5,
  },
};

if (typeof window !== 'undefined') window.NandanXConfig = NandanXConfig;
var NandanXUtils = {

  lerp: (a, b, t) => a + (b - a) * t,
  clamp: (val, min, max) => Math.min(Math.max(val, min), max),
  map: (val, inMin, inMax, outMin, outMax) =>
    ((val - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin,
  dist: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
  angle: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1),
  randomBetween: (min, max) => Math.random() * (max - min) + min,
  randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  noise: (x) => ((Math.sin(x * 127.1 + 311.7) * 43758.5453) % 1 + 1) / 2,
  easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeOutBounce: (t) => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },

  hexToRgb: (hex) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
  },
  rgbToHsl: (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  },
  lerpColor: (c1, c2, t) => {
    const r1 = NandanXUtils.hexToRgb(c1), r2 = NandanXUtils.hexToRgb(c2);
    if (!r1 || !r2) return c1;
    return `rgb(${Math.round(NandanXUtils.lerp(r1.r, r2.r, t))},${Math.round(NandanXUtils.lerp(r1.g, r2.g, t))},${Math.round(NandanXUtils.lerp(r1.b, r2.b, t))})`;
  },
  randomHsl: (h = null, s = 70, l = 60) => `hsl(${h !== null ? h : Math.random() * 360},${s}%,${l}%)`,
  getContrastRatio: (hex1, hex2) => {
    const lum = (hex) => {
      const c = NandanXUtils.hexToRgb(hex) || { r: 0, g: 0, b: 0 };
      const toL = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * toL(c.r) + 0.7152 * toL(c.g) + 0.0722 * toL(c.b);
    };
    const l1 = lum(hex1), l2 = lum(hex2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  },

  qs: (sel, ctx) => (ctx || document).querySelector(sel),
  qsa: (sel, ctx) => [...(ctx || document).querySelectorAll(sel)],
  create: (tag, attrs, styles) => {
    const el = document.createElement(tag);
    if (attrs) Object.assign(el, attrs);
    if (styles) Object.assign(el.style, styles);
    return el;
  },
  addClass: (el, ...cls) => el && el.classList.add(...cls),
  removeClass: (el, ...cls) => el && el.classList.remove(...cls),
  toggleClass: (el, cls) => el && el.classList.toggle(cls),
  hasClass: (el, cls) => !!(el && el.classList.contains(cls)),
  setStyles: (el, styles) => { if (el) Object.assign(el.style, styles); },
  getRect: (el) => el.getBoundingClientRect(),
  getCenter: (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  },
  inViewport: (el, threshold) => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * (1 - (threshold || 0)) && r.bottom > 0;
  },
  isElement: (el) => el instanceof Element,
  parseSelector: (target) => {
    if (typeof target === 'string') return NandanXUtils.qsa(target);
    if (target instanceof Element) return [target];
    if (target instanceof NodeList || Array.isArray(target)) return [...target];
    return [];
  },

  animate: (duration, callback, easing) => {
    const ease = easing || ((t) => t);
    const start = performance.now();
    const tick = (now) => {
      const progress = NandanXUtils.clamp((now - start) / duration, 0, 1);
      callback(ease(progress), progress);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },
  spring: (from, to, stiffness, damping) => {
    const k = stiffness || 0.1;
    const d = damping !== undefined ? damping : 0.75;
    let value = from, velocity = 0;
    return {
      tick() {
        velocity += (to - value) * k;
        velocity *= d;
        value += velocity;
        return { value, settled: Math.abs(velocity) < 0.001 && Math.abs(to - value) < 0.001 };
      },
      setTarget(t) { to = t; },
      getValue() { return value; },
    };
  },
  staggerCb: (elements, delay, callback) => {
    elements.forEach((el, i) => setTimeout(() => callback(el, i), i * delay));
  },
  once: (el, event, fn) => {
    const h = (...args) => { fn(...args); el.removeEventListener(event, h); };
    el.addEventListener(event, h);
  },
  debounce: (fn, delay) => {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
  },
  throttle: (fn, limit) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => { inThrottle = false; }, limit);
      }
    };
  },

  createCanvas: (w, h, styles) => {
    const canvas = document.createElement('canvas');
    canvas.width = w || window.innerWidth;
    canvas.height = h || window.innerHeight;
    Object.assign(canvas.style, { position: 'fixed', top: '0', left: '0', pointerEvents: 'none', zIndex: '9999' });
    if (styles) Object.assign(canvas.style, styles);
    return canvas;
  },
  resizeCanvas: (canvas) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  },
  drawCircle: (ctx, x, y, r, color, alpha) => {
    ctx.save();
    ctx.globalAlpha = alpha !== undefined ? alpha : 1;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  },
  drawGlow: (ctx, x, y, r, color) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  },

  uid: () => Math.random().toString(36).slice(2, 10),
  kebabCase: (s) => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
  capitalize: (s) => s.charAt(0).toUpperCase() + s.slice(1),
  tokenize: (text) => text.toLowerCase().match(/\b[a-z]+\b/g) || [],

  on: (el, events, fn, opts) => events.split(' ').forEach(e => el.addEventListener(e, fn, opts)),
  off: (el, events, fn) => events.split(' ').forEach(e => el.removeEventListener(e, fn)),
  emit: (el, name, detail) => el.dispatchEvent(new CustomEvent('vx:' + name, { detail: detail || {}, bubbles: true })),

  isMobile: () => /Mobi|Android/i.test(navigator.userAgent),
  prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  supportsTouch: () => 'ontouchstart' in window,
  devicePixelRatio: () => window.devicePixelRatio || 1,
};

if (typeof window !== 'undefined') window.NandanXUtils = NandanXUtils;
class CursorEngine {
  constructor() {
    this.mouse = { x: -100, y: -100 };
    this.pos = { x: -100, y: -100 };
    this.trails = [];
    this.particles = [];
    this.clickBurst = [];
    this.currentMode = 'default';
    this.canvas = null;
    this.ctx = null;
    this.frame = null;
    this.outer = null;
    this.inner = null;
    this.label = null;
    this.options = {};
    this.initialized = false;
  }

  init(options) {
    if (this.initialized || NandanXUtils.isMobile()) return this;
    this.options = Object.assign({
      trailLength: 16,
      trailParticles: true,
      glowRadius: 40,
      glowColor: '#00f5ff',
    }, options || {});
    this._injectStyles();
    this._createDOM();
    this._createCanvas();
    this._bindEvents();
    this._setupContextAwareness();
    this._loop();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-cursor-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-cursor-styles';
    s.textContent = `
      * { cursor: none !important; }
      .nx-cursor-outer {
        position: fixed; top: 0; left: 0; pointer-events: none; z-index: 999999;
        width: 36px; height: 36px; border-radius: 50%;
        border: 2px solid rgba(0,245,255,0.8);
        transform: translate(-50%,-50%);
        transition: width 0.25s ease, height 0.25s ease, border-color 0.25s ease, border-radius 0.25s ease;
        mix-blend-mode: screen;
        will-change: left, top;
      }
      .nx-cursor-inner {
        position: fixed; top: 0; left: 0; pointer-events: none; z-index: 1000000;
        width: 8px; height: 8px; border-radius: 50%;
        background: #00f5ff;
        transform: translate(-50%,-50%);
        transition: transform 0.1s ease, background 0.25s ease;
        box-shadow: 0 0 12px #00f5ff, 0 0 24px rgba(0,245,255,0.4);
        mix-blend-mode: screen;
        will-change: left, top;
      }
      .nx-cursor-label {
        position: fixed; pointer-events: none; z-index: 1000001;
        font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
        color: #fff; white-space: nowrap;
        transform: translate(14px, -50%);
        opacity: 0; transition: opacity 0.2s;
        font-family: 'Space Mono', monospace;
      }
      .nx-cursor-label.nx-visible { opacity: 1; }
      .nx-cur-hover { width: 56px !important; height: 56px !important; border-color: rgba(255,0,110,0.9) !important; background: rgba(255,0,110,0.04) !important; }
      .nx-cur-text { width: 72px !important; height: 72px !important; border-color: rgba(124,58,237,0.8) !important; mix-blend-mode: difference !important; background: rgba(255,255,255,0.08) !important; }
      .nx-cur-image { width: 64px !important; height: 64px !important; border-color: rgba(255,230,0,0.9) !important; border-radius: 8px !important; }
      .nx-cur-link { width: 48px !important; height: 48px !important; background: rgba(0,245,255,0.08) !important; animation: nx-cur-spin 1.4s linear infinite !important; }
      .nx-cur-glitch { animation: nx-cur-glitch 0.08s infinite !important; }
      @keyframes nx-cur-spin { to { transform: translate(-50%,-50%) rotate(360deg); } }
      @keyframes nx-cur-glitch {
        0%   { transform: translate(-50%,-50%) translate(0,0); }
        25%  { transform: translate(-50%,-50%) translate(3px,-2px); }
        50%  { transform: translate(-50%,-50%) translate(-2px,3px); }
        75%  { transform: translate(-50%,-50%) translate(2px,1px); }
        100% { transform: translate(-50%,-50%) translate(-1px,-3px); }
      }
    `;
    document.head.appendChild(s);
  }

  _createDOM() {
    this.outer = NandanXUtils.create('div', { className: 'nx-cursor-outer' });
    this.inner = NandanXUtils.create('div', { className: 'nx-cursor-inner' });
    this.label = NandanXUtils.create('div', { className: 'nx-cursor-label' });
    document.body.appendChild(this.outer);
    document.body.appendChild(this.inner);
    document.body.appendChild(this.label);
  }

  _createCanvas() {
    this.canvas = NandanXUtils.createCanvas(window.innerWidth, window.innerHeight, { zIndex: '999998', mixBlendMode: 'screen' });
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;
    window.addEventListener('resize', () => NandanXUtils.resizeCanvas(this.canvas));
  }

  _bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.trails.unshift({ x: e.clientX, y: e.clientY });
      if (this.trails.length > this.options.trailLength) this.trails.pop();
      if (this.options.trailParticles && Math.random() > 0.5) {
        this.particles.push({
          x: e.clientX, y: e.clientY,
          r: NandanXUtils.randomBetween(1.5, 4),
          life: 1, decay: NandanXUtils.randomBetween(0.05, 0.1),
          color: this.options.glowColor,
          vx: NandanXUtils.randomBetween(-0.8, 0.8),
          vy: NandanXUtils.randomBetween(-0.8, 0.8),
        });
      }
    });

    document.addEventListener('mousedown', (e) => {
      this._spawnClickBurst(e.clientX, e.clientY);
      this.inner.style.transform = 'translate(-50%,-50%) scale(0.65)';
    });

    document.addEventListener('mouseup', () => {
      this.inner.style.transform = 'translate(-50%,-50%) scale(1)';
    });
  }

  _setupContextAwareness() {
    const bind = (sel, mode, label) => {
      NandanXUtils.qsa(sel).forEach(el => {
        el.addEventListener('mouseenter', () => this._setMode(mode, label || ''));
        el.addEventListener('mouseleave', () => this._setMode('default'));
      });
    };
    const run = () => {
      bind('a, button, [role="button"]', 'hover', 'Click');
      bind('p, h1, h2, h3, h4, h5, h6, span, label, li', 'text');
      bind('img, video, figure', 'image', 'View');
      bind('input, textarea, select', 'text');
    };
    run();
    const obs = new MutationObserver(run);
    obs.observe(document.body, { childList: true, subtree: true });
  }

  _setMode(mode, label) {
    this.currentMode = mode;
    this.outer.className = 'nx-cursor-outer';
    if (mode === 'hover') this.outer.classList.add('nx-cur-hover');
    else if (mode === 'text') this.outer.classList.add('nx-cur-text');
    else if (mode === 'image') this.outer.classList.add('nx-cur-image');
    else if (mode === 'link') this.outer.classList.add('nx-cur-link');
    else if (mode === 'glitch') this.outer.classList.add('nx-cur-glitch');

    const colors = { hover: '#ff006e', image: '#ffe600', text: '#7c3aed' };
    const c = colors[mode] || this.options.glowColor;
    this.inner.style.background = c;
    this.inner.style.boxShadow = `0 0 12px ${c}, 0 0 24px ${c}66`;

    if (label) {
      this.label.textContent = label;
      this.label.classList.add('nx-visible');
    } else {
      this.label.classList.remove('nx-visible');
    }
  }

  _spawnClickBurst(x, y) {
    const count = 14;
    const colors = [this.options.glowColor, '#ff006e', '#ffe600', '#00ff88'];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = NandanXUtils.randomBetween(3, 9);
      this.clickBurst.push({
        x, y, r: NandanXUtils.randomBetween(2, 6),
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 1, decay: NandanXUtils.randomBetween(0.04, 0.07),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  _loop() {
    if (!this.ctx) return;
    this.frame = requestAnimationFrame(() => this._loop());
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.pos.x = NandanXUtils.lerp(this.pos.x, this.mouse.x, 0.15);
    this.pos.y = NandanXUtils.lerp(this.pos.y, this.mouse.y, 0.15);

    this.outer.style.left = this.pos.x + 'px';
    this.outer.style.top = this.pos.y + 'px';
    this.inner.style.left = this.mouse.x + 'px';
    this.inner.style.top = this.mouse.y + 'px';
    this.label.style.left = this.pos.x + 'px';
    this.label.style.top = this.pos.y + 'px';

    NandanXUtils.drawGlow(ctx, this.pos.x, this.pos.y, this.options.glowRadius, this.options.glowColor + '1a');

    this._drawTrail(ctx);

    this.particles = this.particles.filter(p => {
      p.life -= p.decay;
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.97; p.vy *= 0.97;
      if (p.life <= 0) return false;
      NandanXUtils.drawCircle(ctx, p.x, p.y, p.r * p.life, p.color, p.life * 0.7);
      return true;
    });

    this.clickBurst = this.clickBurst.filter(p => {
      p.life -= p.decay;
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.15; p.vx *= 0.97;
      if (p.life <= 0) return false;
      NandanXUtils.drawCircle(ctx, p.x, p.y, p.r * p.life, p.color, p.life);
      return true;
    });
  }

  _drawTrail(ctx) {
    if (this.trails.length < 2) return;
    ctx.save();
    for (let i = 0; i < this.trails.length - 1; i++) {
      const a = this.trails[i], b = this.trails[i + 1];
      const alpha = (1 - i / this.trails.length) * 0.45;
      const width = (1 - i / this.trails.length) * 3.5;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = this.options.glowColor;
      ctx.lineWidth = width;
      ctx.globalAlpha = alpha;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.restore();
  }

  setColor(color) {
    this.options.glowColor = color;
    this.inner.style.background = color;
    this.inner.style.boxShadow = `0 0 12px ${color}, 0 0 24px ${color}66`;
    return this;
  }

  setStyle(style) {
    if (style === 'glitch') this._setMode('glitch');
    return this;
  }

  setMoodColors(colors) {
    if (Array.isArray(colors) && colors.length > 0) this.setColor(colors[0]);
    return this;
  }

  destroy() {
    if (this.frame) cancelAnimationFrame(this.frame);
    [this.outer, this.inner, this.canvas, this.label].forEach(el => el && el.remove());
    const s = document.getElementById('nx-cursor-styles');
    if (s) s.remove();
    this.initialized = false;
  }
}

var cursorEngine = new CursorEngine();
if (typeof window !== 'undefined') window.NandanXCursor = cursorEngine;
class HoverEngine {
  constructor() {
    this.activeEffects = new Map();
    this.initialized = false;
  }

  init() {
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-hover-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-hover-styles';
    s.textContent = `
      .nx-lift { transition: transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease; will-change: transform; }
      .nx-lift:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 60px rgba(0,245,255,0.25), 0 8px 20px rgba(0,0,0,0.3); }

      .nx-neon { transition: box-shadow 0.3s ease; }
      .nx-neon:hover { box-shadow: 0 0 8px var(--nx-neon-color,#00f5ff), 0 0 24px var(--nx-neon-color,#00f5ff), 0 0 50px var(--nx-neon-color,#00f5ff)44; }

      .nx-glitch { position: relative; overflow: hidden; display: inline-block; }
      .nx-glitch::before, .nx-glitch::after {
        content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        pointer-events: none; opacity: 0;
      }
      .nx-glitch:hover { animation: nx-glitch-base 0.3s steps(4); }
      .nx-glitch:hover::before { animation: nx-gc1 0.3s steps(4) infinite; color: #ff006e; clip-path: polygon(0 20%,100% 20%,100% 45%,0 45%); transform: translate(-3px); opacity: 0.85; }
      .nx-glitch:hover::after { animation: nx-gc2 0.3s steps(4) infinite; color: #00f5ff; clip-path: polygon(0 60%,100% 60%,100% 82%,0 82%); transform: translate(3px); opacity: 0.85; }
      @keyframes nx-glitch-base { 0%,100%{transform:translate(0)} 25%{transform:translate(-2px,1px)} 50%{transform:translate(2px,-1px)} 75%{transform:translate(-1px,2px)} }
      @keyframes nx-gc1 { 0%,100%{clip-path:polygon(0 0%,100% 0%,100% 25%,0 25%);transform:translate(-3px)} 33%{clip-path:polygon(0 40%,100% 40%,100% 65%,0 65%);transform:translate(2px)} 66%{clip-path:polygon(0 70%,100% 70%,100% 90%,0 90%);transform:translate(-3px)} }
      @keyframes nx-gc2 { 0%,100%{clip-path:polygon(0 75%,100% 75%,100% 100%,0 100%);transform:translate(3px)} 33%{clip-path:polygon(0 10%,100% 10%,100% 35%,0 35%);transform:translate(-2px)} 66%{clip-path:polygon(0 45%,100% 45%,100% 70%,0 70%);transform:translate(3px)} }

      .nx-spotlight { position: relative; overflow: hidden; }
      .nx-spotlight::after {
        content: ''; position: absolute; inset: 0; opacity: 0; pointer-events: none;
        background: radial-gradient(circle 130px at var(--nx-mx,50%) var(--nx-my,50%), rgba(255,255,255,0.13), transparent 70%);
        transition: opacity 0.3s;
      }
      .nx-spotlight:hover::after { opacity: 1; }

      .nx-liquid { position: relative; overflow: hidden; }
      .nx-liquid::before {
        content: ''; position: absolute; bottom: -100%; left: 50%;
        width: 250%; height: 250%; border-radius: 42%;
        background: rgba(0,245,255,0.12);
        transform: translateX(-50%);
        transition: bottom 0.7s cubic-bezier(0.23,1,0.32,1); pointer-events: none;
      }
      .nx-liquid:hover::before { bottom: -30%; }

      .nx-underline { position: relative; display: inline-block; }
      .nx-underline::after {
        content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px;
        background: var(--nx-primary,#00f5ff);
        transition: width 0.4s cubic-bezier(0.23,1,0.32,1);
      }
      .nx-underline:hover::after { width: 100%; }

      .nx-shake:hover { animation: nx-shake 0.5s cubic-bezier(0.36,0.07,0.19,0.97); }
      @keyframes nx-shake {
        10%,90%{transform:translate(-1px,0)} 20%,80%{transform:translate(2px,0)}
        30%,50%,70%{transform:translate(-3px,0)} 40%,60%{transform:translate(3px,0)}
      }

      .nx-float-hover { transition: transform 0.4s ease; }
      .nx-float-hover:hover { transform: translateY(-6px); }

      .nx-morph { transition: border-radius 0.4s cubic-bezier(0.34,1.56,0.64,1); }
      .nx-morph:hover { border-radius: 50% !important; }

      .nx-skew { transition: transform 0.3s cubic-bezier(0.23,1,0.32,1); display: inline-block; }
      .nx-skew:hover { transform: skewX(-8deg) scale(1.04); }

      .nx-color-shift { transition: background-color 0.4s ease, color 0.4s ease; }

      .nx-border-trace { position: relative; }
      .nx-border-trace::before {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(90deg, var(--nx-primary,#00f5ff) 50%, transparent 50%) top/200% 2px no-repeat,
                    linear-gradient(180deg, var(--nx-primary,#00f5ff) 50%, transparent 50%) right/2px 200% no-repeat;
        background-size: 200% 2px, 2px 200%;
        transition: background-position 0.4s ease; pointer-events: none;
      }
      .nx-border-trace:hover::before { background-position: right top, right bottom; }
    `;
    document.head.appendChild(s);
  }

  lift(target) {
    NandanXUtils.parseSelector(target).forEach(el => el.classList.add('nx-lift'));
    return this;
  }

  neon(target, color) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-neon');
      if (color) el.style.setProperty('--nx-neon-color', color);
    });
    return this;
  }

  glitch(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      if (!el.dataset.text) el.dataset.text = el.textContent;
      el.classList.add('nx-glitch');
    });
    return this;
  }

  spotlight(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-spotlight');
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--nx-mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--nx-my', (e.clientY - r.top) + 'px');
      });
    });
    return this;
  }

  liquid(target) {
    NandanXUtils.parseSelector(target).forEach(el => el.classList.add('nx-liquid'));
    return this;
  }

  tilt(target, options) {
    const opts = Object.assign({ maxAngle: 15, glare: false, scale: 1.04 }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      let glareEl = null;
      if (opts.glare) {
        glareEl = NandanXUtils.create('div', {}, {
          position: 'absolute', inset: '0', borderRadius: 'inherit',
          pointerEvents: 'none', zIndex: '1', overflow: 'hidden',
        });
        const g = NandanXUtils.create('div', {}, {
          position: 'absolute', top: '-50%', left: '-50%',
          width: '200%', height: '200%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15), transparent)',
          opacity: '0', transition: 'opacity 0.3s',
          transform: 'rotate(-45deg)',
        });
        glareEl.appendChild(g);
        el.style.position = 'relative';
        el.appendChild(glareEl);
      }
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width - 0.5;
        const cy = (e.clientY - r.top) / r.height - 0.5;
        const rx = cy * -opts.maxAngle * 2;
        const ry = cx * opts.maxAngle * 2;
        el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${opts.scale})`;
        el.style.transition = 'transform 0.1s ease';
        if (glareEl) {
          const g = glareEl.firstChild;
          g.style.opacity = '1';
          g.style.transform = `rotate(${cx * 60}deg)`;
        }
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
        el.style.transition = 'transform 0.5s ease';
        if (glareEl) glareEl.firstChild.style.opacity = '0';
      });
    });
    return this;
  }

  magneticText(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      const text = el.textContent;
      el.textContent = '';
      el.style.display = 'inline-block';
      text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00a0' : char;
        span.style.display = 'inline-block';
        span.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), color 0.3s';
        el.appendChild(span);
      });
      el.addEventListener('mouseenter', () => {
        [...el.children].forEach((span, i) => {
          span.style.transform = `translateY(${i % 2 === 0 ? -8 : 8}px)`;
          span.style.color = NandanXUtils.randomHsl(i * 30, 80, 65);
        });
      });
      el.addEventListener('mouseleave', () => {
        [...el.children].forEach(span => {
          span.style.transform = 'translateY(0)';
          span.style.color = '';
        });
      });
    });
    return this;
  }

  borderTrace(target) {
    NandanXUtils.parseSelector(target).forEach(el => el.classList.add('nx-border-trace'));
    return this;
  }

  shake(target) {
    NandanXUtils.parseSelector(target).forEach(el => el.classList.add('nx-shake'));
    return this;
  }

  morph(target) {
    NandanXUtils.parseSelector(target).forEach(el => el.classList.add('nx-morph'));
    return this;
  }

  underline(target) {
    NandanXUtils.parseSelector(target).forEach(el => el.classList.add('nx-underline'));
    return this;
  }

  skew(target) {
    NandanXUtils.parseSelector(target).forEach(el => el.classList.add('nx-skew'));
    return this;
  }

  float(target) {
    NandanXUtils.parseSelector(target).forEach(el => el.classList.add('nx-float-hover'));
    return this;
  }

  colorShift(target, hoverColor) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-color-shift');
      const orig = el.style.backgroundColor;
      el.addEventListener('mouseenter', () => { el.style.backgroundColor = hoverColor || '#00f5ff22'; });
      el.addEventListener('mouseleave', () => { el.style.backgroundColor = orig; });
    });
    return this;
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-hover]').forEach(el => {
        if (el.dataset.nxHoverDone) return;
        el.dataset.nxHoverDone = '1';
        const effect = el.dataset.nxHover;
        if (this[effect]) this[effect](el);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var hoverEngine = new HoverEngine();
if (typeof window !== 'undefined') window.NandanXHover = hoverEngine;
class ScrollEngine {
  constructor() {
    this.observer = null;
    this.parallaxEls = [];
    this.counterEls = [];
    this.horizontalEls = [];
    this.progressBar = null;
    this.rafId = null;
    this.initialized = false;
  }

  init(options) {
    if (this.initialized) return this;
    this.options = Object.assign({
      threshold: NandanXConfig.scroll.threshold,
      rootMargin: NandanXConfig.scroll.rootMargin,
      staggerDelay: NandanXConfig.scroll.staggerDelay,
    }, options || {});
    this._injectStyles();
    this._setupObserver();
    this._autoDetect();
    this._bindScroll();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-scroll-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-scroll-styles';
    s.textContent = `
      .nx-fade-up    { opacity:0; transform:translateY(40px); transition:opacity .7s ease,transform .7s cubic-bezier(.23,1,.32,1); }
      .nx-fade-down  { opacity:0; transform:translateY(-40px); transition:opacity .7s ease,transform .7s cubic-bezier(.23,1,.32,1); }
      .nx-fade-left  { opacity:0; transform:translateX(50px); transition:opacity .7s ease,transform .7s cubic-bezier(.23,1,.32,1); }
      .nx-fade-right { opacity:0; transform:translateX(-50px); transition:opacity .7s ease,transform .7s cubic-bezier(.23,1,.32,1); }
      .nx-zoom-in    { opacity:0; transform:scale(0.83); transition:opacity .6s ease,transform .6s cubic-bezier(.34,1.56,.64,1); }
      .nx-zoom-out   { opacity:0; transform:scale(1.18); transition:opacity .6s ease,transform .6s ease; }
      .nx-flip-x     { opacity:0; transform:rotateX(65deg); transform-origin:bottom center; perspective:900px; transition:opacity .6s ease,transform .6s cubic-bezier(.23,1,.32,1); }
      .nx-flip-y     { opacity:0; transform:rotateY(65deg); perspective:900px; transition:opacity .6s ease,transform .6s cubic-bezier(.23,1,.32,1); }
      .nx-blur-reveal { opacity:0; filter:blur(20px); transform:scale(0.96); transition:opacity .8s ease,filter .8s ease,transform .8s cubic-bezier(.23,1,.32,1); }
      .nx-skew-reveal { opacity:0; transform:skewX(-15deg) translateX(-30px); transition:opacity .6s ease,transform .6s cubic-bezier(.23,1,.32,1); }
      .nx-clip-reveal { opacity:0; clip-path:inset(0 100% 0 0); transition:opacity .6s ease,clip-path .8s cubic-bezier(.23,1,.32,1); }
      .nx-cinematic   { opacity:0; transform:scale(1.08); filter:brightness(0.3); transition:opacity 1.2s ease,transform 1.2s ease,filter 1.2s ease; }
      .nx-float-up    { opacity:0; transform:translateY(60px) rotate(3deg); transition:opacity .7s ease,transform .9s cubic-bezier(.34,1.56,.64,1); }
      .nx-swing-in    { opacity:0; transform:rotateZ(-8deg) translateY(20px); transform-origin:top center; transition:opacity .6s ease,transform .7s cubic-bezier(.34,1.56,.64,1); }

      .nx-visible { opacity:1 !important; transform:none !important; filter:none !important; clip-path:none !important; }

      .nx-progress-bar {
        position:fixed; top:0; left:0; height:3px; z-index:99999;
        background:linear-gradient(90deg,#00f5ff,#7c3aed,#ff006e);
        transform-origin:left; transform:scaleX(0); transition:transform 0.1s linear;
        pointer-events:none;
      }
    `;
    document.head.appendChild(s);
  }

  _setupObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting) {
          const delay = parseInt(el.dataset.nxDelay || '0', 10);
          setTimeout(() => el.classList.add('nx-visible'), delay);
          if (!el.dataset.nxRepeat) this.observer.unobserve(el);
        } else if (el.dataset.nxRepeat) {
          el.classList.remove('nx-visible');
        }
      });
    }, {
      threshold: this.options.threshold,
      rootMargin: this.options.rootMargin,
    });
  }

  reveal(target, type, options) {
    const typeMap = {
      'fade-up': 'nx-fade-up', 'fade-down': 'nx-fade-down',
      'fade-left': 'nx-fade-left', 'fade-right': 'nx-fade-right',
      'zoom-in': 'nx-zoom-in', 'zoom-out': 'nx-zoom-out',
      'flip-x': 'nx-flip-x', 'flip-y': 'nx-flip-y',
      'blur-reveal': 'nx-blur-reveal', 'skew-reveal': 'nx-skew-reveal',
      'clip-reveal': 'nx-clip-reveal', 'cinematic': 'nx-cinematic',
      'float-up': 'nx-float-up', 'swing-in': 'nx-swing-in',
    };
    const cls = typeMap[type] || 'nx-fade-up';
    NandanXUtils.parseSelector(target).forEach((el, i) => {
      el.classList.add(cls);
      if (options && options.delay) el.dataset.nxDelay = options.delay + i * 60;
      if (options && options.repeat) el.dataset.nxRepeat = '1';
      this.observer.observe(el);
    });
    return this;
  }

  stagger(target, delay) {
    const d = delay || this.options.staggerDelay;
    NandanXUtils.parseSelector(target).forEach(container => {
      [...container.children].forEach((child, i) => {
        child.classList.add('nx-fade-up');
        child.dataset.nxDelay = i * d;
        this.observer.observe(child);
      });
    });
    return this;
  }

  counter(target, options) {
    NandanXUtils.parseSelector(target).forEach(el => {
      const to = parseFloat(el.dataset.nxTarget || (options && options.target) || 0);
      const suffix = el.dataset.nxSuffix || (options && options.suffix) || '';
      const prefix = el.dataset.nxPrefix || (options && options.prefix) || '';
      const duration = parseInt(el.dataset.nxDuration || (options && options.duration) || 1800, 10);
      const decimals = parseInt(el.dataset.nxDecimals || (options && options.decimals) || 0, 10);

      const obs = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        obs.unobserve(el);
        const start = performance.now();
        const tick = (now) => {
          const p = NandanXUtils.clamp((now - start) / duration, 0, 1);
          const val = NandanXUtils.easeOutQuart(p) * to;
          el.textContent = prefix + val.toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.3 });
      obs.observe(el);
    });
    return this;
  }

  parallax(target, options) {
    const speed = (options && options.speed) || 0.4;
    NandanXUtils.parseSelector(target).forEach(el => {
      this.parallaxEls.push({ el, speed });
    });
    return this;
  }

  horizontalScroll(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      this.horizontalEls.push(el);
    });
    return this;
  }

  showProgress() {
    if (this.progressBar) return this;
    this.progressBar = NandanXUtils.create('div', { className: 'nx-progress-bar' });
    document.body.appendChild(this.progressBar);
    return this;
  }

  _bindScroll() {
    const onScroll = () => {
      if (this.rafId) return;
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        const scrollY = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;

        if (this.progressBar && maxScroll > 0) {
          this.progressBar.style.transform = `scaleX(${scrollY / maxScroll})`;
        }

        this.parallaxEls.forEach(({ el, speed }) => {
          el.style.transform = `translateY(${scrollY * speed}px)`;
        });

        this.horizontalEls.forEach(el => {
          const r = el.getBoundingClientRect();
          const progress = NandanXUtils.clamp(-r.top / (r.height - window.innerHeight), 0, 1);
          el.style.transform = `translateX(${-progress * (r.width - window.innerWidth)}px)`;
        });
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-scroll]').forEach(el => {
        if (el.dataset.nxScrollDone) return;
        el.dataset.nxScrollDone = '1';
        this.reveal(el, el.dataset.nxScroll);
      });
      NandanXUtils.qsa('[data-nx-parallax]').forEach(el => {
        if (el.dataset.nxParallaxDone) return;
        el.dataset.nxParallaxDone = '1';
        this.parallax(el, { speed: parseFloat(el.dataset.nxSpeed || '0.4') });
      });
      NandanXUtils.qsa('.nx-counter').forEach(el => {
        if (el.dataset.nxCounterDone) return;
        el.dataset.nxCounterDone = '1';
        this.counter(el);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var scrollEngine = new ScrollEngine();
if (typeof window !== 'undefined') window.NandanXScroll = scrollEngine;
class MagnetEngine {
  constructor() {
    this.elements = [];
    this.rafId = null;
    this.mouse = { x: 0, y: 0 };
    this.initialized = false;
  }

  init() {
    if (this.initialized) return this;
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    this._loop();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  attract(target, options) {
    const opts = Object.assign({ radius: 100, strength: 0.35, scale: 1.08 }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      el.style.transition = 'box-shadow 0.3s ease';
      el.style.willChange = 'transform';
      this.elements.push({ el, type: 'attract', opts, ox: 0, oy: 0, cx: 0, cy: 0, active: false });
    });
    return this;
  }

  repel(target, options) {
    const opts = Object.assign({ radius: 100, strength: 0.35 }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      this.elements.push({ el, type: 'repel', opts, ox: 0, oy: 0, cx: 0, cy: 0, active: false });
    });
    return this;
  }

  elastic(target, options) {
    const opts = Object.assign({ stiffness: 0.12, damping: 0.75 }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      let dragging = false, sx = 0, sy = 0, mx = 0, my = 0;
      let vx = 0, vy = 0, cx = 0, cy = 0;
      el.style.cursor = 'grab';
      el.addEventListener('mousedown', (e) => {
        dragging = true;
        const r = el.getBoundingClientRect();
        sx = e.clientX - r.left - r.width / 2;
        sy = e.clientY - r.top - r.height / 2;
        el.style.cursor = 'grabbing';
        e.preventDefault();
      });
      document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        mx = e.clientX - sx;
        my = e.clientY - sy;
      });
      document.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        el.style.cursor = 'grab';
        mx = 0; my = 0;
      });
      const tick = () => {
        requestAnimationFrame(tick);
        if (dragging) {
          const r = el.getBoundingClientRect();
          cx = NandanXUtils.lerp(cx, mx - (r.left + r.width / 2 + window.scrollX), 0.3);
          cy = NandanXUtils.lerp(cy, my - (r.top + r.height / 2 + window.scrollY), 0.3);
        } else {
          vx += (0 - cx) * opts.stiffness;
          vy += (0 - cy) * opts.stiffness;
          vx *= opts.damping;
          vy *= opts.damping;
          cx += vx;
          cy += vy;
        }
        el.style.transform = `translate(${cx}px,${cy}px)`;
      };
      tick();
    });
    return this;
  }

  gravity(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      let x = 0, y = 0, vx = NandanXUtils.randomBetween(-2, 2), vy = -2;
      const tick = () => {
        requestAnimationFrame(tick);
        vy += NandanXConfig.physics.gravity;
        vx *= NandanXConfig.physics.airResistance;
        x += vx; y += vy;
        const wh = window.innerHeight - el.offsetHeight;
        const ww = window.innerWidth - el.offsetWidth;
        if (y > wh) { y = wh; vy *= -NandanXConfig.physics.bounce; }
        if (y < 0) { y = 0; vy *= -0.5; }
        if (x > ww) { x = ww; vx *= -1; }
        if (x < 0) { x = 0; vx *= -1; }
        el.style.position = 'fixed';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
      };
      tick();
    });
    return this;
  }

  wobble(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.addEventListener('mouseenter', () => {
        let t = 0, amp = 6;
        const tick = () => {
          t += 0.3; amp *= 0.92;
          el.style.transform = `rotate(${Math.sin(t) * amp}deg)`;
          if (amp > 0.1) requestAnimationFrame(tick);
          else el.style.transform = '';
        };
        requestAnimationFrame(tick);
      });
    });
    return this;
  }

  bouncyClick(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.addEventListener('mousedown', () => {
        el.style.transition = 'transform 0.1s ease';
        el.style.transform = 'scale(0.9)';
      });
      el.addEventListener('mouseup', () => {
        el.style.transform = 'scale(1.12)';
        setTimeout(() => { el.style.transform = 'scale(1)'; }, 120);
      });
    });
    return this;
  }

  float(target) {
    NandanXUtils.parseSelector(target).forEach((el, i) => {
      let t = i * 0.5;
      el.style.willChange = 'transform';
      const tick = () => {
        requestAnimationFrame(tick);
        t += 0.02;
        const y = Math.sin(t) * 8;
        const r = Math.sin(t * 0.5) * 1.5;
        el.style.transform = `translateY(${y}px) rotate(${r}deg)`;
      };
      tick();
    });
    return this;
  }

  orbital(target, options) {
    const opts = Object.assign({ radius: 60, speed: 0.02 }, options || {});
    NandanXUtils.parseSelector(target).forEach((el, i) => {
      let angle = i * ((Math.PI * 2) / 3);
      el.style.position = 'absolute';
      const tick = () => {
        requestAnimationFrame(tick);
        angle += opts.speed;
        el.style.transform = `translate(${Math.cos(angle) * opts.radius}px,${Math.sin(angle) * opts.radius}px)`;
      };
      tick();
    });
    return this;
  }

  snapGrid(target, options) {
    const gridSize = (options && options.gridSize) || 40;
    NandanXUtils.parseSelector(target).forEach(el => {
      let dragging = false, startX = 0, startY = 0, ox = 0, oy = 0;
      el.style.cursor = 'grab';
      el.addEventListener('mousedown', (e) => {
        dragging = true;
        startX = e.clientX; startY = e.clientY;
        el.style.cursor = 'grabbing';
        e.preventDefault();
      });
      document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        el.style.transform = `translate(${ox + e.clientX - startX}px,${oy + e.clientY - startY}px)`;
      });
      document.addEventListener('mouseup', (e) => {
        if (!dragging) return;
        dragging = false;
        el.style.cursor = 'grab';
        ox = Math.round((ox + e.clientX - startX) / gridSize) * gridSize;
        oy = Math.round((oy + e.clientY - startY) / gridSize) * gridSize;
        el.style.transition = 'transform 0.2s ease';
        el.style.transform = `translate(${ox}px,${oy}px)`;
        setTimeout(() => { el.style.transition = ''; }, 220);
      });
    });
    return this;
  }

  _loop() {
    requestAnimationFrame(() => this._loop());
    this.elements.forEach(item => {
      const { el, type, opts } = item;
      const c = NandanXUtils.getCenter(el);
      const dx = this.mouse.x - c.x;
      const dy = this.mouse.y - c.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      const inside = d < opts.radius;

      if (inside) {
        const factor = (1 - d / opts.radius) * opts.strength * (type === 'repel' ? -1 : 1);
        item.cx = NandanXUtils.lerp(item.cx, dx * factor, 0.12);
        item.cy = NandanXUtils.lerp(item.cy, dy * factor, 0.12);
        item.active = true;
      } else {
        item.cx = NandanXUtils.lerp(item.cx, 0, 0.1);
        item.cy = NandanXUtils.lerp(item.cy, 0, 0.1);
        item.active = false;
      }
      const scale = inside && opts.scale ? NandanXUtils.lerp(1, opts.scale, (1 - d / opts.radius)) : 1;
      el.style.transform = `translate(${item.cx}px,${item.cy}px) scale(${scale})`;
    });
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-magnet]').forEach(el => {
        if (el.dataset.nxMagnetDone) return;
        el.dataset.nxMagnetDone = '1';
        this.attract(el);
      });
      NandanXUtils.qsa('[data-nx-elastic]').forEach(el => {
        if (el.dataset.nxElasticDone) return;
        el.dataset.nxElasticDone = '1';
        this.elastic(el);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var magnetEngine = new MagnetEngine();
if (typeof window !== 'undefined') window.NandanXMagnet = magnetEngine;
class ParticleEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.systems = new Map();
    this.rafId = null;
    this.mouse = { x: -1000, y: -1000 };
    this.initialized = false;
  }

  init(options) {
    if (this.initialized) return this;
    this.canvas = NandanXUtils.createCanvas(window.innerWidth, window.innerHeight, { zIndex: '9990', mixBlendMode: 'screen' });
    document.body.insertBefore(this.canvas, document.body.firstChild);
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return this;
    window.addEventListener('resize', () => {
      NandanXUtils.resizeCanvas(this.canvas);
      this.systems.forEach(sys => { if (sys.onResize) sys.onResize(); });
    });
    document.addEventListener('mousemove', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
    this._loop();
    this.initialized = true;
    return this;
  }

  _ensureInit() {
    if (!this.initialized) this.init();
  }

  ambient(options) {
    this._ensureInit();
    const opts = Object.assign({ count: 60, color: '#00f5ff', connectDistance: 140 }, options || {});
    const W = () => window.innerWidth, H = () => window.innerHeight;
    const pts = Array.from({ length: opts.count }, () => ({
      x: Math.random() * W(), y: Math.random() * H(),
      vx: NandanXUtils.randomBetween(-0.3, 0.3), vy: NandanXUtils.randomBetween(-0.3, 0.3),
      r: NandanXUtils.randomBetween(1, 2.5), opacity: NandanXUtils.randomBetween(0.3, 0.8),
    }));
    this.systems.set('ambient', {
      draw: (ctx) => {
        pts.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = W(); if (p.x > W()) p.x = 0;
          if (p.y < 0) p.y = H(); if (p.y > H()) p.y = 0;
          const dx = this.mouse.x - p.x, dy = this.mouse.y - p.y;
          const md = Math.sqrt(dx * dx + dy * dy);
          if (md < 100) { p.x -= dx * 0.02; p.y -= dy * 0.02; }
          NandanXUtils.drawCircle(ctx, p.x, p.y, p.r, opts.color, p.opacity);
        });
        ctx.strokeStyle = opts.color;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < opts.connectDistance) {
              ctx.globalAlpha = (1 - d / opts.connectDistance) * 0.4;
              ctx.beginPath();
              ctx.moveTo(pts[i].x, pts[i].y);
              ctx.lineTo(pts[j].x, pts[j].y);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
      }
    });
    return this;
  }

  constellation(options) {
    this._ensureInit();
    const opts = Object.assign({ count: 100, color: '#ffffff' }, options || {});
    const W = () => window.innerWidth, H = () => window.innerHeight;
    const stars = Array.from({ length: opts.count }, () => ({
      x: Math.random() * W(), y: Math.random() * H(),
      r: NandanXUtils.randomBetween(0.5, 2),
      opacity: NandanXUtils.randomBetween(0.4, 1),
      twinkle: Math.random() * Math.PI * 2,
    }));
    this.systems.set('constellation', {
      draw: (ctx) => {
        stars.forEach(s => {
          s.twinkle += 0.02;
          const op = s.opacity * (0.6 + 0.4 * Math.sin(s.twinkle));
          NandanXUtils.drawCircle(ctx, s.x, s.y, s.r, opts.color, op);
          const dx = this.mouse.x - s.x, dy = this.mouse.y - s.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 150) {
            s.x = NandanXUtils.lerp(s.x, s.x + dx * 0.005, 0.5);
            s.y = NandanXUtils.lerp(s.y, s.y + dy * 0.005, 0.5);
            if (d < 80) {
              ctx.strokeStyle = opts.color;
              ctx.lineWidth = 0.6;
              ctx.globalAlpha = (1 - d / 80) * 0.5;
              ctx.beginPath();
              ctx.moveTo(this.mouse.x, this.mouse.y);
              ctx.lineTo(s.x, s.y);
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }
        });
      }
    });
    return this;
  }

  fireworks(options) {
    this._ensureInit();
    const rockets = [];
    const sparks = [];
    const colors = ['#00f5ff', '#ff006e', '#ffe600', '#00ff88', '#ff69b4', '#7c3aed'];
    const launch = () => {
      rockets.push({
        x: NandanXUtils.randomBetween(window.innerWidth * 0.2, window.innerWidth * 0.8),
        y: window.innerHeight + 10,
        vy: NandanXUtils.randomBetween(-14, -10),
        vx: NandanXUtils.randomBetween(-1.5, 1.5),
        color: colors[Math.floor(Math.random() * colors.length)],
        trail: [],
      });
    };
    let lastLaunch = 0;
    this.systems.set('fireworks', {
      draw: (ctx) => {
        const now = performance.now();
        if (now - lastLaunch > NandanXUtils.randomBetween(400, 900)) {
          launch();
          lastLaunch = now;
        }
        rockets.forEach((r, ri) => {
          r.trail.push({ x: r.x, y: r.y });
          if (r.trail.length > 12) r.trail.shift();
          r.x += r.vx; r.y += r.vy;
          r.vy += 0.25;
          if (r.vy >= -2) {
            const count = NandanXUtils.randomInt(80, 120);
            for (let i = 0; i < count; i++) {
              const angle = (i / count) * Math.PI * 2;
              const spd = NandanXUtils.randomBetween(1, 8);
              sparks.push({ x: r.x, y: r.y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, life: 1, decay: NandanXUtils.randomBetween(0.012, 0.025), color: r.color, r: NandanXUtils.randomBetween(1, 3) });
            }
            rockets.splice(ri, 1);
            return;
          }
          r.trail.forEach((pt, ti) => {
            const a = (ti / r.trail.length) * 0.8;
            NandanXUtils.drawCircle(ctx, pt.x, pt.y, 2, r.color, a);
          });
          NandanXUtils.drawCircle(ctx, r.x, r.y, 3, r.color, 1);
        });
        for (let i = sparks.length - 1; i >= 0; i--) {
          const sp = sparks[i];
          sp.life -= sp.decay;
          sp.x += sp.vx; sp.y += sp.vy;
          sp.vy += 0.08; sp.vx *= 0.97;
          if (sp.life <= 0) { sparks.splice(i, 1); continue; }
          NandanXUtils.drawCircle(ctx, sp.x, sp.y, sp.r * sp.life, sp.color, sp.life);
        }
      }
    });
    return this;
  }

  matrixRain(options) {
    this._ensureInit();
    const opts = Object.assign({ color: '#00ff41', fontSize: 14 }, options || {});
    const cols = Math.floor(window.innerWidth / opts.fontSize);
    const drops = Array.from({ length: cols }, () => Math.random() * -50);
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
    let frame = 0;
    this.systems.set('matrixRain', {
      draw: (ctx) => {
        frame++;
        if (frame % 3 !== 0) return;
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = opts.color;
        ctx.font = opts.fontSize + 'px monospace';
        drops.forEach((y, i) => {
          const ch = chars[Math.floor(Math.random() * chars.length)];
          ctx.globalAlpha = 0.9;
          ctx.fillText(ch, i * opts.fontSize, y * opts.fontSize);
          ctx.globalAlpha = 1;
          if (y * opts.fontSize > this.canvas.height && Math.random() > 0.975) drops[i] = 0;
          drops[i] += 0.5;
        });
      }
    });
    return this;
  }

  warpSpeed(options) {
    this._ensureInit();
    const opts = Object.assign({ count: 200, speed: 6, color: '#ffffff' }, options || {});
    const cx = () => window.innerWidth / 2, cy = () => window.innerHeight / 2;
    const stars = Array.from({ length: opts.count }, () => ({
      x: NandanXUtils.randomBetween(-window.innerWidth / 2, window.innerWidth / 2),
      y: NandanXUtils.randomBetween(-window.innerHeight / 2, window.innerHeight / 2),
      z: Math.random() * window.innerWidth,
      pz: 0,
    }));
    stars.forEach(s => { s.pz = s.z; });
    this.systems.set('warpSpeed', {
      draw: (ctx) => {
        const W = window.innerWidth, H = window.innerHeight;
        stars.forEach(s => {
          s.pz = s.z;
          s.z -= opts.speed;
          if (s.z <= 0) {
            s.x = NandanXUtils.randomBetween(-W / 2, W / 2);
            s.y = NandanXUtils.randomBetween(-H / 2, H / 2);
            s.z = W; s.pz = s.z;
          }
          const sx = (s.x / s.z) * W + cx();
          const sy = (s.y / s.z) * H + cy();
          const px = (s.x / s.pz) * W + cx();
          const py = (s.y / s.pz) * H + cy();
          const r = NandanXUtils.clamp(2 * (1 - s.z / W), 0.1, 3);
          const alpha = NandanXUtils.clamp(1 - s.z / W, 0, 1);
          ctx.strokeStyle = opts.color;
          ctx.lineWidth = r;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(sx, sy);
          ctx.stroke();
          ctx.globalAlpha = 1;
        });
      }
    });
    return this;
  }

  clickExplosion(colors) {
    this._ensureInit();
    const palette = colors || ['#00f5ff', '#ff006e', '#ffe600'];
    const bursts = [];
    document.addEventListener('click', (e) => {
      const count = 20;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const spd = NandanXUtils.randomBetween(3, 10);
        bursts.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
          life: 1, decay: NandanXUtils.randomBetween(0.03, 0.07),
          r: NandanXUtils.randomBetween(2, 6),
          color: palette[Math.floor(Math.random() * palette.length)],
        });
      }
    });
    this.systems.set('clickExplosion', {
      draw: (ctx) => {
        for (let i = bursts.length - 1; i >= 0; i--) {
          const b = bursts[i];
          b.life -= b.decay; b.x += b.vx; b.y += b.vy; b.vy += 0.15; b.vx *= 0.97;
          if (b.life <= 0) { bursts.splice(i, 1); continue; }
          NandanXUtils.drawCircle(ctx, b.x, b.y, b.r * b.life, b.color, b.life);
        }
      }
    });
    return this;
  }

  remove(name) {
    this.systems.delete(name);
    return this;
  }

  clear() {
    this.systems.clear();
    if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return this;
  }

  _loop() {
    if (!this.ctx) return;
    requestAnimationFrame(() => this._loop());
    if (!this.ctx || this.systems.size === 0) return;
    if (!this.systems.has('matrixRain')) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.systems.forEach(sys => sys.draw(this.ctx));
  }
}

var particleEngine = new ParticleEngine();
if (typeof window !== 'undefined') window.NandanXParticle = particleEngine;
class ThreeDEngine {
  constructor() {
    this.initialized = false;
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-3d-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-3d-styles';
    s.textContent = `
      .nx-glass {
        background: rgba(255,255,255,0.04) !important;
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255,255,255,0.1) !important;
      }
      .nx-holo {
        background: linear-gradient(135deg,
          rgba(255,0,128,0.15),rgba(0,255,255,0.15),rgba(255,255,0,0.15),
          rgba(128,0,255,0.15),rgba(0,255,128,0.15));
        background-size: 300% 300%;
        transition: background-position 0.6s ease;
      }
      .nx-holo:hover { background-position: 100% 100%; }
      .nx-flip-container { perspective: 1000px; }
      .nx-flip-inner { transition: transform 0.7s cubic-bezier(0.23,1,0.32,1); transform-style: preserve-3d; position: relative; }
      .nx-flip-inner.nx-flipped { transform: rotateY(180deg); }
      .nx-flip-front, .nx-flip-back { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      .nx-flip-back { transform: rotateY(180deg); position: absolute; inset: 0; }
      .nx-text-3d {
        transform-style: preserve-3d;
        text-shadow: 1px 1px 0 rgba(0,0,0,0.4), 2px 2px 0 rgba(0,0,0,0.3), 3px 3px 0 rgba(0,0,0,0.2);
        transition: text-shadow 0.3s ease;
      }
      .nx-iso { transform: rotateX(20deg) rotateY(-20deg) rotateZ(0deg); transform-style: preserve-3d; }
      .nx-depth-card { position: relative; transform-style: preserve-3d; }
      .nx-depth-card::before {
        content: ''; position: absolute; inset: 0; transform: translateZ(-8px);
        background: rgba(0,245,255,0.1); border-radius: inherit; pointer-events: none;
      }
      .nx-float-shadow { transition: transform 0.4s ease, box-shadow 0.4s ease; }
      .nx-float-shadow:hover { transform: translateY(-10px); box-shadow: 0 30px 60px rgba(0,0,0,0.4), 0 0 30px rgba(0,245,255,0.15); }
    `;
    document.head.appendChild(s);
  }

  tiltCard(target, options) {
    const opts = Object.assign({ maxAngle: 15, scale: 1.04, glare: false }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      let glare = null;
      el.style.position = 'relative';
      el.style.willChange = 'transform';
      if (opts.glare) {
        const wrap = NandanXUtils.create('div', {}, { position: 'absolute', inset: '0', overflow: 'hidden', borderRadius: 'inherit', pointerEvents: 'none', zIndex: '2' });
        glare = NandanXUtils.create('div', {}, {
          position: 'absolute', top: '-50%', left: '-50%',
          width: '200%', height: '200%',
          background: 'linear-gradient(135deg,rgba(255,255,255,0.2),transparent)',
          opacity: '0', transition: 'opacity 0.3s', transform: 'rotate(-45deg)',
        });
        wrap.appendChild(glare);
        el.appendChild(wrap);
      }
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width - 0.5;
        const cy = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${cy * -opts.maxAngle * 2}deg) rotateY(${cx * opts.maxAngle * 2}deg) scale(${opts.scale})`;
        el.style.transition = 'transform 0.08s ease';
        if (glare) { glare.style.opacity = '1'; glare.style.transform = `rotate(${cx * 60}deg)`; }
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        el.style.transition = 'transform 0.5s ease';
        if (glare) glare.style.opacity = '0';
      });
    });
    return this;
  }

  flipCard(target, options) {
    const trigger = (options && options.trigger) || 'click';
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-flip-container');
      const inner = el.querySelector('.nx-flip-inner');
      if (!inner) {
        el.style.perspective = '1000px';
        const wrapper = NandanXUtils.create('div', { className: 'nx-flip-inner' }, { width: '100%', height: '100%' });
        [...el.children].forEach(child => wrapper.appendChild(child));
        el.appendChild(wrapper);
      }
      const getInner = () => el.querySelector('.nx-flip-inner');
      if (trigger === 'click') {
        el.addEventListener('click', () => getInner().classList.toggle('nx-flipped'));
      } else {
        el.addEventListener('mouseenter', () => getInner().classList.add('nx-flipped'));
        el.addEventListener('mouseleave', () => getInner().classList.remove('nx-flipped'));
      }
    });
    return this;
  }

  holographic(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-holo');
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        el.style.backgroundPosition = `${x}% ${y}%`;
      });
    });
    return this;
  }

  glass(target) {
    NandanXUtils.parseSelector(target).forEach(el => el.classList.add('nx-glass'));
    return this;
  }

  parallax3D(target, options) {
    const depth = (options && options.depth) || 30;
    NandanXUtils.parseSelector(target).forEach(el => {
      document.addEventListener('mousemove', (e) => {
        const cx = (e.clientX / window.innerWidth - 0.5) * depth;
        const cy = (e.clientY / window.innerHeight - 0.5) * depth;
        el.style.transform = `translate(${cx}px,${cy}px)`;
        el.style.transition = 'transform 0.3s ease';
      });
    });
    return this;
  }

  depthScene(container, layers) {
    const el = typeof container === 'string' ? NandanXUtils.qs(container) : container;
    if (!el) return this;
    el.style.perspective = '1000px';
    const depths = [0.1, 0.25, 0.5, 0.75, 1.0];
    document.addEventListener('mousemove', (e) => {
      const cx = (e.clientX / window.innerWidth - 0.5);
      const cy = (e.clientY / window.innerHeight - 0.5);
      NandanXUtils.parseSelector(layers).forEach((layer, i) => {
        const d = (depths[i] || 0.5) * 40;
        layer.style.transform = `translate(${cx * d}px, ${cy * d}px)`;
        layer.style.transition = 'transform 0.2s ease';
      });
    });
    return this;
  }

  text3D(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-text-3d');
      el.style.perspective = '600px';
      document.addEventListener('mousemove', (e) => {
        const cx = (e.clientX / window.innerWidth - 0.5) * 20;
        const cy = (e.clientY / window.innerHeight - 0.5) * 20;
        el.style.transform = `perspective(600px) rotateX(${-cy}deg) rotateY(${cx}deg)`;
        el.style.transition = 'transform 0.2s ease';
      });
    });
    return this;
  }

  isometric(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-iso');
      el.addEventListener('mouseenter', () => { el.style.transform = 'rotateX(0) rotateY(0)'; el.style.transition = 'transform 0.4s ease'; });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; el.style.transition = 'transform 0.4s ease'; });
    });
    return this;
  }

  prism(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.style.transition = 'filter 0.3s ease';
      el.addEventListener('mouseenter', () => { el.style.animation = 'nx-prism 1s linear infinite'; });
      el.addEventListener('mouseleave', () => { el.style.animation = ''; el.style.filter = ''; });
    });
    if (!document.getElementById('nx-prism-kf')) {
      const s = document.createElement('style');
      s.id = 'nx-prism-kf';
      s.textContent = '@keyframes nx-prism { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }';
      document.head.appendChild(s);
    }
    return this;
  }

  depthCard(target) {
    NandanXUtils.parseSelector(target).forEach(el => el.classList.add('nx-depth-card'));
    return this;
  }

  floatShadow(target) {
    NandanXUtils.parseSelector(target).forEach(el => el.classList.add('nx-float-shadow'));
    return this;
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-tilt]').forEach(el => { if (el.dataset.nxTiltDone) return; el.dataset.nxTiltDone = '1'; this.tiltCard(el); });
      NandanXUtils.qsa('[data-nx-holo]').forEach(el => { if (el.dataset.nxHoloDone) return; el.dataset.nxHoloDone = '1'; this.holographic(el); });
      NandanXUtils.qsa('[data-nx-glass]').forEach(el => { if (el.dataset.nxGlassDone) return; el.dataset.nxGlassDone = '1'; this.glass(el); });
      NandanXUtils.qsa('[data-nx-parallax-3d]').forEach(el => { if (el.dataset.nxP3dDone) return; el.dataset.nxP3dDone = '1'; this.parallax3D(el); });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var threeDEngine = new ThreeDEngine();
if (typeof window !== 'undefined') window.NandanX3D = threeDEngine;
class PhysicsEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.effects = [];
    this.rafId = null;
    this.initialized = false;
    this._globalClickEffect = null;
    this._globalClickHandler = null;
  }

  init() {
    if (this.initialized) return this;
    this.canvas = NandanXUtils.createCanvas(window.innerWidth, window.innerHeight, { zIndex: '9995', mixBlendMode: 'screen' });
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return this;
    window.addEventListener('resize', () => NandanXUtils.resizeCanvas(this.canvas));
    this._loop();
    this.initialized = true;
    return this;
  }

  _ensureInit() { if (!this.initialized) this.init(); }

  ripple(x, y, color) {
    this._ensureInit();
    const c = color || '#00f5ff';
    const rings = [{ r: 0, maxR: 120, alpha: 0.8, speed: 4 }, { r: 0, maxR: 90, alpha: 0.5, speed: 3 }, { r: 0, maxR: 60, alpha: 0.3, speed: 2 }];
    this.effects.push({
      type: 'ripple', x, y, c, rings,
      done: false,
      draw: (ctx) => {
        rings.forEach(ring => {
          ring.r += ring.speed;
          const a = ring.alpha * (1 - ring.r / ring.maxR);
          if (a <= 0) return;
          ctx.beginPath();
          ctx.arc(x, y, ring.r, 0, Math.PI * 2);
          ctx.strokeStyle = c;
          ctx.lineWidth = 2;
          ctx.globalAlpha = a;
          ctx.stroke();
          ctx.globalAlpha = 1;
        });
        if (rings.every(ring => ring.r >= ring.maxR)) this.done = true;
      }
    });
    return this;
  }

  shockwave(x, y, color) {
    this._ensureInit();
    const c = color || '#00f5ff';
    let r = 0, maxR = 250, done = false;
    this.effects.push({
      done: false,
      draw: (ctx) => {
        r += 12;
        const a = NandanXUtils.clamp(1 - r / maxR, 0, 1);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = c;
        ctx.lineWidth = 4 * a;
        ctx.globalAlpha = a;
        ctx.stroke();
        ctx.globalAlpha = 1;
        NandanXUtils.drawGlow(ctx, x, y, r * 0.3, c + '44');
        if (r >= maxR) this.done = true;
      }
    });
    const eff = this.effects[this.effects.length - 1];
    const innerDone = () => { eff.done = true; };
    setTimeout(innerDone, 2000);
    return this;
  }

  pixelExplosion(x, y) {
    this._ensureInit();
    const count = 50;
    const pixels = Array.from({ length: count }, () => ({
      x, y,
      vx: NandanXUtils.randomBetween(-8, 8),
      vy: NandanXUtils.randomBetween(-12, -2),
      w: NandanXUtils.randomBetween(4, 14),
      h: NandanXUtils.randomBetween(4, 14),
      rot: Math.random() * Math.PI * 2,
      rotV: NandanXUtils.randomBetween(-0.15, 0.15),
      color: NandanXUtils.randomHsl(null, 80, 60),
      life: 1, decay: NandanXUtils.randomBetween(0.015, 0.03),
    }));
    this.effects.push({
      done: false,
      draw: (ctx) => {
        let alive = 0;
        pixels.forEach(p => {
          p.life -= p.decay;
          if (p.life <= 0) return;
          alive++;
          p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.vx *= 0.98; p.rot += p.rotV;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
        if (alive === 0) this.done = true;
      }
    });
    const eff = this.effects[this.effects.length - 1];
    return this;
  }

  inkSpread(x, y, color) {
    this._ensureInit();
    const c = color || '#ff006e';
    const blobs = Array.from({ length: 18 }, () => ({
      x, y,
      vx: NandanXUtils.randomBetween(-4, 4),
      vy: NandanXUtils.randomBetween(-4, 4),
      r: 2, maxR: NandanXUtils.randomBetween(20, 50),
      life: 1, decay: NandanXUtils.randomBetween(0.008, 0.018),
    }));
    this.effects.push({
      done: false,
      draw: (ctx) => {
        let alive = 0;
        blobs.forEach(b => {
          b.life -= b.decay;
          if (b.life <= 0) return;
          alive++;
          b.x += b.vx; b.y += b.vy; b.vx *= 0.92; b.vy *= 0.92;
          b.r = Math.min(b.r + 1.5, b.maxR);
          NandanXUtils.drawCircle(ctx, b.x, b.y, b.r, c, b.life * 0.7);
        });
        if (alive === 0) this.done = true;
      }
    });
    return this;
  }

  energyPulse(x, y, color) {
    this._ensureInit();
    const c = color || '#ffe600';
    const count = 28;
    const parts = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const spd = NandanXUtils.randomBetween(3, 8);
      return { x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, life: 1, decay: 0.02, r: NandanXUtils.randomBetween(2, 5) };
    });
    let coreR = 0;
    this.effects.push({
      done: false,
      draw: (ctx) => {
        coreR = Math.min(coreR + 3, 60);
        NandanXUtils.drawGlow(ctx, x, y, coreR, c + '66');
        let alive = 0;
        parts.forEach(p => {
          p.life -= p.decay;
          if (p.life <= 0) return;
          alive++;
          p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.vy *= 0.97;
          NandanXUtils.drawCircle(ctx, p.x, p.y, p.r * p.life, c, p.life);
        });
        if (alive === 0 && coreR >= 60) this.done = true;
      }
    });
    return this;
  }

  waterRipple(x, y) {
    this._ensureInit();
    const waves = Array.from({ length: 5 }, (_, i) => ({ r: 0, delay: i * 8, alpha: 0.6 }));
    let t = 0;
    this.effects.push({
      done: false,
      draw: (ctx) => {
        t++;
        waves.forEach(w => {
          if (t < w.delay) return;
          w.r += 3;
          const a = w.alpha * (1 - w.r / 200);
          if (a <= 0) return;
          ctx.save();
          ctx.scale(1, 0.4);
          ctx.beginPath();
          ctx.arc(x, y / 0.4, w.r, 0, Math.PI * 2);
          ctx.strokeStyle = '#7dd3fc';
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = a;
          ctx.stroke();
          ctx.restore();
          ctx.globalAlpha = 1;
        });
        if (waves.every(w => (1 - w.r / 200) <= 0)) this.done = true;
      }
    });
    return this;
  }

  lightning(x1, y1, x2, y2) {
    this._ensureInit();
    const buildBolt = (ax, ay, bx, by, roughness) => {
      if (Math.hypot(bx - ax, by - ay) < 8 || roughness < 2) return [[ax, ay, bx, by]];
      const mx = (ax + bx) / 2 + NandanXUtils.randomBetween(-roughness, roughness);
      const my = (ay + by) / 2 + NandanXUtils.randomBetween(-roughness, roughness);
      return [...buildBolt(ax, ay, mx, my, roughness / 2), ...buildBolt(mx, my, bx, by, roughness / 2)];
    };
    const segs = buildBolt(x1, y1, x2, y2, 80);
    let life = 1;
    this.effects.push({
      done: false,
      draw: (ctx) => {
        life -= 0.04;
        if (life <= 0) { this.done = true; return; }
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 2 * life;
        ctx.shadowColor = '#00f5ff';
        ctx.shadowBlur = 12;
        ctx.globalAlpha = life;
        segs.forEach(([ax, ay, bx, by]) => {
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    });
    const eff = this.effects[this.effects.length - 1];
    setTimeout(() => { eff.done = true; }, 1200);
    return this;
  }

  attachToClicks(target, effect, options) {
    const els = typeof target === 'string' ? NandanXUtils.qsa(target) : [target];
    els.forEach(el => {
      el.addEventListener('click', (e) => {
        const x = e.clientX, y = e.clientY;
        if (effect === 'ripple') this.ripple(x, y);
        else if (effect === 'shockwave') this.shockwave(x, y);
        else if (effect === 'pixels' || effect === 'pixelExplosion') this.pixelExplosion(x, y);
        else if (effect === 'inkSpread') this.inkSpread(x, y);
        else if (effect === 'energyPulse') this.energyPulse(x, y);
        else if (effect === 'waterRipple') this.waterRipple(x, y);
      });
    });
    return this;
  }

  globalClicks(effect) {
    if (this._globalClickHandler) document.removeEventListener('click', this._globalClickHandler);
    this._globalClickEffect = effect;
    this._globalClickHandler = (e) => {
      const x = e.clientX, y = e.clientY;
      const eff = this._globalClickEffect;
      if (eff === 'ripple') this.ripple(x, y);
      else if (eff === 'shockwave') this.shockwave(x, y);
      else if (eff === 'pixelExplosion') this.pixelExplosion(x, y);
      else if (eff === 'inkSpread') this.inkSpread(x, y);
      else if (eff === 'energyPulse') this.energyPulse(x, y);
      else if (eff === 'waterRipple') this.waterRipple(x, y);
      else if (eff === 'lightning') {
        const x2 = NandanXUtils.randomBetween(0, window.innerWidth);
        const y2 = NandanXUtils.randomBetween(0, window.innerHeight);
        this.lightning(x, y, x2, y2);
      }
    };
    document.addEventListener('click', this._globalClickHandler);
    return this;
  }

  _loop() {
    if (!this.ctx) return;
    requestAnimationFrame(() => this._loop());
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const eff = this.effects[i];
      if (eff.done) { this.effects.splice(i, 1); continue; }
      eff.draw(this.ctx);
    }
  }
}

var physicsEngine = new PhysicsEngine();
if (typeof window !== 'undefined') window.NandanXPhysics = physicsEngine;
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
class AIEngine {
  constructor() {
    this.initialized = false;
    this.modules = {};
    this.enhanced = new WeakSet();
  }

  init(modules) {
    if (this.initialized) return this;
    this.modules = modules || {};
    this._scanDOM();
    this._startObserver();
    this.initialized = true;
    return this;
  }

  _scanDOM() {
    NandanXUtils.qsa('button, [role="button"], .btn, input[type="submit"], input[type="button"]').forEach(el => this._enhanceButton(el));
    NandanXUtils.qsa('.card, [class*="card"], article, .product, .item').forEach(el => this._enhanceCard(el));
    NandanXUtils.qsa('h1, h2, h3').forEach(el => this._enhanceHeading(el));
    NandanXUtils.qsa('img').forEach(el => this._enhanceImage(el));
    NandanXUtils.qsa('section, main, .section, [class*="section"]').forEach(el => this._enhanceSection(el));
  }

  _enhanceButton(el) {
    if (this.enhanced.has(el)) return;
    this.enhanced.add(el);
    const text = el.textContent.toLowerCase();
    const isPrimary = /submit|send|buy|start|get|join|sign|create|launch|try/i.test(text);
    const isDanger = /delete|remove|cancel|destroy|clear/i.test(text);
    if (this.modules.hover) {
      this.modules.hover.lift(el);
      if (isPrimary) this.modules.hover.neon(el, '#00f5ff');
      if (isDanger) this.modules.hover.neon(el, '#ff4444');
      this.modules.hover.bouncyClick && this.modules.hover.bouncyClick(el);
    }
    if (this.modules.physics) this.modules.physics.attachToClicks(el, 'ripple');
  }

  _enhanceCard(el) {
    if (this.enhanced.has(el)) return;
    this.enhanced.add(el);
    if (this.modules.thr3d) this.modules.thr3d.tiltCard(el, { maxAngle: 8, glare: true });
    if (this.modules.hover) this.modules.hover.float(el);
  }

  _enhanceHeading(el) {
    if (this.enhanced.has(el)) return;
    this.enhanced.add(el);
    if (this.modules.scroll) {
      el.classList.add('nx-fade-up');
      scrollEngine.observer && scrollEngine.observer.observe(el);
    }
  }

  _enhanceImage(el) {
    if (this.enhanced.has(el)) return;
    this.enhanced.add(el);
    el.style.transition = 'transform 0.4s ease, filter 0.4s ease';
    el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.04)'; el.style.filter = 'brightness(1.1)'; });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; el.style.filter = ''; });
  }

  _enhanceSection(el) {
    if (this.enhanced.has(el)) return;
    this.enhanced.add(el);
    const children = [...el.children].filter(c => !c.matches('h1,h2,h3,h4,script,style'));
    children.forEach((child, i) => {
      if (!child.classList.contains('nx-fade-up')) {
        child.classList.add('nx-fade-up');
        child.dataset.nxDelay = i * 70;
        if (scrollEngine.observer) scrollEngine.observer.observe(child);
      }
    });
  }

  _startObserver() {
    const obs = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (node.matches('button,[role="button"],.btn')) this._enhanceButton(node);
          if (node.matches('.card,article')) this._enhanceCard(node);
          if (node.matches('h1,h2,h3')) this._enhanceHeading(node);
          if (node.matches('img')) this._enhanceImage(node);
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  analyzeUI(container) {
    const root = container ? (typeof container === 'string' ? NandanXUtils.qs(container) : container) : document.body;
    const issues = [];
    const suggestions = [];
    let score = 100;

    NandanXUtils.qsa('img', root).forEach(img => {
      if (!img.alt) { issues.push({ el: img, type: 'missing-alt', msg: 'Image missing alt text' }); score -= 3; }
    });

    NandanXUtils.qsa('a', root).forEach(a => {
      if (!a.textContent.trim() && !a.getAttribute('aria-label')) {
        issues.push({ el: a, type: 'empty-link', msg: 'Link has no accessible text' }); score -= 4;
      }
    });

    NandanXUtils.qsa('input, textarea, select', root).forEach(input => {
      const id = input.id;
      if (!id || !NandanXUtils.qs(`label[for="${id}"]`)) {
        issues.push({ el: input, type: 'missing-label', msg: 'Form field missing associated label' }); score -= 5;
      }
    });

    NandanXUtils.qsa('p, li, span', root).forEach(el => {
      const cs = window.getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      if (fs < 12) { suggestions.push({ el, msg: 'Font size may be too small for readability' }); score -= 1; }
    });

    if (suggestions.length === 0) suggestions.push({ msg: 'Layout and typography look good.' });

    return { score: Math.max(0, score), issues, suggestions, grade: score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : 'D' };
  }

  pageTransition(type) {
    const overlay = NandanXUtils.create('div', {}, {
      position: 'fixed', inset: '0', zIndex: '999995',
      background: 'linear-gradient(135deg,#00f5ff,#7c3aed)',
      transform: 'scaleX(0)', transformOrigin: 'left',
      pointerEvents: 'none',
    });
    document.body.appendChild(overlay);

    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript')) return;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        overlay.style.transition = 'transform 0.4s cubic-bezier(0.23,1,0.32,1)';
        overlay.style.transform = 'scaleX(1)';
        setTimeout(() => { window.location.href = href; }, 420);
      });
    });

    window.addEventListener('pageshow', () => {
      overlay.style.transformOrigin = 'right';
      overlay.style.transition = 'transform 0.4s cubic-bezier(0.23,1,0.32,1)';
      overlay.style.transform = 'scaleX(0)';
    });

    return this;
  }

  auto() { this._scanDOM(); return this; }

  report() {
    const result = this.analyzeUI();
    console.group('%cNandanX UI Report', 'color:#00f5ff;font-weight:bold;font-size:14px');
    console.log('Score:', result.score + '/100 (' + result.grade + ')');
    console.log('Issues:', result.issues.length);
    result.issues.forEach(i => console.warn(i.msg, i.el));
    console.log('Suggestions:', result.suggestions.length);
    result.suggestions.forEach(s => console.info(s.msg));
    console.groupEnd();
    return result;
  }
}

var aiEngine = new AIEngine();
if (typeof window !== 'undefined') window.NandanXAI = aiEngine;
/**
 * NandanX.js - Creative Extras Module
 * Created by Nandan Das
 * Version 2.0.0
 *
 * Extra creative engines:
 *  - TextScramble   : hacker-style text scramble reveal
 *  - Confetti       : celebratory confetti cannon
 *  - SoundReactive  : visual elements react to mic input
 *  - MorphText      : smooth SVG text morphing between words
 *  - Spotlight      : theatrical beam spotlight
 *  - DNA            : animated DNA helix canvas
 *  - Typewriter     : cinematic multi-stage typewriter
 *  - Noise          : animated Perlin-noise background
 *  - Trail          : rainbow svg-path cursor trail
 *  - Counter3D      : 3D flip counter (like airport boards)
 */

var NandanXExtras = (function () {

  // ─────────────────────────────────────────────────────────────────
  // TEXT SCRAMBLE
  // ─────────────────────────────────────────────────────────────────
  function TextScramble(el) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.chars = '!<>-_\\/[]{}—=+*^?#@$%&ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    this.resolve = null;
    this.frameRequest = null;
    this.frame = 0;
    this.queue = [];
  }

  TextScramble.prototype.setText = function (newText) {
    var self = this;
    var oldText = this.el ? this.el.innerText : '';
    var length = Math.max(oldText.length, newText.length);
    var promise = new Promise(function (res) { self.resolve = res; });
    self.queue = [];
    for (var i = 0; i < length; i++) {
      var from = oldText[i] || '';
      var to = newText[i] || '';
      var start = Math.floor(Math.random() * 20);
      var end = start + Math.floor(Math.random() * 20);
      self.queue.push({ from: from, to: to, start: start, end: end, char: '' });
    }
    cancelAnimationFrame(self.frameRequest);
    self.frame = 0;
    self.update();
    return promise;
  };

  TextScramble.prototype.update = function () {
    var self = this;
    var output = '';
    var complete = 0;
    for (var i = 0, n = self.queue.length; i < n; i++) {
      var item = self.queue[i];
      if (self.frame >= item.end) {
        complete++;
        output += item.to;
      } else if (self.frame >= item.start) {
        if (!item.char || Math.random() < 0.28) {
          item.char = self.chars[Math.floor(Math.random() * self.chars.length)];
        }
        output += '<span style="color:var(--nx-primary,#00f5ff);opacity:0.6">' + item.char + '</span>';
      } else {
        output += item.from;
      }
    }
    if (self.el) self.el.innerHTML = output;
    if (complete === self.queue.length) {
      self.resolve && self.resolve();
    } else {
      self.frameRequest = requestAnimationFrame(function () { self.frame++; self.update(); });
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // CONFETTI CANNON
  // ─────────────────────────────────────────────────────────────────
  var confettiCanvas = null;
  var confettiCtx = null;
  var confettiPieces = [];
  var confettiRAF = null;

  function _initConfettiCanvas() {
    if (confettiCanvas) return;
    confettiCanvas = document.createElement('canvas');
    confettiCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99997;';
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    document.body.appendChild(confettiCanvas);
    confettiCtx = confettiCanvas.getContext('2d');
    window.addEventListener('resize', function () {
      if (confettiCanvas) {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
      }
    });
  }

  function _spawnConfetti(x, y, count, colors) {
    colors = colors || ['#00f5ff','#ff006e','#7c3aed','#ffd700','#00ff88','#ff4500','#fff'];
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 4 + Math.random() * 10;
      confettiPieces.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1) * 0.8,
        vy: -(5 + Math.random() * 12),
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        gravity: 0.3 + Math.random() * 0.2,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }
  }

  function _runConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces = confettiPieces.filter(function (p) { return p.alpha > 0.01; });
    confettiPieces.forEach(function (p) {
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      if (p.y > confettiCanvas.height + 20) { p.alpha = 0; return; }
      p.alpha -= 0.006;
      confettiCtx.save();
      confettiCtx.globalAlpha = Math.max(0, p.alpha);
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rot * Math.PI) / 180);
      confettiCtx.fillStyle = p.color;
      if (p.shape === 'rect') {
        confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        confettiCtx.fill();
      }
      confettiCtx.restore();
    });
    if (confettiPieces.length > 0) {
      confettiRAF = requestAnimationFrame(_runConfetti);
    } else {
      cancelAnimationFrame(confettiRAF);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 3D FLIP COUNTER (Airport Board Style)
  // ─────────────────────────────────────────────────────────────────
  function FlipCounter(el, options) {
    options = options || {};
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.chars = '0123456789';
    this.delay = options.delay || 80;
    this.color = options.color || 'var(--nx-primary,#00f5ff)';
    this._injectCSS();
  }

  FlipCounter.prototype._injectCSS = function () {
    if (document.getElementById('nx-flip-counter-css')) return;
    var style = document.createElement('style');
    style.id = 'nx-flip-counter-css';
    style.textContent = [
      '.nx-fc-wrap{display:inline-flex;gap:4px;}',
      '.nx-fc-digit{position:relative;width:36px;height:54px;perspective:120px;cursor:default;}',
      '.nx-fc-card{position:absolute;inset:0;background:#111;border:1px solid rgba(255,255,255,0.08);',
      'border-radius:6px;display:flex;align-items:center;justify-content:center;',
      'font-family:\'Space Mono\',monospace;font-size:28px;font-weight:700;',
      'backface-visibility:hidden;transition:transform 0.22s cubic-bezier(0.23,1,0.32,1);}',
      '.nx-fc-digit.flipping .nx-fc-card{animation:nx-flip-card 0.22s ease forwards;}',
      '@keyframes nx-flip-card{0%{transform:rotateX(0)}50%{transform:rotateX(-90deg)}100%{transform:rotateX(0)}}',
    ].join('');
    document.head.appendChild(style);
  };

  FlipCounter.prototype.set = function (target, from) {
    var self = this;
    if (!self.el) return;
    target = parseInt(target, 10);
    from = parseInt(from || 0, 10);
    var targetStr = String(target).padStart(String(from).length || String(target).length, '0');
    var fromStr = String(from).padStart(targetStr.length, '0');

    // Build digit elements
    if (!self._built || self._digits !== targetStr.length) {
      self.el.innerHTML = '<div class="nx-fc-wrap"></div>';
      var wrap = self.el.querySelector('.nx-fc-wrap');
      self._digitEls = [];
      for (var i = 0; i < targetStr.length; i++) {
        var d = document.createElement('div');
        d.className = 'nx-fc-digit';
        var card = document.createElement('div');
        card.className = 'nx-fc-card';
        card.style.color = self.color;
        card.textContent = fromStr[i] || '0';
        d.appendChild(card);
        wrap.appendChild(d);
        self._digitEls.push(d);
      }
      self._built = true;
      self._digits = targetStr.length;
    }

    // Animate each digit
    for (var i = 0; i < targetStr.length; i++) {
      (function(idx) {
        var fromDigit = parseInt(fromStr[idx] || '0', 10);
        var toDigit = parseInt(targetStr[idx], 10);
        if (fromDigit === toDigit) return;
        var steps = Math.abs(toDigit - fromDigit);
        var dir = toDigit > fromDigit ? 1 : -1;
        var current = fromDigit;
        var interval = setInterval(function () {
          current += dir;
          if (!self._digitEls[idx]) { clearInterval(interval); return; }
          var card = self._digitEls[idx].querySelector('.nx-fc-card');
          if (card) card.textContent = current;
          self._digitEls[idx].classList.remove('flipping');
          void self._digitEls[idx].offsetWidth;
          self._digitEls[idx].classList.add('flipping');
          setTimeout(function() {
            if (self._digitEls[idx]) self._digitEls[idx].classList.remove('flipping');
          }, 250);
          if (current === toDigit) clearInterval(interval);
        }, self.delay * (idx + 1) * 0.5 + self.delay);
      })(i);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // CINEMATIC TYPEWRITER
  // ─────────────────────────────────────────────────────────────────
  function Typewriter(el, options) {
    options = options || {};
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.speed = options.speed || 60;
    this.deleteSpeed = options.deleteSpeed || 30;
    this.pauseAfter = options.pauseAfter || 1400;
    this.loop = options.loop !== false;
    this.cursor = options.cursor !== false;
    this._queue = [];
    this._running = false;
    if (this.cursor && this.el) {
      this.el.style.borderRight = '2px solid var(--nx-primary,#00f5ff)';
      this.el.style.animation = 'nx-blink 0.8s step-end infinite';
      var s = document.createElement('style');
      s.textContent = '@keyframes nx-blink{0%,100%{border-color:var(--nx-primary,#00f5ff)}50%{border-color:transparent}}';
      document.head.appendChild(s);
    }
  }

  Typewriter.prototype.type = function (text, speed) {
    var self = this;
    self._queue.push({ type: 'type', text: text, speed: speed || self.speed });
    return self;
  };

  Typewriter.prototype.delete = function (count, speed) {
    var self = this;
    self._queue.push({ type: 'delete', count: count || 'all', speed: speed || self.deleteSpeed });
    return self;
  };

  Typewriter.prototype.pause = function (ms) {
    this._queue.push({ type: 'pause', ms: ms || this.pauseAfter });
    return this;
  };

  Typewriter.prototype.call = function (fn) {
    this._queue.push({ type: 'call', fn: fn });
    return this;
  };

  Typewriter.prototype.start = function () {
    var self = this;
    if (self._running) return self;
    self._running = true;
    var originalQueue = self._queue.slice();

    function runStep() {
      if (self._queue.length === 0) {
        if (self.loop) {
          self._queue = originalQueue.slice();
          runStep();
        } else {
          self._running = false;
        }
        return;
      }
      var step = self._queue.shift();
      if (step.type === 'type') {
        var i = 0;
        var interval = setInterval(function () {
          if (!self.el) { clearInterval(interval); return; }
          self.el.textContent += step.text[i++];
          if (i >= step.text.length) { clearInterval(interval); runStep(); }
        }, step.speed);
      } else if (step.type === 'delete') {
        var count = step.count === 'all' ? (self.el ? self.el.textContent.length : 0) : step.count;
        var del = setInterval(function () {
          if (!self.el) { clearInterval(del); return; }
          self.el.textContent = self.el.textContent.slice(0, -1);
          count--;
          if (count <= 0) { clearInterval(del); runStep(); }
        }, step.speed);
      } else if (step.type === 'pause') {
        setTimeout(runStep, step.ms);
      } else if (step.type === 'call') {
        step.fn();
        runStep();
      }
    }
    runStep();
    return self;
  };

  // ─────────────────────────────────────────────────────────────────
  // NOISE BACKGROUND (animated gradient mesh)
  // ─────────────────────────────────────────────────────────────────
  function NoiseBackground(el, options) {
    options = options || {};
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.speed = options.speed || 0.003;
    this.colors = options.colors || ['#050507','#0a0a1a','#050520','#0a051a'];
    this._t = 0;
    this._raf = null;
    this._points = [];
    this._init();
  }

  NoiseBackground.prototype._init = function () {
    var self = this;
    if (!self.el) return;
    self.el.style.position = 'relative';
    self.el.style.overflow = 'hidden';

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    self.el.insertBefore(canvas, self.el.firstChild);
    self._canvas = canvas;
    self._ctx = canvas.getContext('2d');
    self._resize();
    window.addEventListener('resize', function () { self._resize(); });
    self._animate();
  };

  NoiseBackground.prototype._resize = function () {
    var r = this.el.getBoundingClientRect();
    this._canvas.width = r.width;
    this._canvas.height = r.height;
    this._w = r.width;
    this._h = r.height;
  };

  NoiseBackground.prototype._sin = function (val) { return (Math.sin(val) + 1) / 2; };

  NoiseBackground.prototype._animate = function () {
    var self = this;
    self._t += self.speed;
    var ctx = self._ctx;
    var w = self._w;
    var h = self._h;
    if (!ctx || !w) { self._raf = requestAnimationFrame(function () { self._animate(); }); return; }
    ctx.clearRect(0, 0, w, h);

    // Animated gradient blobs
    var blobs = [
      { x: self._sin(self._t * 1.1) * w, y: self._sin(self._t * 0.9) * h, r: w * 0.6, c: 'rgba(0,245,255,0.04)' },
      { x: self._sin(self._t * 0.7 + 2) * w, y: self._sin(self._t * 1.3 + 1) * h, r: w * 0.5, c: 'rgba(255,0,110,0.03)' },
      { x: self._sin(self._t * 1.5 + 4) * w, y: self._sin(self._t * 0.6 + 3) * h, r: w * 0.45, c: 'rgba(124,58,237,0.04)' },
    ];
    blobs.forEach(function (b) {
      var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, b.c);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });

    self._raf = requestAnimationFrame(function () { self._animate(); });
  };

  NoiseBackground.prototype.stop = function () {
    cancelAnimationFrame(this._raf);
  };

  // ─────────────────────────────────────────────────────────────────
  // RAINBOW CURSOR TRAIL (SVG path)
  // ─────────────────────────────────────────────────────────────────
  function RainbowTrail(options) {
    options = options || {};
    this.length = options.length || 24;
    this.width = options.width || 4;
    this._points = [];
    this._svg = null;
    this._path = null;
    this._mouse = { x: 0, y: 0 };
    this._raf = null;
    this._hue = 0;
    this._init();
  }

  RainbowTrail.prototype._init = function () {
    var self = this;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99996;overflow:visible;';
    document.body.appendChild(svg);
    self._svg = svg;

    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    var grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    grad.id = 'nx-trail-grad';
    grad.setAttribute('gradientUnits', 'userSpaceOnUse');
    self._gradStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    self._gradStop1.setAttribute('offset', '0%');
    self._gradStop1.setAttribute('stop-color', '#00f5ff');
    self._gradStop1.setAttribute('stop-opacity', '0');
    self._gradStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    self._gradStop2.setAttribute('offset', '100%');
    self._gradStop2.setAttribute('stop-color', '#00f5ff');
    self._gradStop2.setAttribute('stop-opacity', '0.8');
    grad.appendChild(self._gradStop1);
    grad.appendChild(self._gradStop2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'url(#nx-trail-grad)');
    path.setAttribute('stroke-width', String(self.width));
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    self._path = path;
    self._grad = grad;

    document.addEventListener('mousemove', function (e) {
      self._mouse.x = e.clientX;
      self._mouse.y = e.clientY;
    });

    self._animate();
  };

  RainbowTrail.prototype._animate = function () {
    var self = this;
    self._hue = (self._hue + 2) % 360;
    self._points.push({ x: self._mouse.x, y: self._mouse.y });
    if (self._points.length > self.length) self._points.shift();

    var color = 'hsl(' + self._hue + ',100%,60%)';
    self._gradStop2.setAttribute('stop-color', color);
    self._grad.setAttribute('x1', String(self._points[0] ? self._points[0].x : 0));
    self._grad.setAttribute('y1', String(self._points[0] ? self._points[0].y : 0));
    var last = self._points[self._points.length - 1];
    self._grad.setAttribute('x2', String(last ? last.x : 0));
    self._grad.setAttribute('y2', String(last ? last.y : 0));

    if (self._points.length > 1) {
      var d = 'M ' + self._points[0].x + ' ' + self._points[0].y;
      for (var i = 1; i < self._points.length; i++) {
        var p0 = self._points[i - 1];
        var p1 = self._points[i];
        var mx = (p0.x + p1.x) / 2;
        var my = (p0.y + p1.y) / 2;
        d += ' Q ' + p0.x + ' ' + p0.y + ' ' + mx + ' ' + my;
      }
      self._path.setAttribute('d', d);
    }

    self._raf = requestAnimationFrame(function () { self._animate(); });
  };

  RainbowTrail.prototype.destroy = function () {
    cancelAnimationFrame(this._raf);
    if (this._svg && this._svg.parentNode) this._svg.parentNode.removeChild(this._svg);
  };

  // ─────────────────────────────────────────────────────────────────
  // DNA HELIX CANVAS
  // ─────────────────────────────────────────────────────────────────
  function DNAHelix(canvas, options) {
    options = options || {};
    this.canvas = typeof canvas === 'string' ? document.querySelector(canvas) : canvas;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.speed = options.speed || 0.02;
    this.colors = options.colors || ['#00f5ff', '#ff006e', '#7c3aed', '#00ff88'];
    this._t = 0;
    this._raf = null;
    if (this.canvas) this._animate();
  }

  DNAHelix.prototype._animate = function () {
    var self = this;
    if (!self.ctx) return;
    var ctx = self.ctx;
    var w = self.canvas.width;
    var h = self.canvas.height;
    self._t += self.speed;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(5,5,7,0.15)';
    ctx.fillRect(0, 0, w, h);

    var segments = 40;
    var cx = w / 2;
    var radius = w * 0.3;
    var twist = self._t;

    for (var i = 0; i < segments; i++) {
      var t = (i / segments) * Math.PI * 4 + twist;
      var y = (i / segments) * h;
      var x1 = cx + Math.cos(t) * radius;
      var x2 = cx + Math.cos(t + Math.PI) * radius;
      var z1 = Math.sin(t);
      var z2 = Math.sin(t + Math.PI);
      var size1 = 3 + z1 * 3;
      var size2 = 3 + z2 * 3;
      var alpha1 = 0.3 + (z1 + 1) * 0.35;
      var alpha2 = 0.3 + (z2 + 1) * 0.35;

      // Backbone strands
      if (i > 0) {
        var tp = ((i - 1) / segments) * Math.PI * 4 + twist;
        var yp = ((i - 1) / segments) * h;
        var px1 = cx + Math.cos(tp) * radius;
        var px2 = cx + Math.cos(tp + Math.PI) * radius;
        ctx.beginPath();
        ctx.moveTo(px1, yp);
        ctx.lineTo(x1, y);
        ctx.strokeStyle = 'rgba(0,245,255,' + alpha1 * 0.7 + ')';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px2, yp);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = 'rgba(255,0,110,' + alpha2 * 0.7 + ')';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Base pairs (rungs) every 4 segments
      if (i % 4 === 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        var g = ctx.createLinearGradient(x1, y, x2, y);
        g.addColorStop(0, 'rgba(0,245,255,0.6)');
        g.addColorStop(0.5, 'rgba(255,255,255,0.3)');
        g.addColorStop(1, 'rgba(255,0,110,0.6)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Nucleotide dots
      var col1 = self.colors[i % self.colors.length];
      var col2 = self.colors[(i + 2) % self.colors.length];
      ctx.beginPath();
      ctx.arc(x1, y, Math.max(0.5, size1), 0, Math.PI * 2);
      ctx.fillStyle = col1.replace(')', ',' + alpha1 + ')').replace('rgb', 'rgba').replace('#', 'rgba(').replace(/([0-9a-fA-F]{2})/g, function (m) { return parseInt(m, 16) + ','; }).replace(/,$/, ',1)') || col1;
      // simpler color with opacity
      ctx.globalAlpha = alpha1;
      ctx.fillStyle = col1;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x2, y, Math.max(0.5, size2), 0, Math.PI * 2);
      ctx.globalAlpha = alpha2;
      ctx.fillStyle = col2;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    self._raf = requestAnimationFrame(function () { self._animate(); });
  };

  DNAHelix.prototype.stop = function () {
    cancelAnimationFrame(this._raf);
  };

  // ─────────────────────────────────────────────────────────────────
  // MAGNETIC WORDS (words attract/repel cursor)
  // ─────────────────────────────────────────────────────────────────
  function MagneticWords(el, options) {
    options = options || {};
    var self = this;
    self.el = typeof el === 'string' ? document.querySelector(el) : el;
    self.strength = options.strength || 0.3;
    self.radius = options.radius || 100;
    self.mode = options.mode || 'attract'; // attract | repel
    self._spans = [];
    self._mouse = { x: -9999, y: -9999 };
    self._raf = null;
    if (!self.el) return;
    self._build();
    self._listen();
    self._loop();
  }

  MagneticWords.prototype._build = function () {
    var self = this;
    var words = self.el.textContent.trim().split(/\s+/);
    self.el.textContent = '';
    self.el.style.display = 'flex';
    self.el.style.flexWrap = 'wrap';
    self.el.style.gap = '8px';
    words.forEach(function (word) {
      var span = document.createElement('span');
      span.textContent = word;
      span.style.cssText = 'display:inline-block;transition:transform 0.1s,color 0.3s;cursor:default;';
      self.el.appendChild(span);
      self._spans.push(span);
    });
  };

  MagneticWords.prototype._listen = function () {
    var self = this;
    document.addEventListener('mousemove', function (e) {
      self._mouse.x = e.clientX;
      self._mouse.y = e.clientY;
    });
  };

  MagneticWords.prototype._loop = function () {
    var self = this;
    self._spans.forEach(function (span) {
      var r = span.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var dx = self._mouse.x - cx;
      var dy = self._mouse.y - cy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < self.radius) {
        var force = (self.radius - dist) / self.radius;
        var dir = self.mode === 'repel' ? -1 : 1;
        var tx = dx * force * self.strength * dir;
        var ty = dy * force * self.strength * dir;
        span.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
        span.style.color = 'hsl(' + (dist * 1.5) + ',100%,70%)';
      } else {
        span.style.transform = 'translate(0,0)';
        span.style.color = '';
      }
    });
    self._raf = requestAnimationFrame(function () { self._loop(); });
  };

  // ─────────────────────────────────────────────────────────────────
  // SPOTLIGHT BEAM
  // ─────────────────────────────────────────────────────────────────
  function SpotlightBeam(el, options) {
    options = options || {};
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.size = options.size || 300;
    this.color = options.color || 'rgba(0,245,255,0.08)';
    this.blur = options.blur || 60;
    if (!this.el) return;
    this.el.style.position = 'relative';
    this.el.style.overflow = 'hidden';
    var self = this;
    this.el.addEventListener('mousemove', function (e) {
      var r = self.el.getBoundingClientRect();
      var x = e.clientX - r.left;
      var y = e.clientY - r.top;
      self.el.style.backgroundImage = [
        'radial-gradient(circle ' + self.size + 'px at ' + x + 'px ' + y + 'px, ' + self.color + ', transparent)'
      ].join('');
    });
    this.el.addEventListener('mouseleave', function () {
      self.el.style.backgroundImage = '';
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────
  return {
    // Text scramble
    scramble: function (el, text) {
      var s = new TextScramble(el);
      return s.setText(text || (typeof el === 'string' ? document.querySelector(el) : el).textContent);
    },
    TextScramble: TextScramble,

    // Confetti
    confetti: function (x, y, count, colors) {
      _initConfettiCanvas();
      if (x === undefined) { x = window.innerWidth / 2; y = window.innerHeight / 3; }
      _spawnConfetti(x, y, count || 120, colors);
      cancelAnimationFrame(confettiRAF);
      _runConfetti();
    },

    // Flip counter
    flipCounter: function (el, target, from, options) {
      var fc = new FlipCounter(el, options || {});
      fc.set(target, from || 0);
      return fc;
    },
    FlipCounter: FlipCounter,

    // Typewriter
    typewriter: function (el, options) {
      return new Typewriter(el, options);
    },
    Typewriter: Typewriter,

    // Noise background
    noise: function (el, options) {
      return new NoiseBackground(el, options);
    },
    NoiseBackground: NoiseBackground,

    // Rainbow trail
    rainbowTrail: function (options) {
      return new RainbowTrail(options);
    },
    RainbowTrail: RainbowTrail,

    // DNA helix
    dna: function (canvas, options) {
      return new DNAHelix(canvas, options);
    },
    DNAHelix: DNAHelix,

    // Magnetic words
    magneticWords: function (el, options) {
      return new MagneticWords(el, options);
    },
    MagneticWords: MagneticWords,

    // Spotlight
    spotlight: function (el, options) {
      return new SpotlightBeam(el, options);
    },
    SpotlightBeam: SpotlightBeam,

    // Auto scramble cycle through words
    scrambleCycle: function (el, words, interval) {
      var s = new TextScramble(el);
      var i = 0;
      interval = interval || 2500;
      function next() {
        s.setText(words[i]).then(function () {
          setTimeout(next, interval);
        });
        i = (i + 1) % words.length;
      }
      next();
      return { stop: function () { s.resolve = null; } };
    },
  };
})();

if (typeof window !== 'undefined') window.NandanXExtras = NandanXExtras;
/**
 * NandanX.js — Creative Extras v2 
 * Created by Nandan Das
 * NEW features: Aurora, StarField, PixelReveal, SoundWave, 
 * NeonText, CardStack, GlitchImage, MagicCursor, ParticleText, HeatMap
 */

var NXCreative = (function () {

  // ─────────────────────────────────────────────────────────────────
  // AURORA BACKGROUND — Northern lights animated gradient
  // ─────────────────────────────────────────────────────────────────
  function aurora(target) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    el.style.position = el.style.position || 'relative';
    el.insertBefore(canvas, el.firstChild);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var t = 0;
    var blobs = [
      { x: 0.2, y: 0.3, r: 0.4, color: [0, 255, 200], speed: 0.0008 },
      { x: 0.7, y: 0.2, r: 0.5, color: [100, 0, 255], speed: 0.0006 },
      { x: 0.5, y: 0.7, r: 0.45, color: [0, 150, 255], speed: 0.001 },
      { x: 0.1, y: 0.8, r: 0.35, color: [255, 0, 150], speed: 0.0007 },
    ];
    function resize() { canvas.width = el.offsetWidth; canvas.height = el.offsetHeight; }
    resize();
    window.addEventListener('resize', resize);
    function draw() {
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      blobs.forEach(function (b, i) {
        var x = (b.x + Math.sin(t * b.speed * 1000 + i) * 0.15) * w;
        var y = (b.y + Math.cos(t * b.speed * 1000 + i * 1.3) * 0.15) * h;
        var r = b.r * Math.max(w, h);
        var grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgba(' + b.color.join(',') + ',0.25)');
        grad.addColorStop(1, 'rgba(' + b.color.join(',') + ',0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });
      t++;
      requestAnimationFrame(draw);
    }
    draw();
    return { canvas: canvas };
  }

  // ─────────────────────────────────────────────────────────────────
  // PIXEL REVEAL — Image/element reveals in pixel blocks
  // ─────────────────────────────────────────────────────────────────
  function pixelReveal(target, options) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var opts = options || {};
    var cols = opts.cols || 20;
    var delay = opts.delay || 0;
    var duration = opts.duration || 800;
    var color = opts.color || '#0f0f1a';
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:grid;pointer-events:none;z-index:10;';
    var rows = Math.ceil(el.offsetHeight / (el.offsetWidth / cols));
    wrapper.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';
    wrapper.style.gridTemplateRows = 'repeat(' + rows + ',1fr)';
    el.style.position = el.style.position || 'relative';
    var cells = [];
    for (var i = 0; i < cols * rows; i++) {
      var cell = document.createElement('div');
      cell.style.cssText = 'background:' + color + ';transition:opacity ' + (duration / 1000) + 's ease;';
      wrapper.appendChild(cell);
      cells.push(cell);
    }
    el.appendChild(wrapper);
    setTimeout(function () {
      cells.forEach(function (cell, i) {
        setTimeout(function () {
          cell.style.opacity = '0';
        }, Math.random() * duration);
      });
      setTimeout(function () { wrapper.remove(); }, delay + duration + 200);
    }, delay);
    return { reveal: function () { el.appendChild(wrapper); } };
  }

  // ─────────────────────────────────────────────────────────────────
  // SOUND WAVE — Animated sound wave bars (visual, no audio needed)
  // ─────────────────────────────────────────────────────────────────
  function soundWave(target, options) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var opts = options || {};
    var bars = opts.bars || 32;
    var color = opts.color || '#00f5ff';
    var height = opts.height || '60px';
    var active = true;
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.gap = '3px';
    el.style.height = height;
    var barEls = [];
    for (var i = 0; i < bars; i++) {
      var bar = document.createElement('div');
      bar.style.cssText = 'flex:1;background:' + color + ';border-radius:2px;transition:height 0.1s ease;min-height:3px;';
      el.appendChild(bar);
      barEls.push(bar);
    }
    var offsets = barEls.map(function (_, i) { return Math.random() * Math.PI * 2; });
    var t = 0;
    function animate() {
      if (!active) return;
      var elH = el.offsetHeight || 60;
      barEls.forEach(function (bar, i) {
        var h = (Math.sin(t * 0.05 + offsets[i]) * 0.4 + 0.5) * elH;
        bar.style.height = Math.max(3, h) + 'px';
      });
      t++;
      requestAnimationFrame(animate);
    }
    animate();
    return {
      stop: function () { active = false; barEls.forEach(function (b) { b.style.height = '3px'; }); },
      start: function () { active = true; animate(); },
      setColor: function (c) { barEls.forEach(function (b) { b.style.background = c; }); }
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // NEON TEXT — Animated neon sign flicker effect
  // ─────────────────────────────────────────────────────────────────
  function neonText(target, options) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var opts = options || {};
    var color = opts.color || '#00f5ff';
    var flickerChance = opts.flickerChance || 0.02;
    var rgb = color;
    el.style.color = color;
    el.style.textShadow = '0 0 7px ' + color + ', 0 0 10px ' + color + ', 0 0 21px ' + color + ', 0 0 42px ' + color;
    el.style.transition = 'text-shadow 0.08s, opacity 0.08s';
    function flicker() {
      if (Math.random() < flickerChance) {
        el.style.opacity = '0.3';
        el.style.textShadow = 'none';
        setTimeout(function () {
          el.style.opacity = '1';
          el.style.textShadow = '0 0 7px ' + color + ', 0 0 10px ' + color + ', 0 0 21px ' + color + ', 0 0 42px ' + color;
        }, 80 + Math.random() * 120);
      }
      requestAnimationFrame(flicker);
    }
    flicker();
    return { setColor: function (c) { color = c; } };
  }

  // ─────────────────────────────────────────────────────────────────
  // CARD STACK — Stacked cards that fan out on hover
  // ─────────────────────────────────────────────────────────────────
  function cardStack(target, options) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var opts = options || {};
    var spread = opts.spread || 15;
    var cards = el.querySelectorAll('[data-card]');
    if (!cards.length) return;
    el.style.position = 'relative';
    cards.forEach(function (card, i) {
      card.style.cssText += ';position:absolute;top:0;left:0;width:100%;height:100%;transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);transform-origin:bottom center;';
      card.style.transform = 'rotate(' + (i * 3 - cards.length * 1.5) + 'deg) translateY(' + (i * 2) + 'px)';
    });
    el.addEventListener('mouseenter', function () {
      cards.forEach(function (card, i) {
        var angle = (i / (cards.length - 1) - 0.5) * spread * 2;
        card.style.transform = 'rotate(' + angle + 'deg) translateY(-20px)';
      });
    });
    el.addEventListener('mouseleave', function () {
      cards.forEach(function (card, i) {
        card.style.transform = 'rotate(' + (i * 3 - cards.length * 1.5) + 'deg) translateY(' + (i * 2) + 'px)';
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // GLITCH IMAGE — CSS glitch effect on images
  // ─────────────────────────────────────────────────────────────────
  function glitchImage(target) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    if (!document.getElementById('nx-glitch-img-styles')) {
      var s = document.createElement('style');
      s.id = 'nx-glitch-img-styles';
      s.textContent = `
        .nx-glitch-img { position:relative; overflow:hidden; }
        .nx-glitch-img::before, .nx-glitch-img::after {
          content:''; position:absolute; top:0; left:0; width:100%; height:100%;
          background:inherit; background-size:cover; background-position:center;
        }
        .nx-glitch-img:hover::before {
          animation: nxGlitchA 0.4s steps(2) infinite;
          mix-blend-mode: screen; background-color: rgba(255,0,100,0.3);
        }
        .nx-glitch-img:hover::after {
          animation: nxGlitchB 0.4s steps(2) infinite;
          mix-blend-mode: screen; background-color: rgba(0,255,255,0.3);
        }
        @keyframes nxGlitchA {
          0%{clip-path:inset(10% 0 80% 0);transform:translate(-5px,0)}
          50%{clip-path:inset(60% 0 20% 0);transform:translate(5px,0)}
          100%{clip-path:inset(40% 0 50% 0);transform:translate(-3px,0)}
        }
        @keyframes nxGlitchB {
          0%{clip-path:inset(80% 0 5% 0);transform:translate(5px,0)}
          50%{clip-path:inset(20% 0 60% 0);transform:translate(-5px,0)}
          100%{clip-path:inset(50% 0 30% 0);transform:translate(3px,0)}
        }
      `;
      document.head.appendChild(s);
    }
    el.classList.add('nx-glitch-img');
    if (el.tagName === 'IMG') {
      var src = el.src;
      el.style.backgroundImage = 'url(' + src + ')';
      el.style.backgroundSize = 'cover';
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // PARTICLE TEXT — Text that explodes into particles on click
  // ─────────────────────────────────────────────────────────────────
  function particleText(target, options) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var opts = options || {};
    var particleCount = opts.particles || 60;
    var colors = opts.colors || ['#00f5ff', '#ff006e', '#7c3aed', '#ffd700'];
    el.style.cursor = 'pointer';
    el.style.userSelect = 'none';
    el.addEventListener('click', function (e) {
      var rect = el.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      for (var i = 0; i < particleCount; i++) {
        var p = document.createElement('div');
        var angle = (Math.random() * Math.PI * 2);
        var speed = 3 + Math.random() * 8;
        var vx = Math.cos(angle) * speed;
        var vy = Math.sin(angle) * speed;
        var size = 4 + Math.random() * 8;
        var color = colors[Math.floor(Math.random() * colors.length)];
        var shape = Math.random() > 0.5 ? '50%' : '0';
        p.style.cssText = 'position:fixed;width:' + size + 'px;height:' + size + 'px;background:' + color + ';border-radius:' + shape + ';left:' + cx + 'px;top:' + cy + 'px;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);';
        document.body.appendChild(p);
        var startTime = null;
        var lifetime = 600 + Math.random() * 400;
        (function (particle, dvx, dvy, life) {
          function step(ts) {
            if (!startTime) startTime = ts;
            var prog = (ts - startTime) / life;
            if (prog >= 1) { particle.remove(); return; }
            var x = parseFloat(particle.style.left) + dvx * (1 - prog);
            var y = parseFloat(particle.style.top) + dvy * (1 - prog) + prog * prog * 200;
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = 1 - prog;
            particle.style.transform = 'translate(-50%,-50%) rotate(' + (prog * 360) + 'deg)';
            requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        })(p, vx, vy, lifetime);
      }
      // Bounce the text
      el.style.transition = 'transform 0.1s';
      el.style.transform = 'scale(0.9)';
      setTimeout(function () { el.style.transform = 'scale(1.1)'; }, 100);
      setTimeout(function () { el.style.transform = 'scale(1)'; }, 200);
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // HEAT MAP CURSOR — Leave a heat trail as cursor moves
  // ─────────────────────────────────────────────────────────────────
  function heatMapCursor(target) {
    var el = typeof target === 'string' ? document.querySelector(target) : (target || document.body);
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9998;opacity:0.6;mix-blend-mode:screen;';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', function () {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    var points = [];
    document.addEventListener('mousemove', function (e) {
      points.push({ x: e.clientX, y: e.clientY, t: Date.now(), life: 1 });
      if (points.length > 200) points.shift();
    });
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var now = Date.now();
      points.forEach(function (p) {
        var age = (now - p.t) / 2000;
        if (age > 1) return;
        var alpha = (1 - age) * 0.3;
        var r = (1 - age) * 30 + 5;
        var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        grad.addColorStop(0, 'rgba(255,' + Math.floor((1 - age) * 100) + ',0,' + alpha + ')');
        grad.addColorStop(0.5, 'rgba(255,200,0,' + alpha * 0.5 + ')');
        grad.addColorStop(1, 'rgba(0,100,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
    return { canvas: canvas, destroy: function () { canvas.remove(); } };
  }

  // ─────────────────────────────────────────────────────────────────
  // SPOTLIGHT BEAM — Theatrical spotlight following cursor
  // ─────────────────────────────────────────────────────────────────
  function spotlight(target, options) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var opts = options || {};
    var size = opts.size || 300;
    var color = opts.color || 'rgba(255,255,200,0.15)';
    el.style.position = el.style.position || 'relative';
    el.style.overflow = 'hidden';
    var light = document.createElement('div');
    light.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:radial-gradient(circle,' + color + ' 0%,transparent 70%);pointer-events:none;transform:translate(-50%,-50%);transition:left 0.1s,top 0.1s;left:-200px;top:-200px;z-index:5;';
    el.appendChild(light);
    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      light.style.left = (e.clientX - rect.left) + 'px';
      light.style.top = (e.clientY - rect.top) + 'px';
    });
    el.addEventListener('mouseleave', function () { light.style.left = '-200px'; light.style.top = '-200px'; });
    return { light: light };
  }

  // ─────────────────────────────────────────────────────────────────
  // TYPING RAIN — Matrix-like text rain but with custom characters
  // ─────────────────────────────────────────────────────────────────
  function typingRain(target, options) {
    var canvas = document.createElement('canvas');
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var opts = options || {};
    var chars = opts.chars || 'NANDANXABCDEF0123456789@#$%';
    var color = opts.color || '#00f5ff';
    var speed = opts.speed || 1;
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0.4;';
    el.style.position = el.style.position || 'relative';
    el.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    function resize() { canvas.width = el.offsetWidth; canvas.height = el.offsetHeight; }
    resize();
    var cols = Math.floor(canvas.width / 16);
    var drops = Array(cols).fill(1);
    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.font = '14px monospace';
      drops.forEach(function (y, i) {
        var ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * 16, y * 16);
        if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += speed;
      });
    }
    var iv = setInterval(draw, 50);
    return { stop: function () { clearInterval(iv); }, canvas: canvas };
  }

  // ─────────────────────────────────────────────────────────────────
  // MAGNETIC MENU — Menu items repel each other on hover
  // ─────────────────────────────────────────────────────────────────
  function magneticMenu(target) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var items = el.querySelectorAll('li, a, [data-menu-item]');
    items.forEach(function (item) {
      item.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), color 0.3s';
      item.style.display = 'inline-block';
      item.addEventListener('mousemove', function (e) {
        var rect = item.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) / rect.width * 20;
        var dy = (e.clientY - cy) / rect.height * 20;
        item.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.1)';
        item.style.color = '#00f5ff';
      });
      item.addEventListener('mouseleave', function () {
        item.style.transform = 'translate(0,0) scale(1)';
        item.style.color = '';
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // SCROLL FIRE — Elements ignite as you scroll past them
  // ─────────────────────────────────────────────────────────────────
  function scrollFire(target, options) {
    var els = typeof target === 'string' ? document.querySelectorAll(target) : [target];
    var opts = options || {};
    var effect = opts.effect || 'glow';
    if (!document.getElementById('nx-scroll-fire-styles')) {
      var s = document.createElement('style');
      s.id = 'nx-scroll-fire-styles';
      s.textContent = `
        .nx-fire-glow { transition: box-shadow 0.6s, border-color 0.6s; }
        .nx-fire-glow.nx-fired { box-shadow: 0 0 30px #ff006e, 0 0 60px #ff006e44; border-color: #ff006e !important; }
        .nx-fire-scale { transition: transform 0.6s cubic-bezier(0.34,1.56,0.64,1); }
        .nx-fire-scale.nx-fired { transform: scale(1.05); }
        .nx-fire-color { transition: background 0.6s, color 0.6s; }
        .nx-fire-color.nx-fired { background: linear-gradient(135deg,#00f5ff22,#ff006e22); }
      `;
      document.head.appendChild(s);
    }
    els.forEach(function (el) {
      el.classList.add('nx-fire-' + effect);
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { el.classList.add('nx-fired'); }
          else { el.classList.remove('nx-fired'); }
        });
      }, { threshold: 0.3 });
      obs.observe(el);
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // WOBBLE BUTTON — Jelly physics on button press
  // ─────────────────────────────────────────────────────────────────
  function wobbleButton(target) {
    var els = typeof target === 'string' ? document.querySelectorAll(target) : [target];
    if (!document.getElementById('nx-wobble-btn-styles')) {
      var s = document.createElement('style');
      s.id = 'nx-wobble-btn-styles';
      s.textContent = '@keyframes nxWobbleBtn{0%{transform:scale(1)}15%{transform:scale(0.92,1.08)}30%{transform:scale(1.1,0.92)}45%{transform:scale(0.96,1.04)}60%{transform:scale(1.04,0.98)}75%{transform:scale(0.99,1.01)}100%{transform:scale(1)}}';
      document.head.appendChild(s);
    }
    els.forEach(function (el) {
      el.addEventListener('click', function () {
        el.style.animation = 'none';
        el.offsetHeight; // reflow
        el.style.animation = 'nxWobbleBtn 0.6s cubic-bezier(0.36,0.07,0.19,0.97)';
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────
  return {
    aurora: aurora,
    pixelReveal: pixelReveal,
    soundWave: soundWave,
    neonText: neonText,
    cardStack: cardStack,
    glitchImage: glitchImage,
    particleText: particleText,
    heatMapCursor: heatMapCursor,
    spotlight: spotlight,
    typingRain: typingRain,
    magneticMenu: magneticMenu,
    scrollFire: scrollFire,
    wobbleButton: wobbleButton,
  };
})();

if (typeof window !== 'undefined') {
  window.NXCreative = NXCreative;
}
class TextEngine {
  constructor() {
    this.initialized = false;
    this._splitCache = new WeakMap();
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-text-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-text-styles';
    s.textContent = `
      .nx-typewriter-cursor::after {
        content: '|';
        animation: nx-blink 0.7s step-end infinite;
        color: var(--nx-primary, #00f5ff);
        margin-left: 2px;
      }
      @keyframes nx-blink { 0%,100%{opacity:1} 50%{opacity:0} }
      .nx-char { display: inline-block; }
      .nx-word { display: inline-block; }
      .nx-line { display: block; overflow: hidden; }
      .nx-scramble-char { display: inline-block; transition: color 0.1s; }
      .nx-gradient-text {
        background: linear-gradient(135deg, var(--nx-primary,#00f5ff), var(--nx-secondary,#ff006e), var(--nx-accent,#7c3aed));
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text; background-size: 200% auto;
        animation: nx-gradient-shift 3s linear infinite;
      }
      @keyframes nx-gradient-shift { to { background-position: 200% center; } }
      .nx-neon-text {
        color: var(--nx-neon-txt, #00f5ff);
        text-shadow: 0 0 7px var(--nx-neon-txt, #00f5ff), 0 0 21px var(--nx-neon-txt, #00f5ff), 0 0 42px var(--nx-neon-txt, #00f5ff);
        animation: nx-neon-flicker 4s infinite;
      }
      @keyframes nx-neon-flicker {
        0%,19%,21%,23%,25%,54%,56%,100% { opacity:1; }
        20%,24%,55% { opacity:0.4; }
      }
      .nx-glitch-text { position: relative; }
      .nx-glitch-text::before, .nx-glitch-text::after {
        content: attr(data-text); position: absolute; top: 0; left: 0;
        width: 100%; height: 100%; pointer-events: none;
      }
      .nx-glitch-text::before { color: #ff006e; animation: nx-gt1 2s infinite; clip-path: polygon(0 15%, 100% 15%, 100% 40%, 0 40%); }
      .nx-glitch-text::after  { color: #00f5ff; animation: nx-gt2 2s infinite; clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%); }
      @keyframes nx-gt1 { 0%,100%{transform:translate(0)} 20%{transform:translate(-3px,1px)} 40%{transform:translate(3px,-1px)} 60%{transform:translate(-2px,2px)} 80%{transform:translate(2px,-2px)} }
      @keyframes nx-gt2 { 0%,100%{transform:translate(0)} 20%{transform:translate(3px,-1px)} 40%{transform:translate(-3px,1px)} 60%{transform:translate(2px,-2px)} 80%{transform:translate(-2px,2px)} }
      .nx-wave-char { display: inline-block; animation: nx-wave-ch 1.2s ease-in-out infinite; }
      @keyframes nx-wave-ch { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-0.4em)} }
      .nx-blur-text { filter: blur(8px); opacity:0; transition: filter 0.8s ease, opacity 0.8s ease; }
      .nx-blur-text.nx-visible { filter: blur(0); opacity:1; }
    `;
    document.head.appendChild(s);
  }

  typewriter(target, options) {
    const opts = Object.assign({ speed: 50, cursor: true, loop: false, deleteSpeed: 30, pauseAfter: 2000 }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      const text = opts.text || el.textContent;
      el.textContent = '';
      if (opts.cursor) el.classList.add('nx-typewriter-cursor');
      let i = 0, deleting = false;
      const type = () => {
        if (!deleting) {
          el.textContent = text.slice(0, i + 1);
          i++;
          if (i === text.length) {
            if (opts.loop) setTimeout(() => { deleting = true; tick(); }, opts.pauseAfter);
            return;
          }
          setTimeout(tick, opts.speed);
        } else {
          el.textContent = text.slice(0, i - 1);
          i--;
          if (i === 0) { deleting = false; setTimeout(tick, 400); return; }
          setTimeout(tick, opts.deleteSpeed);
        }
      };
      const tick = () => type();
      type();
    });
    return this;
  }

  scramble(target, options) {
    const opts = Object.assign({ speed: 40, chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%', onHover: true }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      const original = el.textContent;
      const doScramble = () => {
        let iter = 0;
        const max = original.length * 3;
        const interval = setInterval(() => {
          el.textContent = original.split('').map((ch, i) => {
            if (ch === ' ') return ' ';
            if (i < Math.floor(iter / 3)) return ch;
            return opts.chars[Math.floor(Math.random() * opts.chars.length)];
          }).join('');
          iter++;
          if (iter >= max) { el.textContent = original; clearInterval(interval); }
        }, opts.speed);
      };
      if (opts.onHover) el.addEventListener('mouseenter', doScramble);
      else doScramble();
    });
    return this;
  }

  splitChars(target) {
    const els = NandanXUtils.parseSelector(target);
    els.forEach(el => {
      if (this._splitCache.has(el)) return;
      const text = el.textContent;
      el.innerHTML = text.split('').map(ch =>
        `<span class="nx-char" style="display:inline-block">${ch === ' ' ? '&nbsp;' : ch}</span>`
      ).join('');
      this._splitCache.set(el, text);
    });
    return els;
  }

  splitWords(target) {
    const els = NandanXUtils.parseSelector(target);
    els.forEach(el => {
      const text = el.textContent;
      el.innerHTML = text.split(' ').map(w =>
        `<span class="nx-word" style="display:inline-block">${w}&nbsp;</span>`
      ).join('');
    });
    return els;
  }

  revealChars(target, options) {
    const opts = Object.assign({ stagger: 30, duration: 600, direction: 'up' }, options || {});
    const els = this.splitChars(target);
    els.forEach(el => {
      const chars = [...el.querySelectorAll('.nx-char')];
      chars.forEach((ch, i) => {
        ch.style.opacity = '0';
        ch.style.transform = opts.direction === 'up' ? 'translateY(20px)' : opts.direction === 'down' ? 'translateY(-20px)' : 'scale(0)';
        ch.style.transition = `opacity ${opts.duration}ms ease, transform ${opts.duration}ms cubic-bezier(0.34,1.56,0.64,1)`;
        ch.style.transitionDelay = `${i * opts.stagger}ms`;
      });
      const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        chars.forEach(ch => { ch.style.opacity = '1'; ch.style.transform = 'none'; });
      }, { threshold: 0.1 });
      obs.observe(el);
    });
    return this;
  }

  revealWords(target, options) {
    const opts = Object.assign({ stagger: 80, duration: 700 }, options || {});
    const els = this.splitWords(target);
    els.forEach(el => {
      const words = [...el.querySelectorAll('.nx-word')];
      words.forEach((w, i) => {
        w.style.opacity = '0';
        w.style.transform = 'translateY(30px)';
        w.style.transition = `opacity ${opts.duration}ms ease, transform ${opts.duration}ms cubic-bezier(0.23,1,0.32,1)`;
        w.style.transitionDelay = `${i * opts.stagger}ms`;
      });
      const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        words.forEach(w => { w.style.opacity = '1'; w.style.transform = 'none'; });
      }, { threshold: 0.1 });
      obs.observe(el);
    });
    return this;
  }

  gradient(target, colors) {
    const c = colors || ['#00f5ff', '#ff006e', '#7c3aed'];
    NandanXUtils.parseSelector(target).forEach(el => {
      el.style.background = `linear-gradient(135deg, ${c.join(', ')})`;
      el.style.webkitBackgroundClip = 'text';
      el.style.webkitTextFillColor = 'transparent';
      el.style.backgroundClip = 'text';
      el.style.backgroundSize = '200% auto';
      el.style.animation = 'nx-gradient-shift 3s linear infinite';
    });
    return this;
  }

  neon(target, color) {
    NandanXUtils.parseSelector(target).forEach(el => {
      if (color) el.style.setProperty('--nx-neon-txt', color);
      el.classList.add('nx-neon-text');
    });
    return this;
  }

  glitch(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.dataset.text = el.textContent;
      el.classList.add('nx-glitch-text');
    });
    return this;
  }

  wave(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      const text = el.textContent;
      el.innerHTML = text.split('').map((ch, i) =>
        `<span class="nx-wave-char" style="animation-delay:${i * 0.08}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
      ).join('');
    });
    return this;
  }

  counter(target, options) {
    const opts = Object.assign({ from: 0, duration: 2000, decimals: 0, prefix: '', suffix: '', easing: NandanXUtils.easeOutQuart }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      const to = parseFloat(el.dataset.nxTarget || el.textContent) || opts.to || 0;
      const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const tick = now => {
          const p = NandanXUtils.clamp((now - start) / opts.duration, 0, 1);
          const val = opts.from + (to - opts.from) * opts.easing(p);
          el.textContent = opts.prefix + val.toFixed(opts.decimals) + opts.suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.3 });
      obs.observe(el);
    });
    return this;
  }

  flipCounter(target, options) {
    const opts = Object.assign({ duration: 2000, from: 0 }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      const to = parseInt(el.dataset.nxTarget || el.textContent) || 0;
      const digits = String(to).length;
      el.style.display = 'inline-flex';
      el.style.gap = '2px';
      const cols = Array.from({ length: digits }, () => {
        const col = document.createElement('span');
        col.style.cssText = 'display:inline-block;overflow:hidden;height:1em;position:relative;';
        const inner = document.createElement('span');
        inner.style.cssText = 'display:block;transition:transform 0.6s cubic-bezier(0.34,1.56,0.64,1);';
        inner.innerHTML = Array.from({ length: 10 }, (_, i) => `<span style="display:block;text-align:center">${i}</span>`).join('');
        col.appendChild(inner);
        el.appendChild(col);
        return inner;
      });
      el.textContent = '';
      cols.forEach(c => el.appendChild(c.parentElement));
      const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        const toStr = String(to).padStart(digits, '0');
        cols.forEach((inner, i) => {
          const d = parseInt(toStr[i]);
          setTimeout(() => {
            inner.style.transform = `translateY(-${d * 1}em)`;
          }, i * 100);
        });
      }, { threshold: 0.3 });
      obs.observe(el);
    });
    return this;
  }

  highlight(target, color) {
    const c = color || 'rgba(0,245,255,0.25)';
    NandanXUtils.parseSelector(target).forEach(el => {
      el.style.background = `linear-gradient(transparent 60%, ${c} 60%)`;
      el.style.backgroundSize = '0% 100%';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.transition = 'background-size 0.6s ease';
      const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        el.style.backgroundSize = '100% 100%';
      }, { threshold: 0.5 });
      obs.observe(el);
    });
    return this;
  }

  blur(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-blur-text');
      const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        el.classList.add('nx-visible');
      }, { threshold: 0.1 });
      obs.observe(el);
    });
    return this;
  }

  multiType(target, texts, options) {
    const opts = Object.assign({ speed: 60, deleteSpeed: 35, pause: 2000, loop: true }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-typewriter-cursor');
      let ti = 0, ci = 0, deleting = false;
      const tick = () => {
        const current = texts[ti % texts.length];
        if (!deleting) {
          el.textContent = current.slice(0, ci + 1);
          ci++;
          if (ci === current.length) {
            setTimeout(() => { deleting = true; tick(); }, opts.pause);
            return;
          }
          setTimeout(tick, opts.speed);
        } else {
          el.textContent = current.slice(0, ci - 1);
          ci--;
          if (ci === 0) {
            deleting = false;
            ti++;
            if (!opts.loop && ti >= texts.length) return;
            setTimeout(tick, 300);
            return;
          }
          setTimeout(tick, opts.deleteSpeed);
        }
      };
      tick();
    });
    return this;
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-text]').forEach(el => {
        if (el.dataset.nxTextDone) return;
        el.dataset.nxTextDone = '1';
        const effect = el.dataset.nxText;
        if (effect === 'typewriter') this.typewriter(el);
        else if (effect === 'scramble') this.scramble(el);
        else if (effect === 'gradient') this.gradient(el);
        else if (effect === 'neon') this.neon(el);
        else if (effect === 'glitch') this.glitch(el);
        else if (effect === 'wave') this.wave(el);
        else if (effect === 'reveal-chars') this.revealChars(el);
        else if (effect === 'reveal-words') this.revealWords(el);
        else if (effect === 'blur') this.blur(el);
        else if (effect === 'highlight') this.highlight(el);
        else if (effect === 'counter') this.counter(el);
        else if (effect === 'flip-counter') this.flipCounter(el);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var textEngine = new TextEngine();
if (typeof window !== 'undefined') window.NandanXText = textEngine;
class NoiseEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.rafId = null;
    this.mode = null;
    this.initialized = false;
    this._permTable = null;
  }

  init() {
    if (this.initialized) return this;
    this._buildPermTable();
    this.initialized = true;
    return this;
  }

  _buildPermTable() {
    const p = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    this._permTable = [...p, ...p];
  }

  _fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  _lerp(a, b, t) { return a + t * (b - a); }
  _grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return (h & 1 ? -u : u) + (h & 2 ? -v : v);
  }

  perlin(x, y) {
    if (!this._permTable) this._buildPermTable();
    const p = this._permTable;
    const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = this._fade(xf), v = this._fade(yf);
    const aa = p[p[xi] + yi], ab = p[p[xi] + yi + 1];
    const ba = p[p[xi + 1] + yi], bb = p[p[xi + 1] + yi + 1];
    return this._lerp(
      this._lerp(this._grad(aa, xf, yf), this._grad(ba, xf - 1, yf), u),
      this._lerp(this._grad(ab, xf, yf - 1), this._grad(bb, xf - 1, yf - 1), u),
      v
    );
  }

  fbm(x, y, octaves, lacunarity, gain) {
    const oct = octaves || 4, lac = lacunarity || 2, g = gain || 0.5;
    let value = 0, amplitude = 1, frequency = 1, max = 0;
    for (let i = 0; i < oct; i++) {
      value += this.perlin(x * frequency, y * frequency) * amplitude;
      max += amplitude;
      amplitude *= g;
      frequency *= lac;
    }
    return value / max;
  }

  noiseBackground(container, options) {
    if (!this.initialized) this.init();
    const opts = Object.assign({
      color1: '#0f0f1a', color2: '#00f5ff', opacity: 0.08,
      scale: 3, animate: true, speed: 0.002
    }, options || {});
    const target = typeof container === 'string' ? document.querySelector(container) : container || document.body;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    target.style.position = target.style.position || 'relative';
    target.insertBefore(canvas, target.firstChild);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let t = 0;
    const draw = () => {
      canvas.width = target.offsetWidth;
      canvas.height = target.offsetHeight;
      const W = canvas.width, H = canvas.height;
      const imageData = ctx.createImageData(W, H);
      const data = imageData.data;
      const c1 = NandanXUtils.hexToRgb(opts.color1) || { r: 15, g: 15, b: 26 };
      const c2 = NandanXUtils.hexToRgb(opts.color2) || { r: 0, g: 245, b: 255 };
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const n = (this.fbm(x / W * opts.scale + t, y / H * opts.scale + t) + 1) / 2;
          const i = (y * W + x) * 4;
          data[i] = Math.round(c1.r + (c2.r - c1.r) * n);
          data[i + 1] = Math.round(c1.g + (c2.g - c1.g) * n);
          data[i + 2] = Math.round(c1.b + (c2.b - c1.b) * n);
          data[i + 3] = Math.round(opts.opacity * 255);
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };
    draw();
    if (opts.animate) {
      const animate = () => {
        t += opts.speed;
        draw();
        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
    return this;
  }

  gradientMesh(container, options) {
    const opts = Object.assign({
      colors: ['#00f5ff', '#ff006e', '#7c3aed', '#00ff88'],
      pointCount: 6, animate: true, speed: 0.003, blur: 80
    }, options || {});
    const target = typeof container === 'string' ? document.querySelector(container) : container || document.body;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;filter:blur(${opts.blur}px);`;
    target.style.position = target.style.position || 'relative';
    target.insertBefore(canvas, target.firstChild);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const points = Array.from({ length: opts.pointCount }, (_, i) => ({
      x: Math.random(), y: Math.random(),
      vx: NandanXUtils.randomBetween(-0.001, 0.001),
      vy: NandanXUtils.randomBetween(-0.001, 0.001),
      color: opts.colors[i % opts.colors.length],
    }));
    const draw = () => {
      canvas.width = target.offsetWidth;
      canvas.height = target.offsetHeight;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      points.forEach(p => {
        if (opts.animate) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > 1) p.vx *= -1;
          if (p.y < 0 || p.y > 1) p.vy *= -1;
        }
        const gx = p.x * W, gy = p.y * H;
        const r = Math.max(W, H) * 0.7;
        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
        grad.addColorStop(0, p.color + 'cc');
        grad.addColorStop(1, 'transparent');
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      });
    };
    draw();
    if (opts.animate) {
      const animate = () => { draw(); requestAnimationFrame(animate); };
      requestAnimationFrame(animate);
    }
    return this;
  }

  aurora(container, options) {
    const opts = Object.assign({
      colors: ['rgba(0,245,255,0.3)', 'rgba(124,58,237,0.25)', 'rgba(0,255,136,0.2)'],
      layers: 3, speed: 0.5
    }, options || {});
    const target = typeof container === 'string' ? document.querySelector(container) : container || document.body;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    target.style.position = target.style.position || 'relative';
    target.insertBefore(canvas, target.firstChild);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let t = 0;
    const draw = () => {
      canvas.width = target.offsetWidth;
      canvas.height = target.offsetHeight;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      for (let l = 0; l < opts.layers; l++) {
        ctx.beginPath();
        const offset = (l / opts.layers) * Math.PI * 2;
        ctx.moveTo(0, H * 0.4);
        for (let x = 0; x <= W; x += 4) {
          const y = H * 0.4 + Math.sin(x / W * Math.PI * 3 + t * opts.speed + offset) * H * 0.12
            + Math.sin(x / W * Math.PI * 5 + t * opts.speed * 1.3 + offset) * H * 0.06;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, 0); ctx.lineTo(0, 0);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, 0, 0, H * 0.6);
        grad.addColorStop(0, opts.colors[l % opts.colors.length]);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();
      }
      t += 0.01;
    };
    draw();
    const animate = () => { draw(); requestAnimationFrame(animate); };
    requestAnimationFrame(animate);
    return this;
  }

  dots(container, options) {
    const opts = Object.assign({ color: '#00f5ff', size: 1.5, gap: 24, opacity: 0.15 }, options || {});
    const target = typeof container === 'string' ? document.querySelector(container) : container || document.body;
    target.style.position = target.style.position || 'relative';
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    target.insertBefore(canvas, target.firstChild);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      canvas.width = target.offsetWidth;
      canvas.height = target.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = opts.color;
      ctx.globalAlpha = opts.opacity;
      for (let x = opts.gap; x < canvas.width; x += opts.gap) {
        for (let y = opts.gap; y < canvas.height; y += opts.gap) {
          ctx.beginPath();
          ctx.arc(x, y, opts.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };
    draw();
    window.addEventListener('resize', NandanXUtils.debounce(draw, 200));
    return this;
  }

  grid(container, options) {
    const opts = Object.assign({ color: '#00f5ff', opacity: 0.07, size: 40 }, options || {});
    const target = typeof container === 'string' ? document.querySelector(container) : container || document.body;
    target.style.position = target.style.position || 'relative';
    const div = document.createElement('div');
    div.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;
      background-image: linear-gradient(${opts.color}${Math.round(opts.opacity*255).toString(16).padStart(2,'0')} 1px, transparent 1px),
                        linear-gradient(90deg, ${opts.color}${Math.round(opts.opacity*255).toString(16).padStart(2,'0')} 1px, transparent 1px);
      background-size: ${opts.size}px ${opts.size}px;`;
    target.insertBefore(div, target.firstChild);
    return this;
  }

  scanlines(container, options) {
    const opts = Object.assign({ opacity: 0.03, lineHeight: 2, gap: 4 }, options || {});
    const target = typeof container === 'string' ? document.querySelector(container) : container || document.body;
    target.style.position = target.style.position || 'relative';
    const div = document.createElement('div');
    div.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;
      background: repeating-linear-gradient(0deg, rgba(0,0,0,${opts.opacity}) 0px, rgba(0,0,0,${opts.opacity}) ${opts.lineHeight}px, transparent ${opts.lineHeight}px, transparent ${opts.lineHeight + opts.gap}px);`;
    target.appendChild(div);
    return this;
  }
}

var noiseEngine = new NoiseEngine();
if (typeof window !== 'undefined') window.NandanXNoise = noiseEngine;
class ModalEngine {
  constructor() {
    this.stack = [];
    this.initialized = false;
    this._backdropEl = null;
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.closeTop(); });
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-modal-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-modal-styles';
    s.textContent = `
      .nx-backdrop {
        position:fixed;inset:0;z-index:100000;
        background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);
        opacity:0;transition:opacity 0.3s ease;pointer-events:none;
      }
      .nx-backdrop.nx-active { opacity:1;pointer-events:all; }
      .nx-modal {
        position:fixed;z-index:100001;
        background:var(--nx-bg,#0f0f1a);border:1px solid rgba(0,245,255,0.2);
        border-radius:16px;padding:32px;
        box-shadow:0 0 60px rgba(0,245,255,0.1),0 20px 60px rgba(0,0,0,0.5);
        opacity:0;transform:translateY(20px) scale(0.97);
        transition:opacity 0.35s ease,transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
        pointer-events:none;max-width:90vw;max-height:90vh;overflow-y:auto;
        color:var(--nx-text,#e2e8f0);
      }
      .nx-modal.nx-center { top:50%;left:50%;transform:translate(-50%,-50%) scale(0.97); }
      .nx-modal.nx-active { opacity:1;pointer-events:all; }
      .nx-modal.nx-center.nx-active { transform:translate(-50%,-50%) scale(1); }
      .nx-modal-close {
        position:absolute;top:16px;right:16px;
        width:28px;height:28px;border-radius:50%;border:none;
        background:rgba(255,255,255,0.08);color:var(--nx-text,#e2e8f0);
        cursor:pointer;display:flex;align-items:center;justify-content:center;
        font-size:16px;transition:background 0.2s;
      }
      .nx-modal-close:hover { background:rgba(255,0,110,0.3); }
      .nx-drawer {
        position:fixed;z-index:100001;
        background:var(--nx-bg,#0f0f1a);border:1px solid rgba(0,245,255,0.15);
        box-shadow:0 0 40px rgba(0,245,255,0.08);
        opacity:0;transition:opacity 0.35s ease,transform 0.35s cubic-bezier(0.23,1,0.32,1);
        pointer-events:none;overflow-y:auto;padding:24px;
        color:var(--nx-text,#e2e8f0);
      }
      .nx-drawer.nx-right  { top:0;right:0;height:100%;width:min(400px,90vw);transform:translateX(100%); }
      .nx-drawer.nx-left   { top:0;left:0;height:100%;width:min(400px,90vw);transform:translateX(-100%); }
      .nx-drawer.nx-bottom { bottom:0;left:0;right:0;max-height:80vh;transform:translateY(100%);border-radius:20px 20px 0 0; }
      .nx-drawer.nx-top    { top:0;left:0;right:0;max-height:80vh;transform:translateY(-100%);border-radius:0 0 20px 20px; }
      .nx-drawer.nx-active { opacity:1;pointer-events:all;transform:none; }
      .nx-toast-container { position:fixed;z-index:200000;display:flex;flex-direction:column;gap:8px;pointer-events:none; }
      .nx-toast-container.nx-top-right    { top:20px;right:20px;align-items:flex-end; }
      .nx-toast-container.nx-top-left     { top:20px;left:20px;align-items:flex-start; }
      .nx-toast-container.nx-bottom-right { bottom:20px;right:20px;align-items:flex-end; }
      .nx-toast-container.nx-bottom-left  { bottom:20px;left:20px;align-items:flex-start; }
      .nx-toast-container.nx-top-center   { top:20px;left:50%;transform:translateX(-50%);align-items:center; }
      .nx-toast {
        pointer-events:all;min-width:240px;max-width:380px;padding:12px 16px;border-radius:10px;
        background:var(--nx-bg,#0f0f1a);border:1px solid rgba(255,255,255,0.1);
        color:var(--nx-text,#e2e8f0);font-size:14px;
        box-shadow:0 8px 30px rgba(0,0,0,0.4);
        display:flex;align-items:center;gap:10px;
        opacity:0;transform:translateY(-10px) scale(0.95);
        transition:opacity 0.3s ease,transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
      }
      .nx-toast.nx-active { opacity:1;transform:none; }
      .nx-toast.nx-success { border-color:rgba(0,255,136,0.4); }
      .nx-toast.nx-error   { border-color:rgba(255,0,110,0.4); }
      .nx-toast.nx-warning { border-color:rgba(255,230,0,0.4); }
      .nx-toast.nx-info    { border-color:rgba(0,245,255,0.4); }
      .nx-toast-icon { font-size:18px;flex-shrink:0; }
      .nx-toast-body { flex:1; }
      .nx-toast-title { font-weight:700;font-size:13px;margin-bottom:2px; }
      .nx-toast-msg { opacity:0.8;font-size:12px;line-height:1.4; }
      .nx-toast-progress {
        position:absolute;bottom:0;left:0;height:2px;
        background:var(--nx-primary,#00f5ff);border-radius:0 0 10px 10px;
        transition:width linear;
      }
      .nx-tooltip {
        position:absolute;z-index:300000;
        background:rgba(15,15,26,0.95);border:1px solid rgba(0,245,255,0.25);
        color:var(--nx-text,#e2e8f0);font-size:12px;border-radius:6px;
        padding:6px 10px;pointer-events:none;white-space:nowrap;
        opacity:0;transform:translateY(4px);
        transition:opacity 0.2s ease,transform 0.2s ease;
        box-shadow:0 4px 20px rgba(0,0,0,0.4);
      }
      .nx-tooltip.nx-active { opacity:1;transform:translateY(0); }
      .nx-confirm-overlay {
        position:fixed;inset:0;z-index:200001;display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);
        opacity:0;pointer-events:none;transition:opacity 0.25s ease;
      }
      .nx-confirm-overlay.nx-active { opacity:1;pointer-events:all; }
      .nx-confirm-box {
        background:var(--nx-bg,#0f0f1a);border:1px solid rgba(0,245,255,0.25);
        border-radius:16px;padding:32px;min-width:300px;max-width:440px;
        text-align:center;box-shadow:0 0 60px rgba(0,245,255,0.1);
        color:var(--nx-text,#e2e8f0);
        transform:scale(0.9);transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
      }
      .nx-confirm-overlay.nx-active .nx-confirm-box { transform:scale(1); }
      .nx-confirm-title { font-size:20px;font-weight:700;margin-bottom:10px; }
      .nx-confirm-msg { opacity:0.7;font-size:14px;line-height:1.6;margin-bottom:24px; }
      .nx-confirm-actions { display:flex;gap:12px;justify-content:center; }
      .nx-confirm-btn {
        padding:10px 24px;border-radius:8px;border:none;cursor:pointer;
        font-size:14px;font-weight:600;transition:opacity 0.2s,transform 0.2s;
      }
      .nx-confirm-btn:hover { opacity:0.85;transform:scale(1.03); }
      .nx-confirm-ok  { background:var(--nx-primary,#00f5ff);color:#000; }
      .nx-confirm-cancel { background:rgba(255,255,255,0.1);color:var(--nx-text,#e2e8f0); }
    `;
    document.head.appendChild(s);
  }

  _getBackdrop() {
    if (!this._backdropEl) {
      this._backdropEl = document.createElement('div');
      this._backdropEl.className = 'nx-backdrop';
      document.body.appendChild(this._backdropEl);
      this._backdropEl.addEventListener('click', () => this.closeTop());
    }
    return this._backdropEl;
  }

  open(options) {
    const opts = Object.assign({
      content: '', title: '', width: 'auto', position: 'center',
      closeButton: true, backdrop: true, onClose: null
    }, options || {});
    const modal = document.createElement('div');
    modal.className = 'nx-modal nx-center';
    if (opts.width !== 'auto') modal.style.width = opts.width;
    let html = '';
    if (opts.closeButton) html += `<button class="nx-modal-close">✕</button>`;
    if (opts.title) html += `<h3 style="margin:0 0 16px;font-size:20px;font-weight:700">${opts.title}</h3>`;
    html += opts.content;
    modal.innerHTML = html;
    document.body.appendChild(modal);
    if (opts.backdrop) {
      const bd = this._getBackdrop();
      bd.classList.add('nx-active');
    }
    requestAnimationFrame(() => modal.classList.add('nx-active'));
    this.stack.push({ modal, opts });
    modal.querySelector('.nx-modal-close')?.addEventListener('click', () => this.close(modal));
    return modal;
  }

  close(modal) {
    const m = modal || (this.stack.length && this.stack[this.stack.length - 1].modal);
    if (!m) return this;
    m.classList.remove('nx-active');
    setTimeout(() => m.remove(), 350);
    this.stack = this.stack.filter(s => s.modal !== m);
    if (this.stack.length === 0 && this._backdropEl) this._backdropEl.classList.remove('nx-active');
    return this;
  }

  closeTop() {
    if (this.stack.length) this.close(this.stack[this.stack.length - 1].modal);
    return this;
  }

  drawer(options) {
    const opts = Object.assign({ content: '', position: 'right', closeButton: true, backdrop: true }, options || {});
    const drawer = document.createElement('div');
    drawer.className = `nx-drawer nx-${opts.position}`;
    let html = '';
    if (opts.closeButton) html += `<button class="nx-modal-close" style="position:absolute;top:16px;right:16px">✕</button>`;
    if (opts.title) html += `<h3 style="margin:0 0 20px;font-size:18px;font-weight:700">${opts.title}</h3>`;
    html += opts.content;
    drawer.innerHTML = html;
    document.body.appendChild(drawer);
    if (opts.backdrop) this._getBackdrop().classList.add('nx-active');
    requestAnimationFrame(() => drawer.classList.add('nx-active'));
    this.stack.push({ modal: drawer, opts });
    drawer.querySelector('.nx-modal-close')?.addEventListener('click', () => this.close(drawer));
    return drawer;
  }

  toast(message, options) {
    const opts = Object.assign({
      type: 'info', title: '', duration: 3500, position: 'top-right',
      icon: null
    }, options || {});
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    let container = document.querySelector(`.nx-toast-container.nx-${opts.position}`);
    if (!container) {
      container = document.createElement('div');
      container.className = `nx-toast-container nx-${opts.position}`;
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `nx-toast nx-${opts.type}`;
    toast.style.position = 'relative';
    toast.innerHTML = `
      <span class="nx-toast-icon">${opts.icon || icons[opts.type]}</span>
      <div class="nx-toast-body">
        ${opts.title ? `<div class="nx-toast-title">${opts.title}</div>` : ''}
        <div class="nx-toast-msg">${message}</div>
      </div>
      <div class="nx-toast-progress" style="width:100%"></div>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('nx-active'));
    const progress = toast.querySelector('.nx-toast-progress');
    if (progress) {
      progress.style.transition = `width ${opts.duration}ms linear`;
      setTimeout(() => { progress.style.width = '0%'; }, 50);
    }
    const remove = () => {
      toast.classList.remove('nx-active');
      setTimeout(() => toast.remove(), 300);
    };
    const timer = setTimeout(remove, opts.duration);
    toast.addEventListener('click', () => { clearTimeout(timer); remove(); });
    return toast;
  }

  tooltip(target, message, options) {
    const opts = Object.assign({ placement: 'top', offset: 8 }, options || {});
    const tip = document.createElement('div');
    tip.className = 'nx-tooltip';
    tip.textContent = message;
    document.body.appendChild(tip);
    NandanXUtils.parseSelector(target).forEach(el => {
      el.addEventListener('mouseenter', () => {
        const r = el.getBoundingClientRect();
        tip.style.left = (r.left + r.width / 2 - tip.offsetWidth / 2) + 'px';
        tip.style.top = opts.placement === 'top'
          ? (r.top - tip.offsetHeight - opts.offset) + 'px'
          : (r.bottom + opts.offset) + 'px';
        tip.classList.add('nx-active');
      });
      el.addEventListener('mouseleave', () => tip.classList.remove('nx-active'));
    });
    return this;
  }

  confirm(message, options) {
    return new Promise(resolve => {
      const opts = Object.assign({ title: 'Confirm', okText: 'Confirm', cancelText: 'Cancel' }, options || {});
      const overlay = document.createElement('div');
      overlay.className = 'nx-confirm-overlay';
      overlay.innerHTML = `
        <div class="nx-confirm-box">
          <div class="nx-confirm-title">${opts.title}</div>
          <div class="nx-confirm-msg">${message}</div>
          <div class="nx-confirm-actions">
            <button class="nx-confirm-btn nx-confirm-cancel">${opts.cancelText}</button>
            <button class="nx-confirm-btn nx-confirm-ok">${opts.okText}</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('nx-active'));
      const close = val => {
        overlay.classList.remove('nx-active');
        setTimeout(() => overlay.remove(), 300);
        resolve(val);
      };
      overlay.querySelector('.nx-confirm-ok').addEventListener('click', () => close(true));
      overlay.querySelector('.nx-confirm-cancel').addEventListener('click', () => close(false));
      overlay.addEventListener('keydown', e => { if (e.key === 'Enter') close(true); if (e.key === 'Escape') close(false); });
      overlay.focus();
    });
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-modal]').forEach(trigger => {
        if (trigger.dataset.nxModalDone) return;
        trigger.dataset.nxModalDone = '1';
        trigger.addEventListener('click', () => {
          const targetSel = trigger.dataset.nxModal;
          const targetEl = document.querySelector(targetSel);
          if (targetEl) this.open({ content: targetEl.innerHTML, title: targetEl.dataset.nxTitle || '' });
        });
      });
      NandanXUtils.qsa('[data-nx-tooltip]').forEach(el => {
        if (el.dataset.nxTooltipDone) return;
        el.dataset.nxTooltipDone = '1';
        this.tooltip(el, el.dataset.nxTooltip);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var modalEngine = new ModalEngine();
if (typeof window !== 'undefined') window.NandanXModal = modalEngine;
class FormEngine {
  constructor() {
    this.validators = {};
    this.forms = new Map();
    this.initialized = false;
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._registerBuiltins();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-form-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-form-styles';
    s.textContent = `
      .nx-field { position:relative; margin-bottom:20px; }
      .nx-input, .nx-textarea, .nx-select {
        width:100%;padding:12px 16px;
        background:rgba(255,255,255,0.04);
        border:1.5px solid rgba(255,255,255,0.1);
        border-radius:10px;color:var(--nx-text,#e2e8f0);font-size:14px;
        outline:none;transition:border-color 0.25s ease,box-shadow 0.25s ease,background 0.25s ease;
        font-family:inherit;
      }
      .nx-input:focus, .nx-textarea:focus, .nx-select:focus {
        border-color:var(--nx-primary,#00f5ff);
        box-shadow:0 0 0 3px rgba(0,245,255,0.12);
        background:rgba(0,245,255,0.03);
      }
      .nx-input.nx-valid   { border-color:rgba(0,255,136,0.6); }
      .nx-input.nx-invalid { border-color:rgba(255,0,110,0.7); }
      .nx-label {
        display:block;margin-bottom:6px;font-size:12px;font-weight:600;
        letter-spacing:0.08em;text-transform:uppercase;
        color:rgba(255,255,255,0.5);transition:color 0.2s;
      }
      .nx-field:focus-within .nx-label { color:var(--nx-primary,#00f5ff); }
      .nx-error-msg {
        font-size:11px;color:#ff006e;margin-top:4px;
        opacity:0;transform:translateY(-4px);
        transition:opacity 0.2s ease,transform 0.2s ease;
      }
      .nx-error-msg.nx-visible { opacity:1;transform:none; }
      .nx-float-label .nx-input { padding-top:20px; }
      .nx-float-label .nx-label {
        position:absolute;top:14px;left:16px;margin:0;
        font-size:14px;text-transform:none;letter-spacing:normal;
        pointer-events:none;transition:all 0.2s ease;
      }
      .nx-float-label .nx-input:focus ~ .nx-label,
      .nx-float-label .nx-input:not(:placeholder-shown) ~ .nx-label {
        top:6px;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;
        color:var(--nx-primary,#00f5ff);
      }
      .nx-btn {
        display:inline-flex;align-items:center;justify-content:center;gap:8px;
        padding:12px 28px;border-radius:10px;border:none;cursor:pointer;
        font-size:14px;font-weight:700;letter-spacing:0.04em;
        transition:opacity 0.2s,transform 0.2s,box-shadow 0.2s;
        font-family:inherit;
      }
      .nx-btn-primary {
        background:var(--nx-primary,#00f5ff);color:#000;
        box-shadow:0 0 20px rgba(0,245,255,0.3);
      }
      .nx-btn-secondary {
        background:transparent;color:var(--nx-primary,#00f5ff);
        border:1.5px solid var(--nx-primary,#00f5ff);
      }
      .nx-btn-danger {
        background:var(--nx-secondary,#ff006e);color:#fff;
        box-shadow:0 0 20px rgba(255,0,110,0.3);
      }
      .nx-btn:hover:not(:disabled) { opacity:0.88;transform:translateY(-2px); }
      .nx-btn:active { transform:scale(0.97); }
      .nx-btn:disabled { opacity:0.4;cursor:not-allowed; }
      .nx-btn.nx-loading { pointer-events:none; }
      .nx-btn.nx-loading::after {
        content:'';display:block;width:14px;height:14px;border-radius:50%;
        border:2px solid transparent;border-top-color:currentColor;
        animation:nx-spin 0.6s linear infinite;
      }
      @keyframes nx-spin { to { transform:rotate(360deg); } }
      .nx-range {
        -webkit-appearance:none;width:100%;height:4px;border-radius:2px;
        background:rgba(255,255,255,0.1);outline:none;cursor:pointer;
      }
      .nx-range::-webkit-slider-thumb {
        -webkit-appearance:none;width:18px;height:18px;border-radius:50%;
        background:var(--nx-primary,#00f5ff);box-shadow:0 0 8px var(--nx-primary,#00f5ff);
        cursor:pointer;transition:transform 0.2s;
      }
      .nx-range::-webkit-slider-thumb:hover { transform:scale(1.2); }
      .nx-toggle {
        display:inline-flex;align-items:center;gap:10px;cursor:pointer;
        user-select:none;
      }
      .nx-toggle-track {
        width:44px;height:24px;border-radius:12px;
        background:rgba(255,255,255,0.15);position:relative;
        transition:background 0.3s ease;
      }
      .nx-toggle-thumb {
        position:absolute;top:3px;left:3px;
        width:18px;height:18px;border-radius:50%;
        background:#fff;transition:left 0.3s cubic-bezier(0.34,1.56,0.64,1),background 0.3s;
      }
      .nx-toggle input:checked + .nx-toggle-track { background:var(--nx-primary,#00f5ff); }
      .nx-toggle input:checked + .nx-toggle-track .nx-toggle-thumb { left:23px;background:#000; }
      .nx-toggle input { display:none; }
      .nx-checkbox-custom {
        display:inline-flex;align-items:center;gap:8px;cursor:pointer;user-select:none;
      }
      .nx-checkbox-box {
        width:18px;height:18px;border-radius:4px;
        border:1.5px solid rgba(255,255,255,0.3);
        display:flex;align-items:center;justify-content:center;
        transition:border-color 0.2s,background 0.2s;
        flex-shrink:0;
      }
      .nx-checkbox-custom input:checked ~ .nx-checkbox-box {
        background:var(--nx-primary,#00f5ff);border-color:var(--nx-primary,#00f5ff);
      }
      .nx-checkbox-custom input:checked ~ .nx-checkbox-box::after {
        content:'✓';font-size:11px;color:#000;font-weight:700;
      }
      .nx-checkbox-custom input { display:none; }
      .nx-select {
        appearance:none;
        background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2300f5ff' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
        background-repeat:no-repeat;background-position:right 14px center;padding-right:36px;
      }
      .nx-progress-ring { display:block; }
      .nx-progress-ring-bg { fill:none;stroke:rgba(255,255,255,0.08); }
      .nx-progress-ring-fill {
        fill:none;stroke:var(--nx-primary,#00f5ff);stroke-linecap:round;
        transition:stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1);
      }
    `;
    document.head.appendChild(s);
  }

  _registerBuiltins() {
    this.addValidator('required', v => !!v.trim(), 'This field is required');
    this.addValidator('email', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Enter a valid email address');
    this.addValidator('minLength', (v, p) => v.length >= p, p => `At least ${p} characters required`);
    this.addValidator('maxLength', (v, p) => v.length <= p, p => `Maximum ${p} characters allowed`);
    this.addValidator('pattern', (v, p) => new RegExp(p).test(v), 'Invalid format');
    this.addValidator('number', v => !isNaN(parseFloat(v)) && isFinite(v), 'Must be a number');
    this.addValidator('url', v => { try { new URL(v); return true; } catch { return false; } }, 'Enter a valid URL');
    this.addValidator('tel', v => /^[+\d\s\-().]{7,20}$/.test(v), 'Enter a valid phone number');
    this.addValidator('min', (v, p) => parseFloat(v) >= p, p => `Minimum value is ${p}`);
    this.addValidator('max', (v, p) => parseFloat(v) <= p, p => `Maximum value is ${p}`);
  }

  addValidator(name, fn, message) {
    this.validators[name] = { fn, message };
    return this;
  }

  validate(input, rules) {
    const val = (input.value || '').trim();
    for (const [rule, param] of Object.entries(rules || {})) {
      if (!this.validators[rule]) continue;
      const { fn, message } = this.validators[rule];
      const valid = fn(val, param);
      if (!valid) {
        const msg = typeof message === 'function' ? message(param) : message;
        return { valid: false, message: msg };
      }
    }
    return { valid: true };
  }

  bindField(input, rules, options) {
    const opts = Object.assign({ inline: true, onValidate: null }, options || {});
    const field = input.closest('.nx-field') || input.parentElement;
    let msgEl = field.querySelector('.nx-error-msg');
    if (!msgEl && opts.inline) {
      msgEl = document.createElement('div');
      msgEl.className = 'nx-error-msg';
      field.appendChild(msgEl);
    }
    const check = () => {
      const result = this.validate(input, rules);
      input.classList.toggle('nx-valid', result.valid);
      input.classList.toggle('nx-invalid', !result.valid);
      if (msgEl) {
        msgEl.textContent = result.valid ? '' : result.message;
        msgEl.classList.toggle('nx-visible', !result.valid);
      }
      if (opts.onValidate) opts.onValidate(result);
      return result.valid;
    };
    input.addEventListener('blur', check);
    input.addEventListener('input', NandanXUtils.debounce(check, 400));
    return check;
  }

  bindForm(form, options) {
    const opts = Object.assign({ onSubmit: null, onError: null }, options || {});
    const formEl = typeof form === 'string' ? document.querySelector(form) : form;
    if (!formEl) return this;
    const fields = new Map();
    formEl.querySelectorAll('[data-nx-rules]').forEach(input => {
      let rules;
      try { rules = JSON.parse(input.dataset.nxRules); } catch { rules = {}; }
      const check = this.bindField(input, rules);
      fields.set(input, check);
    });
    formEl.addEventListener('submit', e => {
      e.preventDefault();
      let allValid = true;
      fields.forEach((check) => { if (!check()) allValid = false; });
      if (allValid && opts.onSubmit) opts.onSubmit(new FormData(formEl));
      if (!allValid && opts.onError) opts.onError();
    });
    this.forms.set(formEl, fields);
    return this;
  }

  floatLabel(input) {
    const field = input.closest('.nx-field') || input.parentElement;
    field.classList.add('nx-float-label');
    input.placeholder = ' ';
    return this;
  }

  toggle(container, options) {
    const opts = Object.assign({ label: '', checked: false, onChange: null }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const id = NandanXUtils.uid();
    el.innerHTML = `
      <label class="nx-toggle">
        <input type="checkbox" id="${id}" ${opts.checked ? 'checked' : ''}>
        <div class="nx-toggle-track"><div class="nx-toggle-thumb"></div></div>
        ${opts.label ? `<span>${opts.label}</span>` : ''}
      </label>
    `;
    const input = el.querySelector('input');
    if (opts.onChange) input.addEventListener('change', () => opts.onChange(input.checked));
    return { get: () => input.checked, set: v => { input.checked = v; } };
  }

  checkbox(container, options) {
    const opts = Object.assign({ label: '', checked: false, onChange: null }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.innerHTML = `
      <label class="nx-checkbox-custom">
        <input type="checkbox" ${opts.checked ? 'checked' : ''}>
        <div class="nx-checkbox-box"></div>
        ${opts.label ? `<span>${opts.label}</span>` : ''}
      </label>
    `;
    const input = el.querySelector('input');
    if (opts.onChange) input.addEventListener('change', () => opts.onChange(input.checked));
    return { get: () => input.checked, set: v => { input.checked = v; } };
  }

  progressRing(container, options) {
    const opts = Object.assign({ size: 80, strokeWidth: 6, value: 0, color: '#00f5ff', animate: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const r = (opts.size - opts.strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    el.innerHTML = `
      <svg class="nx-progress-ring" width="${opts.size}" height="${opts.size}" style="--nx-primary:${opts.color}">
        <circle class="nx-progress-ring-bg" cx="${opts.size/2}" cy="${opts.size/2}" r="${r}" stroke-width="${opts.strokeWidth}"/>
        <circle class="nx-progress-ring-fill" cx="${opts.size/2}" cy="${opts.size/2}" r="${r}" stroke-width="${opts.strokeWidth}"
          stroke-dasharray="${circ}" stroke-dashoffset="${circ}" transform="rotate(-90 ${opts.size/2} ${opts.size/2})"/>
      </svg>
    `;
    const fill = el.querySelector('.nx-progress-ring-fill');
    const setValue = v => {
      const offset = circ - (v / 100) * circ;
      fill.style.strokeDashoffset = offset;
    };
    if (opts.animate) {
      const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        setValue(opts.value);
      }, { threshold: 0.3 });
      obs.observe(el);
    } else {
      setValue(opts.value);
    }
    return { setValue };
  }

  button(container, options) {
    const opts = Object.assign({ label: 'Button', type: 'primary', loading: false, disabled: false, onClick: null }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const btn = document.createElement('button');
    btn.className = `nx-btn nx-btn-${opts.type}`;
    btn.textContent = opts.label;
    if (opts.disabled) btn.disabled = true;
    if (opts.loading) btn.classList.add('nx-loading');
    if (opts.onClick) btn.addEventListener('click', opts.onClick);
    el.appendChild(btn);
    return {
      setLoading: v => btn.classList.toggle('nx-loading', v),
      setDisabled: v => { btn.disabled = v; },
      setText: v => { btn.textContent = v; },
    };
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-form]').forEach(el => {
        if (el.dataset.nxFormDone) return;
        el.dataset.nxFormDone = '1';
        this.bindForm(el);
      });
      NandanXUtils.qsa('.nx-float-label .nx-input').forEach(el => {
        el.placeholder = ' ';
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var formEngine = new FormEngine();
if (typeof window !== 'undefined') window.NandanXForm = formEngine;
class CanvasEngine {
  constructor() {
    this.initialized = false;
    this._charts = new Map();
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-canvas-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-canvas-styles';
    s.textContent = `
      .nx-chart-wrap { position:relative;width:100%;height:100%; }
      .nx-chart-canvas { display:block;width:100%;height:100%; }
      .nx-chart-tooltip {
        position:absolute;pointer-events:none;z-index:1000;
        background:rgba(15,15,26,0.95);border:1px solid rgba(0,245,255,0.25);
        border-radius:8px;padding:8px 12px;font-size:12px;color:#e2e8f0;
        box-shadow:0 4px 20px rgba(0,0,0,0.4);opacity:0;
        transition:opacity 0.15s ease;white-space:nowrap;
      }
    `;
    document.head.appendChild(s);
  }

  _createChart(container, width, height) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.innerHTML = '<div class="nx-chart-wrap"></div>';
    const wrap = el.querySelector('.nx-chart-wrap');
    wrap.style.width = width ? width + 'px' : '100%';
    wrap.style.height = height ? height + 'px' : '100%';
    const canvas = document.createElement('canvas');
    canvas.className = 'nx-chart-canvas';
    const dpr = window.devicePixelRatio || 1;
    const W = wrap.offsetWidth || parseInt(width) || 400;
    const H = wrap.offsetHeight || parseInt(height) || 240;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    wrap.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return this;
    ctx.scale(dpr, dpr);
    const tip = document.createElement('div');
    tip.className = 'nx-chart-tooltip';
    wrap.appendChild(tip);
    return { canvas, ctx, wrap, tip, W, H, dpr };
  }

  lineChart(container, data, options) {
    const opts = Object.assign({
      colors: ['#00f5ff', '#ff006e', '#7c3aed', '#00ff88'],
      lineWidth: 2.5, fill: true, fillOpacity: 0.12,
      animate: true, duration: 1200, grid: true,
      padding: { top: 30, right: 20, bottom: 40, left: 45 },
      pointRadius: 4,
    }, options || {});
    const chart = this._createChart(container, opts.width, opts.height);
    if (!chart) return this;
    const { ctx, W, H, tip } = chart;
    const pad = opts.padding;
    const iW = W - pad.left - pad.right;
    const iH = H - pad.top - pad.bottom;
    // Normalize data: support array, { values, labels }, or { data, labels }
    const rawData = (data && !Array.isArray(data)) ? (data.values || data.data || []) : data;
    if (data && !Array.isArray(data) && data.labels) opts.labels = opts.labels || data.labels;
    const normalized = rawData || [];
    const datasets = Array.isArray(normalized[0]) ? normalized.map((d, i) => ({ values: d, color: opts.colors[i % opts.colors.length] })) : [{ values: normalized, color: opts.colors[0] }];
    const allVals = datasets.flatMap(d => d.values);
    const minV = opts.min !== undefined ? opts.min : Math.min(...allVals) * 0.9;
    const maxV = opts.max !== undefined ? opts.max : Math.max(...allVals) * 1.1;
    const labels = opts.labels || datasets[0].values.map((_, i) => i);
    const xStep = iW / (labels.length - 1 || 1);
    const toX = i => pad.left + i * xStep;
    const toY = v => pad.top + iH - ((v - minV) / (maxV - minV)) * iH;
    const draw = (progress) => {
      ctx.clearRect(0, 0, W, H);
      if (opts.grid) {
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
          const y = pad.top + (iH / 4) * i;
          ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + iW, y); ctx.stroke();
          const val = maxV - ((maxV - minV) / 4) * i;
          ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '10px sans-serif';
          ctx.textAlign = 'right'; ctx.fillText(val.toFixed(0), pad.left - 6, y + 4);
        }
        labels.forEach((l, i) => {
          ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(String(l), toX(i), H - pad.bottom + 16);
        });
      }
      datasets.forEach(({ values, color }) => {
        const count = Math.ceil(values.length * progress);
        if (count < 2) return;
        ctx.strokeStyle = color; ctx.lineWidth = opts.lineWidth;
        ctx.shadowBlur = 8; ctx.shadowColor = color;
        ctx.beginPath();
        values.slice(0, count).forEach((v, i) => {
          i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v));
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
        if (opts.fill) {
          const c2 = NandanXUtils.hexToRgb(color);
          const fillColor = c2 ? `rgba(${c2.r},${c2.g},${c2.b},${opts.fillOpacity})` : color + '1e';
          ctx.lineTo(toX(count - 1), pad.top + iH);
          ctx.lineTo(toX(0), pad.top + iH);
          ctx.closePath();
          ctx.fillStyle = fillColor; ctx.fill();
          ctx.beginPath();
          values.slice(0, count).forEach((v, i) => {
            i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v));
          });
        }
        if (opts.pointRadius > 0) {
          values.slice(0, count).forEach((v, i) => {
            ctx.beginPath();
            ctx.arc(toX(i), toY(v), opts.pointRadius, 0, Math.PI * 2);
            ctx.fillStyle = color; ctx.fill();
          });
        }
      });
    };
    if (opts.animate) NandanXUtils.animate(opts.duration, p => draw(NandanXUtils.easeOutQuart(p)));
    else draw(1);
    this._charts.set(chart.canvas, { type: 'line', draw, datasets, toX, toY, labels, chart, tip });
    return this;
  }

  barChart(container, data, options) {
    const opts = Object.assign({
      colors: ['#00f5ff', '#ff006e', '#7c3aed', '#00ff88'],
      barRadius: 4, gap: 0.25, animate: true, duration: 1000,
      padding: { top: 30, right: 20, bottom: 40, left: 45 },
      horizontal: false,
    }, options || {});
    const chart = this._createChart(container, opts.width, opts.height);
    if (!chart) return this;
    const { ctx, W, H } = chart;
    const pad = opts.padding;
    const iW = W - pad.left - pad.right;
    const iH = H - pad.top - pad.bottom;
    const values = Array.isArray(data) ? data : (data.values || data.data || []);
    if (!Array.isArray(data) && data.labels) opts.labels = opts.labels || data.labels;
    const maxV = values.length ? Math.max(...values) * 1.1 : 1;
    const labels = (Array.isArray(data) ? null : data.labels) || opts.labels || values.map((_, i) => i);
    const colors = data.colors || values.map((_, i) => opts.colors[i % opts.colors.length]);
    const barW = (iW / values.length) * (1 - opts.gap);
    const barGap = (iW / values.length) * opts.gap;
    const toH = v => (v / maxV) * iH;
    const draw = (progress) => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + (iH / 4) * i;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + iW, y); ctx.stroke();
        const val = maxV - (maxV / 4) * i;
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(0), pad.left - 6, y + 4);
      }
      values.forEach((v, i) => {
        const bH = toH(v) * progress;
        const x = pad.left + i * (barW + barGap) + barGap / 2;
        const y = pad.top + iH - bH;
        ctx.fillStyle = colors[i];
        ctx.shadowBlur = 10; ctx.shadowColor = colors[i];
        const r = opts.barRadius;
        ctx.beginPath();
        ctx.moveTo(x + r, y); ctx.lineTo(x + barW - r, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
        ctx.lineTo(x + barW, y + bH); ctx.lineTo(x, y + bH);
        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(String(labels[i]), x + barW / 2, H - pad.bottom + 16);
      });
    };
    if (opts.animate) NandanXUtils.animate(opts.duration, p => draw(NandanXUtils.easeOutQuart(p)));
    else draw(1);
    return this;
  }

  donutChart(container, data, options) {
    const opts = Object.assign({
      colors: ['#00f5ff', '#ff006e', '#7c3aed', '#00ff88', '#ffe600'],
      animate: true, duration: 1200, innerRadius: 0.6, gap: 0.02,
      showLegend: true,
    }, options || {});
    const chart = this._createChart(container, opts.width, opts.height);
    if (!chart) return this;
    const { ctx, W, H } = chart;
    const cx = W / 2, cy = H / 2 - (opts.showLegend ? 20 : 0);
    const outerR = Math.min(cx, cy) * 0.85;
    const innerR = outerR * opts.innerRadius;
    const values = data.values || data;
    const total = values.reduce((a, b) => a + b, 0);
    const labels = data.labels || values.map((_, i) => `Item ${i + 1}`);
    const colors = data.colors || values.map((_, i) => opts.colors[i % opts.colors.length]);
    const slices = values.map((v, i) => ({ value: v, label: labels[i], color: colors[i], angle: (v / total) * Math.PI * 2 }));
    const draw = (progress) => {
      ctx.clearRect(0, 0, W, H);
      let startAngle = -Math.PI / 2;
      slices.forEach(sl => {
        const endAngle = startAngle + sl.angle * progress;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle, endAngle);
        ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = sl.color;
        ctx.shadowBlur = 12; ctx.shadowColor = sl.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        startAngle = endAngle + opts.gap;
      });
      if (opts.showLegend && progress === 1) {
        const itemW = W / slices.length;
        slices.forEach((sl, i) => {
          const x = i * itemW + 8;
          const y = H - 24;
          ctx.fillStyle = sl.color;
          ctx.beginPath(); ctx.arc(x + 6, y + 4, 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left';
          ctx.fillText(`${sl.label} (${((sl.value/total)*100).toFixed(0)}%)`, x + 14, y + 8);
        });
      }
    };
    if (opts.animate) NandanXUtils.animate(opts.duration, p => draw(NandanXUtils.easeOutQuart(p)));
    else draw(1);
    return this;
  }

  areaChart(container, data, options) {
    return this.lineChart(container, data, Object.assign({ fill: true, fillOpacity: 0.2 }, options || {}));
  }

  sparkline(container, data, options) {
    const opts = Object.assign({ color: '#00f5ff', lineWidth: 2, height: 48, fill: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const dpr = window.devicePixelRatio || 1;
    const W = el.offsetWidth || 120;
    const H = opts.height;
    const canvas = document.createElement('canvas');
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px'; canvas.style.display = 'block';
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return this;
    ctx.scale(dpr, dpr);
    const minV = Math.min(...data), maxV = Math.max(...data);
    const toX = i => (i / (data.length - 1)) * W;
    const toY = v => H - ((v - minV) / (maxV - minV || 1)) * H * 0.85 - H * 0.05;
    ctx.strokeStyle = opts.color; ctx.lineWidth = opts.lineWidth;
    ctx.shadowBlur = 6; ctx.shadowColor = opts.color;
    ctx.beginPath();
    data.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.stroke(); ctx.shadowBlur = 0;
    if (opts.fill) {
      const c = NandanXUtils.hexToRgb(opts.color);
      ctx.lineTo(toX(data.length - 1), H); ctx.lineTo(0, H); ctx.closePath();
      ctx.fillStyle = c ? `rgba(${c.r},${c.g},${c.b},0.12)` : opts.color + '1e';
      ctx.fill();
    }
    return this;
  }

  gauge(container, value, options) {
    const opts = Object.assign({
      min: 0, max: 100, color: '#00f5ff', bgColor: 'rgba(255,255,255,0.08)',
      lineWidth: 16, animate: true, label: '', size: 180,
    }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.style.position = 'relative';
    const dpr = window.devicePixelRatio || 1;
    const S = opts.size;
    const canvas = document.createElement('canvas');
    canvas.width = S * dpr; canvas.height = S * dpr;
    canvas.style.width = S + 'px'; canvas.style.height = S + 'px';
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return this;
    ctx.scale(dpr, dpr);
    const cx = S / 2, cy = S / 2, r = S / 2 - opts.lineWidth;
    const startAngle = Math.PI * 0.75, endFull = Math.PI * 2.25;
    const pct = (value - opts.min) / (opts.max - opts.min);
    const draw = p => {
      ctx.clearRect(0, 0, S, S);
      ctx.beginPath(); ctx.arc(cx, cy, r, startAngle, endFull);
      ctx.strokeStyle = opts.bgColor; ctx.lineWidth = opts.lineWidth; ctx.lineCap = 'round'; ctx.stroke();
      const endAngle = startAngle + (endFull - startAngle) * p;
      ctx.beginPath(); ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.strokeStyle = opts.color; ctx.shadowBlur = 12; ctx.shadowColor = opts.color; ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#e2e8f0'; ctx.textAlign = 'center'; ctx.font = `bold ${S * 0.2}px sans-serif`;
      ctx.fillText(Math.round(value * p) + (opts.suffix || ''), cx, cy + 8);
      if (opts.label) {
        ctx.font = `${S * 0.08}px sans-serif`; ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText(opts.label, cx, cy + S * 0.18);
      }
    };
    if (opts.animate) NandanXUtils.animate(1200, p => draw(NandanXUtils.easeOutQuart(p)));
    else draw(1);
    return this;
  }
}

var canvasEngine = new CanvasEngine();
if (typeof window !== 'undefined') window.NandanXCanvas = canvasEngine;
class RouterEngine {
  constructor() {
    this.routes = new Map();
    this.middleware = [];
    this.current = null;
    this.history = [];
    this.initialized = false;
    this._outlet = null;
    this._404handler = null;
    this._transitioning = false;
    this._transition = 'fade';
  }

  init(options) {
    if (this.initialized) return this;
    const opts = Object.assign({ outlet: '#nx-outlet', transition: 'fade', base: '' }, options || {});
    this._outlet = typeof opts.outlet === 'string' ? document.querySelector(opts.outlet) : opts.outlet;
    this._transition = opts.transition;
    this._base = opts.base;
    this._injectStyles();
    window.addEventListener('popstate', () => this._handle(location.pathname));
    document.addEventListener('click', e => {
      const a = e.target.closest('[data-nx-route], a[href^="/"]');
      if (!a) return;
      const href = a.dataset.nxRoute || a.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('//')) {
        e.preventDefault();
        this.navigate(href);
      }
    });
    this.initialized = true;
    this._handle(location.pathname);
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-router-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-router-styles';
    s.textContent = `
      .nx-page { width:100%;min-height:100%; }
      .nx-page-enter { animation:nx-page-in 0.4s cubic-bezier(0.23,1,0.32,1) forwards; }
      .nx-page-exit  { animation:nx-page-out 0.3s ease forwards; }
      @keyframes nx-page-in  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
      @keyframes nx-page-out { from{opacity:1} to{opacity:0} }
      .nx-page-slide-enter { animation:nx-slide-in 0.4s cubic-bezier(0.23,1,0.32,1) forwards; }
      @keyframes nx-slide-in { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:none} }
      .nx-nav-link { transition:color 0.2s; cursor:pointer; }
      .nx-nav-link.nx-active { color:var(--nx-primary,#00f5ff); }
      .nx-breadcrumb { display:flex;align-items:center;gap:8px;font-size:13px;opacity:0.7; }
      .nx-breadcrumb-sep { opacity:0.4; }
    `;
    document.head.appendChild(s);
  }

  on(path, handler, options) {
    const opts = Object.assign({ title: null, meta: {} }, options || {});
    const pattern = this._pathToRegex(path);
    this.routes.set(path, { pattern, handler, path, opts });
    return this;
  }

  use(fn) {
    this.middleware.push(fn);
    return this;
  }

  notFound(handler) {
    this._404handler = handler;
    return this;
  }

  navigate(path, options) {
    const opts = Object.assign({ replace: false, data: {} }, options || {});
    const fullPath = (this._base + path).replace('//', '/');
    if (this._transitioning) return this;
    if (opts.replace) history.replaceState({ data: opts.data }, '', fullPath);
    else history.pushState({ data: opts.data }, '', fullPath);
    this._handle(fullPath, opts.data);
    return this;
  }

  back() { history.back(); return this; }
  forward() { history.forward(); return this; }

  async _handle(pathname, data) {
    const path = pathname.replace(this._base, '') || '/';
    let matched = null;
    let params = {};
    for (const [, route] of this.routes) {
      const m = path.match(route.pattern);
      if (m) {
        matched = route;
        params = m.groups || {};
        break;
      }
    }
    const ctx = { path, params, data: data || {}, query: Object.fromEntries(new URLSearchParams(location.search)) };
    for (const mw of this.middleware) {
      const cont = await mw(ctx);
      if (cont === false) return;
    }
    if (!matched) {
      if (this._404handler) this._404handler(ctx);
      return;
    }
    if (matched.opts.title) document.title = typeof matched.opts.title === 'function' ? matched.opts.title(ctx) : matched.opts.title;
    this._updateNavLinks(path);
    this.history.push(path);
    this.current = path;
    if (this._outlet) {
      await this._transitionOut();
      const content = await matched.handler(ctx);
      if (content !== undefined) this._outlet.innerHTML = content;
      this._transitionIn();
    } else {
      matched.handler(ctx);
    }
    NandanXUtils.emit(document, 'vx:navigate', ctx);
  }

  async _transitionOut() {
    if (!this._outlet || !this._outlet.children.length) return;
    return new Promise(resolve => {
      this._outlet.classList.add('nx-page-exit');
      setTimeout(() => { this._outlet.classList.remove('nx-page-exit'); resolve(); }, 300);
    });
  }

  _transitionIn() {
    if (!this._outlet) return;
    const cls = this._transition === 'slide' ? 'nx-page-slide-enter' : 'nx-page-enter';
    this._outlet.classList.add(cls);
    setTimeout(() => this._outlet.classList.remove(cls), 400);
  }

  _updateNavLinks(path) {
    NandanXUtils.qsa('[data-nx-route], a[href^="/"]').forEach(el => {
      const href = el.dataset.nxRoute || el.getAttribute('href');
      el.classList.toggle('nx-active', href === path || (href !== '/' && path.startsWith(href)));
    });
  }

  _pathToRegex(path) {
    const pattern = path
      .replace(/\//g, '\\/')
      .replace(/:([a-zA-Z_]+)/g, '(?<$1>[^/]+)')
      .replace(/\*/g, '.*');
    return new RegExp(`^${pattern}$`);
  }

  breadcrumb(container, paths) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const items = paths || this.history.slice(-3).map(p => ({ label: p.split('/').pop() || 'Home', path: p }));
    el.className = 'nx-breadcrumb';
    el.innerHTML = items.map((item, i) => `
      <span ${i < items.length - 1 ? `data-nx-route="${item.path}" class="nx-nav-link"` : ''}>
        ${item.label || item}
      </span>
      ${i < items.length - 1 ? '<span class="nx-breadcrumb-sep">/</span>' : ''}
    `).join('');
    return this;
  }

  getCurrentPath() { return this.current; }
  getHistory() { return [...this.history]; }
}

var routerEngine = new RouterEngine();
if (typeof window !== 'undefined') window.NandanXRouter = routerEngine;
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
    NandanXUtils.parseSelector(target).forEach(el => {
      el.addEventListener('click', () => this[sound] ? this[sound]() : this.click());
    });
    return this;
  }

  attachToHovers(target, sound) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.addEventListener('mouseenter', () => this[sound] ? this[sound]() : this.beep());
    });
    return this;
  }

  attachToInputs(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.addEventListener('keydown', () => this.click());
    });
    return this;
  }

  setVolume(v) {
    if (this._masterGain) this._masterGain.gain.value = NandanXUtils.clamp(v, 0, 1);
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
if (typeof window !== 'undefined') window.NandanXAudio = audioEngine;
class DragEngine {
  constructor() {
    this.initialized = false;
    this._draggables = new Map();
    this._dropzones = new Map();
    this._sortables = new Map();
    this._currentDrag = null;
    this._ghost = null;
    this._offset = { x: 0, y: 0 };
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-drag-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-drag-styles';
    s.textContent = `
      .nx-draggable { cursor:grab;user-select:none;touch-action:none; }
      .nx-draggable:active { cursor:grabbing; }
      .nx-draggable.nx-dragging { opacity:0.4; }
      .nx-drag-ghost {
        position:fixed;pointer-events:none;z-index:999999;
        opacity:0.85;box-shadow:0 8px 30px rgba(0,0,0,0.4);
        transform:rotate(2deg) scale(1.04);
        transition:transform 0.15s ease;
      }
      .nx-dropzone {
        transition:background 0.2s ease,border-color 0.2s ease;
        border:2px dashed transparent;border-radius:10px;
      }
      .nx-dropzone.nx-drag-over {
        background:rgba(0,245,255,0.06);
        border-color:rgba(0,245,255,0.4);
        box-shadow:inset 0 0 20px rgba(0,245,255,0.08);
      }
      .nx-sortable-item { cursor:grab;user-select:none;transition:transform 0.2s ease; }
      .nx-sortable-item.nx-sort-dragging { opacity:0.3;cursor:grabbing; }
      .nx-sort-placeholder {
        border:2px dashed rgba(0,245,255,0.35);border-radius:8px;
        background:rgba(0,245,255,0.04);transition:all 0.15s ease;
      }
      .nx-resize-handle {
        position:absolute;width:10px;height:10px;background:var(--nx-primary,#00f5ff);
        border-radius:50%;opacity:0;transition:opacity 0.2s;cursor:se-resize;z-index:10;
      }
      .nx-resizable:hover .nx-resize-handle { opacity:0.8; }
      .nx-resizable { position:relative;overflow:hidden; }
    `;
    document.head.appendChild(s);
  }

  draggable(target, options) {
    if (!this.initialized) this.init();
    const opts = Object.assign({ axis: 'both', bounds: null, snap: false, snapDistance: 20, onStart: null, onMove: null, onEnd: null }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-draggable');
      let startX, startY, elX, elY, dragging = false;
      let origPos = window.getComputedStyle(el).position;
      const onStart = e => {
        e.preventDefault();
        const pt = e.touches ? e.touches[0] : e;
        startX = pt.clientX; startY = pt.clientY;
        const r = el.getBoundingClientRect();
        elX = r.left; elY = r.top;
        dragging = true;
        el.classList.add('nx-dragging');
        if (el.style.position === '' || origPos === 'static') {
          el.style.position = 'relative';
          el.style.left = '0px'; el.style.top = '0px';
        }
        if (opts.onStart) opts.onStart({ el, x: elX, y: elY });
      };
      const onMove = e => {
        if (!dragging) return;
        const pt = e.touches ? e.touches[0] : e;
        let dx = pt.clientX - startX;
        let dy = pt.clientY - startY;
        if (opts.axis === 'x') dy = 0;
        if (opts.axis === 'y') dx = 0;
        const newLeft = parseFloat(el.style.left || 0) + dx;
        const newTop = parseFloat(el.style.top || 0) + dy;
        el.style.left = newLeft + 'px';
        el.style.top = newTop + 'px';
        startX = pt.clientX; startY = pt.clientY;
        this._checkDropzones(el, pt.clientX, pt.clientY);
        if (opts.onMove) opts.onMove({ el, x: newLeft, y: newTop, dx, dy });
      };
      const onEnd = e => {
        if (!dragging) return;
        dragging = false;
        el.classList.remove('nx-dragging');
        this._dropzones.forEach((dz) => dz.el.classList.remove('nx-drag-over'));
        this._tryDrop(el, e);
        if (opts.onEnd) opts.onEnd({ el, x: parseFloat(el.style.left), y: parseFloat(el.style.top) });
      };
      el.addEventListener('mousedown', onStart);
      el.addEventListener('touchstart', onStart, { passive: false });
      document.addEventListener('mousemove', onMove);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchend', onEnd);
      this._draggables.set(el, { opts });
    });
    return this;
  }

  dropzone(target, options) {
    if (!this.initialized) this.init();
    const opts = Object.assign({ accept: null, onDrop: null, onEnter: null, onLeave: null }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-dropzone');
      this._dropzones.set(el, { el, opts });
    });
    return this;
  }

  _checkDropzones(dragEl, x, y) {
    this._dropzones.forEach(({ el, opts }) => {
      const r = el.getBoundingClientRect();
      const over = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      el.classList.toggle('nx-drag-over', over);
    });
  }

  _tryDrop(dragEl, e) {
    const pt = e.changedTouches ? e.changedTouches[0] : e;
    this._dropzones.forEach(({ el, opts }) => {
      const r = el.getBoundingClientRect();
      if (pt.clientX >= r.left && pt.clientX <= r.right && pt.clientY >= r.top && pt.clientY <= r.bottom) {
        if (opts.onDrop) opts.onDrop({ dragged: dragEl, zone: el });
      }
    });
  }

  sortable(container, options) {
    if (!this.initialized) this.init();
    const opts = Object.assign({ handle: null, onSort: null, animation: 150, ghostClass: 'nx-sort-dragging' }, options || {});
    NandanXUtils.parseSelector(container).forEach(el => {
      el.querySelectorAll(':scope > *').forEach(child => child.classList.add('nx-sortable-item'));
      let dragging = null, placeholder = null;
      const getItems = () => [...el.querySelectorAll('.nx-sortable-item')];
      el.addEventListener('mousedown', e => {
        const item = e.target.closest('.nx-sortable-item');
        if (!item) return;
        if (opts.handle && !e.target.closest(opts.handle)) return;
        e.preventDefault();
        dragging = item;
        dragging.classList.add(opts.ghostClass);
        placeholder = document.createElement('div');
        placeholder.className = 'nx-sort-placeholder';
        placeholder.style.width = item.offsetWidth + 'px';
        placeholder.style.height = item.offsetHeight + 'px';
        item.after(placeholder);
      });
      document.addEventListener('mousemove', e => {
        if (!dragging) return;
        const items = getItems().filter(i => i !== dragging && i !== placeholder);
        const { clientY } = e;
        for (const item of items) {
          const r = item.getBoundingClientRect();
          const mid = r.top + r.height / 2;
          if (clientY < mid) { item.before(placeholder); break; }
          else if (item === items[items.length - 1]) { el.appendChild(placeholder); }
        }
      });
      document.addEventListener('mouseup', () => {
        if (!dragging) return;
        placeholder.replaceWith(dragging);
        dragging.classList.remove(opts.ghostClass);
        if (opts.onSort) opts.onSort({ container: el, order: getItems().map(i => i.dataset.nxId || i.textContent) });
        dragging = null; placeholder = null;
      });
      this._sortables.set(el, { opts });
    });
    return this;
  }

  resizable(target, options) {
    if (!this.initialized) this.init();
    const opts = Object.assign({ minWidth: 80, minHeight: 40, onResize: null }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-resizable');
      const handle = document.createElement('div');
      handle.className = 'nx-resize-handle';
      handle.style.cssText = 'bottom:-5px;right:-5px;';
      el.appendChild(handle);
      let resizing = false, startX, startY, startW, startH;
      handle.addEventListener('mousedown', e => {
        e.preventDefault(); resizing = true;
        startX = e.clientX; startY = e.clientY;
        startW = el.offsetWidth; startH = el.offsetHeight;
      });
      document.addEventListener('mousemove', e => {
        if (!resizing) return;
        const w = Math.max(opts.minWidth, startW + e.clientX - startX);
        const h = Math.max(opts.minHeight, startH + e.clientY - startY);
        el.style.width = w + 'px'; el.style.height = h + 'px';
        if (opts.onResize) opts.onResize({ el, width: w, height: h });
      });
      document.addEventListener('mouseup', () => { resizing = false; });
    });
    return this;
  }

  freeCanvas(container, options) {
    const opts = Object.assign({ color: '#00f5ff', lineWidth: 3, background: 'transparent' }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.style.position = 'relative';
    const canvas = document.createElement('canvas');
    canvas.width = el.offsetWidth || 400; canvas.height = el.offsetHeight || 300;
    canvas.style.cssText = 'display:block;cursor:crosshair;touch-action:none;';
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (opts.background !== 'transparent') { ctx.fillStyle = opts.background; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    let drawing = false, lastX = 0, lastY = 0;
    const getPos = e => {
      const r = canvas.getBoundingClientRect();
      const pt = e.touches ? e.touches[0] : e;
      return { x: pt.clientX - r.left, y: pt.clientY - r.top };
    };
    canvas.addEventListener('mousedown', e => { drawing = true; const p = getPos(e); lastX = p.x; lastY = p.y; });
    canvas.addEventListener('touchstart', e => { e.preventDefault(); drawing = true; const p = getPos(e); lastX = p.x; lastY = p.y; }, { passive: false });
    canvas.addEventListener('mousemove', e => {
      if (!drawing) return;
      const p = getPos(e);
      ctx.strokeStyle = opts.color; ctx.lineWidth = opts.lineWidth; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(p.x, p.y); ctx.stroke();
      lastX = p.x; lastY = p.y;
    });
    canvas.addEventListener('touchmove', e => { e.preventDefault(); canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY })); }, { passive: false });
    document.addEventListener('mouseup', () => { drawing = false; });
    document.addEventListener('touchend', () => { drawing = false; });
    return {
      clear: () => ctx.clearRect(0, 0, canvas.width, canvas.height),
      setColor: c => { opts.color = c; },
      setSize: s => { opts.lineWidth = s; },
      toDataURL: () => canvas.toDataURL(),
    };
  }
}

var dragEngine = new DragEngine();
if (typeof window !== 'undefined') window.NandanXDrag = dragEngine;
class MediaEngine {
  constructor() {
    this.initialized = false;
    this._lazyObserver = null;
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._setupLazy();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-media-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-media-styles';
    s.textContent = `
      .nx-img-wrap { position:relative;overflow:hidden;display:block; }
      .nx-img-wrap img { width:100%;height:100%;object-fit:cover;transition:transform 0.5s cubic-bezier(0.23,1,0.32,1); }
      .nx-img-wrap:hover img { transform:scale(1.06); }
      .nx-img-blur-load { filter:blur(20px);transition:filter 0.8s ease; }
      .nx-img-blur-load.nx-loaded { filter:blur(0); }
      .nx-img-overlay {
        position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.7));
        opacity:0;transition:opacity 0.3s ease;
      }
      .nx-img-wrap:hover .nx-img-overlay { opacity:1; }
      .nx-img-caption {
        position:absolute;bottom:0;left:0;right:0;padding:16px;
        color:#fff;font-size:14px;font-weight:600;
        transform:translateY(100%);transition:transform 0.3s cubic-bezier(0.23,1,0.32,1);
      }
      .nx-img-wrap:hover .nx-img-caption { transform:none; }
      .nx-parallax-img { overflow:hidden;display:block; }
      .nx-parallax-img img { will-change:transform;transform:scale(1.15); }
      .nx-img-zoom-overlay {
        position:fixed;inset:0;z-index:500000;
        background:rgba(0,0,0,0.9);backdrop-filter:blur(8px);
        display:flex;align-items:center;justify-content:center;
        opacity:0;pointer-events:none;transition:opacity 0.3s ease;
      }
      .nx-img-zoom-overlay.nx-active { opacity:1;pointer-events:all; }
      .nx-img-zoom-overlay img {
        max-width:90vw;max-height:90vh;object-fit:contain;
        border-radius:8px;box-shadow:0 0 80px rgba(0,0,0,0.8);
        transform:scale(0.95);transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
      }
      .nx-img-zoom-overlay.nx-active img { transform:scale(1); }
      .nx-img-close {
        position:absolute;top:20px;right:20px;width:36px;height:36px;
        background:rgba(255,255,255,0.1);border:none;border-radius:50%;
        color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;
        transition:background 0.2s;
      }
      .nx-img-close:hover { background:rgba(255,0,110,0.4); }
      .nx-lazy { opacity:0;transition:opacity 0.6s ease; }
      .nx-lazy.nx-loaded { opacity:1; }
      .nx-skeleton {
        background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.04) 75%);
        background-size:200% 100%;animation:nx-skeleton 1.5s infinite;border-radius:4px;
      }
      @keyframes nx-skeleton { to { background-position:-200% 0; } }
      .nx-img-tilt { perspective:1000px; }
      .nx-img-tilt img { transition:transform 0.1s ease;border-radius:inherit; }
      .nx-video-wrap { position:relative;overflow:hidden; }
      .nx-video-wrap video { width:100%;height:100%;object-fit:cover;display:block; }
      .nx-video-overlay {
        position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,0.3);transition:opacity 0.3s;cursor:pointer;
      }
      .nx-video-overlay.nx-hidden { opacity:0;pointer-events:none; }
      .nx-play-btn {
        width:60px;height:60px;background:rgba(255,255,255,0.2);backdrop-filter:blur(8px);
        border-radius:50%;display:flex;align-items:center;justify-content:center;
        font-size:22px;color:#fff;transition:transform 0.2s,background 0.2s;
      }
      .nx-play-btn:hover { transform:scale(1.1);background:var(--nx-primary,#00f5ff);color:#000; }
    `;
    document.head.appendChild(s);
  }

  _setupLazy() {
    this._lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const src = el.dataset.nxSrc || el.dataset.src;
        if (src) {
          const img = new Image();
          img.onload = () => {
            el.src = src;
            el.classList.add('nx-loaded');
          };
          img.src = src;
        }
        this._lazyObserver.unobserve(el);
      });
    }, { rootMargin: '50px' });
  }

  lazy(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-lazy');
      this._lazyObserver.observe(el);
    });
    return this;
  }

  hover(target, options) {
    const opts = Object.assign({ zoom: true, overlay: true, caption: '' }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      let img = el.tagName === 'IMG' ? el : el.querySelector('img');
      if (!img) return;
      let wrap = el.tagName === 'IMG' ? (() => {
        const w = document.createElement('div');
        w.className = 'nx-img-wrap';
        img.replaceWith(w); w.appendChild(img);
        return w;
      })() : el;
      wrap.classList.add('nx-img-wrap');
      if (opts.overlay) {
        const overlay = document.createElement('div');
        overlay.className = 'nx-img-overlay';
        wrap.appendChild(overlay);
      }
      if (opts.caption) {
        const cap = document.createElement('div');
        cap.className = 'nx-img-caption';
        cap.textContent = opts.caption;
        wrap.appendChild(cap);
      }
    });
    return this;
  }

  zoom(target) {
    let overlay = document.querySelector('.nx-img-zoom-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'nx-img-zoom-overlay';
      overlay.innerHTML = `<button class="nx-img-close">✕</button><img>`;
      document.body.appendChild(overlay);
      overlay.querySelector('.nx-img-close').addEventListener('click', () => overlay.classList.remove('nx-active'));
      overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('nx-active'); });
    }
    const zoomImg = overlay.querySelector('img');
    NandanXUtils.parseSelector(target).forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        zoomImg.src = img.src;
        overlay.classList.add('nx-active');
      });
    });
    return this;
  }

  parallaxImage(target, speed) {
    const spd = speed || 0.3;
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-parallax-img');
      const img = el.querySelector('img') || (el.tagName === 'IMG' ? el : null);
      if (!img) return;
      const update = () => {
        const r = el.getBoundingClientRect();
        const progress = (window.innerHeight / 2 - r.top - r.height / 2) / window.innerHeight;
        img.style.transform = `scale(1.15) translateY(${progress * spd * 100}%)`;
      };
      window.addEventListener('scroll', update, { passive: true });
      update();
    });
    return this;
  }

  skeleton(target, options) {
    const opts = Object.assign({ width: '100%', height: '20px', count: 1 }, options || {});
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return this;
    el.innerHTML = Array.from({ length: opts.count }, (_, i) => `
      <div class="nx-skeleton" style="width:${Array.isArray(opts.width) ? opts.width[i] : opts.width};height:${opts.height};margin-bottom:10px;"></div>
    `).join('');
    return this;
  }

  tilt(target, options) {
    const opts = Object.assign({ maxAngle: 12, perspective: 800, scale: 1.04 }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-img-tilt');
      const img = el.querySelector('img') || el;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width - 0.5;
        const cy = (e.clientY - r.top) / r.height - 0.5;
        img.style.transform = `perspective(${opts.perspective}px) rotateY(${cx * opts.maxAngle * 2}deg) rotateX(${-cy * opts.maxAngle * 2}deg) scale(${opts.scale})`;
      });
      el.addEventListener('mouseleave', () => { img.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)'; });
    });
    return this;
  }

  video(target, options) {
    const opts = Object.assign({ autoplay: false, loop: false, muted: true, controls: false }, options || {});
    NandanXUtils.parseSelector(target).forEach(vid => {
      if (vid.tagName !== 'VIDEO') return;
      const wrap = document.createElement('div');
      wrap.className = 'nx-video-wrap';
      vid.replaceWith(wrap); wrap.appendChild(vid);
      if (!opts.autoplay) {
        const overlay = document.createElement('div');
        overlay.className = 'nx-video-overlay';
        overlay.innerHTML = '<div class="nx-play-btn">▶</div>';
        wrap.appendChild(overlay);
        overlay.addEventListener('click', () => {
          vid.play();
          overlay.classList.add('nx-hidden');
        });
        vid.addEventListener('ended', () => overlay.classList.remove('nx-hidden'));
      }
      if (opts.loop) vid.loop = true;
      if (opts.muted) vid.muted = true;
    });
    return this;
  }

  blurLoad(target) {
    NandanXUtils.parseSelector(target).forEach(img => {
      if (img.dataset.nxSrc) {
        img.classList.add('nx-img-blur-load');
        const full = new Image();
        full.onload = () => { img.src = img.dataset.nxSrc; img.classList.add('nx-loaded'); };
        full.src = img.dataset.nxSrc;
      }
    });
    return this;
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('img[data-nx-src], img[data-src]').forEach(el => {
        if (el.dataset.nxLazyDone) return;
        el.dataset.nxLazyDone = '1';
        this.lazy(el);
      });
      NandanXUtils.qsa('[data-nx-zoom]').forEach(el => {
        if (el.dataset.nxZoomDone) return;
        el.dataset.nxZoomDone = '1';
        this.zoom(el);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var mediaEngine = new MediaEngine();
if (typeof window !== 'undefined') window.NandanXMedia = mediaEngine;
class ThemeEngine {
  constructor() {
    this.themes = new Map();
    this.current = null;
    this.initialized = false;
    this._transitionDuration = 400;
    this._storageKey = 'nx-theme';
  }

  init(options) {
    if (this.initialized) return this;
    const opts = Object.assign({ persist: true, auto: true, transition: true }, options || {});
    this._persist = opts.persist;
    this._injectStyles();
    this._registerDefaults();
    if (opts.auto) this._autoDetect();
    if (opts.persist) {
      const saved = localStorage.getItem(this._storageKey);
      if (saved && this.themes.has(saved)) this.set(saved);
    }
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-theme-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-theme-styles';
    s.textContent = `
      body { transition:background-color 0.4s ease,color 0.4s ease; }
      .nx-theme-toggle {
        display:inline-flex;align-items:center;justify-content:center;
        width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;
        background:rgba(255,255,255,0.08);font-size:18px;
        transition:background 0.2s,transform 0.3s;
      }
      .nx-theme-toggle:hover { background:rgba(255,255,255,0.15);transform:rotate(20deg); }
      .nx-color-picker { display:flex;gap:8px;flex-wrap:wrap; }
      .nx-color-swatch {
        width:24px;height:24px;border-radius:50%;cursor:pointer;border:2px solid transparent;
        transition:transform 0.15s,border-color 0.15s;
      }
      .nx-color-swatch:hover, .nx-color-swatch.nx-active { transform:scale(1.2);border-color:#fff; }
      .nx-theme-switcher { display:flex;gap:8px;flex-wrap:wrap; }
      .nx-theme-btn {
        padding:6px 14px;border-radius:20px;border:1.5px solid rgba(255,255,255,0.15);
        background:rgba(255,255,255,0.04);color:var(--nx-text,#e2e8f0);
        cursor:pointer;font-size:12px;font-weight:600;transition:all 0.2s;
        font-family:inherit;
      }
      .nx-theme-btn:hover { border-color:var(--nx-primary,#00f5ff); }
      .nx-theme-btn.nx-active { background:var(--nx-primary,#00f5ff);color:#000;border-color:transparent; }
    `;
    document.head.appendChild(s);
  }

  _registerDefaults() {
    this.define('dark', {
      '--nx-bg': '#0f0f1a',
      '--nx-bg-2': '#1a1a2e',
      '--nx-text': '#e2e8f0',
      '--nx-text-muted': 'rgba(226,232,240,0.5)',
      '--nx-primary': '#00f5ff',
      '--nx-secondary': '#ff006e',
      '--nx-accent': '#7c3aed',
      '--nx-border': 'rgba(255,255,255,0.08)',
      '--nx-surface': 'rgba(255,255,255,0.04)',
      'background': '#0f0f1a',
      'color': '#e2e8f0',
    });
    this.define('light', {
      '--nx-bg': '#f8fafc',
      '--nx-bg-2': '#f1f5f9',
      '--nx-text': '#0f172a',
      '--nx-text-muted': 'rgba(15,23,42,0.5)',
      '--nx-primary': '#0077ff',
      '--nx-secondary': '#e01068',
      '--nx-accent': '#5b21b6',
      '--nx-border': 'rgba(0,0,0,0.08)',
      '--nx-surface': 'rgba(0,0,0,0.03)',
      'background': '#f8fafc',
      'color': '#0f172a',
    });
    this.define('neon', {
      '--nx-bg': '#000010',
      '--nx-bg-2': '#05051a',
      '--nx-text': '#ffffff',
      '--nx-text-muted': 'rgba(255,255,255,0.5)',
      '--nx-primary': '#00ff88',
      '--nx-secondary': '#ff00ff',
      '--nx-accent': '#ffff00',
      '--nx-border': 'rgba(0,255,136,0.15)',
      '--nx-surface': 'rgba(0,255,136,0.04)',
      'background': '#000010',
      'color': '#fff',
    });
    this.define('ocean', {
      '--nx-bg': '#04101a',
      '--nx-bg-2': '#071e2e',
      '--nx-text': '#d0f0ff',
      '--nx-text-muted': 'rgba(208,240,255,0.5)',
      '--nx-primary': '#00b4d8',
      '--nx-secondary': '#0077b6',
      '--nx-accent': '#48cae4',
      '--nx-border': 'rgba(0,180,216,0.15)',
      '--nx-surface': 'rgba(0,180,216,0.05)',
      'background': '#04101a',
      'color': '#d0f0ff',
    });
    this.define('sunset', {
      '--nx-bg': '#120804',
      '--nx-bg-2': '#1e0d06',
      '--nx-text': '#ffeedd',
      '--nx-text-muted': 'rgba(255,238,221,0.5)',
      '--nx-primary': '#ff8c00',
      '--nx-secondary': '#ff4500',
      '--nx-accent': '#ffd700',
      '--nx-border': 'rgba(255,140,0,0.15)',
      '--nx-surface': 'rgba(255,140,0,0.05)',
      'background': '#120804',
      'color': '#ffeedd',
    });
    this.define('forest', {
      '--nx-bg': '#041408',
      '--nx-bg-2': '#081f0e',
      '--nx-text': '#d4edda',
      '--nx-text-muted': 'rgba(212,237,218,0.5)',
      '--nx-primary': '#2dce89',
      '--nx-secondary': '#52c41a',
      '--nx-accent': '#b7eb8f',
      '--nx-border': 'rgba(45,206,137,0.15)',
      '--nx-surface': 'rgba(45,206,137,0.04)',
      'background': '#041408',
      'color': '#d4edda',
    });
    this.define('midnight', {
      '--nx-bg': '#08080f',
      '--nx-bg-2': '#10101e',
      '--nx-text': '#c8c8e0',
      '--nx-text-muted': 'rgba(200,200,224,0.5)',
      '--nx-primary': '#7c3aed',
      '--nx-secondary': '#a855f7',
      '--nx-accent': '#c084fc',
      '--nx-border': 'rgba(124,58,237,0.2)',
      '--nx-surface': 'rgba(124,58,237,0.06)',
      'background': '#08080f',
      'color': '#c8c8e0',
    });
  }

  define(name, vars) {
    this.themes.set(name, vars);
    return this;
  }

  set(name, options) {
    const opts = Object.assign({ animate: true }, options || {});
    const theme = this.themes.get(name);
    if (!theme) return this;
    if (opts.animate) {
      document.documentElement.style.transition = `background-color ${this._transitionDuration}ms ease, color ${this._transitionDuration}ms ease`;
    }
    Object.entries(theme).forEach(([key, val]) => {
      if (key.startsWith('--')) document.documentElement.style.setProperty(key, val);
      else if (key === 'background') document.body.style.background = val;
      else if (key === 'color') document.body.style.color = val;
    });
    if (this._persist) localStorage.setItem(this._storageKey, name);
    const prev = this.current;
    this.current = name;
    document.documentElement.dataset.nxTheme = name;
    NandanXUtils.emit(document, 'vx:theme', { name, prev });
    return this;
  }

  toggle(a, b) {
    const themeA = a || 'dark';
    const themeB = b || 'light';
    return this.set(this.current === themeA ? themeB : themeA);
  }

  get(name) { return this.themes.get(name || this.current); }
  getAll() { return [...this.themes.keys()]; }

  createToggle(container, options) {
    const opts = Object.assign({ themes: ['dark', 'light'], icon: '🌓' }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const btn = document.createElement('button');
    btn.className = 'nx-theme-toggle';
    btn.textContent = opts.icon;
    btn.addEventListener('click', () => this.toggle(...opts.themes));
    el.appendChild(btn);
    return this;
  }

  createSwitcher(container, themes) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const list = themes || [...this.themes.keys()];
    const wrap = document.createElement('div');
    wrap.className = 'nx-theme-switcher';
    list.forEach(name => {
      const btn = document.createElement('button');
      btn.className = 'nx-theme-btn' + (this.current === name ? ' nx-active' : '');
      btn.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      btn.addEventListener('click', () => {
        this.set(name);
        wrap.querySelectorAll('.nx-theme-btn').forEach(b => b.classList.toggle('nx-active', b.textContent.toLowerCase() === name));
      });
      wrap.appendChild(btn);
    });
    el.appendChild(wrap);
    return this;
  }

  colorPicker(container, variable, options) {
    const opts = Object.assign({ colors: ['#00f5ff','#ff006e','#7c3aed','#00ff88','#ffe600','#ff8c00','#e01068','#00b4d8'], onChange: null }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const wrap = document.createElement('div');
    wrap.className = 'nx-color-picker';
    opts.colors.forEach(color => {
      const sw = document.createElement('div');
      sw.className = 'nx-color-swatch';
      sw.style.background = color;
      sw.addEventListener('click', () => {
        wrap.querySelectorAll('.nx-color-swatch').forEach(s => s.classList.remove('nx-active'));
        sw.classList.add('nx-active');
        if (variable) document.documentElement.style.setProperty(variable, color);
        if (opts.onChange) opts.onChange(color);
      });
      wrap.appendChild(sw);
    });
    el.appendChild(wrap);
    return this;
  }

  autoSystem() {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => this.set(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', apply);
    if (!localStorage.getItem(this._storageKey)) apply();
    return this;
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-theme-toggle]').forEach(el => {
        if (el.dataset.nxThemeDone) return;
        el.dataset.nxThemeDone = '1';
        el.addEventListener('click', () => this.toggle());
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var themeEngine = new ThemeEngine();
if (typeof window !== 'undefined') window.NandanXTheme = themeEngine;
class ComponentEngine {
  constructor() {
    this.initialized = false;
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-comp-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-comp-styles';
    s.textContent = `
      .nx-accordion { border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden; }
      .nx-accordion-item { border-bottom:1px solid rgba(255,255,255,0.06); }
      .nx-accordion-item:last-child { border-bottom:none; }
      .nx-accordion-header {
        width:100%;padding:16px 20px;background:transparent;border:none;
        color:var(--nx-text,#e2e8f0);font-size:15px;font-weight:600;
        text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;
        transition:background 0.2s;font-family:inherit;
      }
      .nx-accordion-header:hover { background:rgba(255,255,255,0.04); }
      .nx-accordion-header.nx-open { color:var(--nx-primary,#00f5ff); }
      .nx-accordion-icon { transition:transform 0.3s ease;font-size:12px;opacity:0.6; }
      .nx-accordion-header.nx-open .nx-accordion-icon { transform:rotate(180deg); }
      .nx-accordion-body {
        max-height:0;overflow:hidden;
        transition:max-height 0.4s cubic-bezier(0.23,1,0.32,1),padding 0.3s ease;
        padding:0 20px;color:rgba(226,232,240,0.7);font-size:14px;line-height:1.7;
      }
      .nx-accordion-body.nx-open { max-height:500px;padding:4px 20px 20px; }

      .nx-tabs { display:flex;flex-direction:column; }
      .nx-tab-list {
        display:flex;gap:4px;border-bottom:1px solid rgba(255,255,255,0.08);
        overflow-x:auto;scrollbar-width:none;
      }
      .nx-tab-list::-webkit-scrollbar { display:none; }
      .nx-tab-btn {
        padding:10px 20px;border:none;background:transparent;
        color:rgba(226,232,240,0.5);font-size:13px;font-weight:600;
        cursor:pointer;white-space:nowrap;position:relative;font-family:inherit;
        transition:color 0.2s;border-radius:8px 8px 0 0;
      }
      .nx-tab-btn:hover { color:var(--nx-text,#e2e8f0); }
      .nx-tab-btn.nx-active { color:var(--nx-primary,#00f5ff); }
      .nx-tab-btn.nx-active::after {
        content:'';position:absolute;bottom:-1px;left:0;right:0;height:2px;
        background:var(--nx-primary,#00f5ff);border-radius:2px 2px 0 0;
      }
      .nx-tab-panel { display:none;padding:24px 0;animation:nx-tab-in 0.3s ease; }
      .nx-tab-panel.nx-active { display:block; }
      @keyframes nx-tab-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

      .nx-carousel { position:relative;overflow:hidden; }
      .nx-carousel-track { display:flex;transition:transform 0.45s cubic-bezier(0.23,1,0.32,1); }
      .nx-carousel-slide { flex:0 0 100%;min-width:0; }
      .nx-carousel-btn {
        position:absolute;top:50%;transform:translateY(-50%);z-index:10;
        width:44px;height:44px;border-radius:50%;border:none;
        background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);
        color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;
        transition:background 0.2s,transform 0.2s;
      }
      .nx-carousel-btn:hover { background:var(--nx-primary,#00f5ff);color:#000;transform:translateY(-50%) scale(1.05); }
      .nx-carousel-prev { left:12px; }
      .nx-carousel-next { right:12px; }
      .nx-carousel-dots { display:flex;justify-content:center;gap:6px;padding:12px 0; }
      .nx-carousel-dot {
        width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.2);
        cursor:pointer;transition:background 0.2s,transform 0.2s;border:none;padding:0;
      }
      .nx-carousel-dot.nx-active { background:var(--nx-primary,#00f5ff);transform:scale(1.3); }

      .nx-stepper { display:flex;align-items:flex-start;gap:0; }
      .nx-step { flex:1;display:flex;flex-direction:column;align-items:center;position:relative; }
      .nx-step:not(:last-child)::after {
        content:'';position:absolute;top:18px;left:50%;right:-50%;height:2px;
        background:rgba(255,255,255,0.1);z-index:0;
      }
      .nx-step.nx-done::after { background:var(--nx-primary,#00f5ff); }
      .nx-step-circle {
        width:36px;height:36px;border-radius:50%;border:2px solid rgba(255,255,255,0.15);
        display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;
        background:var(--nx-bg,#0f0f1a);z-index:1;position:relative;color:rgba(255,255,255,0.4);
        transition:all 0.3s;
      }
      .nx-step.nx-active .nx-step-circle { border-color:var(--nx-primary,#00f5ff);color:var(--nx-primary,#00f5ff);box-shadow:0 0 16px rgba(0,245,255,0.3); }
      .nx-step.nx-done  .nx-step-circle { background:var(--nx-primary,#00f5ff);border-color:var(--nx-primary,#00f5ff);color:#000; }
      .nx-step-label { margin-top:8px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.4);text-align:center; }
      .nx-step.nx-active .nx-step-label { color:var(--nx-primary,#00f5ff); }
      .nx-step.nx-done .nx-step-label { color:rgba(255,255,255,0.7); }

      .nx-badge {
        display:inline-flex;align-items:center;justify-content:center;
        padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.04em;
        line-height:1.6;
      }
      .nx-badge-primary { background:rgba(0,245,255,0.15);color:var(--nx-primary,#00f5ff); }
      .nx-badge-secondary { background:rgba(255,0,110,0.15);color:var(--nx-secondary,#ff006e); }
      .nx-badge-success { background:rgba(0,255,136,0.15);color:#00ff88; }
      .nx-badge-warning { background:rgba(255,230,0,0.15);color:#ffe600; }
      .nx-badge-danger  { background:rgba(255,0,110,0.15);color:#ff4d4f; }
      .nx-badge-dot::before {
        content:'';display:inline-block;width:6px;height:6px;border-radius:50%;
        background:currentColor;margin-right:5px;
      }

      .nx-alert {
        padding:14px 18px;border-radius:10px;border:1px solid transparent;
        display:flex;align-items:flex-start;gap:12px;font-size:14px;
        animation:nx-tab-in 0.3s ease;
      }
      .nx-alert-info    { background:rgba(0,245,255,0.06);border-color:rgba(0,245,255,0.2);color:#d0f7ff; }
      .nx-alert-success { background:rgba(0,255,136,0.06);border-color:rgba(0,255,136,0.2);color:#d0ffe8; }
      .nx-alert-warning { background:rgba(255,230,0,0.06);border-color:rgba(255,230,0,0.2);color:#fffbd0; }
      .nx-alert-error   { background:rgba(255,0,110,0.06);border-color:rgba(255,0,110,0.2);color:#ffd0e0; }
      .nx-alert-icon { font-size:18px;flex-shrink:0; }
      .nx-alert-close { margin-left:auto;background:none;border:none;cursor:pointer;opacity:0.5;font-size:16px;color:inherit;padding:0; }
      .nx-alert-close:hover { opacity:1; }

      .nx-chip {
        display:inline-flex;align-items:center;gap:6px;
        padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;
        background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);
        color:var(--nx-text,#e2e8f0);cursor:default;transition:all 0.2s;
      }
      .nx-chip:hover { background:rgba(0,245,255,0.1);border-color:rgba(0,245,255,0.3); }
      .nx-chip-remove { background:none;border:none;cursor:pointer;opacity:0.5;font-size:14px;padding:0;color:inherit;line-height:1; }
      .nx-chip-remove:hover { opacity:1; }

      .nx-divider {
        display:flex;align-items:center;gap:12px;color:rgba(255,255,255,0.3);
        font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;
        margin:16px 0;
      }
      .nx-divider::before,.nx-divider::after {
        content:'';flex:1;height:1px;background:rgba(255,255,255,0.08);
      }
    `;
    document.head.appendChild(s);
  }

  accordion(container, items, options) {
    const opts = Object.assign({ multiple: false, defaultOpen: null }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.className = 'nx-accordion';
    el.innerHTML = '';
    const itemEls = [];
    items.forEach((item, i) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'nx-accordion-item';
      const header = document.createElement('button');
      header.className = 'nx-accordion-header';
      header.innerHTML = `<span>${item.title}</span><span class="nx-accordion-icon">▼</span>`;
      const body = document.createElement('div');
      body.className = 'nx-accordion-body';
      body.innerHTML = typeof item.content === 'string' ? item.content : '';
      itemEl.appendChild(header);
      itemEl.appendChild(body);
      el.appendChild(itemEl);
      itemEls.push({ header, body });
      if (opts.defaultOpen === i) { header.classList.add('nx-open'); body.classList.add('nx-open'); }
      header.addEventListener('click', () => {
        const open = header.classList.contains('nx-open');
        if (!opts.multiple) itemEls.forEach(({ header: h, body: b }) => { h.classList.remove('nx-open'); b.classList.remove('nx-open'); });
        if (!open || opts.multiple) { header.classList.toggle('nx-open', !open); body.classList.toggle('nx-open', !open); }
      });
    });
    return { open: i => { itemEls[i]?.header.classList.add('nx-open'); itemEls[i]?.body.classList.add('nx-open'); },
             close: i => { itemEls[i]?.header.classList.remove('nx-open'); itemEls[i]?.body.classList.remove('nx-open'); } };
  }

  tabs(container, items, options) {
    const opts = Object.assign({ defaultTab: 0 }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.className = 'nx-tabs';
    const tabList = document.createElement('div');
    tabList.className = 'nx-tab-list';
    const panels = [];
    items.forEach((item, i) => {
      const btn = document.createElement('button');
      btn.className = 'nx-tab-btn' + (i === opts.defaultTab ? ' nx-active' : '');
      btn.textContent = item.label;
      const panel = document.createElement('div');
      panel.className = 'nx-tab-panel' + (i === opts.defaultTab ? ' nx-active' : '');
      panel.innerHTML = item.content;
      panels.push({ btn, panel });
      btn.addEventListener('click', () => {
        panels.forEach(p => { p.btn.classList.remove('nx-active'); p.panel.classList.remove('nx-active'); });
        btn.classList.add('nx-active');
        panel.classList.add('nx-active');
      });
      tabList.appendChild(btn);
    });
    el.appendChild(tabList);
    panels.forEach(p => el.appendChild(p.panel));
    return { setTab: i => panels[i]?.btn.click() };
  }

  carousel(container, slides, options) {
    const opts = Object.assign({ autoplay: false, interval: 3000, dots: true, arrows: true, loop: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.className = 'nx-carousel';
    const track = document.createElement('div');
    track.className = 'nx-carousel-track';
    slides.forEach(slide => {
      const slideEl = document.createElement('div');
      slideEl.className = 'nx-carousel-slide';
      slideEl.innerHTML = typeof slide === 'string' ? slide : slide.content || '';
      track.appendChild(slideEl);
    });
    el.appendChild(track);
    let current = 0;
    const total = slides.length;
    const go = i => {
      current = opts.loop ? ((i % total) + total) % total : NandanXUtils.clamp(i, 0, total - 1);
      track.style.transform = `translateX(-${current * 100}%)`;
      if (dotsContainer) dotsContainer.querySelectorAll('.nx-carousel-dot').forEach((d, j) => d.classList.toggle('nx-active', j === current));
    };
    if (opts.arrows) {
      const prev = document.createElement('button');
      prev.className = 'nx-carousel-btn nx-carousel-prev';
      prev.innerHTML = '‹';
      const next = document.createElement('button');
      next.className = 'nx-carousel-btn nx-carousel-next';
      next.innerHTML = '›';
      prev.addEventListener('click', () => go(current - 1));
      next.addEventListener('click', () => go(current + 1));
      el.appendChild(prev);
      el.appendChild(next);
    }
    let dotsContainer = null;
    if (opts.dots) {
      dotsContainer = document.createElement('div');
      dotsContainer.className = 'nx-carousel-dots';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'nx-carousel-dot' + (i === 0 ? ' nx-active' : '');
        dot.addEventListener('click', () => go(i));
        dotsContainer.appendChild(dot);
      });
      el.appendChild(dotsContainer);
    }
    if (opts.autoplay) setInterval(() => go(current + 1), opts.interval);
    let startX = 0;
    el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(dx < 0 ? current + 1 : current - 1);
    });
    return { next: () => go(current + 1), prev: () => go(current - 1), goTo: go, getCurrent: () => current };
  }

  stepper(container, steps, options) {
    const opts = Object.assign({ current: 0 }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.className = 'nx-stepper';
    steps.forEach((step, i) => {
      const stepEl = document.createElement('div');
      const label = typeof step === 'string' ? step : step.label;
      stepEl.className = 'nx-step' + (i < opts.current ? ' nx-done' : i === opts.current ? ' nx-active' : '');
      stepEl.innerHTML = `<div class="nx-step-circle">${i < opts.current ? '✓' : i + 1}</div><div class="nx-step-label">${label}</div>`;
      el.appendChild(stepEl);
    });
    return {
      setStep: i => {
        el.querySelectorAll('.nx-step').forEach((s, j) => {
          s.classList.toggle('nx-done', j < i);
          s.classList.toggle('nx-active', j === i);
          s.classList.remove(...(j >= i ? ['nx-done'] : []));
          s.querySelector('.nx-step-circle').textContent = j < i ? '✓' : j + 1;
        });
      }
    };
  }

  badge(container, text, type) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const b = document.createElement('span');
    b.className = `nx-badge nx-badge-${type || 'primary'}`;
    b.textContent = text;
    el.appendChild(b);
    return this;
  }

  alert(container, options) {
    const opts = Object.assign({ type: 'info', message: '', title: '', dismissible: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const icons = { info: 'ℹ', success: '✓', warning: '⚠', error: '✕' };
    const a = document.createElement('div');
    a.className = `nx-alert nx-alert-${opts.type}`;
    a.innerHTML = `
      <span class="nx-alert-icon">${opts.icon || icons[opts.type]}</span>
      <div>
        ${opts.title ? `<div style="font-weight:700;margin-bottom:4px">${opts.title}</div>` : ''}
        <div>${opts.message}</div>
      </div>
      ${opts.dismissible ? '<button class="nx-alert-close">✕</button>' : ''}
    `;
    el.appendChild(a);
    a.querySelector('.nx-alert-close')?.addEventListener('click', () => { a.style.opacity = '0'; setTimeout(() => a.remove(), 300); });
    return a;
  }

  chip(container, text, options) {
    const opts = Object.assign({ removable: false, onRemove: null }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const c = document.createElement('div');
    c.className = 'nx-chip';
    c.innerHTML = text + (opts.removable ? '<button class="nx-chip-remove">✕</button>' : '');
    el.appendChild(c);
    if (opts.removable) c.querySelector('.nx-chip-remove').addEventListener('click', () => { c.remove(); if (opts.onRemove) opts.onRemove(); });
    return c;
  }

  divider(container, text) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const d = document.createElement('div');
    d.className = 'nx-divider';
    d.textContent = text || '';
    el.appendChild(d);
    return this;
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-accordion]').forEach(el => {
        if (el.dataset.nxAccordionDone) return;
        el.dataset.nxAccordionDone = '1';
        let items;
        try { items = JSON.parse(el.dataset.nxAccordion); } catch { return; }
        this.accordion(el, items);
      });
      NandanXUtils.qsa('[data-nx-tabs]').forEach(el => {
        if (el.dataset.nxTabsDone) return;
        el.dataset.nxTabsDone = '1';
        let items;
        try { items = JSON.parse(el.dataset.nxTabs); } catch { return; }
        this.tabs(el, items);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var componentEngine = new ComponentEngine();
if (typeof window !== 'undefined') window.NandanXComponent = componentEngine;
class StateEngine {
  constructor() {
    this.stores = new Map();
    this.initialized = false;
  }

  init() {
    if (this.initialized) return this;
    this.initialized = true;
    return this;
  }

  createStore(name, initialState, options) {
    const opts = Object.assign({ persist: false, middleware: [] }, options || {});
    const listeners = new Set();
    const history = [];
    let state = opts.persist ? this._loadPersisted(name, initialState) : Object.assign({}, initialState);

    const store = {
      name,
      getState: () => Object.assign({}, state),
      setState: (updates) => {
        const patch = typeof updates === 'function' ? updates(state) : updates;
        const prev = Object.assign({}, state);
        let next = Object.assign({}, state, patch);
        for (const mw of opts.middleware) {
          const result = mw({ state: prev, next, patch, store });
          if (result && typeof result === 'object') next = result;
        }
        history.push({ prev, next, timestamp: Date.now() });
        state = next;
        if (opts.persist) this._persist(name, state);
        listeners.forEach(fn => fn(state, prev, patch));
        NandanXUtils.emit(document, `vx:state:${name}`, { state, prev, patch });
        return store;
      },
      subscribe: (fn) => {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
      reset: () => {
        store.setState(initialState);
        return store;
      },
      getHistory: () => [...history],
      undo: () => {
        if (history.length < 2) return store;
        history.pop();
        const prev = history[history.length - 1];
        state = Object.assign({}, prev ? prev.next : initialState);
        listeners.forEach(fn => fn(state, null, null));
        return store;
      },
      bind: (el, key, options) => {
        this._bindElement(el, store, key, options);
        return store;
      },
      computed: (fn) => {
        let cached = fn(state);
        store.subscribe(s => { cached = fn(s); });
        return { get: () => cached };
      },
    };

    this.stores.set(name, store);
    return store;
  }

  getStore(name) { return this.stores.get(name) || null; }

  _persist(name, state) {
    try { localStorage.setItem(`nx-state-${name}`, JSON.stringify(state)); } catch {}
  }

  _loadPersisted(name, fallback) {
    try {
      const saved = localStorage.getItem(`nx-state-${name}`);
      return saved ? JSON.parse(saved) : Object.assign({}, fallback);
    } catch { return Object.assign({}, fallback); }
  }

  _bindElement(target, store, key, options) {
    const opts = Object.assign({ event: 'input', transform: null, format: null }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      const update = (state) => {
        const val = key.split('.').reduce((o, k) => o?.[k], state);
        const display = opts.format ? opts.format(val) : val;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
          if (el.type === 'checkbox') el.checked = !!display;
          else el.value = display !== undefined && display !== null ? display : '';
        } else {
          el.textContent = display !== undefined && display !== null ? display : '';
        }
      };
      update(store.getState());
      store.subscribe(update);
      el.addEventListener(opts.event, e => {
        let val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        if (opts.transform) val = opts.transform(val);
        const patch = {};
        const keys = key.split('.');
        let obj = patch;
        keys.forEach((k, i) => {
          if (i === keys.length - 1) obj[k] = val;
          else { obj[k] = {}; obj = obj[k]; }
        });
        store.setState(patch);
      });
    });
    return this;
  }

  link(store1, store2, mapping) {
    Object.entries(mapping).forEach(([key1, key2]) => {
      store1.subscribe(state => {
        const val = key1.split('.').reduce((o, k) => o?.[k], state);
        const patch = {};
        const keys = key2.split('.');
        let obj = patch;
        keys.forEach((k, i) => {
          if (i === keys.length - 1) obj[k] = val;
          else { obj[k] = {}; obj = obj[k]; }
        });
        store2.setState(patch);
      });
    });
    return this;
  }

  middleware = {
    logger: (opts) => ({ state, next, patch }) => {
      if (opts?.enabled !== false) console.log('[NandanX Store]', { prev: state, patch, next });
      return next;
    },
    validate: (schema) => ({ next }) => {
      for (const [key, rule] of Object.entries(schema)) {
        if (rule.required && (next[key] === undefined || next[key] === null)) {
          console.warn(`[NandanX Store] Validation failed: ${key} is required`);
        }
        if (rule.type && next[key] !== undefined && typeof next[key] !== rule.type) {
          console.warn(`[NandanX Store] Type mismatch: ${key} should be ${rule.type}`);
        }
      }
      return next;
    },
    immutable: () => ({ next }) => Object.freeze(next),
  };
}

var stateEngine = new StateEngine();
if (typeof window !== 'undefined') window.NandanXState = stateEngine;
class TimelineEngine {
  constructor() {
    this.initialized = false;
    this._sequences = new Map();
    this._tweens = new Map();
  }

  init() {
    if (this.initialized) return this;
    this.initialized = true;
    return this;
  }

  tween(target, from, to, options) {
    const opts = Object.assign({ duration: 600, easing: NandanXUtils.easeOutQuart, delay: 0, onUpdate: null, onComplete: null }, options || {});
    const els = NandanXUtils.parseSelector(target);
    return new Promise(resolve => {
      setTimeout(() => {
        const start = performance.now();
        const tick = (now) => {
          const p = NandanXUtils.clamp((now - start) / opts.duration, 0, 1);
          const ep = opts.easing(p);
          els.forEach(el => {
            Object.keys(to).forEach(prop => {
              const fromVal = parseFloat(from[prop] !== undefined ? from[prop] : getComputedStyle(el)[prop]) || 0;
              const toVal = parseFloat(to[prop]) || 0;
              const unit = String(to[prop]).replace(/[\d.-]/g, '') || '';
              el.style[prop] = (fromVal + (toVal - fromVal) * ep) + unit;
            });
            if (opts.onUpdate) opts.onUpdate(ep, p, el);
          });
          if (p < 1) requestAnimationFrame(tick);
          else { if (opts.onComplete) opts.onComplete(); resolve(); }
        };
        requestAnimationFrame(tick);
      }, opts.delay);
    });
  }

  animate(target, keyframes, options) {
    const opts = Object.assign({ duration: 600, easing: 'cubic-bezier(0.23,1,0.32,1)', fill: 'forwards', delay: 0, iterations: 1 }, options || {});
    const els = NandanXUtils.parseSelector(target);
    // Use Web Animations API if available, otherwise fallback to CSS transition
    if (els.length && typeof els[0].animate === 'function') {
      const animations = els.map(el => (typeof el.animate === "function" ? el.animate(keyframes, {
        duration: opts.duration,
        easing: opts.easing,
        fill: opts.fill,
        delay: opts.delay,
        iterations: opts.iterations,
      }) : null));
      return Promise.all(animations.map(a => a.finished));
    }
    // CSS fallback: apply last keyframe styles directly via transition
    els.forEach(el => {
      const last = keyframes[keyframes.length - 1] || {};
      el.style.transition = `all ${opts.duration}ms ${opts.easing} ${opts.delay}ms`;
      Object.assign(el.style, last);
    });
    return Promise.resolve(els);
  }

  timeline(steps) {
    const id = NandanXUtils.uid();
    let time = 0;
    const schedule = [];
    const tl = {
      to: (target, props, options) => {
        const opts = Object.assign({ duration: 600, offset: null }, options || {});
        const startAt = opts.offset !== null ? opts.offset : time;
        schedule.push({ type: 'tween', target, props, opts, startAt });
        time = startAt + opts.duration;
        return tl;
      },
      add: (fn, offset) => {
        schedule.push({ type: 'fn', fn, startAt: offset !== undefined ? offset : time });
        return tl;
      },
      pause: (duration) => {
        time += duration;
        return tl;
      },
      play: () => {
        const start = performance.now();
        const pending = [...schedule];
        const done = new Set();
        const tweenStates = new Map();
        pending.forEach((step, i) => {
          if (step.type === 'tween') tweenStates.set(i, { started: false, startTime: null });
        });
        const tick = (now) => {
          const elapsed = now - start;
          pending.forEach((step, i) => {
            if (done.has(i)) return;
            if (elapsed < step.startAt) return;
            if (step.type === 'fn') {
              step.fn(elapsed);
              done.add(i);
              return;
            }
            const state = tweenStates.get(i);
            if (!state.started) { state.started = true; state.startTime = now; }
            const p = NandanXUtils.clamp((now - state.startTime) / step.opts.duration, 0, 1);
            const ep = step.opts.easing ? step.opts.easing(p) : NandanXUtils.easeOutQuart(p);
            NandanXUtils.parseSelector(step.target).forEach(el => {
              Object.keys(step.props).forEach(prop => {
                const val = step.props[prop];
                if (typeof val === 'string') {
                  const unit = val.replace(/[\d.-]/g, '');
                  const num = parseFloat(val);
                  const current = parseFloat(getComputedStyle(el)[prop]) || 0;
                  el.style[prop] = (current + (num - current) * ep) + unit;
                }
              });
            });
            if (p >= 1) done.add(i);
          });
          if (done.size < pending.length) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        this._sequences.set(id, tl);
        return tl;
      },
    };
    return tl;
  }

  entrance(target, type, options) {
    const opts = Object.assign({ duration: 700, delay: 0, stagger: 0 }, options || {});
    const els = NandanXUtils.parseSelector(target);
    const effects = {
      fadeUp:     [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'translateY(0)' }],
      fadeDown:   [{ opacity: 0, transform: 'translateY(-30px)' }, { opacity: 1, transform: 'translateY(0)' }],
      fadeLeft:   [{ opacity: 0, transform: 'translateX(40px)' }, { opacity: 1, transform: 'translateX(0)' }],
      fadeRight:  [{ opacity: 0, transform: 'translateX(-40px)' }, { opacity: 1, transform: 'translateX(0)' }],
      zoomIn:     [{ opacity: 0, transform: 'scale(0.7)' }, { opacity: 1, transform: 'scale(1)' }],
      zoomOut:    [{ opacity: 0, transform: 'scale(1.3)' }, { opacity: 1, transform: 'scale(1)' }],
      flipX:      [{ opacity: 0, transform: 'rotateX(60deg)' }, { opacity: 1, transform: 'rotateX(0)' }],
      flipY:      [{ opacity: 0, transform: 'rotateY(60deg)' }, { opacity: 1, transform: 'rotateY(0)' }],
      rotateIn:   [{ opacity: 0, transform: 'rotate(-180deg) scale(0.5)' }, { opacity: 1, transform: 'rotate(0) scale(1)' }],
      bounceIn:   [{ opacity: 0, transform: 'scale(0.3)' }, { opacity: 1, transform: 'scale(1)' }],
      slideUp:    [{ opacity: 0, transform: 'translateY(100%)' }, { opacity: 1, transform: 'translateY(0)' }],
      popIn:      [{ opacity: 0, transform: 'scale(0) rotate(45deg)' }, { opacity: 1, transform: 'scale(1) rotate(0deg)' }],
    };
    const kf = effects[type] || effects.fadeUp;
    const easing = type.includes('bounce') || type.includes('pop') ? 'cubic-bezier(0.34,1.56,0.64,1)' : 'cubic-bezier(0.23,1,0.32,1)';
    return Promise.all(els.map((el, i) => el.animate(kf, {
      duration: opts.duration,
      delay: opts.delay + i * opts.stagger,
      fill: 'forwards',
      easing,
    }).finished));
  }

  exit(target, type, options) {
    const opts = Object.assign({ duration: 500, delay: 0 }, options || {});
    const els = NandanXUtils.parseSelector(target);
    const effects = {
      fadeUp:   [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-20px)' }],
      fadeDown: [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(20px)' }],
      zoomOut:  [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.8)' }],
      collapse: [{ opacity: 1, maxHeight: '500px' }, { opacity: 0, maxHeight: '0px' }],
    };
    const kf = effects[type] || effects.fadeUp;
    if (els.length && typeof els[0].animate === 'function') {
      return Promise.all(els.map(el => el.animate(kf, { duration: opts.duration, delay: opts.delay, fill: 'forwards' }).finished));
    }
    els.forEach(el => { const last = kf[kf.length-1]||{}; el.style.transition='all '+opts.duration+'ms'; Object.assign(el.style, last); });
    return Promise.resolve(els);
  }

  loop(target, keyframes, options) {
    const opts = Object.assign({ duration: 2000, easing: 'ease-in-out', iterations: Infinity }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      if (typeof el.animate === 'function') {
        (typeof el.animate === "function" ? el.animate(keyframes, { duration: opts.duration, easing: opts.easing, iterations: opts.iterations }) : null);
      } else {
        // CSS keyframe animation fallback
        const last = keyframes[keyframes.length - 1] || {};
        el.style.transition = 'all ' + opts.duration + 'ms ' + opts.easing;
        Object.assign(el.style, last);
      }
    });
    return this;
  }

  pulse(target, options) {
    return this.loop(target, [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.08)', opacity: 0.8 },
      { transform: 'scale(1)', opacity: 1 },
    ], options);
  }

  float(target, options) {
    return this.loop(target, [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-12px)' },
      { transform: 'translateY(0)' },
    ], Object.assign({ duration: 3000 }, options || {}));
  }

  spin(target, options) {
    const opts = Object.assign({ duration: 2000, direction: 'normal' }, options || {});
    return this.loop(target, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
      Object.assign({ easing: 'linear' }, opts));
  }

  shake(target, options) {
    const opts = Object.assign({ duration: 500, intensity: 8 }, options || {});
    const n = opts.intensity;
    return this.animate(target, [
      { transform: `translateX(0)` },
      { transform: `translateX(-${n}px)` },
      { transform: `translateX(${n}px)` },
      { transform: `translateX(-${n * 0.5}px)` },
      { transform: `translateX(${n * 0.5}px)` },
      { transform: `translateX(0)` },
    ], Object.assign({ easing: 'ease-in-out' }, opts));
  }

  staggerEnter(target, type, options) {
    const opts = Object.assign({ stagger: 80, duration: 600 }, options || {});
    const parent = typeof target === 'string' ? document.querySelector(target) : target;
    if (!parent) return Promise.resolve();
    const children = [...parent.children];
    return this.entrance(children, type, Object.assign({ stagger: opts.stagger, duration: opts.duration }, options));
  }

  scrollEntrance(target, type, options) {
    NandanXUtils.parseSelector(target).forEach(el => {
      const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        this.entrance(el, type || 'fadeUp', options);
      }, { threshold: 0.1 });
      obs.observe(el);
    });
    return this;
  }
}

var timelineEngine = new TimelineEngine();
if (typeof window !== 'undefined') window.NandanXTimeline = timelineEngine;
class GestureEngine {
  constructor() {
    this.initialized = false;
    this._recognizers = new Map();
  }

  init() {
    if (this.initialized) return this;
    this.initialized = true;
    return this;
  }

  on(target, gesture, handler, options) {
    NandanXUtils.parseSelector(target).forEach(el => this._attach(el, gesture, handler, options));
    return this;
  }

  _attach(el, gesture, handler, options) {
    const opts = Object.assign({ threshold: 50, timeout: 500 }, options || {});
    const id = gesture + '-' + NandanXUtils.uid();
    let start = null, startTime = 0, touches = [];

    const onStart = e => {
      const pt = e.touches ? e.touches[0] : e;
      start = { x: pt.clientX, y: pt.clientY };
      startTime = Date.now();
      touches = e.touches ? [...e.touches] : [];
    };

    const onEnd = e => {
      if (!start) return;
      const pt = e.changedTouches ? e.changedTouches[0] : e;
      const dx = pt.clientX - start.x;
      const dy = pt.clientY - start.y;
      const elapsed = Date.now() - startTime;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const ctx = { dx, dy, dist, angle, elapsed, target: el, originalEvent: e };

      if (gesture === 'swipe-left'  && dx < -opts.threshold && Math.abs(dy) < 80) handler(ctx);
      if (gesture === 'swipe-right' && dx >  opts.threshold && Math.abs(dy) < 80) handler(ctx);
      if (gesture === 'swipe-up'    && dy < -opts.threshold && Math.abs(dx) < 80) handler(ctx);
      if (gesture === 'swipe-down'  && dy >  opts.threshold && Math.abs(dx) < 80) handler(ctx);
      if (gesture === 'swipe') handler(ctx);
      if (gesture === 'tap' && dist < 10 && elapsed < 300) handler(ctx);
      start = null;
    };

    if (gesture.startsWith('swipe') || gesture === 'tap') {
      el.addEventListener('touchstart', onStart, { passive: true });
      el.addEventListener('touchend', onEnd, { passive: true });
      el.addEventListener('mousedown', onStart);
      el.addEventListener('mouseup', onEnd);
    }

    if (gesture === 'doubletap') {
      let lastTap = 0;
      el.addEventListener('touchend', e => {
        const now = Date.now();
        if (now - lastTap < 300) handler({ target: el, originalEvent: e });
        lastTap = now;
      }, { passive: true });
    }

    if (gesture === 'longpress') {
      let timer = null;
      el.addEventListener('touchstart', e => {
        const pt = e.touches[0];
        start = { x: pt.clientX, y: pt.clientY };
        timer = setTimeout(() => {
          handler({ target: el, x: start.x, y: start.y, originalEvent: e });
        }, opts.timeout);
      }, { passive: true });
      el.addEventListener('touchend', () => clearTimeout(timer), { passive: true });
      el.addEventListener('touchmove', e => {
        if (!start) return;
        const pt = e.touches[0];
        if (Math.hypot(pt.clientX - start.x, pt.clientY - start.y) > 10) clearTimeout(timer);
      }, { passive: true });
    }

    if (gesture === 'pinch') {
      let initDist = null;
      el.addEventListener('touchstart', e => {
        if (e.touches.length === 2) {
          initDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
        }
      }, { passive: true });
      el.addEventListener('touchmove', e => {
        if (e.touches.length !== 2 || !initDist) return;
        const newDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        handler({ scale: newDist / initDist, delta: newDist - initDist, target: el, originalEvent: e });
      }, { passive: true });
      el.addEventListener('touchend', () => { initDist = null; }, { passive: true });
    }

    if (gesture === 'rotate') {
      let initAngle = null;
      const getAngle = (t1, t2) => Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180 / Math.PI;
      el.addEventListener('touchstart', e => {
        if (e.touches.length === 2) initAngle = getAngle(e.touches[0], e.touches[1]);
      }, { passive: true });
      el.addEventListener('touchmove', e => {
        if (e.touches.length !== 2 || initAngle === null) return;
        const angle = getAngle(e.touches[0], e.touches[1]);
        handler({ rotation: angle - initAngle, angle, target: el, originalEvent: e });
      }, { passive: true });
      el.addEventListener('touchend', () => { initAngle = null; }, { passive: true });
    }

    if (gesture === 'hover') {
      el.addEventListener('mouseenter', e => handler({ type: 'enter', target: el, originalEvent: e }));
      el.addEventListener('mouseleave', e => handler({ type: 'leave', target: el, originalEvent: e }));
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        handler({ type: 'move', x: e.clientX - r.left, y: e.clientY - r.top, target: el, originalEvent: e });
      });
    }

    if (gesture === 'drag') {
      let dragging = false, lastX, lastY;
      el.addEventListener('mousedown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
      document.addEventListener('mousemove', e => {
        if (!dragging) return;
        handler({ dx: e.clientX - lastX, dy: e.clientY - lastY, x: e.clientX, y: e.clientY, target: el, originalEvent: e });
        lastX = e.clientX; lastY = e.clientY;
      });
      document.addEventListener('mouseup', () => { dragging = false; });
    }

    this._recognizers.set(id, { el, gesture, handler });
    return this;
  }

  swipeLeft(target, handler, options) { return this.on(target, 'swipe-left', handler, options); }
  swipeRight(target, handler, options) { return this.on(target, 'swipe-right', handler, options); }
  swipeUp(target, handler, options) { return this.on(target, 'swipe-up', handler, options); }
  swipeDown(target, handler, options) { return this.on(target, 'swipe-down', handler, options); }
  tap(target, handler, options) { return this.on(target, 'tap', handler, options); }
  doubleTap(target, handler, options) { return this.on(target, 'doubletap', handler, options); }
  longPress(target, handler, options) { return this.on(target, 'longpress', handler, options); }
  pinch(target, handler, options) { return this.on(target, 'pinch', handler, options); }
  rotate(target, handler, options) { return this.on(target, 'rotate', handler, options); }
  hover(target, handler, options) { return this.on(target, 'hover', handler, options); }
  drag(target, handler, options) { return this.on(target, 'drag', handler, options); }

  swipeCarousel(el, nextFn, prevFn) {
    this.swipeLeft(el, nextFn);
    this.swipeRight(el, prevFn);
    return this;
  }

  keyboard(keys, handler, options) {
    const opts = Object.assign({ target: document, ctrl: false, shift: false, alt: false }, options || {});
    const keyList = Array.isArray(keys) ? keys : [keys];
    opts.target.addEventListener('keydown', e => {
      if (opts.ctrl && !e.ctrlKey && !e.metaKey) return;
      if (opts.shift && !e.shiftKey) return;
      if (opts.alt && !e.altKey) return;
      if (keyList.includes(e.key) || keyList.includes(e.code)) {
        if (opts.preventDefault) e.preventDefault();
        handler({ key: e.key, code: e.code, originalEvent: e });
      }
    });
    return this;
  }

  shortcut(combo, handler) {
    const parts = combo.toLowerCase().split('+');
    const key = parts[parts.length - 1];
    const ctrl = parts.includes('ctrl') || parts.includes('cmd');
    const shift = parts.includes('shift');
    const alt = parts.includes('alt');
    return this.keyboard(key, handler, { ctrl, shift, alt, preventDefault: true });
  }

  tiltWatch(el, handler) {
    if (!window.DeviceOrientationEvent) return this;
    window.addEventListener('deviceorientation', e => {
      handler({ beta: e.beta || 0, gamma: e.gamma || 0, alpha: e.alpha || 0, target: el });
    });
    return this;
  }
}

var gestureEngine = new GestureEngine();
if (typeof window !== 'undefined') window.NandanXGesture = gestureEngine;
class StorageEngine {
  constructor() {
    this.initialized = false;
    this._prefix = 'nx_';
    this._cache = new Map();
    this._dbName = 'NandanXDB';
    this._dbVersion = 1;
    this._db = null;
  }

  init(options) {
    if (this.initialized) return this;
    const opts = Object.assign({ prefix: 'vx_', dbName: 'NandanXDB' }, options || {});
    this._prefix = opts.prefix;
    this._dbName = opts.dbName;
    this.initialized = true;
    return this;
  }

  _key(k) { return this._prefix + k; }

  local = {
    set: (key, value, ttl) => {
      const item = { value, timestamp: Date.now(), ttl: ttl || null };
      try { localStorage.setItem(this._key(key), JSON.stringify(item)); } catch {}
      this._cache.set(key, item);
      return this;
    },
    get: (key, fallback) => {
      const cached = this._cache.get(key);
      if (cached) {
        if (!cached.ttl || Date.now() - cached.timestamp < cached.ttl) return cached.value;
        this.local.remove(key);
        return fallback !== undefined ? fallback : null;
      }
      try {
        const raw = localStorage.getItem(this._key(key));
        if (!raw) return fallback !== undefined ? fallback : null;
        const item = JSON.parse(raw);
        if (item.ttl && Date.now() - item.timestamp > item.ttl) {
          this.local.remove(key);
          return fallback !== undefined ? fallback : null;
        }
        this._cache.set(key, item);
        return item.value;
      } catch { return fallback !== undefined ? fallback : null; }
    },
    remove: (key) => {
      try { localStorage.removeItem(this._key(key)); } catch {}
      this._cache.delete(key);
      return this;
    },
    has: (key) => this.local.get(key) !== null,
    keys: () => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this._prefix)) keys.push(k.slice(this._prefix.length));
      }
      return keys;
    },
    clear: (pattern) => {
      const keys = this.local.keys();
      keys.forEach(k => {
        if (!pattern || new RegExp(pattern).test(k)) this.local.remove(k);
      });
      return this;
    },
    update: (key, updater) => {
      const current = this.local.get(key);
      this.local.set(key, typeof updater === 'function' ? updater(current) : Object.assign({}, current, updater));
      return this;
    },
  };

  session = {
    set: (key, value) => {
      try { sessionStorage.setItem(this._key(key), JSON.stringify(value)); } catch {}
      return this;
    },
    get: (key, fallback) => {
      try {
        const raw = sessionStorage.getItem(this._key(key));
        return raw !== null ? JSON.parse(raw) : (fallback !== undefined ? fallback : null);
      } catch { return fallback !== undefined ? fallback : null; }
    },
    remove: (key) => { try { sessionStorage.removeItem(this._key(key)); } catch {} return this; },
    clear: () => { try { sessionStorage.clear(); } catch {} return this; },
    has: (key) => this.session.get(key) !== null,
  };

  cookie = {
    set: (name, value, options) => {
      const opts = Object.assign({ days: 7, path: '/', secure: false, sameSite: 'Lax' }, options || {});
      const expires = new Date(Date.now() + opts.days * 864e5).toUTCString();
      let cookie = `${this._key(name)}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=${opts.path}; SameSite=${opts.sameSite}`;
      if (opts.secure) cookie += '; Secure';
      document.cookie = cookie;
      return this;
    },
    get: (name, fallback) => {
      const key = this._key(name);
      const match = document.cookie.split('; ').find(r => r.startsWith(key + '='));
      if (!match) return fallback !== undefined ? fallback : null;
      try { return JSON.parse(decodeURIComponent(match.split('=')[1])); } catch { return null; }
    },
    remove: (name) => {
      document.cookie = `${this._key(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      return this;
    },
    has: (name) => this.cookie.get(name) !== null,
  };

  memory = {
    _store: new Map(),
    set: (key, value) => { this.memory._store.set(key, value); return this; },
    get: (key, fallback) => this.memory._store.has(key) ? this.memory._store.get(key) : (fallback !== undefined ? fallback : null),
    remove: (key) => { this.memory._store.delete(key); return this; },
    has: (key) => this.memory._store.has(key),
    clear: () => { this.memory._store.clear(); return this; },
  };

  openDB(stores) {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error('IndexedDB not supported')); return; }
      const req = indexedDB.open(this._dbName, this._dbVersion);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        (stores || ['default']).forEach(name => {
          if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
        });
      };
      req.onsuccess = e => { this._db = e.target.result; resolve(this._db); };
      req.onerror = () => reject(req.error);
    });
  }

  idb = {
    set: (store, id, data) => {
      return new Promise((resolve, reject) => {
        if (!this._db) { reject(new Error('DB not open. Call openDB() first')); return; }
        const tx = this._db.transaction(store, 'readwrite');
        tx.objectStore(store).put(Object.assign({ id }, data));
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    },
    get: (store, id) => {
      return new Promise((resolve, reject) => {
        if (!this._db) { reject(new Error('DB not open')); return; }
        const req = this._db.transaction(store).objectStore(store).get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    },
    getAll: (store) => {
      return new Promise((resolve, reject) => {
        if (!this._db) { reject(new Error('DB not open')); return; }
        const req = this._db.transaction(store).objectStore(store).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    },
    delete: (store, id) => {
      return new Promise((resolve, reject) => {
        if (!this._db) { reject(new Error('DB not open')); return; }
        const tx = this._db.transaction(store, 'readwrite');
        tx.objectStore(store).delete(id);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    },
    clear: (store) => {
      return new Promise((resolve, reject) => {
        if (!this._db) { reject(new Error('DB not open')); return; }
        const tx = this._db.transaction(store, 'readwrite');
        tx.objectStore(store).clear();
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    },
  };

  getSize() {
    let size = 0;
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith(this._prefix)) size += localStorage.getItem(key)?.length || 0;
      }
    } catch {}
    return { bytes: size * 2, kb: (size * 2 / 1024).toFixed(2), mb: (size * 2 / 1024 / 1024).toFixed(4) };
  }

  export(keys) {
    const data = {};
    const exportKeys = keys || this.local.keys();
    exportKeys.forEach(k => { data[k] = this.local.get(k); });
    return JSON.stringify(data);
  }

  import(json) {
    try {
      const data = JSON.parse(json);
      Object.entries(data).forEach(([k, v]) => this.local.set(k, v));
      return true;
    } catch { return false; }
  }
}

var storageEngine = new StorageEngine();
if (typeof window !== 'undefined') window.NandanXStorage = storageEngine;
class NetworkEngine {
  constructor() {
    this.initialized = false;
    this._interceptors = { request: [], response: [] };
    this._cache = new Map();
    this._pending = new Map();
    this._baseURL = '';
    this._defaultHeaders = { 'Content-Type': 'application/json' };
    this._timeout = 10000;
    this._retries = 0;
  }

  init(options) {
    if (this.initialized) return this;
    const opts = Object.assign({ baseURL: '', timeout: 10000, retries: 0 }, options || {});
    this._baseURL = opts.baseURL;
    this._timeout = opts.timeout;
    this._retries = opts.retries;
    this.initialized = true;
    return this;
  }

  setBaseURL(url) { this._baseURL = url; return this; }
  setHeader(key, value) { this._defaultHeaders[key] = value; return this; }
  setAuth(token, type) { this._defaultHeaders['Authorization'] = `${type || 'Bearer'} ${token}`; return this; }
  setTimeout(ms) { this._timeout = ms; return this; }

  interceptRequest(fn) { this._interceptors.request.push(fn); return this; }
  interceptResponse(fn) { this._interceptors.response.push(fn); return this; }

  async _request(method, url, body, options) {
    const opts = Object.assign({ headers: {}, cache: false, cacheTime: 60000, signal: null, timeout: this._timeout, retries: this._retries }, options || {});
    const fullURL = url.startsWith('http') ? url : this._baseURL + url;
    const cacheKey = method + ':' + fullURL + (body ? ':' + JSON.stringify(body) : '');

    if (opts.cache && method === 'GET' && this._cache.has(cacheKey)) {
      const cached = this._cache.get(cacheKey);
      if (Date.now() - cached.time < opts.cacheTime) return cached.data;
    }

    if (method === 'GET' && this._pending.has(cacheKey)) return this._pending.get(cacheKey);

    let config = {
      method,
      headers: Object.assign({}, this._defaultHeaders, opts.headers),
    };
    if (body) config.body = typeof body === 'string' ? body : JSON.stringify(body);

    for (const interceptor of this._interceptors.request) {
      const result = await interceptor({ url: fullURL, config, options: opts });
      if (result) { config = result.config || config; }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), opts.timeout);
    if (opts.signal) opts.signal.addEventListener('abort', () => controller.abort());
    config.signal = controller.signal;

    const attempt = async (retriesLeft) => {
      try {
        const response = await fetch(fullURL, config);
        clearTimeout(timeoutId);

        let data;
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) data = await response.json();
        else if (ct.includes('text/')) data = await response.text();
        else data = await response.blob();

        const result = { ok: response.ok, status: response.status, statusText: response.statusText, data, headers: response.headers, url: fullURL };

        for (const interceptor of this._interceptors.response) {
          const r = await interceptor(result);
          if (r) Object.assign(result, r);
        }

        if (!response.ok) throw Object.assign(new Error(`HTTP ${response.status}: ${response.statusText}`), result);

        if (opts.cache && method === 'GET') this._cache.set(cacheKey, { data: result, time: Date.now() });
        this._pending.delete(cacheKey);
        NandanXUtils.emit(document, 'vx:fetch:success', { url: fullURL, status: response.status });
        return result;
      } catch (err) {
        clearTimeout(timeoutId);
        if (retriesLeft > 0 && !err.name === 'AbortError') {
          await new Promise(r => setTimeout(r, 1000));
          return attempt(retriesLeft - 1);
        }
        NandanXUtils.emit(document, 'vx:fetch:error', { url: fullURL, error: err });
        throw err;
      }
    };

    const promise = attempt(opts.retries);
    if (method === 'GET') this._pending.set(cacheKey, promise);
    return promise;
  }

  get(url, options) { return this._request('GET', url, null, options); }
  post(url, body, options) { return this._request('POST', url, body, options); }
  put(url, body, options) { return this._request('PUT', url, body, options); }
  patch(url, body, options) { return this._request('PATCH', url, body, options); }
  delete(url, options) { return this._request('DELETE', url, null, options); }

  async upload(url, file, options) {
    const opts = Object.assign({ field: 'file', onProgress: null, extraFields: {} }, options || {});
    const formData = new FormData();
    formData.append(opts.field, file);
    Object.entries(opts.extraFields).forEach(([k, v]) => formData.append(k, v));
    const headers = Object.assign({}, this._defaultHeaders);
    delete headers['Content-Type'];
    const xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
      xhr.open('POST', this._baseURL + url);
      Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
      if (opts.onProgress) xhr.upload.addEventListener('progress', e => opts.onProgress(e.loaded / e.total * 100));
      xhr.onload = () => {
        try { resolve({ status: xhr.status, data: JSON.parse(xhr.responseText) }); }
        catch { resolve({ status: xhr.status, data: xhr.responseText }); }
      };
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(formData);
    });
  }

  async download(url, filename) {
    const res = await this._request('GET', url, null, { headers: { 'Content-Type': 'application/octet-stream' } });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(res.data);
    a.download = filename || url.split('/').pop();
    a.click();
    URL.revokeObjectURL(a.href);
    return this;
  }

  poll(url, options) {
    const opts = Object.assign({ interval: 5000, until: null, onData: null, onError: null }, options || {});
    let active = true;
    const run = async () => {
      while (active) {
        try {
          const result = await this.get(url, options);
          if (opts.onData) opts.onData(result);
          if (opts.until && opts.until(result)) { active = false; break; }
        } catch (err) { if (opts.onError) opts.onError(err); }
        await new Promise(r => setTimeout(r, opts.interval));
      }
    };
    run();
    return { stop: () => { active = false; } };
  }

  sse(url, handlers) {
    const es = new EventSource(this._baseURL + url);
    if (handlers.message) es.onmessage = e => handlers.message(e.data, e);
    if (handlers.error) es.onerror = handlers.error;
    if (handlers.open) es.onopen = handlers.open;
    Object.entries(handlers).forEach(([event, fn]) => {
      if (!['message', 'error', 'open'].includes(event)) es.addEventListener(event, e => fn(e.data, e));
    });
    return { close: () => es.close(), source: es };
  }

  graphql(url, query, variables) {
    return this.post(url, { query, variables: variables || {} });
  }

  clearCache(pattern) {
    if (!pattern) { this._cache.clear(); return this; }
    const re = new RegExp(pattern);
    for (const key of this._cache.keys()) if (re.test(key)) this._cache.delete(key);
    return this;
  }
}

var networkEngine = new NetworkEngine();
if (typeof window !== 'undefined') window.NandanXNetwork = networkEngine;
class AccessibilityEngine {
  constructor() {
    this.initialized = false;
    this._focusTrap = null;
    this._announcer = null;
    this._shortcuts = new Map();
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._createAnnouncer();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-a11y-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-a11y-styles';
    s.textContent = `
      .nx-sr-only {
        position:absolute;width:1px;height:1px;padding:0;margin:-1px;
        overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;
      }
      .nx-skip-link {
        position:absolute;top:-40px;left:0;background:var(--nx-primary,#00f5ff);
        color:#000;padding:8px 16px;font-weight:700;z-index:999999;
        border-radius:0 0 8px 0;transition:top 0.2s;text-decoration:none;
      }
      .nx-skip-link:focus { top:0; }
      :focus-visible {
        outline:2px solid var(--nx-primary,#00f5ff) !important;
        outline-offset:2px !important;
        border-radius:4px;
      }
      .nx-no-focus-ring :focus:not(:focus-visible) { outline:none; }
      .nx-high-contrast * { filter:contrast(1.5); }
      .nx-large-text * { font-size:120% !important; }
      .nx-reduced-motion * { animation-duration:0.01ms !important; transition-duration:0.01ms !important; }
      .nx-a11y-bar {
        position:fixed;bottom:20px;right:20px;z-index:999998;
        display:flex;flex-direction:column;gap:6px;
      }
      .nx-a11y-btn {
        width:40px;height:40px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.2);
        background:rgba(15,15,26,0.9);backdrop-filter:blur(8px);
        color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;
        transition:background 0.2s,transform 0.2s;
      }
      .nx-a11y-btn:hover { background:var(--nx-primary,#00f5ff);color:#000;transform:scale(1.05); }
      .nx-a11y-btn.nx-active { background:var(--nx-primary,#00f5ff);color:#000; }
      .nx-focus-trap-overlay { position:fixed;inset:0;z-index:99999; }
    `;
    document.head.appendChild(s);
  }

  _createAnnouncer() {
    this._announcer = document.createElement('div');
    this._announcer.setAttribute('aria-live', 'polite');
    this._announcer.setAttribute('aria-atomic', 'true');
    this._announcer.className = 'nx-sr-only';
    document.body.appendChild(this._announcer);
  }

  announce(message, priority) {
    if (!this._announcer) this._createAnnouncer();
    this._announcer.setAttribute('aria-live', priority === 'assertive' ? 'assertive' : 'polite');
    this._announcer.textContent = '';
    setTimeout(() => { this._announcer.textContent = message; }, 50);
    return this;
  }

  skipLink(href, text) {
    const a = document.createElement('a');
    a.href = href || '#main';
    a.className = 'nx-skip-link';
    a.textContent = text || 'Skip to main content';
    document.body.insertBefore(a, document.body.firstChild);
    return this;
  }

  focusTrap(container) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => [...el.querySelectorAll(focusable)].filter(e => !e.disabled && e.offsetParent !== null);
    const handler = e => {
      if (e.key !== 'Tab') return;
      const focusableEls = getFocusable();
      const first = focusableEls[0], last = focusableEls[focusableEls.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { last.focus(); e.preventDefault(); } }
      else { if (document.activeElement === last) { first.focus(); e.preventDefault(); } }
    };
    el.addEventListener('keydown', handler);
    const firstFocusable = getFocusable()[0];
    if (firstFocusable) firstFocusable.focus();
    this._focusTrap = { el, handler };
    return this;
  }

  releaseFocusTrap() {
    if (this._focusTrap) {
      this._focusTrap.el.removeEventListener('keydown', this._focusTrap.handler);
      this._focusTrap = null;
    }
    return this;
  }

  roving(container, options) {
    const opts = Object.assign({ selector: 'button, [role="option"], [role="tab"]', loop: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const getItems = () => [...el.querySelectorAll(opts.selector)];
    el.addEventListener('keydown', e => {
      const items = getItems();
      const current = document.activeElement;
      const idx = items.indexOf(current);
      if (idx === -1) return;
      let next = idx;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { next = idx < items.length - 1 ? idx + 1 : (opts.loop ? 0 : idx); e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { next = idx > 0 ? idx - 1 : (opts.loop ? items.length - 1 : idx); e.preventDefault(); }
      if (e.key === 'Home') { next = 0; e.preventDefault(); }
      if (e.key === 'End') { next = items.length - 1; e.preventDefault(); }
      items.forEach((item, i) => { item.tabIndex = i === next ? 0 : -1; });
      items[next].focus();
    });
    return this;
  }

  label(target, text) {
    NandanXUtils.parseSelector(target).forEach(el => {
      if (!el.getAttribute('aria-label') && !el.id) {
        el.setAttribute('aria-label', text);
      }
    });
    return this;
  }

  live(target, type) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.setAttribute('aria-live', type || 'polite');
      el.setAttribute('aria-atomic', 'true');
    });
    return this;
  }

  role(target, roleName) {
    NandanXUtils.parseSelector(target).forEach(el => el.setAttribute('role', roleName));
    return this;
  }

  expanded(target, isExpanded) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.setAttribute('aria-expanded', String(!!isExpanded));
    });
    return this;
  }

  highContrast(enabled) {
    document.documentElement.classList.toggle('nx-high-contrast', enabled !== false);
    return this;
  }

  largeText(enabled) {
    document.documentElement.classList.toggle('nx-large-text', enabled !== false);
    return this;
  }

  reducedMotion(enabled) {
    document.documentElement.classList.toggle('nx-reduced-motion', enabled !== false);
    return this;
  }

  toolbar(container, options) {
    const opts = Object.assign({ contrast: true, text: true, motion: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const bar = document.createElement('div');
    bar.className = 'nx-a11y-bar';
    const addBtn = (icon, label, fn) => {
      const btn = document.createElement('button');
      btn.className = 'nx-a11y-btn';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
      btn.textContent = icon;
      btn.addEventListener('click', () => { btn.classList.toggle('nx-active'); fn(btn.classList.contains('nx-active')); });
      bar.appendChild(btn);
    };
    if (opts.contrast) addBtn('◑', 'Toggle high contrast', v => this.highContrast(v));
    if (opts.text) addBtn('A', 'Toggle large text', v => this.largeText(v));
    if (opts.motion) addBtn('✋', 'Reduce motion', v => this.reducedMotion(v));
    el.appendChild(bar);
    return this;
  }

  audit() {
    const issues = [];
    NandanXUtils.qsa('img').forEach(img => { if (!img.alt) issues.push({ el: img, issue: 'Image missing alt attribute', severity: 'error' }); });
    NandanXUtils.qsa('a').forEach(a => { if (!a.textContent.trim() && !a.getAttribute('aria-label')) issues.push({ el: a, issue: 'Link has no accessible text', severity: 'warning' }); });
    NandanXUtils.qsa('button').forEach(btn => { if (!btn.textContent.trim() && !btn.getAttribute('aria-label')) issues.push({ el: btn, issue: 'Button has no accessible text', severity: 'warning' }); });
    NandanXUtils.qsa('input, select, textarea').forEach(input => {
      const hasLabel = document.querySelector(`label[for="${input.id}"]`) || input.closest('label') || input.getAttribute('aria-label');
      if (!hasLabel) issues.push({ el: input, issue: 'Form field missing label', severity: 'error' });
    });
    const headings = NandanXUtils.qsa('h1, h2, h3, h4, h5, h6').map(h => parseInt(h.tagName[1]));
    for (let i = 1; i < headings.length; i++) {
      if (headings[i] - headings[i - 1] > 1) issues.push({ issue: `Heading level skipped: h${headings[i-1]} to h${headings[i]}`, severity: 'warning' });
    }
    if (!document.querySelector('[role="main"], main')) issues.push({ issue: 'No main landmark found', severity: 'warning' });
    return issues;
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-roving]').forEach(el => {
        if (el.dataset.nxRovingDone) return;
        el.dataset.nxRovingDone = '1';
        this.roving(el);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var accessibilityEngine = new AccessibilityEngine();
if (typeof window !== 'undefined') window.NandanXA11y = accessibilityEngine;
class EventBusEngine {
  constructor() {
    this.initialized = false;
    this._events = new Map();
    this._once = new Map();
    this._history = [];
    this._maxHistory = 100;
    this._wildcards = new Map();
    this._reactive = new Map();
    this._watchers = new Map();
  }

  init() {
    if (this.initialized) return this;
    this.initialized = true;
    return this;
  }

  on(event, handler, options) {
    const opts = Object.assign({ priority: 0, context: null }, options || {});
    if (!this._events.has(event)) this._events.set(event, []);
    const listeners = this._events.get(event);
    const entry = { handler, opts };
    listeners.push(entry);
    listeners.sort((a, b) => b.opts.priority - a.opts.priority);
    return () => this.off(event, handler);
  }

  once(event, handler, options) {
    const wrapper = (...args) => { this.off(event, wrapper); handler(...args); };
    this._once.set(handler, wrapper);
    return this.on(event, wrapper, options);
  }

  off(event, handler) {
    if (!event) { this._events.clear(); return this; }
    if (!handler) { this._events.delete(event); return this; }
    const listeners = this._events.get(event);
    if (!listeners) return this;
    const wrapped = this._once.get(handler) || handler;
    const idx = listeners.findIndex(e => e.handler === wrapped);
    if (idx !== -1) listeners.splice(idx, 1);
    this._once.delete(handler);
    return this;
  }

  emit(event, data, options) {
    const opts = Object.assign({ async: false, bubble: true }, options || {});
    const payload = { event, data, timestamp: Date.now() };
    this._history.unshift(payload);
    if (this._history.length > this._maxHistory) this._history.pop();

    const listeners = this._events.get(event) || [];
    const wildcardListeners = [];
    this._wildcards.forEach((handler, pattern) => {
      if (new RegExp(pattern).test(event)) wildcardListeners.push({ handler, opts: {} });
    });

    const all = [...listeners, ...wildcardListeners];
    if (opts.async) {
      setTimeout(() => all.forEach(({ handler }) => handler(data, payload)), 0);
    } else {
      all.forEach(({ handler }) => { try { handler(data, payload); } catch (err) { console.error('[NandanX EventBus]', event, err); } });
    }

    if (opts.bubble) document.dispatchEvent(new CustomEvent('vx:bus:' + event, { detail: payload, bubbles: true }));
    return this;
  }

  onWildcard(pattern, handler) {
    const id = NandanXUtils.uid();
    this._wildcards.set(id, handler);
    return () => this._wildcards.delete(id);
  }

  getHistory(event) {
    if (event) return this._history.filter(h => h.event === event);
    return [...this._history];
  }

  clearHistory() { this._history = []; return this; }

  has(event) { return this._events.has(event) && this._events.get(event).length > 0; }

  listenerCount(event) { return (this._events.get(event) || []).length; }

  reactive(target, callback) {
    const id = NandanXUtils.uid();
    const handler = new Proxy(target, {
      set: (obj, prop, value) => {
        const oldVal = obj[prop];
        obj[prop] = value;
        if (oldVal !== value) {
          const watchers = this._watchers.get(id + ':' + prop) || [];
          watchers.forEach(fn => fn(value, oldVal, prop));
          if (callback) callback(prop, value, oldVal, handler);
          this.emit('vx:reactive:change', { id, prop, value, oldValue: oldVal });
        }
        return true;
      },
      deleteProperty: (obj, prop) => {
        const oldVal = obj[prop];
        delete obj[prop];
        if (callback) callback(prop, undefined, oldVal, handler);
        return true;
      }
    });
    this._reactive.set(id, { target, handler });
    handler.__rxId = id;
    return handler;
  }

  watch(reactiveObj, prop, handler) {
    const id = reactiveObj.__rxId;
    if (!id) return this;
    const key = id + ':' + prop;
    if (!this._watchers.has(key)) this._watchers.set(key, []);
    this._watchers.get(key).push(handler);
    return () => {
      const wl = this._watchers.get(key);
      if (wl) wl.splice(wl.indexOf(handler), 1);
    };
  }

  computed(deps, fn) {
    let value = fn(...deps.map(d => typeof d === 'function' ? d() : d));
    const update = () => { value = fn(...deps.map(d => typeof d === 'function' ? d() : d)); };
    return { get: () => value, invalidate: update };
  }

  createChannel(name) {
    return {
      on: (event, handler) => this.on(name + ':' + event, handler),
      once: (event, handler) => this.once(name + ':' + event, handler),
      off: (event, handler) => this.off(name + ':' + event, handler),
      emit: (event, data) => this.emit(name + ':' + event, data),
    };
  }

  pipe(sourceEvent, targetEvent, transform) {
    return this.on(sourceEvent, data => {
      const output = transform ? transform(data) : data;
      this.emit(targetEvent, output);
    });
  }

  debounce(event, handler, delay) {
    let timer;
    return this.on(event, data => {
      clearTimeout(timer);
      timer = setTimeout(() => handler(data), delay);
    });
  }

  throttle(event, handler, limit) {
    let last = 0;
    return this.on(event, data => {
      const now = Date.now();
      if (now - last >= limit) { last = now; handler(data); }
    });
  }

  bridge(domElement, domEvent, busEvent) {
    domElement.addEventListener(domEvent, e => this.emit(busEvent || domEvent, e));
    return this;
  }

  destroy() {
    this._events.clear();
    this._once.clear();
    this._wildcards.clear();
    this._reactive.clear();
    this._watchers.clear();
    this._history = [];
    return this;
  }
}

var eventBusEngine = new EventBusEngine();
if (typeof window !== 'undefined') window.NandanXEvents = eventBusEngine;
class WebGLEngine {
  constructor() {
    this.initialized = false;
    this._programs = new Map();
  }

  init() {
    if (this.initialized) return this;
    this.initialized = true;
    return this;
  }

  _createCanvas(container, options) {
    const opts = Object.assign({ width: null, height: null, alpha: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container || document.body;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    el.style.position = el.style.position || 'relative';
    el.insertBefore(canvas, el.firstChild);
    canvas.width = opts.width || el.offsetWidth || window.innerWidth;
    canvas.height = opts.height || el.offsetHeight || window.innerHeight;
    window.addEventListener('resize', NandanXUtils.debounce(() => {
      canvas.width = el.offsetWidth || window.innerWidth;
      canvas.height = el.offsetHeight || window.innerHeight;
    }, 200));
    return canvas;
  }

  _compileShader(gl, type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[NandanX WebGL] Shader error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  _createProgram(gl, vertSrc, fragSrc) {
    const vert = this._compileShader(gl, gl.VERTEX_SHADER, vertSrc);
    const frag = this._compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
    if (!vert || !frag) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[NandanX WebGL] Program error:', gl.getProgramInfoLog(prog));
      return null;
    }
    gl.deleteShader(vert);
    gl.deleteShader(frag);
    return prog;
  }

  _quad(gl) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    return buf;
  }

  gradient(container, options) {
    const opts = Object.assign({
      colors: ['#00f5ff', '#7c3aed', '#ff006e'],
      speed: 0.5, grain: 0.03, animate: true,
    }, options || {});
    const canvas = this._createCanvas(container);
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return this._fallbackGradient(canvas, opts);

    const vertSrc = `attribute vec2 pos; void main(){gl_Position=vec4(pos,0,1);}`;
    const hexToVec3 = h => {
      const r = NandanXUtils.hexToRgb(h) || { r: 0, g: 0, b: 0 };
      return [r.r/255, r.g/255, r.b/255];
    };
    const c = opts.colors.map(hexToVec3);
    const fragSrc = `
      precision mediump float;
      uniform vec2 res; uniform float time; uniform float grain;
      uniform vec3 c0, c1, c2;
      float rand(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      void main(){
        vec2 uv=gl_FragCoord.xy/res;
        float t=time*0.3;
        float a=sin(uv.x*2.0+t)*0.5+0.5;
        float b=cos(uv.y*1.5+t*0.7)*0.5+0.5;
        vec3 col=mix(mix(c0,c1,a),c2,b);
        col+=grain*(rand(uv+t)-0.5);
        gl_FragColor=vec4(col,1.0);
      }
    `;
    const prog = this._createProgram(gl, vertSrc, fragSrc);
    if (!prog) return this;
    const buf = this._quad(gl);
    const posLoc = gl.getAttribLocation(prog, 'pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(prog);
    const uRes = gl.getUniformLocation(prog, 'res');
    const uTime = gl.getUniformLocation(prog, 'time');
    const uGrain = gl.getUniformLocation(prog, 'grain');
    ['c0','c1','c2'].forEach((n, i) => {
      const u = gl.getUniformLocation(prog, n);
      const color = c[i] || c[c.length - 1];
      gl.uniform3fv(u, new Float32Array(color));
    });
    gl.uniform1f(uGrain, opts.grain);
    let t = 0;
    const draw = () => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (opts.animate) { t += opts.speed * 0.016; requestAnimationFrame(draw); }
    };
    draw();
    return this;
  }

  _fallbackGradient(canvas, opts) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      opts.colors.forEach((c, i) => grad.addColorStop(i / (opts.colors.length - 1), c));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    draw();
    return this;
  }

  rippleEffect(container, options) {
    const opts = Object.assign({ color: [0, 245, 255], intensity: 0.4, speed: 1 }, options || {});
    const canvas = this._createCanvas(container, { alpha: true });
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return this;
    const vertSrc = `attribute vec2 pos; void main(){gl_Position=vec4(pos,0,1);}`;
    const fragSrc = `
      precision mediump float;
      uniform vec2 res, mouse; uniform float time, intensity;
      uniform vec3 color;
      void main(){
        vec2 uv=gl_FragCoord.xy/res;
        vec2 m=mouse/res; m.y=1.0-m.y;
        float d=distance(uv,m);
        float r=sin(d*40.0-time*3.0)*0.5+0.5;
        float mask=smoothstep(0.5,0.0,d);
        float alpha=r*mask*intensity;
        gl_FragColor=vec4(color/255.0,alpha);
      }
    `;
    const prog = this._createProgram(gl, vertSrc, fragSrc);
    if (!prog) return this;
    this._quad(gl);
    const posLoc = gl.getAttribLocation(prog, 'pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    const uRes = gl.getUniformLocation(prog, 'res');
    const uMouse = gl.getUniformLocation(prog, 'mouse');
    const uTime = gl.getUniformLocation(prog, 'time');
    const uIntensity = gl.getUniformLocation(prog, 'intensity');
    const uColor = gl.getUniformLocation(prog, 'color');
    gl.uniform3fv(uColor, new Float32Array(opts.color));
    gl.uniform1f(uIntensity, opts.intensity);
    let mouse = { x: 0, y: 0 }, t = 0;
    document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    const draw = () => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      t += 0.016 * opts.speed;
      requestAnimationFrame(draw);
    };
    draw();
    return this;
  }

  plasma(container, options) {
    const opts = Object.assign({ speed: 1, scale: 3, palette: 0 }, options || {});
    const canvas = this._createCanvas(container);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let t = 0;
    const W = () => canvas.width, H = () => canvas.height;
    const palettes = [
      (v) => `hsl(${v * 360},80%,50%)`,
      (v) => `hsl(${180 + v * 120},90%,55%)`,
      (v) => `hsl(${v * 60},100%,50%)`,
    ];
    const pal = palettes[opts.palette % palettes.length];
    const draw = () => {
      const w = W(), h = H();
      const imageData = ctx.createImageData(w >> 1, h >> 1);
      const d = imageData.data;
      for (let y = 0; y < h >> 1; y++) {
        for (let x = 0; x < w >> 1; x++) {
          const nx = x / (w >> 1) * opts.scale, ny = y / (h >> 1) * opts.scale;
          const v = (Math.sin(nx + t) + Math.sin(ny + t) + Math.sin((nx + ny) / 2 + t) + Math.sin(Math.sqrt(nx*nx + ny*ny) + t)) / 4;
          const n = (v + 1) / 2;
          const rgb = NandanXUtils.hexToRgb(pal(n).startsWith('hsl') ? '#00f5ff' : pal(n)) || { r: Math.round(n*255), g: Math.round((1-n)*200), b: 255 };
          const pi = (y * (w >> 1) + x) * 4;
          d[pi] = Math.round(Math.abs(Math.sin((n + t) * Math.PI)) * 255);
          d[pi+1] = Math.round(Math.abs(Math.sin((n * 2 + t * 0.7) * Math.PI)) * 200);
          d[pi+2] = Math.round(Math.abs(Math.cos((n * 3 + t * 0.5) * Math.PI)) * 255);
          d[pi+3] = 200;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      ctx.drawImage(canvas, 0, 0, w >> 1, h >> 1, 0, 0, w, h);
      t += 0.015 * opts.speed;
      requestAnimationFrame(draw);
    };
    draw();
    return this;
  }

  metaballs(container, options) {
    const opts = Object.assign({ count: 5, speed: 0.5, color: '#00f5ff', threshold: 1.0 }, options || {});
    const canvas = this._createCanvas(container);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = () => canvas.width, H = () => canvas.height;
    const balls = Array.from({ length: opts.count }, () => ({
      x: Math.random() * W(), y: Math.random() * H(),
      vx: NandanXUtils.randomBetween(-1, 1) * opts.speed,
      vy: NandanXUtils.randomBetween(-1, 1) * opts.speed,
      r: NandanXUtils.randomBetween(60, 120),
    }));
    const rgb = NandanXUtils.hexToRgb(opts.color) || { r: 0, g: 245, b: 255 };
    const draw = () => {
      const w = W(), h = H();
      const step = 6;
      ctx.clearRect(0, 0, w, h);
      balls.forEach(b => {
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0 || b.x > w) b.vx *= -1;
        if (b.y < 0 || b.y > h) b.vy *= -1;
      });
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          let sum = 0;
          balls.forEach(b => {
            const dx = x - b.x, dy = y - b.y;
            sum += b.r * b.r / (dx*dx + dy*dy);
          });
          if (sum >= opts.threshold) {
            const alpha = NandanXUtils.clamp((sum - opts.threshold) * 3, 0, 1);
            ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha * 0.8})`;
            ctx.fillRect(x, y, step, step);
          }
        }
      }
      requestAnimationFrame(draw);
    };
    draw();
    return this;
  }
}

var webglEngine = new WebGLEngine();
if (typeof window !== 'undefined') window.NandanXWebGL = webglEngine;
class LayoutEngine {
  constructor() {
    this.initialized = false;
    this._observers = new Map();
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-layout-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-layout-styles';
    s.textContent = `
      .nx-masonry { position:relative; }
      .nx-masonry-col { position:absolute;top:0; }
      .nx-masonry-item { margin-bottom:16px; }
      .nx-grid { display:grid;gap:16px; }
      .nx-flex-center { display:flex;align-items:center;justify-content:center; }
      .nx-flex-between { display:flex;align-items:center;justify-content:space-between; }
      .nx-flex-col { display:flex;flex-direction:column; }
      .nx-sticky-header { position:sticky;top:0;z-index:100; }
      .nx-split { display:grid;grid-template-columns:1fr 1fr;gap:20px; }
      .nx-split-3 { display:grid;grid-template-columns:repeat(3,1fr);gap:20px; }
      .nx-split-4 { display:grid;grid-template-columns:repeat(4,1fr);gap:20px; }
      @media(max-width:768px){.nx-split,.nx-split-3,.nx-split-4{grid-template-columns:1fr;}}
      .nx-aspect-16-9 { aspect-ratio:16/9; }
      .nx-aspect-square { aspect-ratio:1; }
      .nx-aspect-4-3 { aspect-ratio:4/3; }
      .nx-scroll-snap { scroll-snap-type:y mandatory;overflow-y:scroll;height:100vh; }
      .nx-scroll-snap-item { scroll-snap-align:start;height:100vh; }
      .nx-container { max-width:1200px;margin:0 auto;padding:0 24px; }
      .nx-container-sm { max-width:768px;margin:0 auto;padding:0 24px; }
      .nx-container-lg { max-width:1440px;margin:0 auto;padding:0 24px; }
      .nx-full-bleed { width:100vw;position:relative;left:50%;transform:translateX(-50%); }
      .nx-sticky-col { position:sticky;top:24px; }
      .nx-card-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px; }
      .nx-infinite-scroll-sentinel { height:1px;margin-top:-1px; }
    `;
    document.head.appendChild(s);
  }

  masonry(container, options) {
    const opts = Object.assign({ columns: 3, gap: 16, responsive: { 768: 2, 480: 1 } }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('nx-masonry');
    const items = [...el.children];
    items.forEach(item => item.classList.add('nx-masonry-item'));
    const layout = () => {
      const w = el.offsetWidth;
      let cols = opts.columns;
      Object.entries(opts.responsive || {}).sort(([a], [b]) => b - a).forEach(([bp, c]) => { if (w <= parseInt(bp)) cols = c; });
      const colW = (w - opts.gap * (cols - 1)) / cols;
      const colHeights = Array(cols).fill(0);
      items.forEach(item => {
        const minIdx = colHeights.indexOf(Math.min(...colHeights));
        item.style.position = 'absolute';
        item.style.width = colW + 'px';
        item.style.left = (minIdx * (colW + opts.gap)) + 'px';
        item.style.top = colHeights[minIdx] + 'px';
        colHeights[minIdx] += item.offsetHeight + opts.gap;
      });
      el.style.height = Math.max(...colHeights) + 'px';
    };
    layout();
    const ro = new ResizeObserver(NandanXUtils.debounce(layout, 100));
    ro.observe(el);
    this._observers.set(el, ro);
    return { relayout: layout, destroy: () => ro.disconnect() };
  }

  grid(container, options) {
    const opts = Object.assign({ cols: 3, gap: 16, minItemWidth: 280, responsive: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('nx-grid');
    if (opts.responsive) el.style.gridTemplateColumns = `repeat(auto-fill, minmax(${opts.minItemWidth}px, 1fr))`;
    else el.style.gridTemplateColumns = `repeat(${opts.cols}, 1fr)`;
    el.style.gap = opts.gap + 'px';
    return this;
  }

  equalHeights(container, selector) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const items = el.querySelectorAll(selector || ':scope > *');
    const reset = () => { items.forEach(i => { i.style.height = ''; }); };
    const equalize = () => {
      reset();
      const maxH = Math.max(...[...items].map(i => i.offsetHeight));
      items.forEach(i => { i.style.height = maxH + 'px'; });
    };
    equalize();
    window.addEventListener('resize', NandanXUtils.debounce(equalize, 200));
    return this;
  }

  stickyHeader(target, options) {
    const opts = Object.assign({ threshold: 10, shadowOnScroll: true, hideOnDown: false, showOnUp: false }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-sticky-header');
      let lastScrollY = window.scrollY;
      window.addEventListener('scroll', NandanXUtils.throttle(() => {
        const currentY = window.scrollY;
        if (opts.shadowOnScroll) el.style.boxShadow = currentY > opts.threshold ? '0 4px 30px rgba(0,0,0,0.2)' : '';
        if (opts.hideOnDown || opts.showOnUp) {
          if (currentY > lastScrollY && currentY > opts.threshold) el.style.transform = 'translateY(-100%)';
          else el.style.transform = '';
          el.style.transition = 'transform 0.3s ease';
        }
        lastScrollY = currentY;
      }, 100), { passive: true });
    });
    return this;
  }

  scrollSnap(container, options) {
    const opts = Object.assign({ direction: 'y', padding: 0 }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.style.scrollSnapType = `${opts.direction} mandatory`;
    el.style.overflow = opts.direction === 'y' ? 'scroll' : 'hidden scroll';
    el.style.height = opts.direction === 'y' ? '100vh' : 'auto';
    [...el.children].forEach(child => {
      child.style.scrollSnapAlign = 'start';
      if (opts.direction === 'y') child.style.minHeight = '100vh';
    });
    return this;
  }

  infiniteScroll(container, options) {
    const opts = Object.assign({ onLoadMore: null, threshold: 200, loadingEl: null }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container || window;
    let loading = false;
    const check = () => {
      if (loading) return;
      const scrollEl = el === window ? document.documentElement : el;
      const distFromBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
      if (distFromBottom < opts.threshold) {
        loading = true;
        if (opts.loadingEl) document.querySelector(opts.loadingEl)?.style && (document.querySelector(opts.loadingEl).style.display = 'block');
        Promise.resolve(opts.onLoadMore && opts.onLoadMore()).then(() => {
          loading = false;
          if (opts.loadingEl) document.querySelector(opts.loadingEl)?.style && (document.querySelector(opts.loadingEl).style.display = 'none');
        });
      }
    };
    el.addEventListener('scroll', NandanXUtils.throttle(check, 200), { passive: true });
    return { refresh: check };
  }

  virtualList(container, options) {
    const opts = Object.assign({ items: [], itemHeight: 48, renderItem: null, overscan: 3 }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el || !opts.renderItem) return null;
    el.style.overflow = 'auto';
    el.style.position = 'relative';
    const total = opts.items.length;
    const inner = document.createElement('div');
    inner.style.height = total * opts.itemHeight + 'px';
    inner.style.position = 'relative';
    el.appendChild(inner);
    const getVisible = () => {
      const scrollTop = el.scrollTop;
      const start = Math.max(0, Math.floor(scrollTop / opts.itemHeight) - opts.overscan);
      const end = Math.min(total - 1, Math.ceil((scrollTop + el.clientHeight) / opts.itemHeight) + opts.overscan);
      return { start, end };
    };
    const rendered = new Map();
    const render = () => {
      const { start, end } = getVisible();
      rendered.forEach((node, i) => { if (i < start || i > end) { node.remove(); rendered.delete(i); } });
      for (let i = start; i <= end; i++) {
        if (rendered.has(i)) continue;
        const node = opts.renderItem(opts.items[i], i);
        node.style.position = 'absolute';
        node.style.top = i * opts.itemHeight + 'px';
        node.style.width = '100%';
        node.style.height = opts.itemHeight + 'px';
        inner.appendChild(node);
        rendered.set(i, node);
      }
    };
    render();
    el.addEventListener('scroll', NandanXUtils.throttle(render, 50), { passive: true });
    return { render, getVisible };
  }

  splitPane(container, options) {
    const opts = Object.assign({ direction: 'horizontal', split: 50, minSize: 80, resizable: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el || el.children.length < 2) return this;
    const [pane1, pane2] = el.children;
    el.style.display = 'flex';
    el.style.flexDirection = opts.direction === 'vertical' ? 'column' : 'row';
    el.style.overflow = 'hidden';
    if (opts.direction === 'horizontal') {
      pane1.style.width = opts.split + '%';
      pane2.style.flex = '1';
    } else {
      pane1.style.height = opts.split + '%';
      pane2.style.flex = '1';
    }
    if (opts.resizable) {
      const divider = document.createElement('div');
      divider.style.cssText = opts.direction === 'horizontal'
        ? 'width:4px;cursor:col-resize;background:rgba(255,255,255,0.08);flex-shrink:0;transition:background 0.2s;'
        : 'height:4px;cursor:row-resize;background:rgba(255,255,255,0.08);flex-shrink:0;transition:background 0.2s;';
      divider.addEventListener('mouseenter', () => { divider.style.background = 'var(--nx-primary,#00f5ff)'; });
      divider.addEventListener('mouseleave', () => { divider.style.background = 'rgba(255,255,255,0.08)'; });
      pane1.after(divider);
      let dragging = false;
      divider.addEventListener('mousedown', e => { dragging = true; e.preventDefault(); });
      document.addEventListener('mousemove', e => {
        if (!dragging) return;
        const r = el.getBoundingClientRect();
        if (opts.direction === 'horizontal') {
          const pct = NandanXUtils.clamp(((e.clientX - r.left) / r.width) * 100, opts.minSize / r.width * 100, 100 - opts.minSize / r.width * 100);
          pane1.style.width = pct + '%';
        } else {
          const pct = NandanXUtils.clamp(((e.clientY - r.top) / r.height) * 100, opts.minSize / r.height * 100, 100 - opts.minSize / r.height * 100);
          pane1.style.height = pct + '%';
        }
      });
      document.addEventListener('mouseup', () => { dragging = false; });
    }
    return this;
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-masonry]').forEach(el => {
        if (el.dataset.nxMasonryDone) return;
        el.dataset.nxMasonryDone = '1';
        let opts;
        try { opts = JSON.parse(el.dataset.nxMasonry); } catch { opts = {}; }
        this.masonry(el, opts);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var layoutEngine = new LayoutEngine();
if (typeof window !== 'undefined') window.NandanXLayout = layoutEngine;
class SearchEngine {
  constructor() {
    this.initialized = false;
    this._indexes = new Map();
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-search-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-search-styles';
    s.textContent = `
      .nx-search-wrap { position:relative; }
      .nx-search-input {
        width:100%;padding:12px 16px 12px 42px;
        background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);
        border-radius:10px;color:var(--nx-text,#e2e8f0);font-size:14px;
        outline:none;transition:border-color 0.25s ease,box-shadow 0.25s ease;
        font-family:inherit;
      }
      .nx-search-input:focus {
        border-color:var(--nx-primary,#00f5ff);
        box-shadow:0 0 0 3px rgba(0,245,255,0.1);
      }
      .nx-search-icon {
        position:absolute;left:14px;top:50%;transform:translateY(-50%);
        opacity:0.4;font-size:16px;pointer-events:none;
      }
      .nx-search-clear {
        position:absolute;right:12px;top:50%;transform:translateY(-50%);
        background:none;border:none;cursor:pointer;opacity:0.4;color:inherit;
        font-size:16px;transition:opacity 0.2s;display:none;
      }
      .nx-search-clear:hover { opacity:1; }
      .nx-search-input:not(:placeholder-shown) ~ .nx-search-clear { display:block; }
      .nx-search-results {
        position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:10000;
        background:var(--nx-bg,#0f0f1a);border:1px solid rgba(255,255,255,0.1);
        border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,0.5);
        max-height:320px;overflow-y:auto;overflow-x:hidden;
        opacity:0;transform:translateY(-6px);pointer-events:none;
        transition:opacity 0.2s ease,transform 0.2s ease;
      }
      .nx-search-results.nx-active { opacity:1;transform:none;pointer-events:all; }
      .nx-search-result-item {
        padding:12px 16px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.04);
        font-size:14px;color:var(--nx-text,#e2e8f0);display:flex;align-items:center;gap:10px;
        transition:background 0.15s;
      }
      .nx-search-result-item:last-child { border-bottom:none; }
      .nx-search-result-item:hover, .nx-search-result-item.nx-selected { background:rgba(0,245,255,0.06); }
      .nx-search-result-item mark { background:none;color:var(--nx-primary,#00f5ff);font-weight:700; }
      .nx-search-empty { padding:20px;text-align:center;opacity:0.4;font-size:13px; }
      .nx-filter-bar { display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px; }
      .nx-filter-chip {
        padding:6px 14px;border-radius:20px;border:1.5px solid rgba(255,255,255,0.1);
        background:rgba(255,255,255,0.04);color:rgba(226,232,240,0.7);
        cursor:pointer;font-size:12px;font-weight:600;transition:all 0.2s;
        font-family:inherit;
      }
      .nx-filter-chip:hover { border-color:var(--nx-primary,#00f5ff); }
      .nx-filter-chip.nx-active { background:var(--nx-primary,#00f5ff);color:#000;border-color:transparent; }
      .nx-highlight { background:rgba(0,245,255,0.15);color:var(--nx-primary,#00f5ff);border-radius:2px;padding:0 2px; }
    `;
    document.head.appendChild(s);
  }

  createIndex(name, data, options) {
    const opts = Object.assign({ fields: null, idField: 'id', tokenize: true }, options || {});
    const index = data.map((item, i) => {
      const fields = opts.fields || Object.keys(item);
      const text = fields.map(f => String(item[f] || '')).join(' ');
      const tokens = opts.tokenize ? NandanXUtils.tokenize(text) : [text.toLowerCase()];
      return { id: item[opts.idField] || i, item, text: text.toLowerCase(), tokens };
    });
    this._indexes.set(name, { index, opts });
    return this;
  }

  search(name, query, options) {
    const opts = Object.assign({ limit: 20, fuzzy: false, minScore: 0.3 }, options || {});
    const idx = this._indexes.get(name);
    if (!idx) return [];
    if (!query || !query.trim()) return idx.index.slice(0, opts.limit).map(r => ({ ...r, score: 1 }));
    const q = query.toLowerCase().trim();
    const qTokens = NandanXUtils.tokenize(q);
    const results = idx.index.map(record => {
      let score = 0;
      if (record.text.includes(q)) score += 1;
      qTokens.forEach(t => {
        if (record.text.includes(t)) score += 0.5 / qTokens.length;
        if (opts.fuzzy) record.tokens.forEach(rt => { if (this._fuzzyMatch(t, rt)) score += 0.2 / qTokens.length; });
      });
      return { ...record, score };
    }).filter(r => r.score >= opts.minScore).sort((a, b) => b.score - a.score).slice(0, opts.limit);
    return results;
  }

  _fuzzyMatch(query, target) {
    let qi = 0;
    for (let i = 0; i < target.length && qi < query.length; i++) {
      if (target[i] === query[qi]) qi++;
    }
    return qi === query.length;
  }

  _highlight(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
  }

  liveSearch(container, options) {
    const opts = Object.assign({
      data: [], fields: null, placeholder: 'Search…', onSelect: null,
      onResults: null, debounce: 200, minChars: 1, maxResults: 8,
      renderItem: null, emptyText: 'No results found',
    }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const indexName = 'live-' + NandanXUtils.uid();
    this.createIndex(indexName, opts.data, { fields: opts.fields });
    el.className = 'nx-search-wrap';
    el.innerHTML = `
      <span class="nx-search-icon">⌕</span>
      <input class="nx-search-input" placeholder="${opts.placeholder}" autocomplete="off" type="search">
      <button class="nx-search-clear" aria-label="Clear search">✕</button>
      <div class="nx-search-results"></div>
    `;
    const input = el.querySelector('.nx-search-input');
    const results = el.querySelector('.nx-search-results');
    const clearBtn = el.querySelector('.nx-search-clear');
    let selected = -1;
    const showResults = (items) => {
      if (!items.length) {
        results.innerHTML = `<div class="nx-search-empty">${opts.emptyText}</div>`;
        results.classList.add('nx-active');
        return;
      }
      results.innerHTML = items.map((r, i) => {
        const label = opts.renderItem ? opts.renderItem(r.item, r.score) : this._highlight(r.text.slice(0, 60), input.value);
        return `<div class="nx-search-result-item" data-idx="${i}">${label}</div>`;
      }).join('');
      results.classList.add('nx-active');
      selected = -1;
    };
    const hide = () => { results.classList.remove('nx-active'); selected = -1; };
    input.addEventListener('input', NandanXUtils.debounce(() => {
      const q = input.value.trim();
      if (q.length < opts.minChars) { hide(); return; }
      const found = this.search(indexName, q, { limit: opts.maxResults });
      if (opts.onResults) opts.onResults(found);
      showResults(found);
    }, opts.debounce));
    results.addEventListener('click', e => {
      const item = e.target.closest('.nx-search-result-item');
      if (!item) return;
      const idx = parseInt(item.dataset.idx);
      const q = input.value.trim();
      const found = this.search(indexName, q, { limit: opts.maxResults });
      if (found[idx] && opts.onSelect) opts.onSelect(found[idx].item, found[idx]);
      input.value = '';
      hide();
    });
    input.addEventListener('keydown', e => {
      const items = results.querySelectorAll('.nx-search-result-item');
      if (e.key === 'ArrowDown') { selected = Math.min(selected + 1, items.length - 1); e.preventDefault(); }
      if (e.key === 'ArrowUp') { selected = Math.max(selected - 1, -1); e.preventDefault(); }
      if (e.key === 'Escape') { hide(); input.blur(); }
      items.forEach((el, i) => el.classList.toggle('nx-selected', i === selected));
      if (e.key === 'Enter' && selected >= 0) items[selected].click();
    });
    clearBtn.addEventListener('click', () => { input.value = ''; hide(); input.focus(); });
    document.addEventListener('click', e => { if (!el.contains(e.target)) hide(); });
    return { update: data => { this.createIndex(indexName, data, { fields: opts.fields }); } };
  }

  filterList(container, options) {
    const opts = Object.assign({ filters: [], selector: ':scope > *', field: 'data-category', all: 'All' }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const bar = document.createElement('div');
    bar.className = 'nx-filter-bar';
    const items = [...el.querySelectorAll(opts.selector)];
    const allFilters = ['all', ...opts.filters];
    let active = 'all';
    allFilters.forEach(f => {
      const btn = document.createElement('button');
      btn.className = 'nx-filter-chip' + (f === 'all' ? ' nx-active' : '');
      btn.textContent = f === 'all' ? opts.all : f;
      btn.addEventListener('click', () => {
        active = f;
        bar.querySelectorAll('.nx-filter-chip').forEach(b => b.classList.toggle('nx-active', b.textContent === btn.textContent));
        items.forEach(item => {
          const cat = item.getAttribute(opts.field) || '';
          const show = f === 'all' || cat.includes(f);
          item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          item.style.opacity = show ? '1' : '0';
          item.style.transform = show ? 'scale(1)' : 'scale(0.95)';
          item.style.pointerEvents = show ? '' : 'none';
          setTimeout(() => { item.style.display = show ? '' : 'none'; }, show ? 0 : 300);
        });
      });
      bar.appendChild(btn);
    });
    el.insertBefore(bar, el.firstChild);
    return { filter: f => bar.querySelector(`[data-f="${f}"]`)?.click() };
  }

  highlight(container, query) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el || !query) return this;
    const walk = (node) => {
      if (node.nodeType === 3) {
        const text = node.textContent;
        const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        if (re.test(text)) {
          const span = document.createElement('span');
          span.innerHTML = text.replace(re, '<mark class="nx-highlight">$1</mark>');
          node.replaceWith(span);
        }
      } else if (node.nodeType === 1 && !['SCRIPT', 'STYLE', 'MARK'].includes(node.tagName)) {
        [...node.childNodes].forEach(walk);
      }
    };
    walk(el);
    return this;
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-filter]').forEach(el => {
        if (el.dataset.nxFilterDone) return;
        el.dataset.nxFilterDone = '1';
        let opts;
        try { opts = JSON.parse(el.dataset.nxFilter); } catch { opts = {}; }
        this.filterList(el, opts);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var searchEngine = new SearchEngine();
if (typeof window !== 'undefined') window.NandanXSearch = searchEngine;
/**
 * NandanX — smoothScrollEngine
 * Butter-smooth scroll (Lenis-inspired), virtual scroll, momentum, snap
 */
class SmoothScrollEngine {
  constructor() {
    this.initialized = false;
    this.lenis = null;
    this.raf = null;
    this.velocity = 0;
    this.current = 0;
    this.target = 0;
    this.ease = 0.1;
    this.sections = [];
    this.snapPoints = [];
    this.isSnapping = false;
    this._active = false;
  }

  init(options = {}) {
    if (this.initialized) return this;
    this.ease = options.ease || 0.09;
    this.multiplier = options.multiplier || 1.0;
    this.infinite = options.infinite || false;
    this._injectStyles();
    if (options.auto !== false) this.start();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-smooth-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-smooth-styles';
    s.textContent = `
      [data-nx-smooth] { will-change: transform; }
      .nx-smooth-wrapper { position: fixed; top: 0; left: 0; width: 100%; }
      .nx-smooth-ghost { pointer-events: none; }
      [data-nx-snap-section] { scroll-snap-align: start; }
      html.nx-smooth-active { overflow: hidden; }
    `;
    document.head.appendChild(s);
  }

  start() {
    if (this._active) return this;
    this._active = true;
    this.current = window.scrollY;
    this.target = window.scrollY;

    window.addEventListener('wheel', this._onWheel.bind(this), { passive: false });
    window.addEventListener('touchstart', this._onTouchStart.bind(this), { passive: true });
    window.addEventListener('touchmove', this._onTouchMove.bind(this), { passive: false });
    window.addEventListener('touchend', this._onTouchEnd.bind(this), { passive: true });

    this._loop();
    return this;
  }

  stop() {
    this._active = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('wheel', this._onWheel);
    return this;
  }

  _onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY * this.multiplier;
    this.target = Math.max(0, Math.min(this.target + delta, document.body.scrollHeight - window.innerHeight));
  }

  _onTouchStart(e) {
    this._touchY = e.touches[0].clientY;
    this._touchVelocity = 0;
  }

  _onTouchMove(e) {
    const dy = this._touchY - e.touches[0].clientY;
    this._touchVelocity = dy;
    this._touchY = e.touches[0].clientY;
    this.target = Math.max(0, Math.min(this.target + dy * 1.5, document.body.scrollHeight - window.innerHeight));
  }

  _onTouchEnd() {
    // momentum
    const momentum = this._touchVelocity * 8;
    this.target = Math.max(0, Math.min(this.target + momentum, document.body.scrollHeight - window.innerHeight));
  }

  _loop() {
    this.current += (this.target - this.current) * this.ease;
    this.velocity = this.target - this.current;

    window.scrollTo(0, this.current);

    // Warp effect on fast scroll
    const absVel = Math.abs(this.velocity);
    if (absVel > 2) {
      document.querySelectorAll('[data-nx-smooth]').forEach(el => {
        const scaleY = 1 + absVel * 0.0015;
        el.style.transform = `scaleY(${scaleY})`;
        el.style.filter = `blur(${Math.min(absVel * 0.06, 2)}px)`;
      });
    } else {
      document.querySelectorAll('[data-nx-smooth]').forEach(el => {
        el.style.transform = '';
        el.style.filter = '';
      });
    }

    if (this.snapPoints.length && !this.isSnapping && Math.abs(this.velocity) < 0.5) {
      this._checkSnap();
    }

    if (this._active) this.raf = requestAnimationFrame(this._loop.bind(this));
  }

  scrollTo(target, options = {}) {
    let y = 0;
    if (typeof target === 'number') y = target;
    else if (typeof target === 'string') {
      const el = document.querySelector(target);
      if (el) y = el.getBoundingClientRect().top + this.current + (options.offset || 0);
    } else if (target && target.getBoundingClientRect) {
      y = target.getBoundingClientRect().top + this.current + (options.offset || 0);
    }
    const duration = options.duration || 1.2;
    this._animateTo(y, duration);
    return this;
  }

  _animateTo(targetY, duration) {
    const start = this.current;
    const diff = targetY - start;
    const startTime = performance.now();
    const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const anim = (now) => {
      const elapsed = (now - startTime) / (duration * 1000);
      const progress = Math.min(elapsed, 1);
      this.target = start + diff * ease(progress);
      if (progress < 1) requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
  }

  addSnapPoint(y) {
    this.snapPoints.push(y);
    return this;
  }

  snapSections(selector = '[data-nx-snap]') {
    document.querySelectorAll(selector).forEach(el => {
      this.snapPoints.push(el.offsetTop);
    });
    return this;
  }

  _checkSnap() {
    const closest = this.snapPoints.reduce((prev, curr) =>
      Math.abs(curr - this.current) < Math.abs(prev - this.current) ? curr : prev
    );
    if (Math.abs(closest - this.current) < 60) {
      this.isSnapping = true;
      this._animateTo(closest, 0.6);
      setTimeout(() => { this.isSnapping = false; }, 800);
    }
  }

  virtualScroll(container, items, renderFn, options = {}) {
    const itemH = options.itemHeight || 60;
    const bufferCount = options.buffer || 5;

    const ghost = document.createElement('div');
    ghost.style.cssText = `height:${items.length * itemH}px; pointer-events:none; visibility:hidden;`;
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.appendChild(ghost);

    const viewport = document.createElement('div');
    viewport.style.cssText = 'position:absolute;top:0;left:0;width:100%;';
    container.appendChild(viewport);

    const render = () => {
      const scrollTop = container.scrollTop;
      const start = Math.max(0, Math.floor(scrollTop / itemH) - bufferCount);
      const end = Math.min(items.length, Math.ceil((scrollTop + container.clientHeight) / itemH) + bufferCount);

      viewport.style.top = start * itemH + 'px';
      viewport.innerHTML = '';
      items.slice(start, end).forEach((item, i) => {
        const el = renderFn(item, start + i);
        el.style.height = itemH + 'px';
        viewport.appendChild(el);
      });
    };

    container.addEventListener('scroll', render);
    render();
    return { refresh: render };
  }

  progress() {
    return this.current / (document.body.scrollHeight - window.innerHeight);
  }
}

const smoothScrollEngine = new SmoothScrollEngine();
/**
 * NandanX — parallaxEngine
 * Advanced parallax layers, scroll-driven reveals, depth scenes, sticky sections
 */
class ParallaxEngine {
  constructor() {
    this.initialized = false;
    this.layers = [];
    this.scenes = [];
    this.raf = null;
    this.scrollY = 0;
    this.ticking = false;
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY;
      if (!this.ticking) {
        requestAnimationFrame(() => { this._update(); this.ticking = false; });
        this.ticking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', () => this._autoDetect());
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-parallax-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-parallax-styles';
    s.textContent = `
      [data-nx-parallax] { will-change: transform; }
      [data-nx-depth-scene] { perspective: 800px; transform-style: preserve-3d; overflow: hidden; }
      .nx-parallax-layer { will-change: transform; }
      [data-nx-sticky-scene] { position: sticky; top: 0; overflow: hidden; }
      [data-nx-reveal-scene] { opacity: 0; }
      [data-nx-reveal-scene].nx-revealed { opacity: 1; transition: opacity 0.6s ease; }
    `;
    document.head.appendChild(s);
  }

  _autoDetect() {
    this.layers = [];
    document.querySelectorAll('[data-nx-parallax]').forEach(el => {
      const speed = parseFloat(el.dataset.nxParallax) || 0.5;
      const dir = el.dataset.nxParallaxDir || 'y';
      const rect = el.getBoundingClientRect();
      this.layers.push({ el, speed, dir, originTop: rect.top + window.scrollY });
    });

    document.querySelectorAll('[data-nx-depth-scene]').forEach(scene => {
      const children = scene.querySelectorAll('[data-depth]');
      this.scenes.push({ scene, children: Array.from(children) });
    });
  }

  _update() {
    const sy = this.scrollY;

    // Simple parallax layers
    this.layers.forEach(({ el, speed, dir, originTop }) => {
      const offset = (sy - (originTop - window.innerHeight / 2)) * speed;
      if (dir === 'y') el.style.transform = `translateY(${offset}px)`;
      else if (dir === 'x') el.style.transform = `translateX(${offset}px)`;
      else if (dir === 'scale') el.style.transform = `scale(${1 + offset * 0.0005})`;
      else if (dir === 'rotate') el.style.transform = `rotate(${offset * 0.05}deg)`;
    });

    // Depth scenes
    this.scenes.forEach(({ scene, children }) => {
      const rect = scene.getBoundingClientRect();
      const progress = (window.innerHeight / 2 - rect.top) / window.innerHeight;
      children.forEach(child => {
        const depth = parseFloat(child.dataset.depth) || 1;
        const tx = progress * 30 * depth;
        const ty = progress * 20 * depth;
        child.style.transform = `translate3d(${tx}px, ${ty}px, ${depth * 20}px)`;
      });
    });

    // Scroll-driven reveals
    document.querySelectorAll('[data-nx-reveal-scene]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) el.classList.add('nx-revealed');
    });
  }

  layer(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const speed = options.speed || 0.5;
    const dir = options.direction || 'y';
    const rect = el.getBoundingClientRect();
    el.dataset.nxParallax = speed;
    el.dataset.nxParallaxDir = dir;
    this.layers.push({ el, speed, dir, originTop: rect.top + window.scrollY });
    return this;
  }

  // Multi-layer depth background (like CSS parallax cards)
  depthLayers(container, layers) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.style.cssText += 'position:relative;overflow:hidden;';
    layers.forEach((cfg, i) => {
      const div = document.createElement('div');
      div.className = 'nx-parallax-layer';
      div.style.cssText = `
        position:absolute;inset:${-20 * cfg.speed}px;
        background:${cfg.background || 'transparent'};
        background-size:cover;background-position:center;
        z-index:${i};
        ${cfg.image ? `background-image:url(${cfg.image});` : ''}
      `;
      el.appendChild(div);
      this.layer(div, { speed: cfg.speed, dir: cfg.direction || 'y' });
    });
    return this;
  }

  // Sticky storytelling section
  stickyStory(container, steps, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    const stepH = options.stepHeight || window.innerHeight;
    el.style.height = `${steps.length * stepH}px`;
    const sticky = document.createElement('div');
    sticky.style.cssText = 'position:sticky;top:0;height:100vh;overflow:hidden;';
    el.appendChild(sticky);

    const updateStory = () => {
      const rect = el.getBoundingClientRect();
      const progress = -rect.top / (rect.height - window.innerHeight);
      const stepIndex = Math.floor(progress * steps.length);
      const stepProgress = (progress * steps.length) % 1;
      const clampedStep = Math.max(0, Math.min(steps.length - 1, stepIndex));
      if (options.onStep) options.onStep(clampedStep, stepProgress, sticky);
    };

    window.addEventListener('scroll', updateStory, { passive: true });
    return { el: sticky };
  }

  // Horizontal scroll section
  horizontal(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const wrapper = el.querySelector('[data-nx-hscroll-track]') || el.firstElementChild;
    if (!wrapper) return this;
    const totalW = wrapper.scrollWidth;
    const sticky = document.createElement('div');
    sticky.style.height = totalW + 'px';
    el.parentNode.insertBefore(sticky, el);
    el.style.cssText = 'position:sticky;top:0;overflow:hidden;';
    window.addEventListener('scroll', () => {
      const rect = sticky.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / (sticky.offsetHeight - window.innerHeight)));
      wrapper.style.transform = `translateX(${-progress * (totalW - window.innerWidth)}px)`;
    }, { passive: true });
    return this;
  }

  // Mouse parallax for hero sections
  mouseParallax(container, layers, intensity = 0.03) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    document.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      layers.forEach(({ selector, depth }) => {
        const target = el.querySelector(selector);
        if (!target) return;
        const x = dx * intensity * depth;
        const y = dy * intensity * depth;
        target.style.transform = `translate(${x}px, ${y}px)`;
      });
    });
    return this;
  }

  // Scroll progress timeline — drive animation by scroll
  scrollTimeline(element, keyframes, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const start = options.start || 0; // 0–1 viewport progress
    const end = options.end || 1;

    window.addEventListener('scroll', () => {
      const rect = el.getBoundingClientRect();
      const vp = window.innerHeight;
      let progress = (vp - rect.top) / (vp + rect.height);
      progress = Math.max(0, Math.min(1, (progress - start) / (end - start)));

      keyframes.forEach((kf, i) => {
        const nextKf = keyframes[i + 1];
        if (!nextKf) return;
        if (progress >= kf.offset && progress <= nextKf.offset) {
          const t = (progress - kf.offset) / (nextKf.offset - kf.offset);
          Object.keys(kf).forEach(k => {
            if (k === 'offset') return;
            const from = parseFloat(kf[k]);
            const to = parseFloat(nextKf[k]);
            el.style[k] = from + (to - from) * t + (typeof kf[k] === 'string' ? kf[k].replace(/[\d.-]/g, '') : '');
          });
        }
      });
    }, { passive: true });
    return this;
  }
}

const parallaxEngine = new ParallaxEngine();
/**
 * NandanX — svgMorphEngine
 * SVG path morphing, drawing animations, shape transitions, blob morphing
 */
class SVGMorphEngine {
  constructor() {
    this.initialized = false;
    this.morphs = new Map();
    this.drawings = new Map();
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-svg-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-svg-styles';
    s.textContent = `
      [data-nx-draw] path, [data-nx-draw] line, [data-nx-draw] circle, [data-nx-draw] polyline {
        stroke-dasharray: var(--nx-path-len, 1000);
        stroke-dashoffset: var(--nx-path-len, 1000);
        transition: stroke-dashoffset var(--nx-draw-dur, 1.5s) cubic-bezier(0.4, 0, 0.2, 1);
      }
      [data-nx-draw].nx-drawn path, [data-nx-draw].nx-drawn line,
      [data-nx-draw].nx-drawn circle, [data-nx-draw].nx-drawn polyline {
        stroke-dashoffset: 0;
      }
      .nx-morph-svg { overflow: visible; }
    `;
    document.head.appendChild(s);
  }

  // Normalize path to same number of commands (basic)
  _normalizePaths(from, to) {
    // Simple numeric interpolation between path d values
    const numFrom = from.match(/-?[\d.]+/g).map(Number);
    const numTo = to.match(/-?[\d.]+/g).map(Number);
    const len = Math.min(numFrom.length, numTo.length);
    return { from: numFrom.slice(0, len), to: numTo.slice(0, len), template: from, len };
  }

  _interpolatePath(from, to, t, template) {
    const nums = from.map((n, i) => n + (to[i] - n) * t);
    let idx = 0;
    return template.replace(/-?[\d.]+/g, () => nums[idx++]?.toFixed(2) || '0');
  }

  // Morph between two SVG paths
  morph(element, fromPath, toPath, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const duration = options.duration || 800;
    const ease = options.ease || (t => t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2);
    const repeat = options.repeat || false;
    const yoyo = options.yoyo || false;

    const { from, to, template } = this._normalizePaths(fromPath, toPath);
    let start = null;
    let forward = true;

    const anim = (ts) => {
      if (!start) start = ts;
      let t = Math.min((ts - start) / duration, 1);
      const easedT = ease(forward ? t : 1 - t);
      const current = this._interpolatePath(from, to, easedT, template);
      el.setAttribute('d', current);

      if (t < 1) {
        requestAnimationFrame(anim);
      } else if (repeat) {
        start = null;
        if (yoyo) forward = !forward;
        requestAnimationFrame(anim);
      } else if (options.onComplete) options.onComplete();
    };
    requestAnimationFrame(anim);
    return this;
  }

  // Morph through multiple paths in sequence
  morphSequence(element, paths, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;
    const duration = options.duration || 600;
    const delay = options.delay || 0;
    let idx = 0;

    const next = () => {
      const fromPath = paths[idx];
      const toPath = paths[(idx + 1) % paths.length];
      idx = (idx + 1) % paths.length;
      this.morph(el, fromPath, toPath, { duration, onComplete: () => {
        if (options.loop !== false) setTimeout(next, delay);
      }});
    };
    setTimeout(next, delay);
    return this;
  }

  // Animate SVG path drawing (write-on effect)
  draw(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const duration = options.duration || 1500;
    const stagger = options.stagger || 100;
    const trigger = options.trigger !== false; // trigger on scroll by default

    const paths = el.querySelectorAll('path, line, circle, polyline, ellipse, rect');
    paths.forEach((path, i) => {
      const len = path.getTotalLength ? path.getTotalLength() : 1000;
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.style.transition = `stroke-dashoffset ${duration}ms ${i * stagger}ms cubic-bezier(0.4,0,0.2,1)`;
    });

    const reveal = () => {
      paths.forEach(path => { path.style.strokeDashoffset = 0; });
      if (options.onComplete) setTimeout(options.onComplete, duration + paths.length * stagger);
    };

    if (trigger) {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { reveal(); observer.disconnect(); }
      }, { threshold: 0.2 });
      observer.observe(el);
    } else {
      reveal();
    }
    return this;
  }

  // Animated blob shapes
  blob(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const colors = options.colors || ['#00f5ff', '#7c3aed', '#ff006e'];
    const speed = options.speed || 4000;
    const size = options.size || 200;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.style.cssText = `width:${size}px;height:${size}px;overflow:visible;`;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const grad = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    grad.innerHTML = `<radialGradient id="blob-g-${Date.now()}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${colors[0]}"/>
      <stop offset="100%" stop-color="${colors[1] || colors[0]}"/>
    </radialGradient>`;
    svg.appendChild(grad);
    path.setAttribute('fill', `url(#${grad.firstChild.id})`);
    svg.appendChild(path);
    el.appendChild(svg);

    const cx = size / 2, cy = size / 2, r = size * 0.38;
    const pts = 8;
    let t = 0;

    const genBlob = (time) => {
      const points = [];
      for (let i = 0; i < pts; i++) {
        const angle = (i / pts) * Math.PI * 2;
        const noise = Math.sin(time * 0.0015 + i * 1.3) * 0.22 + Math.cos(time * 0.001 + i * 2.1) * 0.15;
        const rad = r * (1 + noise);
        points.push([cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad]);
      }
      let d = `M ${points[0][0]} ${points[0][1]}`;
      for (let i = 0; i < pts; i++) {
        const p1 = points[i], p2 = points[(i + 1) % pts];
        const mid = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
        d += ` Q ${p1[0]} ${p1[1]} ${mid[0]} ${mid[1]}`;
      }
      d += ' Z';
      return d;
    };

    const animate = (ts) => {
      path.setAttribute('d', genBlob(ts));
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    return svg;
  }

  // Text to SVG path morph
  textMorph(element, texts, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;
    const interval = options.interval || 3000;
    const duration = options.duration || 800;
    let idx = 0;

    const update = () => {
      el.style.transition = `opacity ${duration * 0.3}ms ease`;
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = texts[idx];
        el.style.opacity = '1';
        idx = (idx + 1) % texts.length;
      }, duration * 0.3);
    };

    setInterval(update, interval);
    return this;
  }

  // Shape transition (div background morphing via clip-path)
  clipMorph(element, shapes, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const clips = {
      circle: 'circle(50% at 50% 50%)',
      ellipse: 'ellipse(60% 40% at 50% 50%)',
      hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
      triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
      diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
      squircle: 'polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)',
      rect: 'inset(0%)',
    };
    const duration = options.duration || 600;
    const delay = options.delay || 2000;
    let idx = 0;

    el.style.transition = `clip-path ${duration}ms cubic-bezier(0.4,0,0.2,1)`;

    const cycle = () => {
      const shape = shapes[idx];
      el.style.clipPath = clips[shape] || shape;
      idx = (idx + 1) % shapes.length;
      setTimeout(cycle, delay);
    };
    cycle();
    return this;
  }

  // Animated SVG icon on hover/click
  animateIcon(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const type = options.type || 'spin';

    if (type === 'spin') {
      el.addEventListener('mouseenter', () => {
        el.style.transition = 'transform 0.5s ease';
        el.style.transform = 'rotate(180deg)';
      });
      el.addEventListener('mouseleave', () => { el.style.transform = 'rotate(0deg)'; });
    } else if (type === 'pulse') {
      el.style.animation = 'nx-svg-pulse 1.5s ease-in-out infinite';
      if (!document.getElementById('nx-svg-anim')) {
        const s = document.createElement('style');
        s.id = 'nx-svg-anim';
        s.textContent = `@keyframes nx-svg-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }`;
        document.head.appendChild(s);
      }
    } else if (type === 'shake') {
      el.addEventListener('click', () => {
        el.style.animation = 'nx-svg-shake 0.4s ease';
        el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
        if (!document.getElementById('nx-svg-shake')) {
          const s = document.createElement('style');
          s.id = 'nx-svg-shake';
          s.textContent = `@keyframes nx-svg-shake { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-15deg)} 75%{transform:rotate(15deg)} }`;
          document.head.appendChild(s);
        }
      });
    }
    return this;
  }
}

const svgMorphEngine = new SVGMorphEngine();
/**
 * NandanX — typographyEngine
 * Text splitting, kinetic typography, char/word/line animations
 */
class TypographyEngine {
  constructor() {
    this.initialized = false;
    this.splitElements = new Map();
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-typo-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-typo-styles';
    s.textContent = `
      .nx-char, .nx-word, .nx-line { display: inline-block; }
      .nx-chars-wrap { overflow: hidden; display: inline-block; }
      .nx-word-wrap { overflow: hidden; display: inline-block; }
      .nx-line-wrap { overflow: hidden; display: block; }

      /* Char animation presets */
      .nx-char { opacity: 0; transform: translateY(110%); }
      .nx-char.nx-in { opacity: 1; transform: translateY(0); transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.23,1,0.32,1); }

      .nx-typo-blur .nx-char { opacity: 0; filter: blur(8px); transform: scale(0.8); }
      .nx-typo-blur .nx-char.nx-in { opacity: 1; filter: blur(0); transform: scale(1); transition: all 0.6s cubic-bezier(0.23,1,0.32,1); }

      .nx-typo-rotate .nx-char { opacity: 0; transform: rotate(-90deg) translateY(-50%); transform-origin: center bottom; }
      .nx-typo-rotate .nx-char.nx-in { opacity: 1; transform: rotate(0) translateY(0); transition: all 0.5s cubic-bezier(0.23,1,0.32,1); }

      .nx-typo-wave .nx-char { display: inline-block; }
      .nx-kinetic { white-space: nowrap; overflow: hidden; }
      .nx-marquee-inner { display: inline-flex; }
      .nx-marquee-inner .nx-marquee-track { animation: nx-marquee-scroll linear infinite; white-space: nowrap; }
      @keyframes nx-marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

      .nx-highlight-span { position: relative; }
      .nx-highlight-span::after { content: ''; position: absolute; bottom: 0; left: 0; height: 0.15em; width: 100%; background: var(--nx-primary, #00f5ff); transform: scaleX(0); transform-origin: left; transition: transform 0.4s cubic-bezier(0.23,1,0.32,1); }
      .nx-highlight-span.nx-in::after { transform: scaleX(1); }

      .nx-count-up { font-variant-numeric: tabular-nums; }
      .nx-typewriter-cursor::after { content: '|'; animation: nx-blink 0.7s step-end infinite; color: var(--nx-primary, #00f5ff); }
      @keyframes nx-blink { 50% { opacity: 0; } }
    `;
    document.head.appendChild(s);
  }

  _autoDetect() {
    document.querySelectorAll('[data-nx-split]').forEach(el => {
      const type = el.dataset.nxSplit || 'chars';
      const effect = el.dataset.nxEffect || 'slide';
      this.split(el, { type, effect, trigger: 'scroll' });
    });
    document.querySelectorAll('[data-nx-marquee]').forEach(el => {
      this.marquee(el, { speed: parseFloat(el.dataset.nxMarquee) || 40 });
    });
    document.querySelectorAll('[data-nx-count]').forEach(el => {
      this.countUp(el, parseFloat(el.dataset.nxCount), { trigger: 'scroll' });
    });
  }

  // Split text into chars/words/lines
  split(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const type = options.type || 'chars';
    const effect = options.effect || 'slide';
    const stagger = options.stagger || 30;
    const delay = options.delay || 0;

    el.classList.add(`nx-typo-${effect}`);
    const originalText = el.textContent;
    let html = '';

    if (type === 'chars') {
      originalText.split('').forEach((char, i) => {
        if (char === ' ') { html += ' '; return; }
        html += `<span class="nx-chars-wrap"><span class="nx-char" style="transition-delay:${delay + i * stagger}ms">${char}</span></span>`;
      });
    } else if (type === 'words') {
      originalText.split(' ').forEach((word, i) => {
        html += `<span class="nx-word-wrap"><span class="nx-word nx-char" style="transition-delay:${delay + i * stagger * 3}ms">${word}</span></span> `;
      });
    } else if (type === 'lines') {
      originalText.split('\n').forEach((line, i) => {
        html += `<span class="nx-line-wrap"><span class="nx-line nx-char" style="transition-delay:${delay + i * stagger * 5}ms">${line}</span></span>`;
      });
    }

    el.innerHTML = html;
    this.splitElements.set(el, { type, originalText });

    if (options.trigger === 'scroll') {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          el.querySelectorAll('.nx-char').forEach(c => c.classList.add('nx-in'));
          observer.disconnect();
        }
      }, { threshold: 0.1 });
      observer.observe(el);
    } else if (options.trigger === 'hover') {
      el.addEventListener('mouseenter', () => el.querySelectorAll('.nx-char').forEach(c => c.classList.add('nx-in')));
      el.addEventListener('mouseleave', () => el.querySelectorAll('.nx-char').forEach(c => c.classList.remove('nx-in')));
    } else {
      requestAnimationFrame(() => el.querySelectorAll('.nx-char').forEach(c => c.classList.add('nx-in')));
    }
    return this;
  }

  // Infinite marquee / ticker
  marquee(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const speed = options.speed || 40; // px/s
    const gap = options.gap || 40;
    const direction = options.direction || 'left';
    const pauseOnHover = options.pauseOnHover !== false;

    el.classList.add('nx-kinetic');
    const inner = document.createElement('div');
    inner.className = 'nx-marquee-inner';
    const track = document.createElement('div');
    track.className = 'nx-marquee-track';
    track.innerHTML = el.innerHTML + el.innerHTML; // duplicate
    inner.appendChild(track);
    el.innerHTML = '';
    el.appendChild(inner);

    const trackW = track.scrollWidth / 2;
    const duration = trackW / speed;
    track.style.animationDuration = `${duration}s`;
    track.style.animationDirection = direction === 'right' ? 'reverse' : 'normal';

    if (pauseOnHover) {
      el.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
      el.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
    }
    return this;
  }

  // Kinetic wave text
  wave(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const speed = options.speed || 1.5;
    const amplitude = options.amplitude || 8;
    const chars = el.textContent.split('');

    el.innerHTML = chars.map((c, i) =>
      c === ' ' ? ' ' : `<span class="nx-char" style="display:inline-block">${c}</span>`
    ).join('');

    const spans = el.querySelectorAll('.nx-char');
    let t = 0;
    const animate = () => {
      spans.forEach((span, i) => {
        span.style.transform = `translateY(${Math.sin(t + i * 0.4) * amplitude}px)`;
      });
      t += 0.05 * speed;
      requestAnimationFrame(animate);
    };
    animate();
    return this;
  }

  // Count up animation
  countUp(element, target, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const duration = options.duration || 2000;
    const decimals = options.decimals || 0;
    const prefix = options.prefix || '';
    const suffix = options.suffix || '';
    const ease = t => 1 - Math.pow(1 - t, 3);
    el.classList.add('nx-count-up');

    const run = () => {
      let start = null;
      const from = parseFloat(options.from || 0);
      const step = (ts) => {
        if (!start) start = ts;
        const t = Math.min((ts - start) / duration, 1);
        const val = from + (target - from) * ease(t);
        el.textContent = prefix + val.toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (options.trigger !== false) {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { run(); observer.disconnect(); }
      }, { threshold: 0.5 });
      observer.observe(el);
    } else { run(); }
    return this;
  }

  // Glitch text effect
  glitch(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const original = el.textContent;
    const chars = '!<>-_\\/[]{}—=+*^?#@$%&';
    const iterations = options.iterations || 8;
    let frame = 0;

    const randomize = () => {
      if (frame >= iterations) { el.textContent = original; return; }
      el.textContent = original.split('').map((c, i) => {
        if (i < frame / iterations * original.length) return c;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      frame++;
      setTimeout(randomize, options.speed || 40);
    };

    const trigger = options.trigger || 'hover';
    if (trigger === 'hover') {
      el.addEventListener('mouseenter', () => { frame = 0; randomize(); });
    } else if (trigger === 'auto') {
      setInterval(() => { frame = 0; randomize(); }, options.interval || 3000);
    } else {
      frame = 0; randomize();
    }
    return this;
  }

  // Highlight underline text reveal
  highlight(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.innerHTML = `<span class="nx-highlight-span">${el.innerHTML}</span>`;
    const span = el.querySelector('.nx-highlight-span');
    if (options.color) span.style.setProperty('--nx-primary', options.color);
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { span.classList.add('nx-in'); observer.disconnect(); }
    }, { threshold: 0.5 });
    observer.observe(el);
    return this;
  }

  // Staggered word reveal on scroll
  staggerReveal(element, options = {}) {
    return this.split(element, { type: 'words', effect: 'slide', trigger: 'scroll', stagger: options.stagger || 60, delay: options.delay || 0 });
  }

  // Rotating text (cycle through words)
  rotatingText(element, words, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const interval = options.interval || 2500;
    const duration = options.duration || 400;
    let idx = 0;
    el.style.cssText += `display:inline-block;overflow:hidden;vertical-align:bottom;`;

    const inner = document.createElement('span');
    inner.style.cssText = 'display:inline-block;';
    inner.textContent = words[0];
    el.appendChild(inner);

    setInterval(() => {
      idx = (idx + 1) % words.length;
      inner.style.transition = `transform ${duration}ms cubic-bezier(0.23,1,0.32,1), opacity ${duration}ms ease`;
      inner.style.transform = 'translateY(-100%)';
      inner.style.opacity = '0';
      setTimeout(() => {
        inner.textContent = words[idx];
        inner.style.transition = 'none';
        inner.style.transform = 'translateY(100%)';
        inner.style.opacity = '0';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          inner.style.transition = `transform ${duration}ms cubic-bezier(0.23,1,0.32,1), opacity ${duration}ms ease`;
          inner.style.transform = 'translateY(0)';
          inner.style.opacity = '1';
        }));
      }, duration + 50);
    }, interval);
    return this;
  }

  // 3D flip text
  flipText(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const chars = el.textContent.split('');
    el.innerHTML = chars.map((c, i) =>
      c === ' ' ? ' ' : `<span style="display:inline-block;transition:transform 0.4s ${i * 0.04}s ease">${c}</span>`
    ).join('');
    el.addEventListener('mouseenter', () => {
      el.querySelectorAll('span').forEach(s => s.style.transform = 'rotateY(360deg)');
    });
    el.addEventListener('mouseleave', () => {
      el.querySelectorAll('span').forEach(s => s.style.transform = 'rotateY(0deg)');
    });
    return this;
  }
}

const typographyEngine = new TypographyEngine();
/**
 * NandanX — shaderEngine
 * WebGL shader-based backgrounds: plasma, aurora, fluid, waves, holographic
 */
class ShaderEngine {
  constructor() {
    this.initialized = false;
    this.canvases = [];
  }

  init(options = {}) {
    if (this.initialized) return this;
    this.initialized = true;
    return this;
  }

  _createCanvas(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;`;
    if (options.blend) canvas.style.mixBlendMode = options.blend;
    el.style.position = el.style.position || 'relative';
    el.insertBefore(canvas, el.firstChild);
    canvas.width = el.offsetWidth || window.innerWidth;
    canvas.height = el.offsetHeight || window.innerHeight;
    window.addEventListener('resize', () => {
      canvas.width = el.offsetWidth || window.innerWidth;
      canvas.height = el.offsetHeight || window.innerHeight;
    });
    return canvas;
  }

  _initGL(canvas) {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;
    return gl;
  }

  _compile(gl, vertSrc, fragSrc) {
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('[NandanX Shader]', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const prog = gl.createProgram();
    const vert = compile(gl.VERTEX_SHADER, vertSrc);
    const frag = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vert || !frag) return null;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    return prog;
  }

  _baseSetup(gl, prog) {
    const verts = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  }

  _baseVert() {
    return `attribute vec2 a_position; void main() { gl_Position = vec4(a_position, 0, 1); }`;
  }

  // Plasma / lava lamp effect
  plasma(container, options = {}) {
    const canvas = this._createCanvas(container, options);
    if (!canvas) return this;
    const gl = this._initGL(canvas);
    if (!gl) return this._fallback2D(canvas, 'plasma', options);

    const frag = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float v = 0.0;
        v += sin(uv.x * 8.0 + u_time) * 0.5;
        v += sin(uv.y * 6.0 + u_time * 0.7) * 0.5;
        v += sin((uv.x + uv.y) * 5.0 + u_time * 0.5) * 0.5;
        v += sin(sqrt(pow(uv.x - 0.5, 2.0) + pow(uv.y - 0.5, 2.0)) * 12.0 + u_time) * 0.5;
        v = (sin(v) + 1.0) * 0.5;
        vec3 col = mix(u_color1, u_color2, v);
        gl_FragColor = vec4(col, 0.9);
      }
    `;
    const prog = this._compile(gl, this._baseVert(), frag);
    if (!prog) return this;
    gl.useProgram(prog);
    this._baseSetup(gl, prog);

    const c1 = options.color1 || [0, 0.96, 1];
    const c2 = options.color2 || [0.49, 0.23, 0.93];
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uC1 = gl.getUniformLocation(prog, 'u_color1');
    const uC2 = gl.getUniformLocation(prog, 'u_color2');
    gl.uniform3fv(uC1, c1);
    gl.uniform3fv(uC2, c2);
    const speed = options.speed || 0.8;

    const loop = (t) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, t * 0.001 * speed);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }

  // Fluid / ink diffusion
  fluid(container, options = {}) {
    const canvas = this._createCanvas(container, options);
    if (!canvas) return this;
    const gl = this._initGL(canvas);
    if (!gl) return this._fallback2D(canvas, 'fluid', options);

    const frag = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform vec2 u_mouse;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        vec2 m = u_mouse / u_res;
        float d = distance(uv, m);
        float wave = sin(d * 20.0 - u_time * 3.0) * exp(-d * 5.0);
        vec2 distort = uv + wave * 0.05 * normalize(uv - m);
        float r = sin(distort.x * 5.0 + u_time) * 0.5 + 0.5;
        float g = sin(distort.y * 5.0 + u_time * 0.7 + 2.0) * 0.5 + 0.5;
        float b = sin((distort.x + distort.y) * 5.0 + u_time * 0.5 + 4.0) * 0.5 + 0.5;
        gl_FragColor = vec4(r * 0.1, g * 0.2, b * 0.8, 0.85);
      }
    `;
    const prog = this._compile(gl, this._baseVert(), frag);
    if (!prog) return this;
    gl.useProgram(prog);
    this._baseSetup(gl, prog);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    let mx = canvas.width / 2, my = canvas.height / 2;
    canvas.parentElement.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left; my = canvas.height - (e.clientY - r.top);
    });

    const loop = (t) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }

  // Aurora borealis shader
  aurora(container, options = {}) {
    const canvas = this._createCanvas(container, options);
    if (!canvas) return this;
    const gl = this._initGL(canvas);
    if (!gl) return this;

    const frag = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        float a = hash(i), b = hash(i + vec2(1,0)), c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.3;
        float n = noise(uv * vec2(3.0, 1.0) + vec2(t, 0.0));
        n += 0.5 * noise(uv * vec2(6.0, 2.0) + vec2(t * 1.3, 0.0));
        float band = smoothstep(0.2, 0.8, uv.y) * (1.0 - smoothstep(0.6, 1.0, uv.y));
        float aurora = smoothstep(0.4, 0.6, n) * band;
        vec3 col1 = vec3(0.0, 0.9, 0.6);
        vec3 col2 = vec3(0.3, 0.1, 0.8);
        vec3 col3 = vec3(0.0, 0.6, 1.0);
        float t2 = sin(uv.x * 3.0 + t) * 0.5 + 0.5;
        vec3 auroraColor = mix(mix(col1, col2, t2), col3, aurora * 0.5);
        gl_FragColor = vec4(auroraColor * aurora, aurora * 0.8);
      }
    `;
    const prog = this._compile(gl, this._baseVert(), frag);
    if (!prog) return this;
    gl.useProgram(prog);
    this._baseSetup(gl, prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');

    const loop = (t) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }

  // Wave distortion background
  waves(container, options = {}) {
    const canvas = this._createCanvas(container, options);
    if (!canvas) return this;
    const gl = this._initGL(canvas);
    if (!gl) return this;

    const frag = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform vec3 u_color;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float wave = 0.0;
        for(int i = 1; i <= 5; i++) {
          float fi = float(i);
          wave += sin(uv.x * fi * 4.0 + u_time * fi * 0.4) * (0.3 / fi);
        }
        float y = uv.y + wave * 0.15;
        float band1 = smoothstep(0.45, 0.55, y);
        float band2 = smoothstep(0.55, 0.65, y);
        vec3 col = mix(u_color * 0.2, u_color, 1.0 - band1);
        col = mix(col, u_color * 0.5, band2);
        gl_FragColor = vec4(col, 0.7);
      }
    `;
    const prog = this._compile(gl, this._baseVert(), frag);
    if (!prog) return this;
    gl.useProgram(prog);
    this._baseSetup(gl, prog);

    const c = options.color || [0, 0.96, 1];
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uColor = gl.getUniformLocation(prog, 'u_color');
    gl.uniform3fv(uColor, c);

    const loop = (t) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }

  // Holographic iridescent shader
  holographic(container, options = {}) {
    const canvas = this._createCanvas(container, options);
    if (!canvas) return this;
    const gl = this._initGL(canvas);
    if (!gl) return this;

    const frag = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform vec2 u_mouse;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        vec2 m = u_mouse / u_res;
        vec2 d = uv - m;
        float angle = atan(d.y, d.x);
        float dist = length(d);
        float holo = sin(angle * 5.0 + u_time * 2.0) * 0.5 + 0.5;
        holo *= sin(dist * 20.0 - u_time) * 0.5 + 0.5;
        float r = sin(holo * 6.28 + 0.0) * 0.5 + 0.5;
        float g = sin(holo * 6.28 + 2.09) * 0.5 + 0.5;
        float b = sin(holo * 6.28 + 4.19) * 0.5 + 0.5;
        gl_FragColor = vec4(r, g, b, holo * 0.6);
      }
    `;
    const prog = this._compile(gl, this._baseVert(), frag);
    if (!prog) return this;
    gl.useProgram(prog);
    this._baseSetup(gl, prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    let mx = canvas.width / 2, my = canvas.height / 2;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = window.innerHeight - e.clientY; });

    const loop = (t) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }

  _fallback2D(canvas, type, options) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    const colors = options.colors || ['#00f5ff', '#7c3aed', '#ff006e'];
    let t = 0;
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, w, h);
      colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      t += 0.01;
      requestAnimationFrame(loop);
    };
    loop();
    return this;
  }

  // Custom shader from string
  custom(container, fragShader, uniforms = {}, options = {}) {
    const canvas = this._createCanvas(container, options);
    if (!canvas) return this;
    const gl = this._initGL(canvas);
    if (!gl) return this;
    const prog = this._compile(gl, this._baseVert(), fragShader);
    if (!prog) return this;
    gl.useProgram(prog);
    this._baseSetup(gl, prog);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    let mx = 0.5, my = 0.5;
    document.addEventListener('mousemove', e => { mx = e.clientX / window.innerWidth; my = 1 - e.clientY / window.innerHeight; });

    const loop = (t) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mx * canvas.width, my * canvas.height);
      Object.keys(uniforms).forEach(k => {
        const u = gl.getUniformLocation(prog, k);
        const v = uniforms[k];
        if (Array.isArray(v)) gl[`uniform${v.length}fv`](u, v);
        else gl.uniform1f(u, v);
      });
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }
}

const shaderEngine = new ShaderEngine();
/**
 * NandanX — particleSystemEngine
 * Advanced particle systems: fire, smoke, stars, confetti, snow, bubbles, dust
 */
class ParticleSystemEngine {
  constructor() {
    this.initialized = false;
    this.systems = new Map();
    this.canvas = null;
    this.ctx = null;
    this.raf = null;
  }

  init(options = {}) {
    if (this.initialized) return this;
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9990;';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return this;
    this._resize();
    window.addEventListener('resize', () => this._resize());
    this._loop();
    this.initialized = true;
    return this;
  }

  _ensureInit() { if (!this.initialized) this.init(); }

  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _loop() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.systems.forEach((system, id) => {
      system.update();
      system.draw(ctx);
      if (system.done) this.systems.delete(id);
    });
    this.raf = requestAnimationFrame(() => this._loop());
  }

  _uid() { return Math.random().toString(36).slice(2); }

  // Fire effect
  fire(x, y, options = {}) {
    this._ensureInit();
    const count = options.count || 80;
    const id = this._uid();
    const particles = [];
    const w = options.width || 60;
    const color1 = options.color1 || '#ff6600';
    const color2 = options.color2 || '#ffcc00';
    const onCanvas = options.canvas;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * w,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(Math.random() * 4 + 2),
        life: 1,
        decay: Math.random() * 0.015 + 0.01,
        size: Math.random() * 12 + 4,
      });
    }

    const system = {
      done: false,
      update: () => {
        particles.forEach(p => {
          p.x += p.vx + Math.sin(Date.now() * 0.003 + p.y) * 0.3;
          p.y += p.vy;
          p.vy += 0.05;
          p.size *= 0.98;
          p.life -= p.decay;
          if (p.life <= 0) {
            p.life = 1;
            p.x = x + (Math.random() - 0.5) * w;
            p.y = y;
            p.vy = -(Math.random() * 4 + 2);
            p.size = Math.random() * 12 + 4;
          }
        });
      },
      draw: (ctx) => {
        particles.forEach(p => {
          const alpha = Math.max(0, p.life);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `rgba(255,255,180,${alpha})`);
          grad.addColorStop(0.4, color2.replace(')', `,${alpha})`).replace('rgb', 'rgba'));
          grad.addColorStop(1, `rgba(255,50,0,0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        });
      },
    };

    this.systems.set(id, system);
    if (options.duration) setTimeout(() => this.systems.delete(id), options.duration);
    return { id, stop: () => this.systems.delete(id) };
  }

  // Snow effect
  snow(options = {}) {
    this._ensureInit();
    const count = options.count || 120;
    const id = this._uid();
    const w = this.canvas.width, h = this.canvas.height;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 4 + 1,
      vy: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.5,
      wobble: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.5 + 0.5,
    }));

    const system = {
      done: false,
      update: () => {
        particles.forEach(p => {
          p.wobble += 0.02;
          p.x += p.vx + Math.sin(p.wobble) * 0.5;
          p.y += p.vy;
          if (p.y > this.canvas.height + 10) { p.y = -10; p.x = Math.random() * this.canvas.width; }
          if (p.x > this.canvas.width + 10) p.x = -10;
          if (p.x < -10) p.x = this.canvas.width + 10;
        });
      },
      draw: (ctx) => {
        ctx.save();
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
          ctx.fill();
        });
        ctx.restore();
      },
    };
    this.systems.set(id, system);
    return { id, stop: () => this.systems.delete(id) };
  }

  // Confetti burst
  confetti(x, y, options = {}) {
    this._ensureInit();
    const count = options.count || 80;
    const colors = options.colors || ['#ff006e', '#00f5ff', '#00ff88', '#ffcc00', '#ff6600', '#7c3aed'];
    const id = this._uid();
    const particles = Array.from({ length: count }, () => ({
      x, y,
      vx: (Math.random() - 0.5) * 12,
      vy: -(Math.random() * 10 + 5),
      rotation: Math.random() * 360,
      rotVel: (Math.random() - 0.5) * 8,
      w: Math.random() * 12 + 4,
      h: Math.random() * 6 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
      gravity: 0.25,
    }));

    const system = {
      done: false,
      update: () => {
        let allDead = true;
        particles.forEach(p => {
          p.x += p.vx;
          p.vy += p.gravity;
          p.y += p.vy;
          p.rotation += p.rotVel;
          p.life -= 0.008;
          if (p.life > 0) allDead = false;
        });
        if (allDead) system.done = true;
      },
      draw: (ctx) => {
        particles.forEach(p => {
          if (p.life <= 0) return;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation * Math.PI / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
      },
    };
    this.systems.set(id, system);
    return { id, stop: () => this.systems.delete(id) };
  }

  // Star field
  starfield(options = {}) {
    this._ensureInit();
    const count = options.count || 200;
    const speed = options.speed || 0.5;
    const id = this._uid();
    const cx = this.canvas.width / 2, cy = this.canvas.height / 2;

    const stars = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * this.canvas.width * 2,
      y: (Math.random() - 0.5) * this.canvas.height * 2,
      z: Math.random() * this.canvas.width,
      pz: 0,
    }));

    const system = {
      done: false,
      update: () => {
        stars.forEach(s => {
          s.pz = s.z;
          s.z -= speed * 3;
          if (s.z <= 0) {
            s.x = (Math.random() - 0.5) * this.canvas.width * 2;
            s.y = (Math.random() - 0.5) * this.canvas.height * 2;
            s.z = this.canvas.width;
            s.pz = s.z;
          }
        });
      },
      draw: (ctx) => {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        stars.forEach(s => {
          const sx = (s.x / s.z) * this.canvas.width + cx;
          const sy = (s.y / s.z) * this.canvas.height + cy;
          const px = (s.x / s.pz) * this.canvas.width + cx;
          const py = (s.y / s.pz) * this.canvas.height + cy;
          const size = Math.max(0.5, (1 - s.z / this.canvas.width) * 3);
          const alpha = 1 - s.z / this.canvas.width;
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = size;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        });
        ctx.restore();
      },
    };
    this.systems.set(id, system);
    return { id, stop: () => this.systems.delete(id) };
  }

  // Smoke / dust
  smoke(x, y, options = {}) {
    this._ensureInit();
    const count = options.count || 30;
    const color = options.color || 'rgba(150,150,150,';
    const id = this._uid();

    const particles = Array.from({ length: count }, () => ({
      x: x + (Math.random() - 0.5) * 20,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(Math.random() * 1.5 + 0.5),
      size: Math.random() * 20 + 10,
      life: 1,
      decay: Math.random() * 0.005 + 0.003,
    }));

    const system = {
      done: false,
      update: () => {
        let allDead = true;
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.size += 0.4;
          p.vx *= 0.99;
          p.life -= p.decay;
          if (p.life > 0) allDead = false;
        });
        if (allDead) system.done = true;
      },
      draw: (ctx) => {
        particles.forEach(p => {
          if (p.life <= 0) return;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          g.addColorStop(0, color + (p.life * 0.3) + ')');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        });
      },
    };
    this.systems.set(id, system);
    return { id, stop: () => this.systems.delete(id) };
  }

  // Bubbles floating up
  bubbles(container, options = {}) {
    this._ensureInit();
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    const rect = el ? el.getBoundingClientRect() : { x: 0, y: window.innerHeight, width: window.innerWidth };
    const count = options.count || 20;
    const color = options.color || '#00f5ff';
    const id = this._uid();

    const spawn = () => ({
      x: rect.left + Math.random() * rect.width,
      y: rect.bottom || window.innerHeight,
      size: Math.random() * 12 + 4,
      vy: -(Math.random() * 1.5 + 0.5),
      vx: (Math.random() - 0.5) * 0.5,
      life: 1,
      decay: Math.random() * 0.003 + 0.002,
      wobble: Math.random() * Math.PI * 2,
    });

    const particles = Array.from({ length: count }, spawn);
    const system = {
      done: false,
      update: () => {
        particles.forEach(p => {
          p.wobble += 0.05;
          p.x += p.vx + Math.sin(p.wobble) * 0.5;
          p.y += p.vy;
          p.life -= p.decay;
          if (p.life <= 0) Object.assign(p, spawn());
        });
      },
      draw: (ctx) => {
        particles.forEach(p => {
          ctx.save();
          ctx.globalAlpha = p.life * 0.6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          // Shine
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${p.life * 0.4})`;
          ctx.fill();
          ctx.restore();
        });
      },
    };
    this.systems.set(id, system);
    return { id, stop: () => this.systems.delete(id) };
  }

  // Click-triggered confetti burst
  clickConfetti(target, options = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return this;
    el.addEventListener('click', (e) => {
      this.confetti(e.clientX, e.clientY, options);
    });
    return this;
  }

  stop(id) {
    if (id) this.systems.delete(id);
    else this.systems.clear();
    return this;
  }
}

const particleSystemEngine = new ParticleSystemEngine();
/**
 * NandanX — physicsWorldEngine
 * 2D physics: gravity, bounce, collision, spring, rope, inertia, ragdoll
 */
class PhysicsWorldEngine {
  constructor() {
    this.initialized = false;
    this.bodies = [];
    this.constraints = [];
    this.gravity = { x: 0, y: 0.5 };
    this.canvas = null;
    this.ctx = null;
    this.raf = null;
    this.paused = false;
    this.bounds = null;
    this.debug = false;
  }

  init(options = {}) {
    if (this.initialized) return this;
    this.gravity = options.gravity || { x: 0, y: 0.5 };
    this.debug = options.debug || false;
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-physworld-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-physworld-styles';
    s.textContent = `
      .nx-physics-body { position: absolute; will-change: transform; cursor: grab; }
      .nx-physics-body:active { cursor: grabbing; }
      .nx-physics-canvas { position: absolute; top: 0; left: 0; pointer-events: none; }
    `;
    document.head.appendChild(s);
  }

  // Create a DOM element physics body
  createBody(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const body = {
      el,
      x: options.x !== undefined ? options.x : rect.left + rect.width / 2,
      y: options.y !== undefined ? options.y : rect.top + rect.height / 2,
      vx: options.vx || 0,
      vy: options.vy || 0,
      mass: options.mass || 1,
      restitution: options.restitution !== undefined ? options.restitution : 0.6,
      friction: options.friction !== undefined ? options.friction : 0.98,
      w: rect.width,
      h: rect.height,
      fixed: options.fixed || false,
      sleeping: false,
      sleepCounter: 0,
      userData: options.userData || {},
    };
    el.style.position = 'fixed';
    el.style.left = '0px';
    el.style.top = '0px';
    el.style.transform = `translate(${body.x - body.w / 2}px, ${body.y - body.h / 2}px)`;
    el.style.willChange = 'transform';
    if (options.draggable !== false) this._makeDraggable(body);
    this.bodies.push(body);
    if (!this.raf) this._loop();
    return body;
  }

  _makeDraggable(body) {
    let isDragging = false, ox = 0, oy = 0;
    body.el.addEventListener('mousedown', (e) => {
      isDragging = true;
      ox = e.clientX - body.x;
      oy = e.clientY - body.y;
      body.vx = 0; body.vy = 0;
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      body.x = e.clientX - ox;
      body.y = e.clientY - oy;
      body.vx = 0; body.vy = 0;
    });
    document.addEventListener('mouseup', () => { isDragging = false; });
  }

  _loop() {
    if (!this.ctx) return;
    if (this.paused) { this.raf = requestAnimationFrame(() => this._loop()); return; }

    this.bodies.forEach(b => {
      if (b.fixed) return;
      // Gravity
      b.vx += this.gravity.x / b.mass;
      b.vy += this.gravity.y / b.mass;
      // Friction
      b.vx *= b.friction;
      b.vy *= b.friction;
      // Integrate
      b.x += b.vx;
      b.y += b.vy;
      // Bounds
      const bnd = this.bounds || { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight };
      // Floor
      if (b.y + b.h / 2 > bnd.y + bnd.h) {
        b.y = bnd.y + bnd.h - b.h / 2;
        b.vy *= -b.restitution;
        b.vx *= 0.85;
      }
      // Ceiling
      if (b.y - b.h / 2 < bnd.y) { b.y = bnd.y + b.h / 2; b.vy *= -b.restitution; }
      // Walls
      if (b.x - b.w / 2 < bnd.x) { b.x = bnd.x + b.w / 2; b.vx *= -b.restitution; }
      if (b.x + b.w / 2 > bnd.x + bnd.w) { b.x = bnd.x + bnd.w - b.w / 2; b.vx *= -b.restitution; }

      // Update DOM
      b.el.style.transform = `translate(${b.x - b.w / 2}px, ${b.y - b.h / 2}px)`;
    });

    // Constraints (springs/ropes)
    this.constraints.forEach(c => this._solveConstraint(c));

    this.raf = requestAnimationFrame(() => this._loop());
  }

  _solveConstraint(c) {
    const a = c.a, b = c.b;
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;
    const force = (dist - c.length) * c.stiffness;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    if (!a.fixed) { a.vx += fx / a.mass; a.vy += fy / a.mass; }
    if (!b.fixed) { b.vx -= fx / b.mass; b.vy -= fy / b.mass; }

    if (c.type === 'rope' && dist > c.length) {
      const correction = (dist - c.length) / 2;
      const nx = dx / dist * correction;
      const ny = dy / dist * correction;
      if (!a.fixed) { a.x += nx; a.y += ny; }
      if (!b.fixed) { b.x -= nx; b.y -= ny; }
    }
  }

  spring(bodyA, bodyB, options = {}) {
    this.constraints.push({
      a: bodyA, b: bodyB,
      length: options.length || 100,
      stiffness: options.stiffness || 0.1,
      type: 'spring',
    });
    return this;
  }

  rope(bodyA, bodyB, options = {}) {
    this.constraints.push({
      a: bodyA, b: bodyB,
      length: options.length || 120,
      stiffness: options.stiffness || 0.8,
      type: 'rope',
    });
    return this;
  }

  applyForce(body, fx, fy) {
    body.vx += fx / body.mass;
    body.vy += fy / body.mass;
    return this;
  }

  applyImpulse(body, fx, fy) {
    body.vx += fx;
    body.vy += fy;
    return this;
  }

  explosion(x, y, radius, force, options = {}) {
    this.bodies.forEach(b => {
      if (b.fixed) return;
      const dx = b.x - x, dy = b.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius && dist > 0) {
        const f = (1 - dist / radius) * force;
        b.vx += (dx / dist) * f / b.mass;
        b.vy += (dy / dist) * f / b.mass;
      }
    });
    return this;
  }

  setBounds(x, y, w, h) {
    this.bounds = { x, y, w, h };
    return this;
  }

  // Cloth simulation (grid of constrained points)
  cloth(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const cols = options.cols || 20;
    const rows = options.rows || 15;
    const segW = (el.offsetWidth || 400) / cols;
    const segH = (el.offsetHeight || 300) / rows;
    const rect = el.getBoundingClientRect();

    const canvas = document.createElement('canvas');
    canvas.className = 'nx-physics-canvas';
    canvas.width = el.offsetWidth;
    canvas.height = el.offsetHeight;
    el.style.position = 'relative';
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const points = [];
    const constraints = [];

    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        points.push({
          x: c * segW,
          y: r * segH,
          px: c * segW,
          py: r * segH,
          pinned: r === 0,
          vx: 0, vy: 0,
        });
      }
    }

    const getIdx = (r, c) => r * (cols + 1) + c;
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        if (c < cols) constraints.push([getIdx(r, c), getIdx(r, c + 1), segW]);
        if (r < rows) constraints.push([getIdx(r, c), getIdx(r + 1, c), segH]);
      }
    }

    const wind = options.wind || 0.1;
    const gravity = options.gravity || 0.4;
    const damping = 0.99;

    document.addEventListener('mousemove', (e) => {
      const rx = e.clientX - rect.left;
      const ry = e.clientY - rect.top;
      points.forEach(p => {
        if (p.pinned) return;
        const dx = rx - p.x, dy = ry - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 30) { p.x += dx * 0.15; p.y += dy * 0.15; }
      });
    });

    const update = () => {
      points.forEach(p => {
        if (p.pinned) return;
        const vx = (p.x - p.px) * damping + (Math.random() - 0.4) * wind;
        const vy = (p.y - p.py) * damping + gravity;
        p.px = p.x; p.py = p.y;
        p.x += vx; p.y += vy;
        if (p.y > canvas.height) { p.y = canvas.height; p.py = p.y; }
      });
      for (let iter = 0; iter < 3; iter++) {
        constraints.forEach(([ai, bi, len]) => {
          const a = points[ai], b = points[bi];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx*dx + dy*dy) || 0.001;
          const diff = (dist - len) / dist / 2;
          if (!a.pinned) { a.x += dx * diff; a.y += dy * diff; }
          if (!b.pinned) { b.x -= dx * diff; b.y -= dy * diff; }
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = options.color || 'rgba(0,245,255,0.5)';
      ctx.lineWidth = 1;
      constraints.forEach(([ai, bi]) => {
        const a = points[ai], b = points[bi];
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
    };

    const loop = () => { update(); draw(); requestAnimationFrame(loop); };
    loop();
    return this;
  }

  pause() { this.paused = true; return this; }
  resume() { this.paused = false; return this; }

  remove(body) {
    this.bodies = this.bodies.filter(b => b !== body);
    return this;
  }

  clear() {
    this.bodies = [];
    this.constraints = [];
    cancelAnimationFrame(this.raf);
    this.raf = null;
    return this;
  }
}

const physicsWorldEngine = new PhysicsWorldEngine();
/**
 * NandanX — cursorFXEngine
 * Advanced cursor effects: trails, spotlights, magnetic, ink, ripple glow
 */
class CursorFXEngine {
  constructor() {
    this.initialized = false;
    this.effects = new Map();
    this.mx = -100; this.my = -100;
    this.canvas = null;
    this.ctx = null;
    this.raf = null;
    this.trails = [];
    this.activeEffects = new Set();
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this._trackMouse();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-cursorfx-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-cursorfx-styles';
    s.textContent = `
      .nx-cursor-dot { position: fixed; pointer-events: none; z-index: 99999; border-radius: 50%; mix-blend-mode: difference; }
      .nx-cursor-ring { position: fixed; pointer-events: none; z-index: 99998; border-radius: 50%; border: 2px solid; transition: width 0.2s, height 0.2s; }
      .nx-cursor-text { position: fixed; pointer-events: none; z-index: 99999; font-size: 11px; font-weight: 700; white-space: nowrap; transform: translate(-50%, -50%); }
      .nx-cursor-emoji { position: fixed; pointer-events: none; z-index: 99999; font-size: 24px; transform: translate(-50%, -50%); transition: transform 0.1s; }
      .nx-cursor-spotlight { position: fixed; pointer-events: none; z-index: 9; border-radius: 50%; mix-blend-mode: screen; transform: translate(-50%, -50%); }
      .nx-cursor-blob { position: fixed; pointer-events: none; z-index: 9998; border-radius: 50%; filter: blur(20px); opacity: 0.4; transform: translate(-50%, -50%); }
      body.nx-cursor-hidden { cursor: none !important; }
      body.nx-cursor-hidden * { cursor: none !important; }
    `;
    document.head.appendChild(s);
  }

  _trackMouse() {
    document.addEventListener('mousemove', (e) => {
      this.mx = e.clientX;
      this.my = e.clientY;
    }, { passive: true });
  }

  // Canvas-based trail setup
  _setupCanvas() {
    if (this.canvas) return;
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99990;';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
    if (!this.raf) this._loop();
  }

  _loop() {
    if (!this.ctx) return;
    if (!this.ctx) { this.raf = requestAnimationFrame(() => this._loop()); return; }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Draw all active canvas effects
    this.activeEffects.forEach(fn => fn(this.ctx));
    this.raf = requestAnimationFrame(() => this._loop());
  }

  // Pixel / comet trail
  trail(options = {}) {
    this._setupCanvas();
    const color = options.color || '#00f5ff';
    const length = options.length || 20;
    const size = options.size || 4;
    const points = [];

    document.addEventListener('mousemove', (e) => {
      points.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (points.length > length) points.shift();
    }, { passive: true });

    const draw = (ctx) => {
      points.forEach((p, i) => {
        const alpha = (i / points.length) * p.life;
        const s = size * (i / points.length);
        ctx.beginPath();
        ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
        ctx.fillStyle = color.includes('rgb') ? color : this._hexToRgba(color, alpha);
        ctx.fill();
      });
    };
    this.activeEffects.add(draw);
    return { stop: () => this.activeEffects.delete(draw) };
  }

  // Rainbow trail
  rainbowTrail(options = {}) {
    this._setupCanvas();
    const points = [];
    const len = options.length || 30;

    document.addEventListener('mousemove', (e) => {
      points.push({ x: e.clientX, y: e.clientY });
      if (points.length > len) points.shift();
    }, { passive: true });

    const draw = (ctx) => {
      points.forEach((p, i) => {
        const hue = (i / points.length) * 360;
        const alpha = i / points.length;
        const size = (i / points.length) * (options.size || 6);
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue},100%,60%,${alpha})`;
        ctx.fill();
      });
    };
    this.activeEffects.add(draw);
    return { stop: () => this.activeEffects.delete(draw) };
  }

  // Glow spotlight following cursor
  spotlight(options = {}) {
    const size = options.size || 300;
    const color = options.color || 'rgba(0,245,255,0.08)';
    const el = document.createElement('div');
    el.className = 'nx-cursor-spotlight';
    el.style.cssText = `width:${size}px;height:${size}px;background:radial-gradient(circle, ${color} 0%, transparent 70%);`;
    document.body.appendChild(el);

    const ease = options.ease || 0.1;
    let cx = -500, cy = -500;

    const update = () => {
      cx += (this.mx - cx) * ease;
      cy += (this.my - cy) * ease;
      el.style.left = cx + 'px';
      el.style.top = cy + 'px';
      requestAnimationFrame(update);
    };
    update();
    return { el, stop: () => el.remove() };
  }

  // Magnetic blob cursor
  blob(options = {}) {
    const size = options.size || 60;
    const color = options.color || '#00f5ff';
    const el = document.createElement('div');
    el.className = 'nx-cursor-blob';
    el.style.cssText = `width:${size}px;height:${size}px;background:${color};`;
    document.body.appendChild(el);

    const ease = options.ease || 0.12;
    let cx = -100, cy = -100;

    const update = () => {
      cx += (this.mx - cx) * ease;
      cy += (this.my - cy) * ease;
      el.style.left = cx + 'px';
      el.style.top = cy + 'px';
      requestAnimationFrame(update);
    };
    update();
    document.body.classList.add('nx-cursor-hidden');
    return { el, stop: () => { el.remove(); document.body.classList.remove('nx-cursor-hidden'); } };
  }

  // Dot + ring cursor (standard premium cursor)
  dotRing(options = {}) {
    document.body.classList.add('nx-cursor-hidden');
    const dot = document.createElement('div');
    dot.className = 'nx-cursor-dot';
    dot.style.cssText = `width:8px;height:8px;background:${options.color || '#ffffff'};transform:translate(-50%,-50%);`;

    const ring = document.createElement('div');
    ring.className = 'nx-cursor-ring';
    ring.style.cssText = `width:36px;height:36px;border-color:${options.ringColor || '#00f5ff'};transform:translate(-50%,-50%);`;

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let rx = -100, ry = -100;
    const ease = options.ease || 0.15;

    const update = () => {
      dot.style.left = this.mx + 'px';
      dot.style.top = this.my + 'px';
      rx += (this.mx - rx) * ease;
      ry += (this.my - ry) * ease;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(update);
    };
    update();

    // Hover effect on clickable elements
    document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.style.width = '60px'; ring.style.height = '60px';
        ring.style.opacity = '0.5';
      });
      el.addEventListener('mouseleave', () => {
        ring.style.width = '36px'; ring.style.height = '36px';
        ring.style.opacity = '1';
      });
    });

    return { dot, ring, stop: () => { dot.remove(); ring.remove(); document.body.classList.remove('nx-cursor-hidden'); } };
  }

  // Emoji cursor
  emoji(char, options = {}) {
    document.body.classList.add('nx-cursor-hidden');
    const el = document.createElement('div');
    el.className = 'nx-cursor-emoji';
    el.textContent = char;
    document.body.appendChild(el);

    const ease = options.ease || 0.3;
    let cx = -100, cy = -100;

    const update = () => {
      cx += (this.mx - cx) * ease;
      cy += (this.my - cy) * ease;
      el.style.left = cx + 'px';
      el.style.top = cy + 'px';
      requestAnimationFrame(update);
    };
    update();
    return { el, stop: () => { el.remove(); document.body.classList.remove('nx-cursor-hidden'); } };
  }

  // Text label that follows cursor
  textLabel(text, options = {}) {
    const el = document.createElement('div');
    el.className = 'nx-cursor-text';
    el.textContent = text;
    el.style.cssText = `color:${options.color || '#fff'};background:${options.bg || 'rgba(0,0,0,0.7)'};padding:4px 10px;border-radius:20px;font-family:monospace;`;
    document.body.appendChild(el);
    const offset = options.offset || { x: 16, y: -16 };

    const update = () => {
      el.style.left = (this.mx + offset.x) + 'px';
      el.style.top = (this.my + offset.y) + 'px';
      requestAnimationFrame(update);
    };
    update();
    return { el, stop: () => el.remove(), update: (t) => { el.textContent = t; } };
  }

  // Ink splatter on click
  inkSplatter(options = {}) {
    this._setupCanvas();
    const color = options.color || '#00f5ff';
    const splatters = [];

    document.addEventListener('click', (e) => {
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.5;
        const speed = Math.random() * 8 + 3;
        splatters.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 8 + 3,
          life: 1,
        });
      }
    });

    const draw = (ctx) => {
      splatters.forEach((s, i) => {
        s.x += s.vx; s.y += s.vy;
        s.vy += 0.3;
        s.vx *= 0.95; s.vy *= 0.95;
        s.life -= 0.02;
        if (s.life <= 0) { splatters.splice(i, 1); return; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fillStyle = this._hexToRgba(color, s.life);
        ctx.fill();
      });
    };
    this.activeEffects.add(draw);
    return { stop: () => this.activeEffects.delete(draw) };
  }

  // Cursor-reactive elements (elements follow or react to cursor)
  reactive(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    const strength = options.strength || 0.3;
    const ease = options.ease || 0.1;
    const type = options.type || 'magnetic';

    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      let cx = rect.left + rect.width / 2;
      let cy = rect.top + rect.height / 2;
      let tx = cx, ty = cy;

      document.addEventListener('mousemove', (e) => {
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const radius = options.radius || 120;
        if (dist < radius) {
          tx = cx + dx * strength;
          ty = cy + dy * strength;
        } else {
          tx = cx; ty = cy;
        }
      });

      const update = () => {
        const x = parseFloat(el.style.transform.match(/translateX\((.*?)px/)?.[1] || 0);
        const y = parseFloat(el.style.transform.match(/translateY\((.*?)px/)?.[1] || 0);
        const nx = x + (tx - cx - x) * ease;
        const ny = y + (ty - cy - y) * ease;
        if (type === 'magnetic') {
          el.style.transform = `translate(${nx}px, ${ny}px)`;
        } else if (type === 'tilt') {
          const rotX = ny * 0.1;
          const rotY = -nx * 0.1;
          el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        }
        requestAnimationFrame(update);
      };
      update();
    });
    return this;
  }

  _hexToRgba(hex, alpha) {
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}

const cursorFXEngine = new CursorFXEngine();
/**
 * NandanX — glitchEngine
 * Glitch effects: RGB split, scanlines, VHS, pixel corruption, digital noise
 */
class GlitchEngine {
  constructor() {
    this.initialized = false;
    this.activeGlitches = new Map();
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-glitch-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-glitch-styles';
    s.textContent = `
      .nx-glitch { position: relative; }
      .nx-glitch::before, .nx-glitch::after {
        content: attr(data-text);
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        overflow: hidden;
      }
      .nx-glitch::before {
        color: #ff006e; clip: rect(0, 0, 0, 0);
        animation: nx-glitch-1 2s infinite linear alternate-reverse;
      }
      .nx-glitch::after {
        color: #00f5ff; clip: rect(0, 0, 0, 0);
        animation: nx-glitch-2 2s infinite linear alternate-reverse;
      }
      @keyframes nx-glitch-1 {
        0% { clip: rect(22px, 9999px, 56px, 0); transform: translate(-4px); }
        20% { clip: rect(73px, 9999px, 89px, 0); transform: translate(4px); }
        40% { clip: rect(12px, 9999px, 28px, 0); transform: translate(-2px); }
        60% { clip: rect(85px, 9999px, 91px, 0); transform: translate(3px); }
        80% { clip: rect(45px, 9999px, 68px, 0); transform: translate(-3px); }
        100% { clip: rect(31px, 9999px, 47px, 0); transform: translate(2px); }
      }
      @keyframes nx-glitch-2 {
        0% { clip: rect(65px, 9999px, 99px, 0); transform: translate(4px); }
        20% { clip: rect(15px, 9999px, 35px, 0); transform: translate(-4px); }
        40% { clip: rect(78px, 9999px, 95px, 0); transform: translate(2px); }
        60% { clip: rect(8px, 9999px, 24px, 0); transform: translate(-2px); }
        80% { clip: rect(55px, 9999px, 72px, 0); transform: translate(4px); }
        100% { clip: rect(38px, 9999px, 58px, 0); transform: translate(-3px); }
      }
      .nx-glitch-hover::before, .nx-glitch-hover::after { animation: none; }
      .nx-glitch-hover:hover::before { animation: nx-glitch-1 0.3s steps(2) infinite; }
      .nx-glitch-hover:hover::after { animation: nx-glitch-2 0.3s steps(2) infinite; }

      .nx-scanlines {
        position: relative;
        overflow: hidden;
      }
      .nx-scanlines::after {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
          0deg, transparent, transparent 2px,
          rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px
        );
        pointer-events: none;
        z-index: 10;
      }
      .nx-vhs {
        position: relative;
        overflow: hidden;
      }
      .nx-vhs::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 3px;
        background: rgba(255,255,255,0.15);
        z-index: 10;
        animation: nx-vhs-scan 3s linear infinite;
        pointer-events: none;
      }
      @keyframes nx-vhs-scan {
        from { top: -3px; }
        to { top: 100%; }
      }
      .nx-chromatic { filter: url(#nx-chromatic-aberration); }
      .nx-pixel-glitch { image-rendering: pixelated; }

      .nx-hologram {
        position: relative;
        overflow: hidden;
      }
      .nx-hologram::before {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
          0deg, transparent, transparent 6px,
          rgba(0,245,255,0.03) 6px, rgba(0,245,255,0.03) 7px
        );
        pointer-events: none;
        z-index: 5;
        animation: nx-holo-flicker 4s infinite;
      }
      @keyframes nx-holo-flicker {
        0%,100% { opacity: 1; }
        92% { opacity: 1; }
        93% { opacity: 0.6; }
        94% { opacity: 1; }
        96% { opacity: 0.3; }
        97% { opacity: 1; }
      }

      .nx-glitch-block { position: relative; overflow: hidden; }
      @keyframes nx-block-glitch {
        0% { transform: translate(0); }
        10% { transform: translate(-3px, 2px); clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%); }
        20% { transform: translate(3px, -2px); }
        30% { transform: translate(0); }
        60% { transform: translate(2px, 1px); clip-path: polygon(0 60%, 100% 60%, 100% 75%, 0 75%); }
        70% { transform: translate(-2px, -1px); }
        80% { transform: translate(0); }
      }
    `;
    document.head.appendChild(s);
    this._injectSVGFilters();
  }

  _injectSVGFilters() {
    if (document.getElementById('nx-svg-filters')) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'nx-svg-filters';
    svg.style.cssText = 'position:absolute;width:0;height:0;';
    svg.innerHTML = `
      <defs>
        <filter id="nx-chromatic-aberration">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" in="SourceGraphic"/>
          <feOffset dx="-3" dy="0" in="red" result="red-shift"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" in="SourceGraphic"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" in="SourceGraphic"/>
          <feOffset dx="3" dy="0" in="blue" result="blue-shift"/>
          <feMerge><feMergeNode in="red-shift"/><feMergeNode in="green"/><feMergeNode in="blue-shift"/></feMerge>
        </filter>
        <filter id="nx-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
          <feBlend in="SourceGraphic" mode="multiply"/>
        </filter>
        <filter id="nx-vhs-distort">
          <feTurbulence type="turbulence" baseFrequency="0.0 0.02" numOctaves="1" result="turbulence"/>
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="5" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
    `;
    document.body.insertBefore(svg, document.body.firstChild);
  }

  _autoDetect() {
    document.querySelectorAll('[data-nx-glitch]').forEach(el => {
      const type = el.dataset.nxGlitch || 'text';
      this[type]?.(el);
    });
  }

  // CSS glitch text
  text(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.dataset.text = el.textContent;
    if (options.hover) el.classList.add('nx-glitch', 'nx-glitch-hover');
    else el.classList.add('nx-glitch');
    el.style.color = options.color || '#e2e8f0';
    return this;
  }

  // Canvas-based RGB split glitch on any element
  rgbSplit(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.style.filter = 'url(#nx-chromatic-aberration)';
    if (options.animate) {
      let on = true;
      setInterval(() => {
        el.style.filter = on ? 'url(#nx-chromatic-aberration)' : 'none';
        on = !on;
      }, options.interval || 3000);
    }
    return this;
  }

  // VHS effect (scanline + distort)
  vhs(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.classList.add('nx-vhs', 'nx-scanlines');
    if (options.chromatic) el.classList.add('nx-chromatic');
    return this;
  }

  // Scanlines overlay
  scanlines(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) el.classList.add('nx-scanlines');
    return this;
  }

  // Digital noise (canvas overlay)
  noise(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5;opacity:' + (options.opacity || 0.05);
    el.style.position = el.style.position || 'relative';
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const draw = () => {
      canvas.width = el.offsetWidth;
      canvas.height = el.offsetHeight;
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const val = Math.random() * 255;
        imageData.data[i] = val;
        imageData.data[i+1] = val;
        imageData.data[i+2] = val;
        imageData.data[i+3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
    };
    draw();
    setInterval(draw, options.fps ? 1000 / options.fps : 80);
    return this;
  }

  // Hologram effect
  hologram(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) el.classList.add('nx-hologram');
    return this;
  }

  // Canvas pixel corruption burst
  pixelCorrupt(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;

    const burst = () => {
      const canvas = document.createElement('canvas');
      const rect = el.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.cssText = `position:absolute;top:0;left:0;pointer-events:none;z-index:100;`;
      el.style.position = el.style.position || 'relative';
      el.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const colors = options.colors || ['#ff006e', '#00f5ff', '#00ff88', '#ffcc00'];
      let frames = 0;

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const w = Math.random() * 60 + 10;
          const h = Math.random() * 8 + 2;
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)] + '99';
          ctx.fillRect(x, y, w, h);
        }
        frames++;
        if (frames < 12) requestAnimationFrame(draw);
        else canvas.remove();
      };
      draw();
    };

    const trigger = options.trigger || 'hover';
    if (trigger === 'hover') el.addEventListener('mouseenter', burst);
    else if (trigger === 'click') el.addEventListener('click', burst);
    else if (trigger === 'auto') setInterval(burst, options.interval || 3000);
    else burst();
    return this;
  }

  // TV static noise burst
  static(element, duration = 600) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const canvas = document.createElement('canvas');
    canvas.width = el.offsetWidth || 300;
    canvas.height = el.offsetHeight || 200;
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:100;opacity:0.3;';
    el.style.position = el.style.position || 'relative';
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const end = Date.now() + duration;
    const draw = () => {
      const img = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() > 0.5 ? 255 : 0;
        img.data[i] = v; img.data[i+1] = v; img.data[i+2] = v; img.data[i+3] = 200;
      }
      ctx.putImageData(img, 0, 0);
      if (Date.now() < end) requestAnimationFrame(draw);
      else canvas.remove();
    };
    draw();
    return this;
  }
}

const glitchEngine = new GlitchEngine();
/**
 * NandanX — audioVisualizerEngine
 * Audio-reactive visualizations: bars, waveform, radial, particles, spectrum
 */
class AudioVisualizerEngine {
  constructor() {
    this.initialized = false;
    this.audioCtx = null;
    this.analyser = null;
    this.source = null;
    this.dataArray = null;
    this.bufferLength = 0;
    this.stream = null;
    this.visualizers = new Map();
  }

  init(options = {}) {
    if (this.initialized) return this;
    this.initialized = true;
    return this;
  }

  _ensureAudioContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
    }
    return this;
  }

  // Connect to audio element
  connectElement(audioElement, options = {}) {
    this._ensureAudioContext();
    const el = typeof audioElement === 'string' ? document.querySelector(audioElement) : audioElement;
    if (!el) return this;
    if (this.source) this.source.disconnect();
    this.source = this.audioCtx.createMediaElementSource(el);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);
    el.addEventListener('play', () => {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    });
    return this;
  }

  // Connect to microphone
  async connectMic(options = {}) {
    this._ensureAudioContext();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      if (this.source) this.source.disconnect();
      this.source = this.audioCtx.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);
      // Do NOT connect to destination (avoid feedback)
      if (options.onReady) options.onReady();
    } catch (e) {
      console.warn('[NandanX AudioViz] Mic access denied:', e);
    }
    return this;
  }

  _getFrequencyData() {
    if (!this.analyser) return new Uint8Array(128);
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  _getTimeDomainData() {
    if (!this.analyser) return new Uint8Array(128);
    const d = new Uint8Array(this.bufferLength);
    this.analyser.getByteTimeDomainData(d);
    return d;
  }

  // Bar visualizer
  bars(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block;';
    el.style.position = el.style.position || 'relative';
    el.appendChild(canvas);

    const resize = () => { canvas.width = el.offsetWidth; canvas.height = el.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const color1 = options.color1 || '#00f5ff';
    const color2 = options.color2 || '#ff006e';
    const barCount = options.barCount || 64;
    const rounded = options.rounded !== false;
    const mirror = options.mirror || false;

    const draw = () => {
      const data = this._getFrequencyData();
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const step = Math.floor(data.length / barCount);
      const barW = w / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const val = data[i * step] / 255;
        const barH = val * (mirror ? h / 2 : h);
        const x = i * (barW + 2);
        const y = mirror ? h / 2 - barH / 2 : h - barH;

        const grad = ctx.createLinearGradient(x, y, x, y + barH);
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        ctx.fillStyle = grad;

        if (rounded) {
          const r = Math.min(barW / 2, 4);
          ctx.beginPath();
          ctx.roundRect(x, y, barW, barH, r);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, barW, barH);
        }
      }
      requestAnimationFrame(draw);
    };
    draw();
    return { canvas, stop: () => {} };
  }

  // Waveform visualizer
  waveform(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block;';
    el.appendChild(canvas);
    const resize = () => { canvas.width = el.offsetWidth; canvas.height = el.offsetHeight; };
    resize();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const color = options.color || '#00f5ff';
    const lineWidth = options.lineWidth || 2;

    const draw = () => {
      const data = this._getTimeDomainData();
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = color;
      ctx.shadowBlur = options.glow ? 10 : 0;

      const sliceW = w / data.length;
      let x = 0;
      data.forEach((v, i) => {
        const y = (v / 128) * h / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceW;
      });
      ctx.stroke();
      requestAnimationFrame(draw);
    };
    draw();
    return { canvas };
  }

  // Radial / circular visualizer
  radial(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block;';
    el.appendChild(canvas);
    const resize = () => { canvas.width = el.offsetWidth; canvas.height = el.offsetHeight; };
    resize();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const color = options.color || '#00f5ff';
    const bars = options.bars || 80;
    const innerR = options.innerRadius || 60;
    const rotate = options.rotate || 0;

    const draw = () => {
      const data = this._getFrequencyData();
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      const step = Math.floor(data.length / bars);
      const angle = (Math.PI * 2) / bars;

      for (let i = 0; i < bars; i++) {
        const val = data[i * step] / 255;
        const len = val * (options.maxLength || 80);
        const a = angle * i + rotate;

        const x1 = cx + Math.cos(a) * innerR;
        const y1 = cy + Math.sin(a) * innerR;
        const x2 = cx + Math.cos(a) * (innerR + len);
        const y2 = cy + Math.sin(a) * (innerR + len);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `hsl(${(i / bars) * 360}, 100%, 60%)`;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.stroke();
      }
      requestAnimationFrame(draw);
    };
    draw();
    return { canvas };
  }

  // Spectrum analyzer with gradient fill
  spectrum(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block;';
    el.appendChild(canvas);
    const resize = () => { canvas.width = el.offsetWidth; canvas.height = el.offsetHeight; };
    resize();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const prevData = new Float32Array(64);
    const smooth = options.smooth || 0.8;

    const draw = () => {
      const data = this._getFrequencyData();
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const barCount = 64;
      const step = Math.floor(data.length / barCount);
      const barW = w / barCount;

      for (let i = 0; i < barCount; i++) {
        const raw = data[i * step] / 255;
        prevData[i] = prevData[i] * smooth + raw * (1 - smooth);
        const barH = prevData[i] * h;

        const grad = ctx.createLinearGradient(0, h, 0, h - barH);
        grad.addColorStop(0, '#00f5ff');
        grad.addColorStop(0.5, '#7c3aed');
        grad.addColorStop(1, '#ff006e');

        ctx.fillStyle = grad;
        ctx.fillRect(i * barW, h - barH, barW - 1, barH);
      }
      requestAnimationFrame(draw);
    };
    draw();
    return { canvas };
  }

  // Beat detection
  detectBeat(callback, options = {}) {
    this._ensureAudioContext();
    const threshold = options.threshold || 180;
    const cooldown = options.cooldown || 300;
    let lastBeat = 0;

    const check = () => {
      const data = this._getFrequencyData();
      // Look at bass frequencies (first ~10 bins)
      let bass = 0;
      for (let i = 0; i < 10; i++) bass += data[i];
      bass /= 10;

      const now = Date.now();
      if (bass > threshold && now - lastBeat > cooldown) {
        lastBeat = now;
        callback(bass / 255);
      }
      requestAnimationFrame(check);
    };
    check();
    return this;
  }

  // Reactive element — scale/glow elements to beat
  reactive(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return this;

    this.detectBeat((strength) => {
      elements.forEach(el => {
        const scale = 1 + strength * (options.scale || 0.15);
        el.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
        el.style.transform = `scale(${scale})`;
        el.style.boxShadow = `0 0 ${strength * 40}px ${options.color || '#00f5ff'}`;
        setTimeout(() => {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = '';
        }, 150);
      });
    }, options);
    return this;
  }

  resume() {
    if (this.audioCtx?.state === 'suspended') this.audioCtx.resume();
    return this;
  }

  suspend() {
    if (this.audioCtx?.state === 'running') this.audioCtx.suspend();
    return this;
  }
}

const audioVisualizerEngine = new AudioVisualizerEngine();
/**
 * NandanX — scene3DEngine
 * Full 3D scene: camera, lights, objects, drag/rotate/zoom, 3D UI elements
 * Uses Three.js if available, or canvas 2.5D fallback
 */
class Scene3DEngine {
  constructor() {
    this.initialized = false;
    this.scenes = new Map();
    this.THREE = null;
  }

  init(options = {}) {
    if (this.initialized) return this;
    this.THREE = window.THREE || null;
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-scene3d-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-scene3d-styles';
    s.textContent = `
      .nx-scene3d { position: relative; overflow: hidden; }
      .nx-scene3d canvas { display: block; width: 100%; height: 100%; }
      .nx-3d-card { transform-style: preserve-3d; transition: transform 0.5s ease; }
      .nx-3d-btn { transform-style: preserve-3d; }
      .nx-3d-btn:hover { transform: translateZ(8px); }
    `;
    document.head.appendChild(s);
  }

  // Create a Three.js scene in a container
  create(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const THREE = this.THREE;
    if (!THREE) {
      console.warn('[NandanX Scene3D] Three.js not found. Include Three.js for full 3D.');
      return this._fallbackScene(el, options);
    }

    el.classList.add('nx-scene3d');
    const w = el.offsetWidth || 400, h = el.offsetHeight || 300;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = options.shadows || false;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    if (options.fog) scene.fog = new THREE.FogExp2(options.fogColor || 0x0a0a12, options.fogDensity || 0.05);

    const camera = new THREE.PerspectiveCamera(options.fov || 60, w / h, 0.1, 1000);
    camera.position.set(...(options.cameraPos || [0, 0, 5]));

    // Lights
    const ambientLight = new THREE.AmbientLight(options.ambientColor || 0x404040, options.ambientIntensity || 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(options.lightColor || 0xffffff, options.lightIntensity || 1);
    dirLight.position.set(5, 10, 5);
    if (options.shadows) dirLight.castShadow = true;
    scene.add(dirLight);

    if (options.pointLights) {
      options.pointLights.forEach(cfg => {
        const pl = new THREE.PointLight(cfg.color || 0x00f5ff, cfg.intensity || 1, cfg.distance || 100);
        pl.position.set(...(cfg.position || [0, 0, 0]));
        scene.add(pl);
      });
    }

    // Resize handling
    window.addEventListener('resize', () => {
      const nw = el.offsetWidth, nh = el.offsetHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });

    const sceneObj = {
      renderer, scene, camera, THREE,
      objects: [],
      clock: new THREE.Clock(),
      animFns: [],
      orbitEnabled: false,
    };

    // Orbit controls (manual implementation)
    if (options.orbit) this._addOrbit(sceneObj, renderer.domElement, options.orbit);

    // Render loop
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = sceneObj.clock.getDelta();
      sceneObj.animFns.forEach(fn => fn(delta, sceneObj));
      renderer.render(scene, camera);
    };
    animate();

    this.scenes.set(el, sceneObj);
    return sceneObj;
  }

  _addOrbit(sceneObj, domEl, options = {}) {
    let isDown = false, px = 0, py = 0;
    let rotX = 0, rotY = 0, zoom = sceneObj.camera.position.z;

    domEl.addEventListener('mousedown', e => { isDown = true; px = e.clientX; py = e.clientY; });
    domEl.addEventListener('mousemove', e => {
      if (!isDown) return;
      rotY += (e.clientX - px) * 0.005;
      rotX += (e.clientY - py) * 0.005;
      px = e.clientX; py = e.clientY;
      sceneObj.camera.position.x = Math.sin(rotY) * zoom;
      sceneObj.camera.position.z = Math.cos(rotY) * zoom;
      sceneObj.camera.position.y = rotX * zoom * 0.5;
      sceneObj.camera.lookAt(0, 0, 0);
    });
    domEl.addEventListener('mouseup', () => { isDown = false; });
    domEl.addEventListener('wheel', e => {
      zoom = Math.max(1, Math.min(20, zoom + e.deltaY * 0.01));
      sceneObj.camera.position.setLength(zoom);
      sceneObj.camera.lookAt(0, 0, 0);
    }, { passive: true });
    // Touch
    let touches = [];
    domEl.addEventListener('touchstart', e => { touches = Array.from(e.touches); });
    domEl.addEventListener('touchmove', e => {
      if (e.touches.length === 1) {
        rotY += (e.touches[0].clientX - touches[0].clientX) * 0.005;
        rotX += (e.touches[0].clientY - touches[0].clientY) * 0.005;
        touches = Array.from(e.touches);
        sceneObj.camera.position.x = Math.sin(rotY) * zoom;
        sceneObj.camera.position.z = Math.cos(rotY) * zoom;
        sceneObj.camera.position.y = rotX * zoom * 0.5;
        sceneObj.camera.lookAt(0, 0, 0);
      } else if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const od = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
        zoom = Math.max(1, Math.min(20, zoom - (d - od) * 0.02));
        sceneObj.camera.position.setLength(zoom);
        sceneObj.camera.lookAt(0, 0, 0);
        touches = Array.from(e.touches);
      }
    }, { passive: true });
  }

  // Add mesh to scene
  addMesh(sceneObj, geometry, material, options = {}) {
    const { THREE, scene } = sceneObj;
    let geo, mat;

    // Geometry presets
    const geos = {
      box: () => new THREE.BoxGeometry(...(geometry.size || [1,1,1])),
      sphere: () => new THREE.SphereGeometry(geometry.radius || 1, 32, 32),
      torus: () => new THREE.TorusGeometry(geometry.radius || 1, geometry.tube || 0.3, 16, 100),
      cylinder: () => new THREE.CylinderGeometry(...(geometry.args || [1,1,2,32])),
      cone: () => new THREE.ConeGeometry(geometry.radius || 1, geometry.height || 2, 32),
      plane: () => new THREE.PlaneGeometry(...(geometry.size || [5,5])),
      torus_knot: () => new THREE.TorusKnotGeometry(geometry.radius || 1, geometry.tube || 0.3),
    };
    geo = typeof geometry === 'string' ? (geos[geometry] || geos.box)() :
          (geometry.type ? (geos[geometry.type] || geos.box)() : geometry);

    // Material presets
    const mats = {
      standard: () => new THREE.MeshStandardMaterial(material),
      phong: () => new THREE.MeshPhongMaterial(material),
      basic: () => new THREE.MeshBasicMaterial(material),
      wireframe: () => new THREE.MeshBasicMaterial({ color: material.color || 0x00f5ff, wireframe: true }),
      glass: () => new THREE.MeshPhysicalMaterial({ color: material.color || 0xffffff, transparent: true, opacity: 0.2, roughness: 0, metalness: 0.8 }),
      neon: () => new THREE.MeshBasicMaterial({ color: material.color || 0x00f5ff }),
    };
    mat = typeof material === 'string' ? (mats[material] || mats.standard)() :
          (material.preset ? (mats[material.preset] || mats.standard)() : new THREE.MeshStandardMaterial(material));

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...(options.position || [0,0,0]));
    mesh.rotation.set(...(options.rotation || [0,0,0]));
    mesh.scale.set(...(options.scale || [1,1,1]));
    if (options.castShadow) mesh.castShadow = true;
    if (options.receiveShadow) mesh.receiveShadow = true;
    scene.add(mesh);
    sceneObj.objects.push(mesh);

    if (options.autoRotate) {
      const speed = options.autoRotate === true ? [0.5, 0.5, 0] : options.autoRotate;
      sceneObj.animFns.push((delta) => {
        mesh.rotation.x += delta * speed[0];
        mesh.rotation.y += delta * speed[1];
        mesh.rotation.z += delta * speed[2];
      });
    }
    return mesh;
  }

  // Particle system in 3D
  particles3D(sceneObj, count, options = {}) {
    const { THREE, scene } = sceneObj;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const spread = options.spread || 10;
    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * spread;
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: options.color || 0x00f5ff,
      size: options.size || 0.05,
      transparent: true,
      opacity: options.opacity || 0.8,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    const rotSpeed = options.rotateSpeed || 0.05;
    sceneObj.animFns.push((delta) => {
      points.rotation.y += delta * rotSpeed;
    });
    return points;
  }

  // 3D floating card with hover interaction
  card3D(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.classList.add('nx-3d-card');
    el.style.transformStyle = 'preserve-3d';
    const depth = options.depth || 20;
    const maxAngle = options.maxAngle || 20;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rx = ((e.clientY - cy) / (rect.height / 2)) * maxAngle;
      const ry = -((e.clientX - cx) / (rect.width / 2)) * maxAngle;
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${depth}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
    });
    return this;
  }

  // 3D button press
  button3D(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.style.cssText += 'transform-style:preserve-3d;transition:transform 0.1s ease;';
    el.addEventListener('mousedown', () => {
      el.style.transform = 'translateZ(-4px) translateY(2px)';
    });
    el.addEventListener('mouseup', () => {
      el.style.transform = 'translateZ(0) translateY(0)';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translateZ(0) translateY(0)';
    });
    return this;
  }

  _fallbackScene(el, options) {
    el.style.cssText += 'display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);color:#00f5ff;font-size:12px;font-family:monospace;';
    el.textContent = '3D: Include Three.js for full scene';
    return null;
  }
}

const scene3DEngine = new Scene3DEngine();
/**
 * NandanX — pageTransitionEngine
 * Page transitions: fade, slide, wipe, zoom, morph, glitch
 */
class PageTransitionEngine {
  constructor() {
    this.initialized = false;
    this.overlay = null;
    this.currentTransition = null;
    this.history = [];
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this._createOverlay();
    if (options.intercept) this._interceptLinks(options);
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-transition-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-transition-styles';
    s.textContent = `
      .nx-page-overlay {
        position: fixed; inset: 0; z-index: 99999;
        pointer-events: none;
        transform-origin: center;
      }
      .nx-curtain {
        position: fixed; inset: 0; z-index: 99999;
        transform: scaleY(0); transform-origin: bottom;
        pointer-events: none;
      }
      .nx-curtain-top {
        position: fixed; top: 0; left: 0; right: 0; height: 50%; z-index: 99999;
        transform: translateY(-100%); pointer-events: none;
      }
      .nx-curtain-bottom {
        position: fixed; bottom: 0; left: 0; right: 0; height: 50%; z-index: 99999;
        transform: translateY(100%); pointer-events: none;
      }
      .nx-transition-blocks {
        position: fixed; inset: 0; z-index: 99999;
        display: grid; pointer-events: none;
      }
      .nx-transition-block {
        background: var(--nx-primary, #00f5ff);
        transform: scaleY(0);
        transform-origin: bottom;
      }
      .nx-loader-bar {
        position: fixed; top: 0; left: 0; height: 3px; z-index: 999999;
        background: var(--nx-primary, #00f5ff);
        width: 0%; transition: width 0.3s ease;
        box-shadow: 0 0 10px var(--nx-primary, #00f5ff);
      }
      @keyframes nx-page-fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes nx-page-slide-in { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .nx-page-enter { animation: nx-page-fade-in 0.4s ease; }
      .nx-page-enter-slide { animation: nx-page-slide-in 0.4s cubic-bezier(0.23,1,0.32,1); }
    `;
    document.head.appendChild(s);
  }

  _createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'nx-page-overlay';
    document.body.appendChild(this.overlay);
    // Loader bar
    this.loaderBar = document.createElement('div');
    this.loaderBar.className = 'nx-loader-bar';
    document.body.appendChild(this.loaderBar);
  }

  // Fade transition
  fade(options = {}) {
    const duration = options.duration || 400;
    const color = options.color || '#000';
    return new Promise(resolve => {
      this.overlay.style.cssText = `background:${color};opacity:0;transition:opacity ${duration/2}ms ease;pointer-events:all;`;
      requestAnimationFrame(() => { this.overlay.style.opacity = '1'; });
      setTimeout(() => {
        if (options.onMiddle) options.onMiddle();
        this.overlay.style.opacity = '0';
        setTimeout(() => {
          this.overlay.style.pointerEvents = 'none';
          resolve();
        }, duration / 2);
      }, duration / 2);
    });
  }

  // Curtain slide
  curtain(options = {}) {
    const duration = options.duration || 600;
    const color = options.color || getComputedStyle(document.documentElement).getPropertyValue('--nx-primary') || '#00f5ff';
    return new Promise(resolve => {
      const curtain = document.createElement('div');
      curtain.className = 'nx-curtain';
      curtain.style.cssText = `background:${color};transition:transform ${duration/2}ms cubic-bezier(0.86,0,0.07,1);`;
      document.body.appendChild(curtain);

      requestAnimationFrame(() => { curtain.style.transform = 'scaleY(1)'; });
      setTimeout(() => {
        if (options.onMiddle) options.onMiddle();
        curtain.style.transformOrigin = 'top';
        curtain.style.transform = 'scaleY(0)';
        setTimeout(() => { curtain.remove(); resolve(); }, duration / 2);
      }, duration / 2 + 50);
    });
  }

  // Split curtain (top + bottom)
  splitCurtain(options = {}) {
    const duration = options.duration || 500;
    const color = options.color || '#0a0a12';
    return new Promise(resolve => {
      const top = document.createElement('div');
      const bot = document.createElement('div');
      top.className = 'nx-curtain-top';
      bot.className = 'nx-curtain-bottom';
      top.style.background = bot.style.background = color;
      top.style.transition = bot.style.transition = `transform ${duration/2}ms cubic-bezier(0.86,0,0.07,1)`;
      document.body.appendChild(top);
      document.body.appendChild(bot);

      requestAnimationFrame(() => {
        top.style.transform = 'translateY(0)';
        bot.style.transform = 'translateY(0)';
      });
      setTimeout(() => {
        if (options.onMiddle) options.onMiddle();
        top.style.transform = 'translateY(-100%)';
        bot.style.transform = 'translateY(100%)';
        setTimeout(() => { top.remove(); bot.remove(); resolve(); }, duration / 2);
      }, duration / 2 + 50);
    });
  }

  // Block/grid wipe
  blockWipe(options = {}) {
    const duration = options.duration || 800;
    const cols = options.cols || 6;
    const color = options.color || '#00f5ff';
    return new Promise(resolve => {
      const grid = document.createElement('div');
      grid.className = 'nx-transition-blocks';
      grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      document.body.appendChild(grid);

      for (let i = 0; i < cols; i++) {
        const block = document.createElement('div');
        block.className = 'nx-transition-block';
        block.style.background = color;
        block.style.transitionDelay = `${i * 40}ms`;
        block.style.transition = `transform ${duration/2}ms cubic-bezier(0.86,0,0.07,1) ${i * 40}ms`;
        grid.appendChild(block);
      }

      requestAnimationFrame(() => {
        grid.querySelectorAll('.nx-transition-block').forEach(b => b.style.transform = 'scaleY(1)');
      });

      const totalIn = duration / 2 + cols * 40;
      setTimeout(() => {
        if (options.onMiddle) options.onMiddle();
        grid.querySelectorAll('.nx-transition-block').forEach((b, i) => {
          b.style.transformOrigin = 'top';
          b.style.transitionDelay = `${i * 30}ms`;
          b.style.transform = 'scaleY(0)';
        });
        setTimeout(() => { grid.remove(); resolve(); }, duration / 2 + cols * 30);
      }, totalIn);
    });
  }

  // Zoom transition
  zoom(options = {}) {
    const duration = options.duration || 500;
    return new Promise(resolve => {
      this.overlay.style.cssText = `
        background:${options.color || '#000'};
        transform:scale(0);
        border-radius:50%;
        opacity:1;
        transition:transform ${duration/2}ms cubic-bezier(0.4,0,1,1), border-radius ${duration/2}ms ease;
        pointer-events:all;
      `;
      requestAnimationFrame(() => {
        this.overlay.style.transform = 'scale(3)';
        this.overlay.style.borderRadius = '0';
      });
      setTimeout(() => {
        if (options.onMiddle) options.onMiddle();
        this.overlay.style.transform = 'scale(0)';
        this.overlay.style.borderRadius = '50%';
        this.overlay.style.transition = `transform ${duration/2}ms cubic-bezier(0,0,0.2,1), border-radius ${duration/2}ms ease`;
        setTimeout(() => {
          this.overlay.style.pointerEvents = 'none';
          resolve();
        }, duration / 2);
      }, duration / 2 + 50);
    });
  }

  // Progress loader bar
  startLoader() {
    this.loaderBar.style.width = '0%';
    this.loaderBar.style.display = 'block';
    let p = 0;
    const id = setInterval(() => {
      p = Math.min(90, p + Math.random() * 15);
      this.loaderBar.style.width = p + '%';
    }, 200);
    return {
      finish: () => {
        clearInterval(id);
        this.loaderBar.style.width = '100%';
        setTimeout(() => { this.loaderBar.style.display = 'none'; }, 300);
      },
      stop: () => clearInterval(id),
    };
  }

  _interceptLinks(options = {}) {
    const type = options.type || 'fade';
    document.addEventListener('click', async (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel') || a.target === '_blank') return;
      e.preventDefault();
      await this[type]?.({ onMiddle: () => { window.location.href = href; } });
    });
  }
}

const pageTransitionEngine = new PageTransitionEngine();
/**
 * NandanX — gradientEngine
 * Dynamic gradients, mesh gradients, animated backgrounds, auto dark mode
 */
class GradientEngine {
  constructor() {
    this.initialized = false;
    this.darkMode = false;
    this.observers = [];
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    if (options.autoDark) this.autoDarkMode(options.autoDark);
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-gradient-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-gradient-styles';
    s.textContent = `
      .nx-gradient-mesh { position: relative; overflow: hidden; }
      .nx-gradient-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.6; animation: nx-orb-float linear infinite; pointer-events: none; }
      @keyframes nx-orb-float {
        0% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(30px, -20px) scale(1.1); }
        66% { transform: translate(-20px, 30px) scale(0.9); }
        100% { transform: translate(0, 0) scale(1); }
      }
      .nx-animated-gradient {
        background-size: 200% 200%;
        animation: nx-gradient-shift 6s ease infinite;
      }
      @keyframes nx-gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .nx-dark-mode { filter: invert(1) hue-rotate(180deg); }
      .nx-dark-mode img, .nx-dark-mode video, .nx-dark-mode canvas { filter: invert(1) hue-rotate(180deg); }

      :root.nx-dark {
        --nx-bg: #0a0a12;
        --nx-text: #e2e8f0;
        --nx-surface: rgba(255,255,255,0.04);
        --nx-border: rgba(255,255,255,0.08);
      }
      :root.nx-light {
        --nx-bg: #f8fafc;
        --nx-text: #0f172a;
        --nx-surface: rgba(0,0,0,0.04);
        --nx-border: rgba(0,0,0,0.08);
      }
      .nx-transition-colors * { transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease; }
      .nx-glass {
        background: rgba(255,255,255,0.08);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.15);
      }
      .nx-neumorphism {
        background: #e0e5ec;
        box-shadow: 9px 9px 16px #b8bec7, -9px -9px 16px #ffffff;
      }
      .nx-neumorphism-dark {
        background: #1e2030;
        box-shadow: 9px 9px 16px #151720, -9px -9px 16px #272940;
      }
    `;
    document.head.appendChild(s);
  }

  // Animated mesh gradient background
  meshGradient(container, colors, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('nx-gradient-mesh');
    el.style.position = el.style.position || 'relative';

    const orbs = colors || ['#ff006e', '#00f5ff', '#7c3aed', '#00ff88'];
    const sizes = options.sizes || ['400px', '350px', '300px', '250px'];
    const durations = options.durations || [8, 12, 10, 14];

    orbs.forEach((color, i) => {
      const orb = document.createElement('div');
      orb.className = 'nx-gradient-orb';
      const size = sizes[i] || '300px';
      orb.style.cssText = `
        width: ${size}; height: ${size};
        background: ${color};
        top: ${Math.random() * 80}%;
        left: ${Math.random() * 80}%;
        animation-duration: ${durations[i] || 10}s;
        animation-delay: ${-Math.random() * 5}s;
      `;
      el.appendChild(orb);
    });
    return this;
  }

  // Animated gradient on element
  animated(element, colors, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const dir = options.direction || '135deg';
    el.style.background = `linear-gradient(${dir}, ${colors.join(', ')}, ${colors[0]})`;
    el.style.backgroundSize = '200% 200%';
    el.classList.add('nx-animated-gradient');
    if (options.duration) el.style.animationDuration = options.duration;
    return this;
  }

  // Conic gradient
  conic(element, colors, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const stops = colors.map((c, i) => `${c} ${(i / colors.length) * 360}deg`).join(', ');
    el.style.background = `conic-gradient(from ${options.from || 0}deg, ${stops})`;
    return this;
  }

  // Radial glow
  radialGlow(element, color, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const size = options.size || '80%';
    el.style.background = `radial-gradient(circle at center, ${color}${options.opacity || '33'} 0%, transparent ${size})`;
    return this;
  }

  // Glassmorphism
  glass(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const opacity = options.opacity || 0.1;
    const blur = options.blur || 20;
    const border = options.border || '1px solid rgba(255,255,255,0.15)';
    const bg = options.dark ? `rgba(0,0,0,${opacity})` : `rgba(255,255,255,${opacity})`;
    el.style.background = bg;
    el.style.backdropFilter = `blur(${blur}px)`;
    el.style.webkitBackdropFilter = `blur(${blur}px)`;
    el.style.border = border;
    return this;
  }

  // Neumorphism
  neumorphism(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.classList.add(options.dark ? 'nx-neumorphism-dark' : 'nx-neumorphism');
    if (options.borderRadius) el.style.borderRadius = options.borderRadius;
    return this;
  }

  // Auto dark mode based on system preference
  autoDarkMode(options = {}) {
    const apply = (dark) => {
      this.darkMode = dark;
      document.documentElement.classList.toggle('nx-dark', dark);
      document.documentElement.classList.toggle('nx-light', !dark);
      if (options.transition) document.body.classList.add('nx-transition-colors');
      if (options.onChange) options.onChange(dark);
    };

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    apply(mq.matches);
    mq.addEventListener('change', e => apply(e.matches));

    if (options.toggle) {
      const btn = typeof options.toggle === 'string' ? document.querySelector(options.toggle) : options.toggle;
      if (btn) btn.addEventListener('click', () => apply(!this.darkMode));
    }
    return this;
  }

  // Theme generator from base color
  generateTheme(baseColor, options = {}) {
    const hsl = this._hexToHSL(baseColor);
    const vars = {
      '--nx-primary': baseColor,
      '--nx-primary-light': `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(95, hsl.l + 20)}%)`,
      '--nx-primary-dark': `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(5, hsl.l - 20)}%)`,
      '--nx-secondary': `hsl(${(hsl.h + 180) % 360}, ${hsl.s}%, ${hsl.l}%)`,
      '--nx-accent': `hsl(${(hsl.h + 90) % 360}, ${hsl.s}%, ${hsl.l}%)`,
      '--nx-glow': `hsla(${hsl.h}, 100%, 60%, 0.4)`,
    };

    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    return vars;
  }

  _hexToHSL(hex) {
    let r = parseInt(hex.slice(1,3),16)/255;
    let g = parseInt(hex.slice(3,5),16)/255;
    let b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max+min)/2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      switch(max) {
        case r: h = (g-b)/d + (g<b?6:0); break;
        case g: h = (b-r)/d + 2; break;
        case b: h = (r-g)/d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
  }

  // Dynamic gradient text
  gradientText(element, colors, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const dir = options.direction || '135deg';
    el.style.background = `linear-gradient(${dir}, ${colors.join(', ')})`;
    el.style.webkitBackgroundClip = 'text';
    el.style.backgroundClip = 'text';
    el.style.webkitTextFillColor = 'transparent';
    if (options.animate) {
      el.style.backgroundSize = '200% 200%';
      el.classList.add('nx-animated-gradient');
    }
    return this;
  }

  // Background that reacts to mouse position
  mouseGradient(element, colors, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
      el.style.background = `radial-gradient(circle at ${x}% ${y}%, ${colors[0]}, ${colors[1] || '#0a0a12'})`;
    });
    return this;
  }
}

const gradientEngine = new GradientEngine();
/**
 * NandanX — webrtcEngine
 * WebRTC peer-to-peer video calls, screen share, signaling helpers
 */
class WebRTCEngine {
  constructor() {
    this.initialized = false;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.signalingChannel = null;
    this.onRemoteStream = null;
    this.onConnectionState = null;
    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ];
  }

  init(options = {}) {
    if (this.initialized) return this;
    if (options.iceServers) this.iceServers = options.iceServers;
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-webrtc-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-webrtc-styles';
    s.textContent = `
      .nx-video-container { position: relative; background: #000; border-radius: 12px; overflow: hidden; }
      .nx-video-container video { width: 100%; height: 100%; object-fit: cover; display: block; }
      .nx-video-local { position: absolute; bottom: 12px; right: 12px; width: 140px; height: 90px; border-radius: 8px; overflow: hidden; border: 2px solid rgba(255,255,255,0.2); z-index: 10; }
      .nx-video-controls { position: absolute; bottom: 0; left: 0; right: 0; padding: 16px; display: flex; gap: 12px; justify-content: center; background: linear-gradient(transparent, rgba(0,0,0,0.6)); z-index: 20; }
      .nx-ctrl-btn { width: 44px; height: 44px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: transform 0.15s ease, opacity 0.15s ease; background: rgba(255,255,255,0.15); color: #fff; backdrop-filter: blur(8px); }
      .nx-ctrl-btn:hover { transform: scale(1.1); }
      .nx-ctrl-btn.nx-off { background: #ef4444; }
      .nx-connection-status { position: absolute; top: 12px; left: 12px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; font-family: monospace; z-index: 20; }
      .nx-status-connecting { background: rgba(234,179,8,0.3); color: #eab308; border: 1px solid rgba(234,179,8,0.4); }
      .nx-status-connected { background: rgba(34,197,94,0.2); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }
      .nx-status-disconnected { background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
    `;
    document.head.appendChild(s);
  }

  async getUserMedia(options = {}) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: options.video !== false ? (options.videoOptions || { width: 1280, height: 720 }) : false,
        audio: options.audio !== false,
      });
      return this.localStream;
    } catch (e) {
      console.warn('[NandanX WebRTC] getUserMedia failed:', e);
      throw e;
    }
  }

  async getScreenShare(options = {}) {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: options.audio || false });
      return screen;
    } catch (e) {
      console.warn('[NandanX WebRTC] Screen share failed:', e);
      throw e;
    }
  }

  createPeerConnection(options = {}) {
    this.peerConnection = new RTCPeerConnection({ iceServers: this.iceServers });

    this.peerConnection.onicecandidate = (e) => {
      if (e.candidate && options.onIceCandidate) options.onIceCandidate(e.candidate);
    };

    this.peerConnection.ontrack = (e) => {
      this.remoteStream = e.streams[0];
      if (this.onRemoteStream) this.onRemoteStream(this.remoteStream);
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.onConnectionState) this.onConnectionState(this.peerConnection.connectionState);
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream));
    }

    return this.peerConnection;
  }

  async createOffer() {
    if (!this.peerConnection) this.createPeerConnection();
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(offer) {
    if (!this.peerConnection) this.createPeerConnection();
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async setRemoteAnswer(answer) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async addIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) { /* ignore */ }
  }

  // Full video call UI builder
  async buildCallUI(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    el.classList.add('nx-video-container');

    const remoteVideo = document.createElement('video');
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideo.id = 'nx-remote-video';
    el.appendChild(remoteVideo);

    const localWrap = document.createElement('div');
    localWrap.className = 'nx-video-local';
    const localVideo = document.createElement('video');
    localVideo.autoplay = true;
    localVideo.playsInline = true;
    localVideo.muted = true;
    localVideo.id = 'nx-local-video';
    localWrap.appendChild(localVideo);
    el.appendChild(localWrap);

    const statusBadge = document.createElement('div');
    statusBadge.className = 'nx-connection-status nx-status-connecting';
    statusBadge.textContent = '● Connecting...';
    el.appendChild(statusBadge);

    const controls = document.createElement('div');
    controls.className = 'nx-video-controls';

    let micOn = true, camOn = true;

    const micBtn = this._ctrlBtn('🎤', () => {
      micOn = !micOn;
      if (this.localStream) this.localStream.getAudioTracks().forEach(t => t.enabled = micOn);
      micBtn.classList.toggle('nx-off', !micOn);
      micBtn.textContent = micOn ? '🎤' : '🔇';
    });

    const camBtn = this._ctrlBtn('📷', () => {
      camOn = !camOn;
      if (this.localStream) this.localStream.getVideoTracks().forEach(t => t.enabled = camOn);
      camBtn.classList.toggle('nx-off', !camOn);
      camBtn.textContent = camOn ? '📷' : '🚫';
    });

    const hangupBtn = this._ctrlBtn('📵', () => { this.hangup(); if (options.onHangup) options.onHangup(); });
    hangupBtn.classList.add('nx-off');

    controls.appendChild(micBtn);
    controls.appendChild(camBtn);
    if (options.screenShare !== false) {
      const screenBtn = this._ctrlBtn('🖥️', async () => {
        try {
          const screen = await this.getScreenShare();
          const videoTrack = screen.getVideoTracks()[0];
          const sender = this.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
          localVideo.srcObject = screen;
          videoTrack.onended = () => {
            const origTrack = this.localStream?.getVideoTracks()[0];
            if (sender && origTrack) sender.replaceTrack(origTrack);
            localVideo.srcObject = this.localStream;
          };
        } catch(e) {}
      });
      controls.appendChild(screenBtn);
    }
    controls.appendChild(hangupBtn);
    el.appendChild(controls);

    try {
      const stream = await this.getUserMedia(options);
      localVideo.srcObject = stream;
    } catch (e) {
      statusBadge.textContent = '● No Camera/Mic';
      statusBadge.className = 'nx-connection-status nx-status-disconnected';
    }

    this.onRemoteStream = (stream) => {
      remoteVideo.srcObject = stream;
      statusBadge.textContent = '● Connected';
      statusBadge.className = 'nx-connection-status nx-status-connected';
    };

    this.onConnectionState = (state) => {
      if (state === 'connected') {
        statusBadge.textContent = '● Connected';
        statusBadge.className = 'nx-connection-status nx-status-connected';
      } else if (state === 'disconnected' || state === 'failed') {
        statusBadge.textContent = '● Disconnected';
        statusBadge.className = 'nx-connection-status nx-status-disconnected';
      }
    };

    return { localVideo, remoteVideo, controls };
  }

  _ctrlBtn(icon, onClick) {
    const btn = document.createElement('button');
    btn.className = 'nx-ctrl-btn';
    btn.textContent = icon;
    btn.addEventListener('click', onClick);
    return btn;
  }

  hangup() {
    if (this.localStream) { this.localStream.getTracks().forEach(t => t.stop()); this.localStream = null; }
    if (this.peerConnection) { this.peerConnection.close(); this.peerConnection = null; }
  }

  // Simple data channel
  createDataChannel(label, options = {}) {
    if (!this.peerConnection) this.createPeerConnection();
    return this.peerConnection.createDataChannel(label, options);
  }
}

const webrtcEngine = new WebRTCEngine();
/**
 * NandanX — liveChatEngine
 * Live chat UI, typing indicators, reactions, message effects
 */
class LiveChatEngine {
  constructor() {
    this.initialized = false;
    this.chats = new Map();
    this.ws = null;
    this.sse = null;
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-chat-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-chat-styles';
    s.textContent = `
      .nx-chat { display: flex; flex-direction: column; height: 100%; background: var(--nx-bg, #0a0a12); border-radius: 16px; overflow: hidden; border: 1px solid var(--nx-border, rgba(255,255,255,0.08)); font-family: inherit; }
      .nx-chat-header { padding: 16px 20px; border-bottom: 1px solid var(--nx-border, rgba(255,255,255,0.08)); display: flex; align-items: center; gap: 12px; }
      .nx-chat-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--nx-primary, #00f5ff); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: #000; flex-shrink: 0; }
      .nx-chat-title { font-weight: 600; font-size: 15px; color: var(--nx-text, #e2e8f0); }
      .nx-chat-subtitle { font-size: 12px; color: var(--nx-text-muted, rgba(226,232,240,0.5)); }
      .nx-chat-status { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; margin-left: auto; box-shadow: 0 0 6px #22c55e; }
      .nx-chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 8px; scroll-behavior: smooth; }
      .nx-chat-messages::-webkit-scrollbar { width: 4px; }
      .nx-chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      .nx-msg { display: flex; gap: 8px; align-items: flex-end; max-width: 80%; animation: nx-msg-in 0.2s ease; }
      @keyframes nx-msg-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .nx-msg-out { align-self: flex-end; flex-direction: row-reverse; }
      .nx-msg-in { align-self: flex-start; }
      .nx-bubble { padding: 10px 14px; border-radius: 18px; font-size: 14px; line-height: 1.5; word-break: break-word; }
      .nx-msg-in .nx-bubble { background: var(--nx-surface, rgba(255,255,255,0.07)); color: var(--nx-text, #e2e8f0); border-bottom-left-radius: 4px; }
      .nx-msg-out .nx-bubble { background: var(--nx-primary, #00f5ff); color: #000; border-bottom-right-radius: 4px; font-weight: 500; }
      .nx-msg-time { font-size: 10px; color: var(--nx-text-muted, rgba(226,232,240,0.4)); padding: 0 4px; white-space: nowrap; }
      .nx-msg-avatar { width: 24px; height: 24px; border-radius: 50%; background: var(--nx-accent, #7c3aed); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; }
      .nx-typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px; background: var(--nx-surface, rgba(255,255,255,0.07)); border-radius: 18px; border-bottom-left-radius: 4px; }
      .nx-typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--nx-text-muted, rgba(226,232,240,0.5)); animation: nx-typing-bounce 1.2s ease infinite; }
      .nx-typing span:nth-child(2) { animation-delay: 0.2s; }
      .nx-typing span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes nx-typing-bounce { 0%,80%,100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-5px); opacity: 1; } }
      .nx-chat-input-area { padding: 12px 16px; border-top: 1px solid var(--nx-border, rgba(255,255,255,0.08)); display: flex; gap: 10px; align-items: flex-end; }
      .nx-chat-input { flex: 1; background: var(--nx-surface, rgba(255,255,255,0.05)); border: 1px solid var(--nx-border, rgba(255,255,255,0.08)); border-radius: 20px; padding: 10px 16px; font-size: 14px; color: var(--nx-text, #e2e8f0); resize: none; outline: none; font-family: inherit; line-height: 1.4; max-height: 120px; overflow-y: auto; transition: border-color 0.2s; }
      .nx-chat-input:focus { border-color: var(--nx-primary, #00f5ff); }
      .nx-chat-input::placeholder { color: var(--nx-text-muted, rgba(226,232,240,0.4)); }
      .nx-send-btn { width: 40px; height: 40px; border-radius: 50%; background: var(--nx-primary, #00f5ff); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .nx-send-btn:hover { transform: scale(1.08); box-shadow: 0 0 16px var(--nx-glow, rgba(0,245,255,0.4)); }
      .nx-reaction-bar { display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap; }
      .nx-reaction { padding: 2px 8px; border-radius: 12px; background: var(--nx-surface, rgba(255,255,255,0.07)); border: 1px solid var(--nx-border, rgba(255,255,255,0.08)); font-size: 13px; cursor: pointer; transition: transform 0.15s ease; }
      .nx-reaction:hover { transform: scale(1.15); }
      .nx-msg-status { font-size: 10px; color: var(--nx-primary, #00f5ff); }
      .nx-unread-badge { background: var(--nx-secondary, #ff006e); color: #fff; border-radius: 20px; padding: 2px 8px; font-size: 11px; font-weight: 700; }
    `;
    document.head.appendChild(s);
  }

  // Build full chat UI
  build(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;

    el.innerHTML = '';
    el.classList.add('nx-chat');

    // Header
    const header = document.createElement('div');
    header.className = 'nx-chat-header';
    const avatar = document.createElement('div');
    avatar.className = 'nx-chat-avatar';
    avatar.textContent = (options.name || 'Support')[0].toUpperCase();
    if (options.avatarColor) avatar.style.background = options.avatarColor;
    const info = document.createElement('div');
    info.innerHTML = `<div class="nx-chat-title">${options.name || 'Support'}</div><div class="nx-chat-subtitle" id="nx-chat-sub">${options.subtitle || 'Online'}</div>`;
    const status = document.createElement('div');
    status.className = 'nx-chat-status';
    header.appendChild(avatar);
    header.appendChild(info);
    header.appendChild(status);
    el.appendChild(header);

    // Messages
    const messagesEl = document.createElement('div');
    messagesEl.className = 'nx-chat-messages';
    el.appendChild(messagesEl);

    // Input area
    const inputArea = document.createElement('div');
    inputArea.className = 'nx-chat-input-area';
    const input = document.createElement('textarea');
    input.className = 'nx-chat-input';
    input.placeholder = options.placeholder || 'Type a message...';
    input.rows = 1;
    const sendBtn = document.createElement('button');
    sendBtn.className = 'nx-send-btn';
    sendBtn.innerHTML = '➤';
    inputArea.appendChild(input);
    inputArea.appendChild(sendBtn);
    el.appendChild(inputArea);

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    let typingTimeout = null;
    let typingEl = null;

    const sendMessage = () => {
      const text = input.value.trim();
      if (!text) return;
      this.addMessage(messagesEl, { text, type: 'out', time: this._time() });
      input.value = '';
      input.style.height = 'auto';
      if (options.onSend) options.onSend(text);
      // Auto-reply simulation
      if (options.autoReply) {
        this.showTyping(messagesEl);
        setTimeout(() => {
          this.hideTyping(messagesEl);
          const reply = typeof options.autoReply === 'function' ? options.autoReply(text) : options.autoReply;
          this.addMessage(messagesEl, { text: reply, type: 'in', name: options.name, time: this._time() });
        }, options.replyDelay || 1500);
      }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });

    // Typing indicator trigger
    input.addEventListener('input', () => {
      clearTimeout(typingTimeout);
      if (options.onTyping) options.onTyping(true);
      typingTimeout = setTimeout(() => { if (options.onTyping) options.onTyping(false); }, 1000);
    });

    // Load initial messages
    if (options.messages) {
      options.messages.forEach(msg => this.addMessage(messagesEl, msg));
    }

    const chat = { el, messagesEl, input, sendBtn, status };
    this.chats.set(el, chat);
    return chat;
  }

  addMessage(messagesEl, msg) {
    const wrap = document.createElement('div');
    wrap.className = `nx-msg nx-msg-${msg.type || 'in'}`;

    if (msg.type === 'in') {
      const av = document.createElement('div');
      av.className = 'nx-msg-avatar';
      av.textContent = (msg.name || 'S')[0].toUpperCase();
      wrap.appendChild(av);
    }

    const col = document.createElement('div');
    const bubble = document.createElement('div');
    bubble.className = 'nx-bubble';
    bubble.textContent = msg.text;

    const meta = document.createElement('div');
    meta.style.cssText = 'display:flex;gap:6px;align-items:center;';
    const time = document.createElement('span');
    time.className = 'nx-msg-time';
    time.textContent = msg.time || this._time();
    meta.appendChild(time);

    if (msg.type === 'out') {
      const tick = document.createElement('span');
      tick.className = 'nx-msg-status';
      tick.textContent = msg.read ? '✓✓' : '✓';
      meta.appendChild(tick);
    }

    col.appendChild(bubble);
    col.appendChild(meta);

    if (msg.reactions) {
      const reactionBar = document.createElement('div');
      reactionBar.className = 'nx-reaction-bar';
      msg.reactions.forEach(r => {
        const btn = document.createElement('div');
        btn.className = 'nx-reaction';
        btn.textContent = `${r.emoji} ${r.count || 1}`;
        btn.addEventListener('click', () => {
          const count = parseInt(btn.textContent.split(' ')[1] || 1);
          btn.textContent = `${r.emoji} ${count + 1}`;
          btn.style.background = 'rgba(0,245,255,0.1)';
        });
        reactionBar.appendChild(btn);
      });
      col.appendChild(reactionBar);
    }

    wrap.appendChild(col);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrap;
  }

  showTyping(messagesEl) {
    const wrap = document.createElement('div');
    wrap.className = 'nx-msg nx-msg-in nx-typing-wrap';
    const typing = document.createElement('div');
    typing.className = 'nx-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    wrap.appendChild(typing);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrap;
  }

  hideTyping(messagesEl) {
    messagesEl.querySelector('.nx-typing-wrap')?.remove();
  }

  // Connect to WebSocket
  connectWS(url, options = {}) {
    this.ws = new WebSocket(url);
    this.ws.onopen = () => { if (options.onOpen) options.onOpen(); };
    this.ws.onmessage = (e) => { const data = JSON.parse(e.data); if (options.onMessage) options.onMessage(data); };
    this.ws.onclose = () => { if (options.onClose) options.onClose(); };
    this.ws.onerror = (e) => { if (options.onError) options.onError(e); };
    return this.ws;
  }

  sendWS(data) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(data));
    return this;
  }

  // SSE for one-way streaming messages
  connectSSE(url, options = {}) {
    this.sse = new EventSource(url);
    this.sse.onmessage = (e) => { if (options.onMessage) options.onMessage(JSON.parse(e.data)); };
    this.sse.onerror = () => { if (options.onError) options.onError(); };
    return this.sse;
  }

  _time() {
    const d = new Date();
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  }
}

const liveChatEngine = new LiveChatEngine();
/**
 * NandanX — syncEngine
 * Offline-first data sync, optimistic updates, conflict resolution, multiplayer state
 */
class SyncEngine {
  constructor() {
    this.initialized = false;
    this.stores = new Map();
    this.ws = null;
    this.pendingOps = [];
    this.online = navigator.onLine;
    this.peers = new Map();
    this.clientId = this._generateId();
  }

  init(options = {}) {
    if (this.initialized) return this;
    this.options = options;
    this._setupOnlineListener();
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-sync-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-sync-styles';
    s.textContent = `
      .nx-sync-badge { position: fixed; bottom: 20px; left: 20px; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; font-family: monospace; z-index: 9000; transition: all 0.3s ease; }
      .nx-sync-online { background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }
      .nx-sync-offline { background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
      .nx-sync-syncing { background: rgba(234,179,8,0.15); color: #eab308; border: 1px solid rgba(234,179,8,0.3); }
      .nx-presence-avatars { display: flex; gap: -8px; }
      .nx-presence-avatar { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--nx-bg, #0a0a12); margin-left: -8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; animation: nx-avatar-in 0.2s ease; }
      @keyframes nx-avatar-in { from { transform: scale(0); } to { transform: scale(1); } }
      .nx-cursor-peer { position: fixed; pointer-events: none; z-index: 99990; transition: transform 0.1s linear; }
      .nx-cursor-peer-label { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px; margin-top: 2px; white-space: nowrap; }
    `;
    document.head.appendChild(s);
  }

  _setupOnlineListener() {
    window.addEventListener('online', () => {
      this.online = true;
      this._flushPending();
      this._updateBadge();
    });
    window.addEventListener('offline', () => {
      this.online = false;
      this._updateBadge();
    });
  }

  _generateId() {
    return 'nx-' + Math.random().toString(36).slice(2, 10);
  }

  // Create an offline-first reactive store
  createStore(name, initialState = {}, options = {}) {
    const key = `nx-sync-${name}`;
    let state = initialState;

    // Load from IndexedDB / localStorage
    try {
      const saved = localStorage.getItem(key);
      if (saved) state = { ...initialState, ...JSON.parse(saved) };
    } catch (e) {}

    const subscribers = new Set();
    const history = [{ ...state }];
    let historyIdx = 0;

    const store = {
      name,
      get: () => ({ ...state }),
      set: (partial) => {
        const prev = { ...state };
        state = { ...state, ...partial };
        history.splice(historyIdx + 1);
        history.push({ ...state });
        historyIdx = history.length - 1;
        this._persist(key, state);
        if (this.online && this.ws) this._broadcast({ type: 'sync', store: name, data: state });
        else this.pendingOps.push({ key, state });
        subscribers.forEach(fn => fn(state, prev));
        return store;
      },
      subscribe: (fn) => { subscribers.add(fn); return () => subscribers.delete(fn); },
      undo: () => { if (historyIdx > 0) { historyIdx--; state = { ...history[historyIdx] }; subscribers.forEach(fn => fn(state)); } },
      redo: () => { if (historyIdx < history.length - 1) { historyIdx++; state = { ...history[historyIdx] }; subscribers.forEach(fn => fn(state)); } },
      reset: () => { state = { ...initialState }; this._persist(key, state); subscribers.forEach(fn => fn(state)); },
      bind: (selector, mapFn) => {
        const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!el) return store;
        const update = (s) => {
          const val = mapFn ? mapFn(s) : JSON.stringify(s);
          el.textContent = val;
        };
        update(state);
        subscribers.add(update);
        return store;
      },
    };

    this.stores.set(name, store);
    return store;
  }

  _persist(key, state) {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
  }

  _flushPending() {
    if (!this.ws || !this.pendingOps.length) return;
    this.pendingOps.forEach(op => this._broadcast({ type: 'sync', key: op.key, data: op.state }));
    this.pendingOps = [];
    this._updateBadge('syncing');
    setTimeout(() => this._updateBadge('online'), 1000);
  }

  _broadcast(msg) {
    if (this.ws?.readyState === 1) {
      this.ws.send(JSON.stringify({ ...msg, clientId: this.clientId }));
    }
  }

  // Connect to sync server
  connect(url, options = {}) {
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      this.online = true;
      this._flushPending();
      this._updateBadge('online');
      this._broadcast({ type: 'join', clientId: this.clientId, name: options.name || 'Anonymous' });
      if (options.onConnect) options.onConnect();
    };
    this.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.clientId === this.clientId) return;
      if (msg.type === 'sync' && this.stores.has(msg.store)) {
        const store = this.stores.get(msg.store);
        const current = store.get();
        const merged = options.merge ? options.merge(current, msg.data) : { ...current, ...msg.data };
        store.set(merged);
      }
      if (msg.type === 'join') this._addPeer(msg.clientId, msg.name, options);
      if (msg.type === 'leave') this._removePeer(msg.clientId);
      if (msg.type === 'cursor') this._updatePeerCursor(msg.clientId, msg.x, msg.y);
      if (options.onMessage) options.onMessage(msg);
    };
    this.ws.onclose = () => {
      this.online = false;
      this._updateBadge('offline');
      if (options.onDisconnect) options.onDisconnect();
    };
    return this;
  }

  // Multiplayer cursor sharing
  shareCursors(options = {}) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth).toFixed(3);
      const y = (e.clientY / window.innerHeight).toFixed(3);
      this._broadcast({ type: 'cursor', x, y });
    });
    return this;
  }

  _addPeer(id, name, options) {
    const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    this.peers.set(id, { id, name, color });
    // Show cursor
    const cursor = document.createElement('div');
    cursor.className = 'nx-cursor-peer';
    cursor.id = `nx-peer-${id}`;
    cursor.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M0 0L16 6L8 8L6 16L0 0Z" fill="${color}"/></svg><div class="nx-cursor-peer-label" style="background:${color};color:#fff">${name}</div>`;
    document.body.appendChild(cursor);
  }

  _removePeer(id) {
    document.getElementById(`nx-peer-${id}`)?.remove();
    this.peers.delete(id);
  }

  _updatePeerCursor(id, rx, ry) {
    const cursor = document.getElementById(`nx-peer-${id}`);
    if (cursor) {
      cursor.style.left = (rx * window.innerWidth) + 'px';
      cursor.style.top = (ry * window.innerHeight) + 'px';
    }
  }

  // Presence badge (show who's online)
  showPresence(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    el.classList.add('nx-presence-avatars');
    const update = () => {
      el.innerHTML = '';
      this.peers.forEach(peer => {
        const av = document.createElement('div');
        av.className = 'nx-presence-avatar';
        av.style.background = peer.color;
        av.textContent = (peer.name || '?')[0].toUpperCase();
        av.title = peer.name;
        el.appendChild(av);
      });
    };
    this.ws.addEventListener('message', update);
    return this;
  }

  showBadge(options = {}) {
    if (!this.badge) {
      this.badge = document.createElement('div');
      this.badge.className = 'nx-sync-badge';
      document.body.appendChild(this.badge);
    }
    this._updateBadge(this.online ? 'online' : 'offline');
    return this;
  }

  _updateBadge(state) {
    if (!this.badge) return;
    const states = {
      online: ['nx-sync-online', '● Synced'],
      offline: ['nx-sync-offline', '◌ Offline'],
      syncing: ['nx-sync-syncing', '↻ Syncing...'],
    };
    const [cls, text] = states[state || (this.online ? 'online' : 'offline')];
    this.badge.className = 'nx-sync-badge ' + cls;
    this.badge.textContent = text;
  }

  disconnect() {
    this.ws?.close();
    return this;
  }
}

const syncEngine = new SyncEngine();
/**
 * NandanX — advancedUIEngine
 * 3D carousels, physics sliders, virtual scroll, advanced dropdowns, animated modals
 */
class AdvancedUIEngine {
  constructor() {
    this.initialized = false;
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-advui-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-advui-styles';
    s.textContent = `
      /* 3D Carousel */
      .nx-carousel-3d { perspective: 1000px; }
      .nx-carousel-track { transform-style: preserve-3d; position: relative; width: 100%; height: 100%; transition: transform 0.6s cubic-bezier(0.23,1,0.32,1); }
      .nx-carousel-slide { position: absolute; top: 0; left: 0; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 12px; overflow: hidden; }

      /* Physics Slider */
      .nx-slider { position: relative; user-select: none; }
      .nx-slider-track { height: 6px; background: var(--nx-surface, rgba(255,255,255,0.07)); border-radius: 6px; position: relative; cursor: pointer; }
      .nx-slider-fill { height: 100%; background: var(--nx-primary, #00f5ff); border-radius: 6px; transition: width 0.05s; box-shadow: 0 0 8px var(--nx-glow, rgba(0,245,255,0.4)); }
      .nx-slider-thumb { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; border-radius: 50%; background: var(--nx-primary, #00f5ff); box-shadow: 0 0 12px var(--nx-glow, rgba(0,245,255,0.5)); cursor: grab; transition: transform 0.2s ease; }
      .nx-slider-thumb:active { cursor: grabbing; transform: translate(-50%, -50%) scale(1.3); }
      .nx-slider-value { font-size: 12px; font-family: monospace; color: var(--nx-primary, #00f5ff); margin-top: 8px; text-align: center; }

      /* Virtual Scroll */
      .nx-virtual-scroll { overflow-y: auto; position: relative; }
      .nx-virtual-scroll::-webkit-scrollbar { width: 4px; }
      .nx-virtual-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      .nx-virtual-viewport { position: relative; }
      .nx-virtual-content { position: absolute; top: 0; left: 0; width: 100%; }

      /* Advanced Dropdown */
      .nx-dropdown { position: relative; display: inline-block; }
      .nx-dropdown-menu { position: absolute; top: calc(100% + 8px); left: 0; min-width: 200px; background: var(--nx-bg-2, #1a1a2e); border: 1px solid var(--nx-border, rgba(255,255,255,0.08)); border-radius: 12px; overflow: hidden; z-index: 1000; transform-origin: top; transform: scaleY(0); opacity: 0; transition: transform 0.2s cubic-bezier(0.23,1,0.32,1), opacity 0.2s ease; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
      .nx-dropdown-menu.nx-open { transform: scaleY(1); opacity: 1; }
      .nx-dropdown-item { padding: 10px 16px; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.15s; color: var(--nx-text, #e2e8f0); }
      .nx-dropdown-item:hover { background: var(--nx-surface, rgba(255,255,255,0.05)); }
      .nx-dropdown-item.nx-active { color: var(--nx-primary, #00f5ff); }
      .nx-dropdown-divider { height: 1px; background: var(--nx-border, rgba(255,255,255,0.06)); margin: 4px 0; }
      .nx-dropdown-search { padding: 10px 14px; border-bottom: 1px solid var(--nx-border, rgba(255,255,255,0.06)); }
      .nx-dropdown-search input { width: 100%; background: transparent; border: none; outline: none; font-size: 13px; color: var(--nx-text, #e2e8f0); }

      /* Animated Tabs */
      .nx-adv-tabs { position: relative; }
      .nx-adv-tab-bar { display: flex; position: relative; border-bottom: 1px solid var(--nx-border, rgba(255,255,255,0.08)); }
      .nx-adv-tab-btn { padding: 10px 20px; cursor: pointer; font-size: 14px; font-weight: 500; color: var(--nx-text-muted, rgba(226,232,240,0.5)); transition: color 0.2s; border: none; background: transparent; font-family: inherit; }
      .nx-adv-tab-btn.nx-active { color: var(--nx-primary, #00f5ff); }
      .nx-adv-tab-indicator { position: absolute; bottom: -1px; height: 2px; background: var(--nx-primary, #00f5ff); transition: left 0.3s cubic-bezier(0.23,1,0.32,1), width 0.3s cubic-bezier(0.23,1,0.32,1); box-shadow: 0 0 8px var(--nx-glow, rgba(0,245,255,0.5)); }
      .nx-adv-panel { display: none; animation: nx-panel-in 0.25s ease; }
      .nx-adv-panel.nx-active { display: block; }
      @keyframes nx-panel-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

      /* Accordion */
      .nx-accordion-item { border-bottom: 1px solid var(--nx-border, rgba(255,255,255,0.06)); }
      .nx-accordion-header { padding: 16px 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 15px; font-weight: 500; transition: color 0.2s; user-select: none; }
      .nx-accordion-header:hover { color: var(--nx-primary, #00f5ff); }
      .nx-accordion-icon { transition: transform 0.3s ease; }
      .nx-accordion-item.nx-open .nx-accordion-icon { transform: rotate(180deg); }
      .nx-accordion-body { max-height: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0.23,1,0.32,1); }
      .nx-accordion-inner { padding: 0 20px 16px; font-size: 14px; color: var(--nx-text-muted, rgba(226,232,240,0.6)); line-height: 1.7; }

      /* Rating */
      .nx-rating { display: flex; gap: 4px; cursor: pointer; }
      .nx-star { font-size: 24px; color: rgba(255,255,255,0.2); transition: transform 0.15s ease, color 0.15s ease; }
      .nx-star.nx-active { color: #eab308; }
      .nx-star:hover { transform: scale(1.2); }
    `;
    document.head.appendChild(s);
  }

  _autoDetect() {
    document.querySelectorAll('[data-nx-carousel]').forEach(el => this.carousel3D(el));
    document.querySelectorAll('[data-nx-slider]').forEach(el => {
      const opts = { min: parseFloat(el.dataset.min || 0), max: parseFloat(el.dataset.max || 100), value: parseFloat(el.dataset.value || 50) };
      this.slider(el, opts);
    });
    document.querySelectorAll('[data-nx-accordion]').forEach(el => this.accordion(el));
    document.querySelectorAll('[data-nx-dropdown]').forEach(el => this.dropdown(el));
    document.querySelectorAll('[data-nx-tabs]').forEach(el => this.tabs(el));
  }

  // 3D coverflow carousel
  carousel3D(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('nx-carousel-3d');
    const slides = Array.from(el.children);
    if (!slides.length) return this;

    const track = document.createElement('div');
    track.className = 'nx-carousel-track';
    slides.forEach(slide => { slide.classList.add('nx-carousel-slide'); track.appendChild(slide); });
    el.appendChild(track);

    let current = 0;
    const total = slides.length;
    const gap = options.gap || 300;

    const update = () => {
      slides.forEach((slide, i) => {
        const offset = i - current;
        const tx = offset * gap;
        const tz = -Math.abs(offset) * 100;
        const ry = offset * (options.rotateY || 30);
        const opacity = 1 - Math.abs(offset) * 0.3;
        const scale = 1 - Math.abs(offset) * 0.1;
        slide.style.cssText = `transform: translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${scale}); opacity:${opacity}; z-index:${total - Math.abs(offset)};`;
        slide.style.transition = 'all 0.5s cubic-bezier(0.23,1,0.32,1)';
      });
    };
    update();

    const prev = () => { current = (current - 1 + total) % total; update(); };
    const next = () => { current = (current + 1) % total; update(); };

    // Auto-add nav if not present
    if (options.nav !== false) {
      const prevBtn = document.createElement('button');
      prevBtn.innerHTML = '‹';
      prevBtn.style.cssText = 'position:absolute;left:10px;top:50%;transform:translateY(-50%);z-index:100;background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:24px;padding:8px 12px;border-radius:8px;cursor:pointer;';
      const nextBtn = document.createElement('button');
      nextBtn.innerHTML = '›';
      nextBtn.style.cssText = prevBtn.style.cssText + 'left:auto;right:10px;';
      prevBtn.addEventListener('click', prev);
      nextBtn.addEventListener('click', next);
      el.style.position = 'relative';
      el.appendChild(prevBtn);
      el.appendChild(nextBtn);
    }

    // Swipe
    let startX = 0;
    el.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
    el.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    });

    if (options.autoplay) setInterval(next, options.autoplay);
    return { prev, next, goTo: (i) => { current = i; update(); } };
  }

  // Physics-based range slider
  slider(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('nx-slider');
    const min = options.min || 0, max = options.max || 100;
    let value = options.value || min;

    el.innerHTML = `<div class="nx-slider-track"><div class="nx-slider-fill"></div><div class="nx-slider-thumb"></div></div>${options.showValue !== false ? '<div class="nx-slider-value">' + value + '</div>' : ''}`;

    const track = el.querySelector('.nx-slider-track');
    const fill = el.querySelector('.nx-slider-fill');
    const thumb = el.querySelector('.nx-slider-thumb');
    const label = el.querySelector('.nx-slider-value');

    let vx = 0, isDragging = false, targetPct = 0;

    const setPct = (pct) => {
      pct = Math.max(0, Math.min(1, pct));
      targetPct = pct;
    };

    const getVal = (pct) => Math.round(min + (max - min) * pct);

    // Physics spring update
    let currentPct = (value - min) / (max - min);
    const physics = () => {
      const spring = 0.18, damping = 0.7;
      vx = vx * damping + (targetPct - currentPct) * spring;
      currentPct += vx;
      currentPct = Math.max(0, Math.min(1, currentPct));
      fill.style.width = `${currentPct * 100}%`;
      thumb.style.left = `${currentPct * 100}%`;
      value = getVal(currentPct);
      if (label) label.textContent = (options.prefix || '') + value + (options.suffix || '');
      if (options.onChange) options.onChange(value);
      requestAnimationFrame(physics);
    };
    targetPct = currentPct;
    physics();

    const setFromEvent = (e) => {
      const rect = track.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      setPct(x / rect.width);
    };

    track.addEventListener('mousedown', (e) => { isDragging = true; setFromEvent(e); });
    document.addEventListener('mousemove', (e) => { if (isDragging) setFromEvent(e); });
    document.addEventListener('mouseup', () => { isDragging = false; });
    track.addEventListener('touchstart', (e) => { isDragging = true; setFromEvent(e); }, { passive: true });
    document.addEventListener('touchmove', (e) => { if (isDragging) setFromEvent(e); }, { passive: true });
    document.addEventListener('touchend', () => { isDragging = false; });

    return { getValue: () => value, setValue: (v) => setPct((v - min) / (max - min)) };
  }

  // Virtual scroll (no lag for huge lists)
  virtualScroll(container, items, renderItem, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    const itemH = options.itemHeight || 60;
    const buffer = options.buffer || 5;
    el.classList.add('nx-virtual-scroll');

    const viewport = document.createElement('div');
    viewport.className = 'nx-virtual-viewport';
    viewport.style.height = `${items.length * itemH}px`;
    const content = document.createElement('div');
    content.className = 'nx-virtual-content';
    viewport.appendChild(content);
    el.appendChild(viewport);

    const render = () => {
      const scrollTop = el.scrollTop;
      const start = Math.max(0, Math.floor(scrollTop / itemH) - buffer);
      const end = Math.min(items.length, Math.ceil((scrollTop + el.clientHeight) / itemH) + buffer);
      content.style.top = `${start * itemH}px`;
      content.innerHTML = '';
      for (let i = start; i < end; i++) {
        const itemEl = renderItem(items[i], i);
        itemEl.style.height = itemH + 'px';
        content.appendChild(itemEl);
      }
    };

    el.addEventListener('scroll', render, { passive: true });
    render();
    return { refresh: render, scrollTo: (idx) => { el.scrollTop = idx * itemH; } };
  }

  // Advanced dropdown with search
  dropdown(trigger, options = {}) {
    const btn = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
    if (!btn) return this;

    const wrap = document.createElement('div');
    wrap.className = 'nx-dropdown';
    btn.parentNode.insertBefore(wrap, btn);
    wrap.appendChild(btn);

    const menu = document.createElement('div');
    menu.className = 'nx-dropdown-menu';

    if (options.search) {
      const searchWrap = document.createElement('div');
      searchWrap.className = 'nx-dropdown-search';
      const searchInput = document.createElement('input');
      searchInput.placeholder = 'Search...';
      searchWrap.appendChild(searchInput);
      menu.appendChild(searchWrap);
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase();
        menu.querySelectorAll('.nx-dropdown-item').forEach(item => {
          item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      });
    }

    (options.items || []).forEach(item => {
      if (item === 'divider') {
        const d = document.createElement('div');
        d.className = 'nx-dropdown-divider';
        menu.appendChild(d);
        return;
      }
      const el = document.createElement('div');
      el.className = 'nx-dropdown-item';
      el.innerHTML = (item.icon ? `<span>${item.icon}</span>` : '') + `<span>${item.label}</span>`;
      el.addEventListener('click', () => {
        menu.querySelectorAll('.nx-dropdown-item').forEach(i => i.classList.remove('nx-active'));
        el.classList.add('nx-active');
        if (options.onSelect) options.onSelect(item);
        menu.classList.remove('nx-open');
        btn.textContent = (item.icon ? item.icon + ' ' : '') + item.label;
      });
      menu.appendChild(el);
    });

    wrap.appendChild(menu);
    btn.addEventListener('click', (e) => { e.stopPropagation(); menu.classList.toggle('nx-open'); });
    document.addEventListener('click', () => menu.classList.remove('nx-open'));
    return this;
  }

  // Animated tabs with sliding indicator
  tabs(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('nx-adv-tabs');

    const buttons = el.querySelectorAll('[data-tab-btn]') || [];
    const panels = el.querySelectorAll('[data-tab-panel]') || [];
    const bar = el.querySelector('.nx-adv-tab-bar') || el;
    const indicator = document.createElement('div');
    indicator.className = 'nx-adv-tab-indicator';
    bar.appendChild(indicator);

    const activate = (idx) => {
      buttons.forEach((btn, i) => btn.classList.toggle('nx-active', i === idx));
      panels.forEach((panel, i) => panel.classList.toggle('nx-active', i === idx));
      const activeBtn = buttons[idx];
      if (activeBtn) {
        indicator.style.left = activeBtn.offsetLeft + 'px';
        indicator.style.width = activeBtn.offsetWidth + 'px';
      }
    };

    buttons.forEach((btn, i) => btn.addEventListener('click', () => activate(i)));
    activate(0);
    return { activate };
  }

  // Accordion
  accordion(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const items = el.querySelectorAll('.nx-accordion-item');
    items.forEach(item => {
      const header = item.querySelector('.nx-accordion-header');
      const body = item.querySelector('.nx-accordion-body');
      if (!header || !body) return;
      if (!header.querySelector('.nx-accordion-icon')) {
        const icon = document.createElement('span');
        icon.className = 'nx-accordion-icon';
        icon.textContent = '▾';
        header.appendChild(icon);
      }
      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('nx-open');
        if (!options.multi) items.forEach(i => { i.classList.remove('nx-open'); i.querySelector('.nx-accordion-body').style.maxHeight = '0'; });
        if (!isOpen) {
          item.classList.add('nx-open');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
    return this;
  }

  // Star rating
  rating(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('nx-rating');
    const max = options.max || 5;
    let value = options.value || 0;

    for (let i = 1; i <= max; i++) {
      const star = document.createElement('span');
      star.className = 'nx-star';
      star.textContent = '★';
      star.dataset.value = i;
      star.addEventListener('mouseenter', () => el.querySelectorAll('.nx-star').forEach((s, j) => s.classList.toggle('nx-active', j < i)));
      star.addEventListener('mouseleave', () => el.querySelectorAll('.nx-star').forEach((s, j) => s.classList.toggle('nx-active', j < value)));
      star.addEventListener('click', () => {
        value = i;
        if (options.onChange) options.onChange(value);
      });
      el.appendChild(star);
    }

    el.querySelectorAll('.nx-star').forEach((s, j) => s.classList.toggle('nx-active', j < value));
    return { getValue: () => value };
  }
}

const advancedUIEngine = new AdvancedUIEngine();
/**
 * NandanX — smartFormEngine
 * Smart form validation, auto UX, inline errors, password strength, autofill
 */
class SmartFormEngine {
  constructor() {
    this.initialized = false;
    this.forms = new Map();
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-smartform-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-smartform-styles';
    s.textContent = `
      .nx-field { position: relative; margin-bottom: 20px; }
      .nx-field-input { width: 100%; padding: 12px 16px; background: var(--nx-surface, rgba(255,255,255,0.05)); border: 1.5px solid var(--nx-border, rgba(255,255,255,0.1)); border-radius: 10px; font-size: 14px; color: var(--nx-text, #e2e8f0); outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease; font-family: inherit; }
      .nx-field-input:focus { border-color: var(--nx-primary, #00f5ff); box-shadow: 0 0 0 3px rgba(0,245,255,0.1); }
      .nx-field-label { font-size: 12px; font-weight: 600; color: var(--nx-text-muted, rgba(226,232,240,0.6)); margin-bottom: 6px; display: block; letter-spacing: 0.04em; text-transform: uppercase; transition: color 0.2s; }
      .nx-field.nx-focused .nx-field-label { color: var(--nx-primary, #00f5ff); }
      .nx-field.nx-valid .nx-field-input { border-color: #22c55e; }
      .nx-field.nx-invalid .nx-field-input { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
      .nx-field-error { font-size: 12px; color: #ef4444; margin-top: 5px; display: none; padding-left: 4px; }
      .nx-field.nx-invalid .nx-field-error { display: block; animation: nx-shake-x 0.3s ease; }
      .nx-field-hint { font-size: 11px; color: var(--nx-text-muted, rgba(226,232,240,0.4)); margin-top: 4px; }
      .nx-field-icon { position: absolute; right: 12px; bottom: 13px; font-size: 16px; pointer-events: none; }
      .nx-field.nx-valid .nx-field-icon { color: #22c55e; }
      .nx-field.nx-invalid .nx-field-icon { color: #ef4444; }
      @keyframes nx-shake-x { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }

      /* Password strength */
      .nx-pw-strength { margin-top: 8px; }
      .nx-pw-bar { height: 4px; border-radius: 4px; background: var(--nx-border, rgba(255,255,255,0.08)); overflow: hidden; }
      .nx-pw-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease, background 0.3s ease; width: 0%; }
      .nx-pw-label { font-size: 11px; margin-top: 4px; }

      /* Float label */
      .nx-float-field { position: relative; margin-bottom: 20px; }
      .nx-float-input { width: 100%; padding: 20px 16px 8px; background: var(--nx-surface, rgba(255,255,255,0.05)); border: 1.5px solid var(--nx-border, rgba(255,255,255,0.1)); border-radius: 10px; font-size: 14px; color: var(--nx-text, #e2e8f0); outline: none; transition: border-color 0.2s; font-family: inherit; }
      .nx-float-input:focus { border-color: var(--nx-primary, #00f5ff); }
      .nx-float-label { position: absolute; left: 16px; top: 14px; font-size: 14px; color: var(--nx-text-muted, rgba(226,232,240,0.5)); pointer-events: none; transition: all 0.2s cubic-bezier(0.23,1,0.32,1); }
      .nx-float-input:focus ~ .nx-float-label,
      .nx-float-input:not(:placeholder-shown) ~ .nx-float-label { top: 6px; font-size: 10px; color: var(--nx-primary, #00f5ff); letter-spacing: 0.06em; text-transform: uppercase; font-weight: 600; }

      /* Character counter */
      .nx-char-count { font-size: 11px; text-align: right; color: var(--nx-text-muted, rgba(226,232,240,0.4)); margin-top: 3px; }
      .nx-char-count.nx-over { color: #ef4444; }

      /* Submit button state */
      .nx-submit-btn { position: relative; overflow: hidden; }
      .nx-submit-btn.nx-loading { pointer-events: none; opacity: 0.7; }
      .nx-submit-btn.nx-loading::after { content: ''; position: absolute; right: 14px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.3); border-top-color: rgba(0,0,0,0.8); border-radius: 50%; animation: nx-spin 0.6s linear infinite; }
      @keyframes nx-spin { to { transform: translateY(-50%) rotate(360deg); } }
      .nx-submit-btn.nx-success { background: #22c55e !important; }
    `;
    document.head.appendChild(s);
  }

  _autoDetect() {
    document.querySelectorAll('[data-nx-smartform]').forEach(form => this.enhance(form));
    document.querySelectorAll('[data-nx-float-label]').forEach(wrap => this.floatLabel(wrap));
    document.querySelectorAll('[data-nx-pw-strength]').forEach(input => this.passwordStrength(input));
  }

  // Enhance entire form with validation
  enhance(form, options = {}) {
    const el = typeof form === 'string' ? document.querySelector(form) : form;
    if (!el) return this;
    const rules = options.rules || {};

    el.querySelectorAll('[data-nx-validate]').forEach(input => {
      const r = rules[input.name] || this._parseRules(input.dataset.nxValidate);
      const field = input.closest('.nx-field');
      const errEl = field?.querySelector('.nx-field-error');
      const icon = field?.querySelector('.nx-field-icon');

      input.addEventListener('blur', () => this._validateField(input, r, field, errEl, icon));
      input.addEventListener('input', () => {
        if (field?.classList.contains('nx-invalid')) this._validateField(input, r, field, errEl, icon);
      });
    });

    el.addEventListener('submit', (e) => {
      let valid = true;
      el.querySelectorAll('[data-nx-validate]').forEach(input => {
        const r = rules[input.name] || this._parseRules(input.dataset.nxValidate);
        const field = input.closest('.nx-field');
        const errEl = field?.querySelector('.nx-field-error');
        const icon = field?.querySelector('.nx-field-icon');
        if (!this._validateField(input, r, field, errEl, icon)) valid = false;
      });
      if (!valid) { e.preventDefault(); if (options.onInvalid) options.onInvalid(); }
      else if (options.onValid) {
        e.preventDefault();
        const data = new FormData(el);
        options.onValid(Object.fromEntries(data));
      }
    });

    this.forms.set(el, { rules });
    return this;
  }

  _parseRules(str = '') {
    const rules = {};
    str.split('|').forEach(rule => {
      const [name, val] = rule.split(':');
      rules[name] = val || true;
    });
    return rules;
  }

  _validateField(input, rules, field, errEl, icon) {
    const val = input.value.trim();
    let error = '';

    if (rules.required && !val) error = rules.requiredMsg || 'This field is required';
    else if (rules.email && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) error = 'Invalid email address';
    else if (rules.min && val.length < parseInt(rules.min)) error = `Minimum ${rules.min} characters`;
    else if (rules.max && val.length > parseInt(rules.max)) error = `Maximum ${rules.max} characters`;
    else if (rules.minVal && parseFloat(val) < parseFloat(rules.minVal)) error = `Minimum value is ${rules.minVal}`;
    else if (rules.maxVal && parseFloat(val) > parseFloat(rules.maxVal)) error = `Maximum value is ${rules.maxVal}`;
    else if (rules.pattern && !new RegExp(rules.pattern).test(val)) error = rules.patternMsg || 'Invalid format';
    else if (rules.match) {
      const other = document.querySelector(`[name="${rules.match}"]`);
      if (other && other.value !== input.value) error = `Must match ${rules.match}`;
    }
    else if (rules.url && val && !/^https?:\/\/.+/.test(val)) error = 'Invalid URL';
    else if (rules.phone && val && !/^\+?[\d\s()-]{7,}$/.test(val)) error = 'Invalid phone number';
    else if (rules.number && val && isNaN(Number(val))) error = 'Must be a number';
    else if (rules.custom && typeof rules.custom === 'function') error = rules.custom(val) || '';

    if (field) {
      field.classList.toggle('nx-valid', !error);
      field.classList.toggle('nx-invalid', !!error);
    }
    if (errEl) errEl.textContent = error;
    if (icon) icon.textContent = error ? '✗' : (val ? '✓' : '');
    return !error;
  }

  // Float label input
  floatLabel(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('nx-float-field');
    const input = el.querySelector('input, textarea');
    const label = el.querySelector('label');
    if (!input || !label) return this;
    input.classList.add('nx-float-input');
    input.placeholder = ' ';
    label.classList.add('nx-float-label');
    input.addEventListener('focus', () => el.classList.add('nx-focused'));
    input.addEventListener('blur', () => el.classList.remove('nx-focused'));
    return this;
  }

  // Password strength meter
  passwordStrength(input, options = {}) {
    const el = typeof input === 'string' ? document.querySelector(input) : input;
    if (!el) return this;

    const wrap = document.createElement('div');
    wrap.className = 'nx-pw-strength';
    wrap.innerHTML = '<div class="nx-pw-bar"><div class="nx-pw-fill"></div></div><div class="nx-pw-label"></div>';
    el.parentNode.insertBefore(wrap, el.nextSibling);

    const fill = wrap.querySelector('.nx-pw-fill');
    const label = wrap.querySelector('.nx-pw-label');

    const levels = [
      { min: 0, color: '#ef4444', text: 'Too weak', width: '20%' },
      { min: 20, color: '#f97316', text: 'Weak', width: '40%' },
      { min: 40, color: '#eab308', text: 'Fair', width: '60%' },
      { min: 60, color: '#3b82f6', text: 'Good', width: '80%' },
      { min: 80, color: '#22c55e', text: 'Strong', width: '100%' },
    ];

    el.addEventListener('input', () => {
      const val = el.value;
      let score = 0;
      if (val.length >= 8) score += 20;
      if (val.length >= 12) score += 10;
      if (/[A-Z]/.test(val)) score += 20;
      if (/[0-9]/.test(val)) score += 20;
      if (/[^A-Za-z0-9]/.test(val)) score += 20;
      if (val.length >= 16) score += 10;

      const level = [...levels].reverse().find(l => score >= l.min) || levels[0];
      fill.style.width = level.width;
      fill.style.background = level.color;
      label.textContent = val ? level.text : '';
      label.style.color = level.color;
    });
    return this;
  }

  // Character counter
  charCounter(input, options = {}) {
    const el = typeof input === 'string' ? document.querySelector(input) : input;
    if (!el) return this;
    const max = options.max || parseInt(el.maxLength) || 140;
    const counter = document.createElement('div');
    counter.className = 'nx-char-count';
    counter.textContent = `0/${max}`;
    el.parentNode.insertBefore(counter, el.nextSibling);
    el.addEventListener('input', () => {
      const len = el.value.length;
      counter.textContent = `${len}/${max}`;
      counter.classList.toggle('nx-over', len > max);
    });
    return this;
  }

  // Submit button loading state
  submitState(btn, options = {}) {
    const el = typeof btn === 'string' ? document.querySelector(btn) : btn;
    if (!el) return;
    el.classList.add('nx-submit-btn');
    const original = el.textContent;
    return {
      loading: (text) => { el.classList.add('nx-loading'); el.textContent = text || 'Sending...'; },
      success: (text) => { el.classList.remove('nx-loading'); el.classList.add('nx-success'); el.textContent = text || '✓ Done'; setTimeout(() => { el.classList.remove('nx-success'); el.textContent = original; }, options.resetAfter || 2000); },
      error: (text) => { el.classList.remove('nx-loading'); el.textContent = text || original; },
      reset: () => { el.classList.remove('nx-loading', 'nx-success'); el.textContent = original; },
    };
  }

  // Build a complete form from schema
  build(container, schema, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    el.innerHTML = '';
    const form = document.createElement('form');
    form.setAttribute('novalidate', '');

    schema.forEach(field => {
      const wrap = document.createElement('div');
      wrap.className = 'nx-field';

      const label = document.createElement('label');
      label.className = 'nx-field-label';
      label.textContent = field.label;

      const input = document.createElement(field.type === 'textarea' ? 'textarea' : 'input');
      input.className = 'nx-field-input';
      input.name = field.name;
      input.placeholder = field.placeholder || '';
      if (field.type !== 'textarea') input.type = field.type || 'text';
      if (field.validate) input.dataset.nxValidate = field.validate;

      const err = document.createElement('div');
      err.className = 'nx-field-error';
      err.textContent = field.errorMsg || '';

      const icon = document.createElement('span');
      icon.className = 'nx-field-icon';

      wrap.appendChild(label);
      wrap.appendChild(input);
      wrap.appendChild(icon);
      wrap.appendChild(err);
      if (field.hint) {
        const hint = document.createElement('div');
        hint.className = 'nx-field-hint';
        hint.textContent = field.hint;
        wrap.appendChild(hint);
      }
      form.appendChild(wrap);

      if (field.type === 'password' && field.strength) this.passwordStrength(input);
      if (field.maxChars) this.charCounter(input, { max: field.maxChars });
    });

    if (options.submit) {
      const btn = document.createElement('button');
      btn.type = 'submit';
      btn.className = 'nx-submit-btn';
      btn.textContent = options.submitLabel || 'Submit';
      form.appendChild(btn);
    }

    el.appendChild(form);
    this.enhance(form, options);
    return form;
  }
}

const smartFormEngine = new SmartFormEngine();
/**
 * NandanX — microinteractionEngine
 * Magnetic buttons, hover microinteractions, press feedback, pulse, wiggle
 */
class MicrointeractionEngine {
  constructor() {
    this.initialized = false;
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-micro-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-micro-styles';
    s.textContent = `
      .nx-btn-3d { position: relative; transition: transform 0.1s ease; transform-style: preserve-3d; }
      .nx-btn-3d::after { content: ''; position: absolute; inset: 0; border-radius: inherit; transform: translateZ(-4px) translateY(4px); background: rgba(0,0,0,0.4); pointer-events: none; }
      .nx-btn-3d:active { transform: translateY(3px); }
      .nx-btn-3d:active::after { transform: translateZ(-2px) translateY(1px); }

      .nx-btn-fill { position: relative; overflow: hidden; z-index: 0; }
      .nx-btn-fill::before { content: ''; position: absolute; inset: -100%; background: rgba(255,255,255,0.15); transform: translateX(-100%) skewX(-15deg); transition: transform 0.5s ease; z-index: -1; }
      .nx-btn-fill:hover::before { transform: translateX(200%) skewX(-15deg); }

      .nx-btn-border-glow { position: relative; }
      .nx-btn-border-glow::before { content: ''; position: absolute; inset: -2px; border-radius: inherit; background: conic-gradient(from var(--nx-angle,0deg), #00f5ff, #7c3aed, #ff006e, #00f5ff); animation: nx-border-spin 3s linear infinite; z-index: -1; }
      @property --nx-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
      @keyframes nx-border-spin { to { --nx-angle: 360deg; } }

      .nx-click-scale:active { transform: scale(0.94); }
      .nx-hover-float { transition: transform 0.3s ease, box-shadow 0.3s ease; }
      .nx-hover-float:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.2); }

      .nx-press-ripple { position: relative; overflow: hidden; }
      .nx-ripple-wave { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.25); animation: nx-ripple 0.6s ease-out; pointer-events: none; }
      @keyframes nx-ripple { from { transform: scale(0); opacity: 1; } to { transform: scale(4); opacity: 0; } }

      .nx-wiggle:hover { animation: nx-wiggle 0.4s ease; }
      @keyframes nx-wiggle { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }

      .nx-jelly:hover { animation: nx-jelly 0.4s ease; }
      @keyframes nx-jelly { 0%,100% { transform: scale(1,1); } 25% { transform: scale(0.9,1.1); } 50% { transform: scale(1.1,0.9); } 75% { transform: scale(0.95,1.05); } }

      .nx-heartbeat { animation: nx-heartbeat 1.5s ease infinite; }
      @keyframes nx-heartbeat { 0%,100% { transform: scale(1); } 14% { transform: scale(1.15); } 28% { transform: scale(1); } 42% { transform: scale(1.15); } 70% { transform: scale(1); } }

      .nx-pulse-ring { position: relative; }
      .nx-pulse-ring::before { content: ''; position: absolute; inset: -6px; border-radius: inherit; border: 2px solid var(--nx-primary,#00f5ff); animation: nx-pulse-ring 2s ease-out infinite; opacity: 0; }
      @keyframes nx-pulse-ring { 0% { transform: scale(0.9); opacity: 0.7; } 100% { transform: scale(1.4); opacity: 0; } }

      .nx-swipe-indicator { position: relative; overflow: hidden; }
      .nx-swipe-indicator::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%); animation: nx-shimmer 1.5s infinite; }
      @keyframes nx-shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
    `;
    document.head.appendChild(s);
  }

  _autoDetect() {
    document.querySelectorAll('[data-nx-micro]').forEach(el => {
      const type = el.dataset.nxMicro;
      if (this[type]) this[type](el);
    });
    document.querySelectorAll('[data-nx-magnetic]').forEach(el => this.magnetic(el, { strength: parseFloat(el.dataset.nxMagnetic) || 0.4 }));
  }

  magnetic(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const strength = options.strength || 0.4;
    const ease = options.ease || 0.15;
    let tx = 0, ty = 0, vx = 0, vy = 0;
    let isHovered = false;

    el.addEventListener('mouseenter', () => { isHovered = true; });
    el.addEventListener('mouseleave', () => { isHovered = false; });
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      tx = (e.clientX - cx) * strength;
      ty = (e.clientY - cy) * strength;
    });

    const update = () => {
      if (!isHovered) { tx *= 0.85; ty *= 0.85; }
      vx += (tx - vx) * ease;
      vy += (ty - vy) * ease;
      el.style.transform = `translate(${vx.toFixed(2)}px, ${vy.toFixed(2)}px)`;
      requestAnimationFrame(update);
    };
    update();
    return this;
  }

  pressRipple(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => {
      el.classList.add('nx-press-ripple');
      el.style.position = el.style.position || 'relative';
      el.addEventListener('click', (e) => {
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const wave = document.createElement('div');
        wave.className = 'nx-ripple-wave';
        wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;`;
        el.appendChild(wave);
        wave.addEventListener('animationend', () => wave.remove());
      });
    });
    return this;
  }

  button3D(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('nx-btn-3d'));
    return this;
  }

  fillSwipe(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('nx-btn-fill'));
    return this;
  }

  borderGlow(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('nx-btn-border-glow'));
    return this;
  }

  float(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('nx-hover-float'));
    return this;
  }

  wiggle(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('nx-wiggle'));
    return this;
  }

  jelly(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('nx-jelly'));
    return this;
  }

  heartbeat(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('nx-heartbeat'));
    return this;
  }

  pulseRing(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('nx-pulse-ring'));
    return this;
  }

  shimmer(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('nx-swipe-indicator'));
    return this;
  }

  clickScale(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('nx-click-scale'));
    return this;
  }

  // Hover tilt card
  tilt(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const maxAngle = options.maxAngle || 15;
    const glare = options.glare !== false;

    if (glare) {
      const glareEl = document.createElement('div');
      glareEl.style.cssText = 'position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(circle at 0% 0%, rgba(255,255,255,0.2), transparent 70%);opacity:0;transition:opacity 0.3s;';
      el.style.position = el.style.position || 'relative';
      el.appendChild(glareEl);
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        glareEl.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.2), transparent 70%)`;
        glareEl.style.opacity = '1';
      });
      el.addEventListener('mouseleave', () => { glareEl.style.opacity = '0'; });
    }

    el.style.transformStyle = 'preserve-3d';
    el.style.transition = 'transform 0.1s ease';
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rx = ((e.clientY - cy) / (rect.height / 2)) * maxAngle;
      const ry = -((e.clientX - cx) / (rect.width / 2)) * maxAngle;
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)'; });
    return this;
  }
}

const microinteractionEngine = new MicrointeractionEngine();
/**
 * NandanX — builderEngine
 * Drag & Drop visual builder, resizable panels, snap grid, export
 */
class BuilderEngine {
  constructor() {
    this.initialized = false;
    this.canvas = null;
    this.selected = null;
    this.history = [];
    this.historyIdx = -1;
    this.grid = 8;
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-builder-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-builder-styles';
    s.textContent = `
      .nx-builder { position: relative; overflow: hidden; background: #0d0d1a; }
      .nx-builder-canvas { position: absolute; inset: 0; }
      .nx-builder-grid { background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 24px 24px; }
      .nx-builder-el { position: absolute; cursor: move; user-select: none; box-sizing: border-box; }
      .nx-builder-el.nx-selected { outline: 2px solid #00f5ff; outline-offset: 2px; }
      .nx-resize-handle { position: absolute; width: 8px; height: 8px; background: #00f5ff; border-radius: 2px; z-index: 10; }
      .nx-rh-se { bottom: -4px; right: -4px; cursor: se-resize; }
      .nx-rh-ne { top: -4px; right: -4px; cursor: ne-resize; }
      .nx-rh-sw { bottom: -4px; left: -4px; cursor: sw-resize; }
      .nx-builder-toolbar { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; background: rgba(20,20,35,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 8px 12px; z-index: 100; backdrop-filter: blur(12px); }
      .nx-tool-btn { padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(226,232,240,0.7); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: monospace; }
      .nx-tool-btn:hover, .nx-tool-btn.nx-active { background: rgba(0,245,255,0.1); color: #00f5ff; border-color: rgba(0,245,255,0.3); }
      .nx-builder-props { position: absolute; right: 12px; top: 12px; width: 200px; background: rgba(20,20,35,0.95); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; z-index: 100; backdrop-filter: blur(12px); font-size: 12px; color: rgba(226,232,240,0.7); }
      .nx-prop-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
      .nx-prop-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 3px 8px; color: #e2e8f0; font-size: 11px; width: 80px; outline: none; font-family: monospace; }
    `;
    document.head.appendChild(s);
  }

  create(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.classList.add('nx-builder');
    const canvas = document.createElement('div');
    canvas.className = 'nx-builder-canvas' + (options.grid !== false ? ' nx-builder-grid' : '');
    el.appendChild(canvas);
    this.canvas = canvas;

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'nx-builder-toolbar';
    const tools = [
      { id: 'text', label: '📝 Text', color: '#e2e8f0', bg: 'transparent', border: '1px solid rgba(255,255,255,0.2)', w: 120, h: 40 },
      { id: 'box', label: '⬜ Box', color: 'transparent', bg: 'rgba(0,245,255,0.1)', border: '1px solid #00f5ff', w: 120, h: 80 },
      { id: 'btn', label: '🔲 Button', color: '#000', bg: '#00f5ff', border: 'none', w: 100, h: 36 },
      { id: 'img', label: '🖼 Image', color: 'transparent', bg: '#1a1a2e', border: '2px dashed rgba(255,255,255,0.2)', w: 160, h: 100 },
      { id: 'circle', label: '⭕ Circle', color: 'transparent', bg: 'rgba(124,58,237,0.3)', border: '2px solid #7c3aed', w: 80, h: 80, radius: '50%' },
    ];

    tools.forEach(tool => {
      const btn = document.createElement('button');
      btn.className = 'nx-tool-btn';
      btn.textContent = tool.label;
      btn.addEventListener('click', () => {
        const x = Math.random() * (canvas.offsetWidth - tool.w - 40) + 20;
        const y = Math.random() * (canvas.offsetHeight - tool.h - 40) + 20;
        this.addElement(canvas, { ...tool, x, y });
      });
      toolbar.appendChild(btn);
    });

    // Undo/Redo/Export
    const undoBtn = document.createElement('button');
    undoBtn.className = 'nx-tool-btn';
    undoBtn.textContent = '↩ Undo';
    undoBtn.addEventListener('click', () => this.undo());

    const exportBtn = document.createElement('button');
    exportBtn.className = 'nx-tool-btn';
    exportBtn.textContent = '⬇ Export';
    exportBtn.addEventListener('click', () => this.export(canvas));

    toolbar.appendChild(undoBtn);
    toolbar.appendChild(exportBtn);
    el.appendChild(toolbar);

    // Props panel
    this.propsPanel = document.createElement('div');
    this.propsPanel.className = 'nx-builder-props';
    this.propsPanel.innerHTML = '<div style="font-weight:700;color:#00f5ff;margin-bottom:10px;font-family:monospace;font-size:11px;">PROPERTIES</div><div class="nx-no-sel" style="color:rgba(226,232,240,0.3);font-size:11px;">Select an element</div>';
    el.appendChild(this.propsPanel);

    // Click on canvas deselect
    canvas.addEventListener('click', (e) => {
      if (e.target === canvas) this._deselect();
    });

    return { canvas, addElement: (cfg) => this.addElement(canvas, cfg), export: () => this.export(canvas) };
  }

  addElement(canvas, cfg) {
    const el = document.createElement('div');
    el.className = 'nx-builder-el';
    el.style.cssText = `
      left: ${this._snap(cfg.x || 0)}px;
      top: ${this._snap(cfg.y || 0)}px;
      width: ${cfg.w || 120}px;
      height: ${cfg.h || 60}px;
      background: ${cfg.bg || 'transparent'};
      border: ${cfg.border || 'none'};
      color: ${cfg.color || '#e2e8f0'};
      border-radius: ${cfg.radius || '8px'};
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-family: inherit;
    `;
    el.textContent = cfg.label || cfg.id || 'Element';
    el.contentEditable = true;
    canvas.appendChild(el);

    // Resize handles
    ['se', 'ne', 'sw'].forEach(pos => {
      const handle = document.createElement('div');
      handle.className = `nx-resize-handle nx-rh-${pos}`;
      el.appendChild(handle);
      this._makeResizable(el, handle, pos);
    });

    this._makeDraggable(el, canvas);
    el.addEventListener('click', (e) => { e.stopPropagation(); this._select(el); });
    this._saveHistory(canvas);
    return el;
  }

  _snap(v) { return Math.round(v / this.grid) * this.grid; }

  _makeDraggable(el, canvas) {
    let isDragging = false, ox = 0, oy = 0;
    el.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('nx-resize-handle')) return;
      isDragging = true;
      ox = e.clientX - el.offsetLeft;
      oy = e.clientY - el.offsetTop;
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      el.style.left = this._snap(e.clientX - ox) + 'px';
      el.style.top = this._snap(e.clientY - oy) + 'px';
      this._updateProps(el);
    });
    document.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; this._saveHistory(canvas); } });
  }

  _makeResizable(el, handle, pos) {
    let isResizing = false, sx = 0, sy = 0, sw = 0, sh = 0;
    handle.addEventListener('mousedown', (e) => {
      isResizing = true;
      sx = e.clientX; sy = e.clientY;
      sw = el.offsetWidth; sh = el.offsetHeight;
      e.preventDefault(); e.stopPropagation();
    });
    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (pos.includes('e')) el.style.width = this._snap(Math.max(40, sw + dx)) + 'px';
      if (pos.includes('s')) el.style.height = this._snap(Math.max(20, sh + dy)) + 'px';
      if (pos.includes('n')) { el.style.height = this._snap(Math.max(20, sh - dy)) + 'px'; el.style.top = this._snap(el.offsetTop + dy) + 'px'; }
    });
    document.addEventListener('mouseup', () => { isResizing = false; });
  }

  _select(el) {
    this._deselect();
    this.selected = el;
    el.classList.add('nx-selected');
    this._updateProps(el);
  }

  _deselect() {
    if (this.selected) this.selected.classList.remove('nx-selected');
    this.selected = null;
    if (this.propsPanel) this.propsPanel.innerHTML = '<div style="font-weight:700;color:#00f5ff;margin-bottom:10px;font-family:monospace;font-size:11px;">PROPERTIES</div><div style="color:rgba(226,232,240,0.3);font-size:11px;">Select an element</div>';
  }

  _updateProps(el) {
    if (!this.propsPanel || this.selected !== el) return;
    this.propsPanel.innerHTML = `
      <div style="font-weight:700;color:#00f5ff;margin-bottom:10px;font-family:monospace;font-size:11px;">PROPERTIES</div>
      <div class="nx-prop-row"><span>X</span><input class="nx-prop-input" value="${el.offsetLeft}" onchange="this.closest('.nx-builder').querySelector('.nx-selected').style.left=this.value+'px'"/></div>
      <div class="nx-prop-row"><span>Y</span><input class="nx-prop-input" value="${el.offsetTop}" onchange="this.closest('.nx-builder').querySelector('.nx-selected').style.top=this.value+'px'"/></div>
      <div class="nx-prop-row"><span>W</span><input class="nx-prop-input" value="${el.offsetWidth}" onchange="this.closest('.nx-builder').querySelector('.nx-selected').style.width=this.value+'px'"/></div>
      <div class="nx-prop-row"><span>H</span><input class="nx-prop-input" value="${el.offsetHeight}" onchange="this.closest('.nx-builder').querySelector('.nx-selected').style.height=this.value+'px'"/></div>
      <div class="nx-prop-row"><span>Opacity</span><input class="nx-prop-input" type="number" min="0" max="1" step="0.1" value="${el.style.opacity||1}" onchange="this.closest('.nx-builder').querySelector('.nx-selected').style.opacity=this.value"/></div>
    `;
  }

  _saveHistory(canvas) {
    this.history = this.history.slice(0, this.historyIdx + 1);
    this.history.push(canvas.innerHTML);
    this.historyIdx = this.history.length - 1;
  }

  undo() {
    if (this.historyIdx > 0) {
      this.historyIdx--;
      this.canvas.innerHTML = this.history[this.historyIdx];
    }
  }

  export(canvas) {
    const html = `<div style="position:relative;width:${canvas.offsetWidth}px;height:${canvas.offsetHeight}px;">${canvas.innerHTML}</div>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'nx-builder-export.html';
    a.click();
  }
}

const builderEngine = new BuilderEngine();
/**
 * NandanX — revealEngine
 * Scroll reveal effects: cinematic, clip, stagger, count, progress, depth
 */
class RevealEngine {
  constructor() { this.initialized = false; this.observer = null; this.effects = new Map(); }
  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }
  _injectStyles() {
    if (document.getElementById('nx-reveal-styles')) return;
    const s = document.createElement('style'); s.id = 'nx-reveal-styles';
    s.textContent = `
      [data-nx-reveal] { opacity: 0; transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.23,1,0.32,1), filter 0.7s ease; will-change: transform, opacity; }
      [data-nx-reveal="up"] { transform: translateY(40px); }
      [data-nx-reveal="down"] { transform: translateY(-40px); }
      [data-nx-reveal="left"] { transform: translateX(-40px); }
      [data-nx-reveal="right"] { transform: translateX(40px); }
      [data-nx-reveal="scale"] { transform: scale(0.85); }
      [data-nx-reveal="blur"] { filter: blur(12px); transform: translateY(20px); }
      [data-nx-reveal="flip"] { transform: rotateX(-80deg); transform-origin: top; }
      [data-nx-reveal="rotate"] { transform: rotate(-10deg) translateY(30px); }
      [data-nx-reveal].nx-revealed { opacity: 1 !important; transform: none !important; filter: none !important; }
      .nx-clip-reveal { clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%); transition: clip-path 0.8s cubic-bezier(0.23,1,0.32,1); }
      .nx-clip-reveal.nx-revealed { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
      .nx-progress-bar-reveal { height: 4px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }
      .nx-progress-fill { height: 100%; background: var(--nx-primary,#00f5ff); border-radius: 4px; width: 0%; transition: width 1.2s cubic-bezier(0.23,1,0.32,1); box-shadow: 0 0 8px var(--nx-glow,rgba(0,245,255,0.5)); }
    `;
    document.head.appendChild(s);
  }
  _autoDetect() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseFloat(el.dataset.nxDelay || 0);
        setTimeout(() => el.classList.add('nx-revealed'), delay);
        if (el.dataset.nxProgress !== undefined) this._animateProgress(el);
        this.observer.unobserve(el);
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-nx-reveal]').forEach(el => this.observer.observe(el));
    document.querySelectorAll('[data-nx-progress]').forEach(el => {
      el.classList.add('nx-progress-bar-reveal');
      const fill = document.createElement('div');
      fill.className = 'nx-progress-fill';
      el.appendChild(fill);
      const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { fill.style.width = (el.dataset.nxProgress || 50) + '%'; obs.disconnect(); }
      }, { threshold: 0.5 });
      obs.observe(el);
    });
    // Stagger groups
    document.querySelectorAll('[data-nx-stagger]').forEach(container => {
      const delay = parseFloat(container.dataset.nxStagger || 80);
      const children = Array.from(container.children);
      children.forEach((child, i) => {
        child.setAttribute('data-nx-reveal', child.dataset.nxReveal || 'up');
        child.setAttribute('data-nx-delay', i * delay);
        this.observer.observe(child);
      });
    });
  }
  _animateProgress(el) {
    const fill = el.querySelector('.nx-progress-fill');
    if (fill) fill.style.width = (el.dataset.nxProgress || 50) + '%';
  }
  reveal(selector, options = {}) {
    const els = typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
    els.forEach((el, i) => {
      el.setAttribute('data-nx-reveal', options.effect || 'up');
      el.setAttribute('data-nx-delay', (options.delay || 0) + i * (options.stagger || 0));
      if (this.observer) this.observer.observe(el);
    });
    return this;
  }
  progressBar(selector, value, options = {}) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return this;
    el.classList.add('nx-progress-bar-reveal');
    if (!el.querySelector('.nx-progress-fill')) {
      const fill = document.createElement('div');
      fill.className = 'nx-progress-fill';
      if (options.color) fill.style.background = options.color;
      el.appendChild(fill);
    }
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { el.querySelector('.nx-progress-fill').style.width = value + '%'; obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(el);
    return this;
  }
}
const revealEngine = new RevealEngine();
/**
 * NandanX — springEngine
 * Spring/inertia physics for UI animations
 */
class SpringEngine {
  constructor() { this.initialized = false; this.springs = new Map(); }
  init() { if (this.initialized) return this; this.initialized = true; return this; }
  create(options = {}) {
    const stiffness = options.stiffness || 180;
    const damping = options.damping || 22;
    const mass = options.mass || 1;
    let value = options.value || 0;
    let velocity = 0;
    let target = value;
    let subscribers = [];
    let rafId = null;
    const step = () => {
      const springForce = -stiffness * (value - target);
      const dampingForce = -damping * velocity;
      const acceleration = (springForce + dampingForce) / mass;
      velocity += acceleration * 0.016;
      value += velocity * 0.016;
      subscribers.forEach(fn => fn(value));
      const settled = Math.abs(value - target) < 0.001 && Math.abs(velocity) < 0.001;
      if (!settled) rafId = requestAnimationFrame(step);
      else { value = target; velocity = 0; subscribers.forEach(fn => fn(value)); }
    };
    return {
      get: () => value,
      set: (v) => { target = v; cancelAnimationFrame(rafId); rafId = requestAnimationFrame(step); },
      subscribe: (fn) => { subscribers.push(fn); return () => { subscribers = subscribers.filter(s => s !== fn); }; },
      bind: (el, prop) => {
        return { get: () => value, set: (v) => { target = v; cancelAnimationFrame(rafId); rafId = requestAnimationFrame(step); subscribers.push(val => { if(el && prop) el.style[prop] = typeof val === 'number' && prop !== 'opacity' ? val + 'px' : val; }); } };
      },
    };
  }
  // Animate element property with spring physics
  animate(element, property, to, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const spring = this.create(options);
    const unsub = spring.subscribe(val => {
      if (property === 'translateX') el.style.transform = `translateX(${val}px)`;
      else if (property === 'translateY') el.style.transform = `translateY(${val}px)`;
      else if (property === 'scale') el.style.transform = `scale(${val})`;
      else el.style[property] = val + (options.unit || 'px');
    });
    spring.set(to);
    return { spring, stop: unsub };
  }
  // Elastic follow (element follows mouse with spring)
  follow(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const sx = this.create({ stiffness: options.stiffness || 100, damping: options.damping || 15 });
    const sy = this.create({ stiffness: options.stiffness || 100, damping: options.damping || 15 });
    sx.subscribe(x => { el.style.transform = `translate(${x}px, ${parseFloat(el.style.transform.match(/translate\(.*?,\s*(.*?)px\)/)?.[1] || 0)}px)`; });
    sy.subscribe(y => { el.style.transform = `translate(${parseFloat(el.style.transform.match(/translate\((.*?)px/)?.[1] || 0)}px, ${y}px)`; });
    document.addEventListener('mousemove', e => { sx.set(e.clientX - window.innerWidth / 2); sy.set(e.clientY - window.innerHeight / 2); });
    return this;
  }
}
const springEngine = new SpringEngine();
/**
 * NandanX — videoFiltersEngine
 * Real-time canvas video filters: grayscale, sepia, blur, neon, invert, pixelate, VHS
 */
class VideoFiltersEngine {
  constructor() { this.initialized = false; this.filters = new Map(); }
  init(options = {}) { if (this.initialized) return this; this.initialized = true; return this; }
  apply(videoEl, canvasEl, filterFn, options = {}) {
    const video = typeof videoEl === 'string' ? document.querySelector(videoEl) : videoEl;
    const canvas = typeof canvasEl === 'string' ? document.querySelector(canvasEl) : canvasEl;
    if (!video || !canvas) return this;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      canvas.width = video.videoWidth || canvas.offsetWidth;
      canvas.height = video.videoHeight || canvas.offsetHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      if (filterFn) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        filterFn(imageData.data, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);
      }
      requestAnimationFrame(draw);
    };
    video.addEventListener('play', draw);
    return this;
  }
  grayscale(d) { for (let i = 0; i < d.length; i += 4) { const g = 0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; d[i]=d[i+1]=d[i+2]=g; } }
  sepia(d) { for (let i = 0; i < d.length; i += 4) { const r=d[i],g=d[i+1],b=d[i+2]; d[i]=Math.min(255,r*0.393+g*0.769+b*0.189); d[i+1]=Math.min(255,r*0.349+g*0.686+b*0.168); d[i+2]=Math.min(255,r*0.272+g*0.534+b*0.131); } }
  invert(d) { for (let i = 0; i < d.length; i += 4) { d[i]=255-d[i]; d[i+1]=255-d[i+1]; d[i+2]=255-d[i+2]; } }
  neon(d) { for (let i = 0; i < d.length; i += 4) { d[i]=d[i]>100?255:0; d[i+1]=d[i+1]>100?255:0; d[i+2]=d[i+2]>100?255:0; } }
  pixelate(d, w, h, size=8) { for(let y=0;y<h;y+=size)for(let x=0;x<w;x+=size){const idx=(y*w+x)*4;const r=d[idx],g=d[idx+1],b=d[idx+2];for(let dy=0;dy<size&&y+dy<h;dy++)for(let dx=0;dx<size&&x+dx<w;dx++){const ni=((y+dy)*w+(x+dx))*4;d[ni]=r;d[ni+1]=g;d[ni+2]=b;}} }
  applyCSS(element, filter) { const el = typeof element === 'string' ? document.querySelector(element) : element; if (el) el.style.filter = filter; return this; }
  blur(el, px=5) { return this.applyCSS(el, `blur(${px}px)`); }
  vintage(el) { return this.applyCSS(el, 'sepia(0.5) contrast(1.2) brightness(0.9) saturate(0.8)'); }
  cyberpunk(el) { return this.applyCSS(el, 'hue-rotate(180deg) saturate(2) contrast(1.3)'); }
  horror(el) { return this.applyCSS(el, 'grayscale(0.8) contrast(1.5) brightness(0.7) sepia(0.3)'); }
  warmth(el) { return this.applyCSS(el, 'sepia(0.3) saturate(1.4) brightness(1.05)'); }
  cool(el) { return this.applyCSS(el, 'hue-rotate(30deg) saturate(1.2) brightness(0.95)'); }
  reset(el) { return this.applyCSS(el, 'none'); }
}
const videoFiltersEngine = new VideoFiltersEngine();
/**
 * NandanX — infiniteMarqueeEngine
 * Infinite scrolling banners, tickers, logo strips, news feeds
 */
class InfiniteMarqueeEngine {
  constructor() { this.initialized = false; }
  init() { if (this.initialized) return this; this._injectStyles(); this._autoDetect(); this.initialized = true; return this; }
  _injectStyles() {
    if (document.getElementById('nx-imarquee-styles')) return;
    const s = document.createElement('style'); s.id = 'nx-imarquee-styles';
    s.textContent = `
      .nx-imarquee { overflow: hidden; white-space: nowrap; }
      .nx-imarquee-inner { display: inline-flex; align-items: center; gap: var(--nx-marquee-gap, 40px); }
      .nx-imarquee-track { display: inline-flex; align-items: center; gap: var(--nx-marquee-gap, 40px); animation: nx-imarquee-scroll var(--nx-marquee-dur, 20s) linear infinite; white-space: nowrap; }
      .nx-imarquee-track.nx-reverse { animation-direction: reverse; }
      @keyframes nx-imarquee-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      .nx-imarquee:hover .nx-imarquee-track { animation-play-state: paused; }
      .nx-ticker { font-family: monospace; font-size: 13px; }
      .nx-ticker-item { padding: 0 20px; }
      .nx-ticker-sep { color: var(--nx-primary, #00f5ff); }
    `;
    document.head.appendChild(s);
  }
  _autoDetect() {
    document.querySelectorAll('[data-nx-marquee2]').forEach(el => {
      this.create(el, { speed: parseFloat(el.dataset.nxMarquee2) || 30, direction: el.dataset.nxDir || 'left' });
    });
  }
  create(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const speed = options.speed || 30;
    const direction = options.direction || 'left';
    const gap = options.gap || 40;
    el.classList.add('nx-imarquee');
    el.style.setProperty('--nx-marquee-gap', gap + 'px');
    const inner = document.createElement('div');
    inner.className = 'nx-imarquee-inner';
    const content = el.innerHTML;
    const track = document.createElement('div');
    track.className = 'nx-imarquee-track' + (direction === 'right' ? ' nx-reverse' : '');
    track.innerHTML = content + content;
    const trackW = () => track.scrollWidth / 2;
    inner.appendChild(track);
    el.innerHTML = '';
    el.appendChild(inner);
    setTimeout(() => {
      const dur = trackW() / speed;
      track.style.setProperty('--nx-marquee-dur', dur + 's');
      el.style.setProperty('--nx-marquee-dur', dur + 's');
    }, 100);
    return this;
  }
  ticker(container, items, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('nx-imarquee', 'nx-ticker');
    const sep = options.separator || ' ◆ ';
    const content = items.map(item => `<span class="nx-ticker-item">${item}</span><span class="nx-ticker-sep">${sep}</span>`).join('');
    return this.create(el, { ...options, speed: options.speed || 60 });
  }
  logoStrip(container, logos, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.innerHTML = logos.map(l => `<div style="display:inline-flex;align-items:center;padding:0 24px;opacity:0.5;filter:grayscale(1);transition:opacity 0.2s,filter 0.2s;" onmouseenter="this.style.opacity=1;this.style.filter='none'" onmouseleave="this.style.opacity=0.5;this.style.filter='grayscale(1)'">${l.img ? `<img src="${l.img}" alt="${l.name||''}" style="height:${options.height||32}px;">` : `<span style="font-weight:700;font-size:16px;">${l.name}</span>`}</div>`).join('');
    return this.create(el, options);
  }
}
const infiniteMarqueeEngine = new InfiniteMarqueeEngine();
/**
 * NandanX — holographicUIEngine
 * Holographic cards, neon borders, iridescent effects, scanline overlays
 */
class HolographicUIEngine {
  constructor() { this.initialized = false; }
  init() { if (this.initialized) return this; this._injectStyles(); this._autoDetect(); this.initialized = true; return this; }
  _injectStyles() {
    if (document.getElementById('nx-holo-ui-styles')) return;
    const s = document.createElement('style'); s.id = 'nx-holo-ui-styles';
    s.textContent = `
      .nx-holo-card { position: relative; border-radius: 16px; overflow: hidden; transform-style: preserve-3d; transition: transform 0.1s ease; }
      .nx-holo-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,245,255,0.1) 0%, rgba(124,58,237,0.1) 50%, rgba(255,0,110,0.1) 100%); opacity: 0; transition: opacity 0.3s; pointer-events: none; z-index: 2; mix-blend-mode: screen; }
      .nx-holo-card:hover::before { opacity: 1; }
      .nx-holo-foil { background: linear-gradient(45deg, #ff006e, #00f5ff, #00ff88, #7c3aed, #ff006e); background-size: 400% 400%; animation: nx-foil 4s ease infinite; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
      @keyframes nx-foil { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
      .nx-neon-border { position: relative; border-radius: inherit; }
      .nx-neon-border::before { content: ''; position: absolute; inset: -1px; border-radius: inherit; padding: 1px; background: linear-gradient(var(--nx-neon-angle, 45deg), #00f5ff, #7c3aed, #ff006e); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; animation: nx-neon-rotate 3s linear infinite; }
      @property --nx-neon-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
      @keyframes nx-neon-rotate { to { --nx-neon-angle: 360deg; } }
      .nx-scanline-overlay { position: relative; overflow: hidden; }
      .nx-scanline-overlay::after { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,245,255,0.03) 3px, rgba(0,245,255,0.03) 4px); pointer-events: none; z-index: 5; animation: nx-scan-move 8s linear infinite; }
      @keyframes nx-scan-move { from { background-position: 0 0; } to { background-position: 0 100%; } }
      .nx-holo-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; font-family: monospace; letter-spacing: 0.08em; background: rgba(0,245,255,0.1); border: 1px solid rgba(0,245,255,0.3); color: #00f5ff; text-shadow: 0 0 8px #00f5ff; box-shadow: 0 0 12px rgba(0,245,255,0.2); }
      .nx-holo-panel { background: rgba(0,245,255,0.03); border: 1px solid rgba(0,245,255,0.12); border-radius: 12px; position: relative; overflow: hidden; }
      .nx-holo-panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, #00f5ff, transparent); }
    `;
    document.head.appendChild(s);
  }
  _autoDetect() {
    document.querySelectorAll('[data-nx-holo]').forEach(el => this[el.dataset.nxHolo]?.(el));
  }
  card(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.classList.add('nx-holo-card');
    const maxAngle = options.maxAngle || 20;
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const ry = (x - 0.5) * maxAngle;
      const rx = (0.5 - y) * maxAngle;
      el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      el.style.setProperty('--x', x * 100 + '%');
      el.style.setProperty('--y', y * 100 + '%');
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    return this;
  }
  foilText(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) el.classList.add('nx-holo-foil');
    return this;
  }
  neonBorder(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) el.classList.add('nx-neon-border');
    return this;
  }
  scanlines(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) el.classList.add('nx-scanline-overlay');
    return this;
  }
  badge(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) el.classList.add('nx-holo-badge');
    return this;
  }
  panel(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) el.classList.add('nx-holo-panel');
    return this;
  }
}
const holographicUIEngine = new HolographicUIEngine();
/**
 * NandanX — adaptiveUIEngine
 * Smart adaptive UI: component auto-enhancer, layout intelligence, viewport-aware behaviors
 */
class AdaptiveUIEngine {
  constructor() { this.initialized = false; }
  init(options = {}) { if (this.initialized) return this; this._injectStyles(); this.initialized = true; if (options.auto) this.enhance(document.body); return this; }
  _injectStyles() {
    if (document.getElementById('nx-adaptive-styles')) return;
    const s = document.createElement('style'); s.id = 'nx-adaptive-styles';
    s.textContent = `
      .nx-auto-enhanced { transition: all 0.2s ease; }
      @media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      .nx-responsive-text { font-size: clamp(14px, 2vw, 18px); }
      .nx-responsive-h1 { font-size: clamp(28px, 6vw, 72px); line-height: 1.1; }
      .nx-responsive-h2 { font-size: clamp(22px, 4vw, 48px); line-height: 1.2; }
      .nx-sticky-smart { position: sticky; top: 0; z-index: 100; transition: box-shadow 0.3s ease, background 0.3s ease; }
      .nx-sticky-smart.nx-scrolled { box-shadow: 0 4px 20px rgba(0,0,0,0.3); background: rgba(10,10,18,0.95); backdrop-filter: blur(12px); }
      .nx-lazy-section { opacity: 0; transition: opacity 0.6s ease; }
      .nx-lazy-section.nx-loaded { opacity: 1; }
    `;
    document.head.appendChild(s);
  }
  enhance(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    // Auto-enhance buttons
    el.querySelectorAll('button:not(.nx-enhanced), [role="button"]:not(.nx-enhanced)').forEach(btn => {
      btn.classList.add('nx-enhanced');
      btn.style.transition = btn.style.transition || 'transform 0.15s ease, opacity 0.15s ease';
      btn.addEventListener('mouseenter', () => { btn.style.transform = 'translateY(-1px)'; });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
      btn.addEventListener('mousedown', () => { btn.style.transform = 'translateY(1px) scale(0.98)'; });
      btn.addEventListener('mouseup', () => { btn.style.transform = ''; });
    });
    // Auto-enhance images with lazy loading
    el.querySelectorAll('img:not(.nx-enhanced)').forEach(img => {
      img.classList.add('nx-enhanced');
      img.loading = 'lazy';
      img.style.transition = 'opacity 0.4s ease';
      if (!img.complete) { img.style.opacity = '0'; img.addEventListener('load', () => { img.style.opacity = '1'; }); }
    });
    // Auto sticky nav
    el.querySelectorAll('nav:not(.nx-enhanced), header:not(.nx-enhanced)').forEach(nav => {
      nav.classList.add('nx-enhanced', 'nx-sticky-smart');
      window.addEventListener('scroll', () => nav.classList.toggle('nx-scrolled', window.scrollY > 20), { passive: true });
    });
    // Responsive text
    el.querySelectorAll('h1:not(.nx-enhanced)').forEach(h => { h.classList.add('nx-enhanced', 'nx-responsive-h1'); });
    el.querySelectorAll('h2:not(.nx-enhanced)').forEach(h => { h.classList.add('nx-enhanced', 'nx-responsive-h2'); });
    return this;
  }
  responsiveMotion(options = {}) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { document.body.classList.add('nx-reduced-motion'); }
    return { reduced: prefersReduced };
  }
  stickyNav(selector, options = {}) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return this;
    el.classList.add('nx-sticky-smart');
    const threshold = options.threshold || 20;
    window.addEventListener('scroll', () => el.classList.toggle('nx-scrolled', window.scrollY > threshold), { passive: true });
    return this;
  }
  lazySection(selector) {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('nx-lazy-section');
      const obs = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { el.classList.add('nx-loaded'); obs.disconnect(); } }, { threshold: 0.1 });
      obs.observe(el);
    });
    return this;
  }
}
const adaptiveUIEngine = new AdaptiveUIEngine();
const NandanX = {
  version: '1.0.2',
  author: 'Nandan Das',

  cursor: cursorEngine,
  hover: hoverEngine,
  scroll: scrollEngine,
  magnet: magnetEngine,
  particle: particleEngine,
  thr3d: threeDEngine,
  physics: physicsEngine,
  mood: moodEngine,
  config: NandanXConfig,
  utils: NandanXUtils,
  text: textEngine,
  noise: noiseEngine,
  modal: modalEngine,
  form: formEngine,
  charts: canvasEngine,
  router: routerEngine,
  audio: audioEngine,
  drag: dragEngine,
  media: mediaEngine,
  theme: themeEngine,
  components: componentEngine,
  state: stateEngine,
  timeline: timelineEngine,
  gesture: gestureEngine,
  storage: storageEngine,
  network: networkEngine,
  a11y: accessibilityEngine,
  events: eventBusEngine,
  webgl: webglEngine,
  layout: layoutEngine,
  search: searchEngine,

  // v1.0 New Engines
  smoothScroll: smoothScrollEngine,
  parallax: parallaxEngine,
  svgMorph: svgMorphEngine,
  typography: typographyEngine,
  shader: shaderEngine,
  particles3D: particleSystemEngine,
  physicsWorld: physicsWorldEngine,
  cursorFX: cursorFXEngine,
  glitch: glitchEngine,
  audioViz: audioVisualizerEngine,
  scene3D: scene3DEngine,
  pageTransitions: pageTransitionEngine,
  gradient: gradientEngine,
  webrtc: webrtcEngine,
  liveChat: liveChatEngine,
  sync: syncEngine,
  advancedUI: advancedUIEngine,
  smartForm: smartFormEngine,
  microinteractions: microinteractionEngine,
  builder: builderEngine,
  reveal: revealEngine,
  spring: springEngine,
  videoFilters: videoFiltersEngine,
  infiniteMarquee: infiniteMarqueeEngine,
  holoUI: holographicUIEngine,
  adaptive: adaptiveUIEngine,

  _initialized: false,

  init(options) {
    if (this._initialized) return this;
    const {
      cursor: cursorOpts = {},
      hover: hoverOpts = {},
      scroll: scrollOpts = {},
      magnet: magnetOpts = {},
      particle: particleOpts = false,
      thr3d: thr3dOpts = {},
      physics: physicsOpts = {},
      mood: initialMood = null,
      auto: autoEnhance = true,
      debug: debugMode = false,
      theme: themeOpts = false,
      a11y: a11yOpts = false,
    } = options || {};

    this._debug = debugMode;

    if (!NandanXUtils.isMobile()) cursorEngine.init(cursorOpts);

    hoverEngine.init(hoverOpts);
    scrollEngine.init(scrollOpts);
    magnetEngine.init();
    threeDEngine.init();
    physicsEngine.init();
    moodEngine.init();
    textEngine.init();
    modalEngine.init();
    formEngine.init();
    canvasEngine.init();
    dragEngine.init();
    mediaEngine.init();
    componentEngine.init();
    stateEngine.init();
    timelineEngine.init();
    gestureEngine.init();
    storageEngine.init();
    networkEngine.init();
    eventBusEngine.init();
    webglEngine.init();
    layoutEngine.init();
    searchEngine.init();

    if (themeOpts !== false) {
      themeEngine.init(typeof themeOpts === 'object' ? themeOpts : {});
    }

    if (a11yOpts !== false) {
      accessibilityEngine.init();
    }

    moodEngine.setDependents({ cursor: cursorEngine, particle: particleEngine });

    if (particleOpts !== false) {
      particleEngine.init(typeof particleOpts === 'object' ? particleOpts : {});
      if (typeof particleOpts === 'object' && particleOpts.mode) {
        this._startParticleMode(particleOpts.mode, particleOpts);
      }
    }

    if (autoEnhance) {
      aiEngine.init({
        hover: hoverEngine,
        scroll: scrollEngine,
        thr3d: threeDEngine,
        physics: physicsEngine,
        cursor: cursorEngine,
      });
    }

    if (initialMood) moodEngine.set(initialMood);

    physicsEngine.attachToClicks(document, 'ripple');

    // v1.0 engines
    smoothScrollEngine.init();
    parallaxEngine.init();
    svgMorphEngine.init();
    typographyEngine.init();
    shaderEngine.init();
    particleSystemEngine.init();
    physicsWorldEngine.init();
    cursorFXEngine.init();
    glitchEngine.init();
    audioVisualizerEngine.init();
    scene3DEngine.init();
    pageTransitionEngine.init();
    gradientEngine.init();
    webrtcEngine.init();
    liveChatEngine.init();
    syncEngine.init();
    advancedUIEngine.init();
    smartFormEngine.init();
    microinteractionEngine.init();
    builderEngine.init();
    revealEngine.init();
    springEngine.init();
    videoFiltersEngine.init();
    infiniteMarqueeEngine.init();
    holographicUIEngine.init();
    adaptiveUIEngine.init();

    this._injectRootStyles();

    this._initialized = true;
    this._log('NandanX v1.0.2 initialized — Created by Nandan Das');

    NandanXUtils.emit(document, 'ready', { version: this.version });

    return this;
  },

  _startParticleMode(mode, opts) {
    if (mode === 'ambient') particleEngine.ambient(opts);
    else if (mode === 'constellation') particleEngine.constellation(opts);
    else if (mode === 'fireworks') particleEngine.fireworks();
    else if (mode === 'warp') particleEngine.warpSpeed(opts);
    else if (mode === 'matrix') particleEngine.matrixRain(opts);
    particleEngine.clickExplosion(opts.colors);
  },

  _injectRootStyles() {
    if (document.getElementById('nx-root-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-root-styles';
    s.textContent = `
      :root {
        --nx-primary: #00f5ff;
        --nx-secondary: #ff006e;
        --nx-accent: #7c3aed;
        --nx-bg: #0f0f1a;
        --nx-bg-2: #1a1a2e;
        --nx-text: #e2e8f0;
        --nx-text-muted: rgba(226,232,240,0.5);
        --nx-border: rgba(255,255,255,0.08);
        --nx-surface: rgba(255,255,255,0.04);
        --nx-glow: rgba(0,245,255,0.4);
        --nx-duration: 0.6s;
        --nx-ease: cubic-bezier(0.23, 1, 0.32, 1);
      }
      html { scroll-behavior: smooth; }
      *, *::before, *::after { box-sizing: border-box; }
    `;
    document.head.appendChild(s);
  },

  auto(options) {
    return this.init(Object.assign({
      auto: true,
      particle: { mode: 'ambient', count: 50 },
      theme: {},
    }, options || {}));
  },

  minimal(options) {
    return this.init(Object.assign({
      auto: false,
      particle: false,
    }, options || {}));
  },

  tilt(target, options) { return threeDEngine.tiltCard(target, options); },
  magnetic(target, strength) { return magnetEngine.attract(target, strength); },
  reveal(target, type, options) { return scrollEngine.reveal(target, type, options); },
  glow(target, color) { return hoverEngine.neon(target, color); },
  lift(target) { return hoverEngine.lift(target); },
  glitch(target) { return hoverEngine.glitch(target); },
  ripple(target) { return physicsEngine.attachToClicks(target, 'ripple'); },
  setMood(mood) { return moodEngine.set(mood); },
  float(target) { return magnetEngine.float(target); },
  parallax(target, speed) { return scrollEngine.parallax(target, speed); },
  glass(target) { return threeDEngine.glass(target); },
  holo(target) { return threeDEngine.holographic(target); },
  counter(target, to, options) { return scrollEngine.counter(target, to, options); },
  transition(type) { return aiEngine.pageTransition(type); },
  magneticText(target) { return hoverEngine.magneticText(target); },
  spotlight(target) { return hoverEngine.spotlight(target); },
  shake(target) { return hoverEngine.shake(target); },
  particles(mode, options) { if (!particleEngine.initialized) particleEngine.init(); this._startParticleMode(mode, options || {}); return this; },
  parallax3D(target, depth) { return threeDEngine.parallax3D(target, depth); },
  analyzeUI(container) { return aiEngine.analyzeUI(container); },
  stagger(target, delay) { return scrollEngine.stagger(target, delay); },
  bounce(target) { return magnetEngine.bouncyClick(target); },
  wobble(target) { return magnetEngine.wobble(target); },
  flip(target, trigger) { return threeDEngine.flipCard(target, trigger); },
  shockwave(target) { return physicsEngine.attachToClicks(target, 'shockwave'); },
  explode(target) { return physicsEngine.attachToClicks(target, 'pixels'); },

  typewriter(target, options) { return textEngine.typewriter(target, options); },
  scramble(target, options) { return textEngine.scramble(target, options); },
  gradientText(target, colors) { return textEngine.gradient(target, colors); },
  neonText(target, color) { return textEngine.neon(target, color); },
  wave(target) { return textEngine.wave(target); },

  toast(message, options) { return modalEngine.toast(message, options); },
  confirm(message, options) { return modalEngine.confirm(message, options); },
  modal(options) { return modalEngine.open(options); },
  tooltip(target, message) { return modalEngine.tooltip(target, message); },

  setTheme(name) { return themeEngine.set(name); },
  announce(msg, priority) { return accessibilityEngine.announce(msg, priority); },

  on(event, handler, options) { return eventBusEngine.on(event, handler, options); },
  off(event, handler) { return eventBusEngine.off(event, handler); },
  emit(event, data) { return eventBusEngine.emit(event, data); },

  animate(target, keyframes, options) { return timelineEngine.animate(target, keyframes, options); },
  entrance(target, type, options) { return timelineEngine.entrance(target, type, options); },
  pulse(target, options) { return timelineEngine.pulse(target, options); },

  store(name, state, options) { return stateEngine.createStore(name, state, options); },

  swipeLeft(target, handler) { return gestureEngine.swipeLeft(target, handler); },
  swipeRight(target, handler) { return gestureEngine.swipeRight(target, handler); },

  noiseBackground(container, options) { return noiseEngine.noiseBackground(container, options); },
  gradientMesh(container, options) { return noiseEngine.gradientMesh(container, options); },
  aurora(container, options) { return noiseEngine.aurora(container, options); },

  lineChart(container, data, options) { return canvasEngine.lineChart(container, data, options); },
  barChart(container, data, options) { return canvasEngine.barChart(container, data, options); },
  donutChart(container, data, options) { return canvasEngine.donutChart(container, data, options); },

  masonry(container, options) { return layoutEngine.masonry(container, options); },
  infiniteScroll(container, options) { return layoutEngine.infiniteScroll(container, options); },

  liveSearch(container, options) { return searchEngine.liveSearch(container, options); },
  filterList(container, options) { return searchEngine.filterList(container, options); },

  _log(...args) {
    if (this._debug) console.log('[NandanX]', ...args);
    else console.log('%cNandanX', 'color:#00f5ff;font-weight:bold;font-size:13px;', ...args);
  },

  // v1.0 shorthand methods
  initSmoothScroll(options) { return smoothScrollEngine.init(options); },
  butterSmooth(options) { return smoothScrollEngine.start(options); },
  scrollTo(target, options) { return smoothScrollEngine.scrollTo(target, options); },
  smoothScrollTo(target, options) { return smoothScrollEngine.scrollTo(target, options); },

  parallaxLayer(target, options) { return parallaxEngine.layer(target, options); },
  meshLayers(container, layers) { return parallaxEngine.depthLayers(container, layers); },
  stickyStory(container, steps, options) { return parallaxEngine.stickyStory(container, steps, options); },
  horizontalScroll(container, options) { return parallaxEngine.horizontal(container, options); },
  mouseParallax(container, layers, intensity) { return parallaxEngine.mouseParallax(container, layers, intensity); },
  scrollTimeline(element, keyframes, options) { return parallaxEngine.scrollTimeline(element, keyframes, options); },

  svgDraw(element, options) { return svgMorphEngine.draw(element, options); },
  svgBlob(element, options) { return svgMorphEngine.blob(element, options); },
  svgMorph(element, from, to, options) { return svgMorphEngine.morph(element, from, to, options); },
  clipMorph(element, shapes, options) { return svgMorphEngine.clipMorph(element, shapes, options); },

  splitText(element, options) { return typographyEngine.split(element, options); },
  marqueeText(element, options) { return typographyEngine.marquee(element, options); },
  waveText(element, options) { return typographyEngine.wave(element, options); },
  countUp(element, target, options) { return typographyEngine.countUp(element, target, options); },
  glitchText(element, options) { return typographyEngine.glitch(element, options); },
  highlightText(element, options) { return typographyEngine.highlight(element, options); },
  rotatingText(element, words, options) { return typographyEngine.rotatingText(element, words, options); },

  shaderPlasma(container, options) { return shaderEngine.plasma(container, options); },
  shaderFluid(container, options) { return shaderEngine.fluid(container, options); },
  shaderAurora(container, options) { return shaderEngine.aurora(container, options); },
  shaderWaves(container, options) { return shaderEngine.waves(container, options); },
  shaderHolo(container, options) { return shaderEngine.holographic(container, options); },

  fire(x, y, options) { return particleSystemEngine.fire(x, y, options); },
  snow(options) { return particleSystemEngine.snow(options); },
  confetti(x, y, options) { return particleSystemEngine.confetti(x, y, options); },
  starfield(options) { return particleSystemEngine.starfield(options); },
  smoke(x, y, options) { return particleSystemEngine.smoke(x, y, options); },
  bubbles(container, options) { return particleSystemEngine.bubbles(container, options); },
  clickConfetti(target, options) { return particleSystemEngine.clickConfetti(target, options); },

  physicsBody(element, options) { return physicsWorldEngine.createBody(element, options); },
  physicsSpring(a, b, options) { return physicsWorldEngine.spring(a, b, options); },
  physicsExplosion(x, y, r, f, options) { return physicsWorldEngine.explosion(x, y, r, f, options); },
  cloth(container, options) { return physicsWorldEngine.cloth(container, options); },

  cursorTrail(options) { return cursorFXEngine.trail(options); },
  cursorSpotlight(options) { return cursorFXEngine.spotlight(options); },
  cursorBlob(options) { return cursorFXEngine.blob(options); },
  cursorDotRing(options) { return cursorFXEngine.dotRing(options); },
  cursorEmoji(char, options) { return cursorFXEngine.emoji(char, options); },
  cursorReactive(selector, options) { return cursorFXEngine.reactive(selector, options); },

  glitchEffect(element, options) { return glitchEngine.text(element, options); },
  vhsEffect(element, options) { return glitchEngine.vhs(element, options); },
  scanlines(element) { return glitchEngine.scanlines(element); },
  digitalNoise(container, options) { return glitchEngine.noise(container, options); },
  pixelCorrupt(element, options) { return glitchEngine.pixelCorrupt(element, options); },

  audioVizBars(container, options) { return audioVisualizerEngine.bars(container, options); },
  audioVizWave(container, options) { return audioVisualizerEngine.waveform(container, options); },
  audioVizRadial(container, options) { return audioVisualizerEngine.radial(container, options); },
  audioReactive(selector, options) { return audioVisualizerEngine.reactive(selector, options); },

  scene3d(container, options) { return scene3DEngine.create(container, options); },
  card3D(element, options) { return scene3DEngine.card3D(element, options); },
  button3D(element, options) { return scene3DEngine.button3D(element, options); },

  fadeTransition(options) { return pageTransitionEngine.fade(options); },
  curtainTransition(options) { return pageTransitionEngine.curtain(options); },
  blockWipeTransition(options) { return pageTransitionEngine.blockWipe(options); },
  startLoader() { return pageTransitionEngine.startLoader(); },

  meshGradient(container, colors, options) { return gradientEngine.meshGradient(container, colors, options); },
  animatedGradient(element, colors, options) { return gradientEngine.animated(element, colors, options); },
  glassEffect(element, options) { return gradientEngine.glass(element, options); },
  neumorphism(element, options) { return gradientEngine.neumorphism(element, options); },
  autoDarkMode(options) { return gradientEngine.autoDarkMode(options); },
  generateTheme(color) { return gradientEngine.generateTheme(color); },
  gradientBg(element, colors, options) { return gradientEngine.animated(element, colors, options); },
  mouseGradient(element, colors, options) { return gradientEngine.mouseGradient(element, colors, options); },

  buildChat(container, options) { return liveChatEngine.build(container, options); },
  syncStore(name, state, options) { return syncEngine.createStore(name, state, options); },

  carousel3D(container, options) { return advancedUIEngine.carousel3D(container, options); },
  physicsSlider(container, options) { return advancedUIEngine.slider(container, options); },
  virtualScroll(container, items, renderFn, options) { return advancedUIEngine.virtualScroll(container, items, renderFn, options); },
  advDropdown(trigger, options) { return advancedUIEngine.dropdown(trigger, options); },
  animatedTabs(container, options) { return advancedUIEngine.tabs(container, options); },
  accordion(container, options) { return advancedUIEngine.accordion(container, options); },
  starRating(container, options) { return advancedUIEngine.rating(container, options); },

  smartForm(form, options) { return smartFormEngine.enhance(form, options); },
  floatLabel(container) { return smartFormEngine.floatLabel(container); },
  passwordStrength(input) { return smartFormEngine.passwordStrength(input); },

  magneticEl(target, options) { return microinteractionEngine.magnetic(target, typeof options === 'number' ? { strength: options } : (options || {})); },
  pressRipple(element) { return microinteractionEngine.pressRipple(element); },
  tiltCard(element, options) { return microinteractionEngine.tilt(element, options); },
  borderGlow(element) { return microinteractionEngine.borderGlow(element); },
  jelly(element) { return microinteractionEngine.jelly(element); },

  dragBuilder(container, options) { return builderEngine.create(container, options); },

  scrollReveal(selector, options) { return revealEngine.reveal(selector, options); },
  progressBar(selector, value, options) { return revealEngine.progressBar(selector, value, options); },

  springAnimate(element, property, to, options) { return springEngine.animate(element, property, to, options); },
  springFollow(element, options) { return springEngine.follow(element, options); },

  videoFilter(element, filter) { return videoFiltersEngine.applyCSS(element, filter); },
  infiniteMarquee(container, options) { return infiniteMarqueeEngine.create(container, options); },
  logoStrip(container, logos, options) { return infiniteMarqueeEngine.logoStrip(container, logos, options); },

  holoCard(element, options) { return holographicUIEngine.card(element, options); },
  holoFoil(element) { return holographicUIEngine.foilText(element); },
  neonBorder(element) { return holographicUIEngine.neonBorder(element); },
  holoBadge(element) { return holographicUIEngine.badge(element); },
  holoPanel(element) { return holographicUIEngine.panel(element); },

  autoEnhance(container, options) { return adaptiveUIEngine.enhance(container, options); },
  stickyNav(selector, options) { return adaptiveUIEngine.stickyNav(selector, options); },
  lazySection(selector) { return adaptiveUIEngine.lazySection(selector); },

  isReady() { return this._initialized; },

  features() {
    return [
      'magnetic-cursor', 'glow-cursor', 'trail-cursor', 'context-aware-cursor', 'cursor-particles', 'click-burst', 'cursor-label',
      'lift-hover', 'neon-hover', 'glitch-hover', 'spotlight-hover', 'liquid-hover', 'tilt-hover', 'magnetic-text', 'border-trace', 'float-hover', 'shake-hover', 'morph-hover', 'skew-hover', 'color-shift',
      'fade-up', 'fade-down', 'fade-left', 'fade-right', 'zoom-in', 'zoom-out', 'flip-x', 'flip-y', 'blur-reveal', 'skew-reveal', 'clip-reveal', 'text-reveal', 'cinematic', 'stagger', 'parallax', 'horizontal-scroll', 'counter-animation', 'scroll-progress', 'depth-scroll',
      'ripple', 'shockwave', 'pixel-explosion', 'ink-spread', 'energy-pulse', 'water-ripple', 'lightning',
      'ambient-particles', 'constellation', 'click-explosion', 'fireworks', 'matrix-rain', 'warp-speed',
      'tilt-card', 'flip-card', 'holographic', 'glass-morphism', 'parallax-3d', 'depth-scene', '3d-text', 'isometric', 'prism', 'depth-card',
      'magnetic-attract', 'magnetic-repel', 'gravity', 'elastic-drag', 'orbital-motion', 'wobble', 'float-physics', 'snap-grid', 'bouncy-click',
      'auto-detect-buttons', 'auto-detect-cards', 'auto-detect-sections', 'auto-detect-headings', 'ui-analyzer', 'page-transitions', 'accessibility-fix',
      'mood-soft', 'mood-hyper', 'mood-calm', 'mood-aggressive', 'mood-broken', 'mood-romantic', 'mood-transition', 'mood-cycle', 'custom-mood',
      'typewriter', 'scramble', 'gradient-text', 'neon-text', 'glitch-text', 'wave-text', 'reveal-chars', 'reveal-words', 'blur-text', 'highlight', 'flip-counter', 'multi-type',
      'noise-background', 'gradient-mesh', 'aurora', 'dots-bg', 'grid-bg', 'scanlines',
      'modal', 'drawer', 'toast', 'tooltip', 'confirm',
      'form-validation', 'float-label', 'toggle', 'checkbox', 'progress-ring', 'range-input', 'custom-select',
      'line-chart', 'bar-chart', 'donut-chart', 'area-chart', 'sparkline', 'gauge',
      'hash-router', 'history-router', 'page-transition-router', 'breadcrumb', 'nav-links',
      'click-sound', 'hover-sound', 'success-sound', 'error-sound', 'notification-sound',
      'draggable', 'dropzone', 'sortable', 'resizable', 'free-canvas',
      'lazy-load', 'image-zoom', 'image-parallax', 'skeleton', 'image-tilt', 'video-player', 'blur-load',
      'dark-theme', 'light-theme', 'neon-theme', 'ocean-theme', 'sunset-theme', 'forest-theme', 'midnight-theme', 'theme-switcher', 'color-picker',
      'accordion', 'tabs', 'carousel', 'stepper', 'badge', 'alert', 'chip', 'divider',
      'reactive-store', 'state-history', 'state-undo', 'two-way-binding', 'computed',
      'tween', 'timeline', 'entrance', 'exit', 'loop', 'stagger-enter', 'scroll-entrance',
      'swipe-left', 'swipe-right', 'swipe-up', 'swipe-down', 'tap', 'double-tap', 'long-press', 'pinch', 'rotate', 'keyboard-shortcut',
      'local-storage', 'session-storage', 'cookie', 'indexeddb', 'memory-store',
      'fetch-get', 'fetch-post', 'upload', 'download', 'polling', 'sse', 'graphql',
      'screen-reader-announce', 'focus-trap', 'roving-tabindex', 'skip-link', 'a11y-audit', 'aria-labels', 'a11y-toolbar',
      'event-bus', 'reactive-proxy', 'watch', 'computed-reactive', 'event-channel', 'keyboard-shortcuts',
      'webgl-gradient', 'webgl-ripple', 'plasma', 'metaballs',
      'masonry', 'grid', 'equal-heights', 'sticky-header', 'scroll-snap', 'infinite-scroll', 'virtual-list', 'split-pane',
      'live-search', 'full-text-search', 'fuzzy-search', 'filter-list', 'highlight-text',
      // v1.0
      'butter-smooth-scroll','virtual-scroll','scroll-snap-sections','scroll-momentum','scroll-to',
      'parallax-layers','depth-layers','sticky-story','horizontal-scroll-section','mouse-parallax','scroll-timeline',
      'svg-draw','svg-blob','svg-morph','clip-path-morph','shape-transition',
      'text-split-chars','text-split-words','text-wave','text-count-up','text-glitch','text-highlight','text-rotating',
      'shader-plasma','shader-fluid','shader-aurora','shader-waves','shader-holographic','custom-glsl',
      'fire-particles','snow-particles','confetti-particles','starfield','smoke-particles','bubble-particles',
      'physics-bodies','physics-spring','physics-rope','cloth-simulation','explosion',
      'cursor-trail','cursor-rainbow','cursor-spotlight','cursor-blob','cursor-dot-ring','cursor-emoji','cursor-ink',
      'glitch-css','rgb-split','vhs-effect','digital-noise','pixel-corrupt','tv-static','hologram-overlay',
      'audio-bars','audio-waveform','audio-radial','audio-spectrum','beat-detection','audio-reactive',
      '3d-scene','3d-orbit','3d-particles','3d-card','3d-button',
      'fade-transition','curtain-transition','split-curtain','block-wipe','zoom-transition','loader-bar',
      'mesh-gradient','animated-gradient','glassmorphism','neumorphism','auto-dark-mode','theme-generator','mouse-gradient',
      'webrtc-video-call','screen-share','webrtc-data',
      'live-chat-ui','typing-indicator','message-reactions','websocket','sse',
      'offline-store','multiplayer-cursor','presence-avatars','realtime-sync',
      '3d-carousel','physics-slider','virtual-list-10k','searchable-dropdown','animated-tabs','accordion','star-rating',
      'smart-validation','float-label','password-strength','char-counter','form-builder',
      'magnetic-element','press-ripple','btn-3d','fill-swipe','border-glow-spin','wiggle','jelly','heartbeat','pulse-ring',
      'drag-drop-builder','resize-handles','snap-grid','canvas-export',
      'scroll-reveal','stagger-reveal','clip-reveal','progress-bar-reveal',
      'spring-physics','spring-follow','elastic-ui',
      'video-filter-css','video-filter-canvas',
      'infinite-marquee','news-ticker','logo-strip',
      'holo-card','foil-text','neon-border-spin','scanline-ui','holo-badge',
      'auto-enhance','sticky-nav-smart','lazy-section',
    ];
  },
};

if (typeof window !== 'undefined') {
  window.NandanX = NandanX;
  window.NX = NandanX;
}


// ─────────────────────────────────────────────────────────────────────────────
// NandanX — Drop-in global alias  (jQuery / GSAP style)
// Usage: <script src="nandanx.js"></script>  →  NandanX.cursor() / NandanX.toast() etc.
// ─────────────────────────────────────────────────────────────────────────────
(function (root) {
  'use strict';

  var _NX = root.NandanX;
  if (!_NX) return; // guard

  // ── Auto-init on first meaningful call so user never has to call .init() ──
  function _autoInit() {
    if (!_NX._initialized) _NX.minimal(); // lightweight boot: no particles, no auto-scan
  }

  var NandanX = {

    version: '1.0.2',
    _nx: _NX,

    // ── Boot helpers ─────────────────────────────────────────────────────────
    init: function (opts) { return _NX.init(opts); },
    auto: function (opts) { return _NX.auto(opts); },
    minimal: function (opts) { return _NX.minimal(opts); },

    // ── Cursor ───────────────────────────────────────────────────────────────
    cursor: function (opts) {
      _autoInit();
      return _NX.cursor.init ? _NX.cursor.init(opts || {}) : _NX.cursor;
    },
    cursorTrail:    function (o)    { _autoInit(); return _NX.cursorTrail(o); },
    cursorSpotlight:function (o)    { _autoInit(); return _NX.cursorSpotlight(o); },
    cursorBlob:     function (o)    { _autoInit(); return _NX.cursorBlob(o); },
    cursorDotRing:  function (o)    { _autoInit(); return _NX.cursorDotRing(o); },
    cursorEmoji:    function (c, o) { _autoInit(); return _NX.cursorEmoji(c, o); },

    // ── Toast / Modal / Dialog ────────────────────────────────────────────────
    toast:   function (msg, o) { _autoInit(); return _NX.toast(msg, o); },
    modal:   function (o)      { _autoInit(); return _NX.modal(o); },
    confirm: function (msg, o) { _autoInit(); return _NX.confirm(msg, o); },
    tooltip: function (el, msg){ _autoInit(); return _NX.tooltip(el, msg); },

    // ── Glitch & Visual FX ───────────────────────────────────────────────────
    glitch:       function (el, o) { _autoInit(); return _NX.glitch(el, o); },
    glitchText:   function (el, o) { _autoInit(); return _NX.glitchText(el, o); },
    glitchEffect: function (el, o) { _autoInit(); return _NX.glitchEffect(el, o); },
    vhs:          function (el, o) { _autoInit(); return _NX.vhsEffect(el, o); },
    scanlines:    function (el)    { _autoInit(); return _NX.scanlines(el); },
    digitalNoise: function (el, o) { _autoInit(); return _NX.digitalNoise(el, o); },
    pixelCorrupt: function (el, o) { _autoInit(); return _NX.pixelCorrupt(el, o); },

    // ── Hover effects ────────────────────────────────────────────────────────
    glow:     function (el, c) { _autoInit(); return _NX.glow(el, c); },
    lift:     function (el)    { _autoInit(); return _NX.lift(el); },
    magnetic: function (el, s) { _autoInit(); return _NX.magnetic(el, s); },
    spotlight:function (el)    { _autoInit(); return _NX.spotlight(el); },
    shake:    function (el)    { _autoInit(); return _NX.shake(el); },
    tilt:     function (el, o) { _autoInit(); return _NX.tilt(el, o); },
    wobble:   function (el)    { _autoInit(); return _NX.wobble(el); },
    bounce:   function (el)    { _autoInit(); return _NX.bounce(el); },
    float:    function (el)    { _autoInit(); return _NX.float(el); },
    ripple:   function (el)    { _autoInit(); return _NX.ripple(el); },
    shockwave:function (el)    { _autoInit(); return _NX.shockwave(el); },
    flip:     function (el, t) { _autoInit(); return _NX.flip(el, t); },
    holo:     function (el)    { _autoInit(); return _NX.holo(el); },
    glass:    function (el)    { _autoInit(); return _NX.glass(el); },

    // ── Text ─────────────────────────────────────────────────────────────────
    typewriter:   function (el, o)    { _autoInit(); return _NX.typewriter(el, o); },
    scramble:     function (el, o)    { _autoInit(); return _NX.scramble(el, o); },
    gradientText: function (el, c)    { _autoInit(); return _NX.gradientText(el, c); },
    neonText:     function (el, c)    { _autoInit(); return _NX.neonText(el, c); },
    wave:         function (el)       { _autoInit(); return _NX.wave(el); },
    splitText:    function (el, o)    { _autoInit(); return _NX.splitText(el, o); },
    waveText:     function (el, o)    { _autoInit(); return _NX.waveText(el, o); },
    countUp:      function (el, n, o) { _autoInit(); return _NX.countUp(el, n, o); },
    rotatingText: function (el, w, o) { _autoInit(); return _NX.rotatingText(el, w, o); },
    highlightText:function (el, o)    { _autoInit(); return _NX.highlightText(el, o); },
    marqueeText:  function (el, o)    { _autoInit(); return _NX.marqueeText(el, o); },

    // ── Scroll ───────────────────────────────────────────────────────────────
    reveal:       function (el, t, o) { _autoInit(); return _NX.reveal(el, t, o); },
    parallax:     function (el, s)    { _autoInit(); return _NX.parallax(el, s); },
    stagger:      function (el, d)    { _autoInit(); return _NX.stagger(el, d); },
    counter:      function (el, n, o) { _autoInit(); return _NX.counter(el, n, o); },
    scrollTo:     function (el, o)    { _autoInit(); return _NX.scrollTo(el, o); },
    butterSmooth: function (o)        { _autoInit(); return _NX.butterSmooth(o); },
    horizontalScroll: function (el, o){ _autoInit(); return _NX.horizontalScroll(el, o); },
    stickyStory:  function (c, s, o)  { _autoInit(); return _NX.stickyStory(c, s, o); },
    mouseParallax:function (c, l, i)  { _autoInit(); return _NX.mouseParallax(c, l, i); },
    scrollTimeline:function (el, k, o){ _autoInit(); return _NX.scrollTimeline(el, k, o); },

    // ── Particles ────────────────────────────────────────────────────────────
    particles:   function (mode, o)  { _autoInit(); return _NX.particles(mode, o); },
    fire:        function (x, y, o)  { _autoInit(); return _NX.fire(x, y, o); },
    snow:        function (o)        { _autoInit(); return _NX.snow(o); },
    confetti:    function (x, y, o)  { _autoInit(); return _NX.confetti(x, y, o); },
    starfield:   function (o)        { _autoInit(); return _NX.starfield(o); },
    smoke:       function (x, y, o)  { _autoInit(); return _NX.smoke(x, y, o); },
    bubbles:     function (c, o)     { _autoInit(); return _NX.bubbles(c, o); },
    clickConfetti:function (el, o)   { _autoInit(); return _NX.clickConfetti(el, o); },

    // ── Shader / WebGL backgrounds ───────────────────────────────────────────
    shaderPlasma: function (c, o) { _autoInit(); return _NX.shaderPlasma(c, o); },
    shaderFluid:  function (c, o) { _autoInit(); return _NX.shaderFluid(c, o); },
    shaderAurora: function (c, o) { _autoInit(); return _NX.shaderAurora(c, o); },
    shaderWaves:  function (c, o) { _autoInit(); return _NX.shaderWaves(c, o); },
    shaderHolo:   function (c, o) { _autoInit(); return _NX.shaderHolo(c, o); },
    aurora:       function (c, o) { _autoInit(); return _NX.aurora(c, o); },
    noiseBackground:  function (c, o)    { _autoInit(); return _NX.noiseBackground(c, o); },
    gradientMesh: function (c, o)        { _autoInit(); return _NX.gradientMesh(c, o); },
    meshGradient: function (c, cl, o)    { _autoInit(); return _NX.meshGradient(c, cl, o); },
    animatedGradient: function (el, cl, o){ _autoInit(); return _NX.animatedGradient(el, cl, o); },
    mouseGradient:function (el, cl, o)   { _autoInit(); return _NX.mouseGradient(el, cl, o); },

    // ── SVG ──────────────────────────────────────────────────────────────────
    svgDraw:  function (el, o)       { _autoInit(); return _NX.svgDraw(el, o); },
    svgBlob:  function (el, o)       { _autoInit(); return _NX.svgBlob(el, o); },
    svgMorph: function (el, f, t, o) { _autoInit(); return _NX.svgMorph(el, f, t, o); },
    clipMorph:function (el, s, o)    { _autoInit(); return _NX.clipMorph(el, s, o); },

    // ── Animation ────────────────────────────────────────────────────────────
    animate:   function (el, k, o)  { _autoInit(); return _NX.animate(el, k, o); },
    entrance:  function (el, t, o)  { _autoInit(); return _NX.entrance(el, t, o); },
    pulse:     function (el, o)     { _autoInit(); return _NX.pulse(el, o); },
    springAnimate: function (el, p, v, o){ _autoInit(); return _NX.springAnimate(el, p, v, o); },
    springFollow:  function (el, o)     { _autoInit(); return _NX.springFollow(el, o); },
    tween:    function (el, o)      { _autoInit(); return _NX.timeline ? _NX.timeline.tween(el, o) : null; },

    // ── 3D ───────────────────────────────────────────────────────────────────
    scene3d:    function (c, o)  { _autoInit(); return _NX.scene3d(c, o); },
    card3D:     function (el, o) { _autoInit(); return _NX.card3D(el, o); },
    button3D:   function (el, o) { _autoInit(); return _NX.button3D(el, o); },
    parallax3D: function (el, d) { _autoInit(); return _NX.parallax3D(el, d); },
    holoCard:   function (el, o) { _autoInit(); return _NX.holoCard(el, o); },
    holoFoil:   function (el)    { _autoInit(); return _NX.holoFoil(el); },
    neonBorder: function (el)    { _autoInit(); return _NX.neonBorder(el); },

    // ── Physics ──────────────────────────────────────────────────────────────
    physicsBody:     function (el, o)        { _autoInit(); return _NX.physicsBody(el, o); },
    physicsSpring:   function (a, b, o)      { _autoInit(); return _NX.physicsSpring(a, b, o); },
    physicsExplosion:function (x, y, r, f, o){ _autoInit(); return _NX.physicsExplosion(x, y, r, f, o); },
    cloth:           function (c, o)         { _autoInit(); return _NX.cloth(c, o); },
    explode:         function (el)           { _autoInit(); return _NX.explode(el); },

    // ── Charts ───────────────────────────────────────────────────────────────
    lineChart:   function (c, d, o) { _autoInit(); return _NX.lineChart(c, d, o); },
    barChart:    function (c, d, o) { _autoInit(); return _NX.barChart(c, d, o); },
    donutChart:  function (c, d, o) { _autoInit(); return _NX.donutChart(c, d, o); },

    // ── UI Components ────────────────────────────────────────────────────────
    accordion:    function (c, o)     { _autoInit(); return _NX.accordion(c, o); },
    carousel3D:   function (c, o)     { _autoInit(); return _NX.carousel3D(c, o); },
    animatedTabs: function (c, o)     { _autoInit(); return _NX.animatedTabs(c, o); },
    starRating:   function (c, o)     { _autoInit(); return _NX.starRating(c, o); },
    advDropdown:  function (el, o)    { _autoInit(); return _NX.advDropdown(el, o); },
    infiniteMarquee: function (c, o)  { _autoInit(); return _NX.infiniteMarquee(c, o); },
    logoStrip:    function (c, l, o)  { _autoInit(); return _NX.logoStrip(c, l, o); },
    masonry:      function (c, o)     { _autoInit(); return _NX.masonry(c, o); },
    infiniteScroll:function (c, o)    { _autoInit(); return _NX.infiniteScroll(c, o); },

    // ── Gestures ─────────────────────────────────────────────────────────────
    swipeLeft:  function (el, fn) { _autoInit(); return _NX.swipeLeft(el, fn); },
    swipeRight: function (el, fn) { _autoInit(); return _NX.swipeRight(el, fn); },

    // ── Forms ────────────────────────────────────────────────────────────────
    smartForm: function (form, o) { _autoInit(); return _NX.smartForm(form, o); },

    // ── Theme & Mood ─────────────────────────────────────────────────────────
    setTheme: function (name) { _autoInit(); return _NX.setTheme(name); },
    setMood:  function (mood) { _autoInit(); return _NX.setMood(mood); },
    generateTheme: function (c) { _autoInit(); return _NX.generateTheme(c); },
    autoDarkMode:  function (o) { _autoInit(); return _NX.autoDarkMode(o); },
    glassEffect:   function (el, o) { _autoInit(); return _NX.glassEffect(el, o); },
    neumorphism:   function (el, o) { _autoInit(); return _NX.neumorphism(el, o); },

    // ── Page Transitions ─────────────────────────────────────────────────────
    fadeTransition:    function (o) { _autoInit(); return _NX.fadeTransition(o); },
    curtainTransition: function (o) { _autoInit(); return _NX.curtainTransition(o); },
    blockWipe:         function (o) { _autoInit(); return _NX.blockWipeTransition(o); },
    startLoader:       function ()  { _autoInit(); return _NX.startLoader(); },
    transition:        function (t) { _autoInit(); return _NX.transition(t); },

    // ── Audio Visualizer ─────────────────────────────────────────────────────
    audioVizBars:  function (c, o) { _autoInit(); return _NX.audioVizBars(c, o); },
    audioVizWave:  function (c, o) { _autoInit(); return _NX.audioVizWave(c, o); },
    audioVizRadial:function (c, o) { _autoInit(); return _NX.audioVizRadial(c, o); },
    audioReactive: function (s, o) { _autoInit(); return _NX.audioReactive(s, o); },

    // ── Accessibility ────────────────────────────────────────────────────────
    announce: function (msg, p) { _autoInit(); return _NX.announce(msg, p); },

    // ── Search ───────────────────────────────────────────────────────────────
    liveSearch:  function (c, o) { _autoInit(); return _NX.liveSearch(c, o); },
    filterList:  function (c, o) { _autoInit(); return _NX.filterList(c, o); },

    // ── Events ───────────────────────────────────────────────────────────────
    on:   function (ev, fn, o) { _autoInit(); return _NX.on(ev, fn, o); },
    off:  function (ev, fn)    { _autoInit(); return _NX.off(ev, fn); },
    emit: function (ev, d)     { _autoInit(); return _NX.emit(ev, d); },

    // ── State ────────────────────────────────────────────────────────────────
    store: function (name, state, o) { _autoInit(); return _NX.store(name, state, o); },

    // ── Drag & Build ─────────────────────────────────────────────────────────
    dragBuilder: function (c, o) { _autoInit(); return _NX.dragBuilder ? _NX.dragBuilder(c, o) : null; },

    // ── Microinteractions ────────────────────────────────────────────────────
    magneticEl:  function (el, o) { _autoInit(); return _NX.magneticEl ? _NX.magneticEl(el, o) : null; },
    pressRipple: function (el)    { _autoInit(); return _NX.pressRipple ? _NX.pressRipple(el) : null; },
    tiltCard:    function (el, o) { _autoInit(); return _NX.tiltCard ? _NX.tiltCard(el, o) : null; },
    borderGlow:  function (el)    { _autoInit(); return _NX.borderGlow ? _NX.borderGlow(el) : null; },
    jelly:       function (el)    { _autoInit(); return _NX.jelly ? _NX.jelly(el) : null; },

    // ── Reveal ───────────────────────────────────────────────────────────────
    scrollReveal: function (sel, o)       { _autoInit(); return _NX.scrollReveal ? _NX.scrollReveal(sel, o) : null; },
    progressBar:  function (sel, v, o)    { _autoInit(); return _NX.progressBar ? _NX.progressBar(sel, v, o) : null; },

    // ── Utility ──────────────────────────────────────────────────────────────
    features: function () { return _NX.features(); },
    isReady:  function () { return _NX.isReady(); },
    utils: _NX.utils,
    config: _NX.config,
  };

  // Expose globally
  root.NandanX = NandanX;
  root.NX = NandanX; // two-letter shorthand

})(typeof window !== 'undefined' ? window : this);
