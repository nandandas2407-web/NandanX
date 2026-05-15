var VeloxUtils = {

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
    const r1 = VeloxUtils.hexToRgb(c1), r2 = VeloxUtils.hexToRgb(c2);
    if (!r1 || !r2) return c1;
    return `rgb(${Math.round(VeloxUtils.lerp(r1.r, r2.r, t))},${Math.round(VeloxUtils.lerp(r1.g, r2.g, t))},${Math.round(VeloxUtils.lerp(r1.b, r2.b, t))})`;
  },
  randomHsl: (h = null, s = 70, l = 60) => `hsl(${h !== null ? h : Math.random() * 360},${s}%,${l}%)`,
  getContrastRatio: (hex1, hex2) => {
    const lum = (hex) => {
      const c = VeloxUtils.hexToRgb(hex) || { r: 0, g: 0, b: 0 };
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
    if (typeof target === 'string') return VeloxUtils.qsa(target);
    if (target instanceof Element) return [target];
    if (target instanceof NodeList || Array.isArray(target)) return [...target];
    return [];
  },

  animate: (duration, callback, easing) => {
    const ease = easing || ((t) => t);
    const start = performance.now();
    const tick = (now) => {
      const progress = VeloxUtils.clamp((now - start) / duration, 0, 1);
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

if (typeof window !== 'undefined') window.VeloxUtils = VeloxUtils;
