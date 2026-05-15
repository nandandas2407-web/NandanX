/**
 * VeloxUI — microinteractionEngine
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
    if (document.getElementById('vx-micro-styles')) return;
    const s = document.createElement('style');
    s.id = 'vx-micro-styles';
    s.textContent = `
      .vx-btn-3d { position: relative; transition: transform 0.1s ease; transform-style: preserve-3d; }
      .vx-btn-3d::after { content: ''; position: absolute; inset: 0; border-radius: inherit; transform: translateZ(-4px) translateY(4px); background: rgba(0,0,0,0.4); pointer-events: none; }
      .vx-btn-3d:active { transform: translateY(3px); }
      .vx-btn-3d:active::after { transform: translateZ(-2px) translateY(1px); }

      .vx-btn-fill { position: relative; overflow: hidden; z-index: 0; }
      .vx-btn-fill::before { content: ''; position: absolute; inset: -100%; background: rgba(255,255,255,0.15); transform: translateX(-100%) skewX(-15deg); transition: transform 0.5s ease; z-index: -1; }
      .vx-btn-fill:hover::before { transform: translateX(200%) skewX(-15deg); }

      .vx-btn-border-glow { position: relative; }
      .vx-btn-border-glow::before { content: ''; position: absolute; inset: -2px; border-radius: inherit; background: conic-gradient(from var(--vx-angle,0deg), #00f5ff, #7c3aed, #ff006e, #00f5ff); animation: vx-border-spin 3s linear infinite; z-index: -1; }
      @property --vx-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
      @keyframes vx-border-spin { to { --vx-angle: 360deg; } }

      .vx-click-scale:active { transform: scale(0.94); }
      .vx-hover-float { transition: transform 0.3s ease, box-shadow 0.3s ease; }
      .vx-hover-float:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.2); }

      .vx-press-ripple { position: relative; overflow: hidden; }
      .vx-ripple-wave { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.25); animation: vx-ripple 0.6s ease-out; pointer-events: none; }
      @keyframes vx-ripple { from { transform: scale(0); opacity: 1; } to { transform: scale(4); opacity: 0; } }

      .vx-wiggle:hover { animation: vx-wiggle 0.4s ease; }
      @keyframes vx-wiggle { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }

      .vx-jelly:hover { animation: vx-jelly 0.4s ease; }
      @keyframes vx-jelly { 0%,100% { transform: scale(1,1); } 25% { transform: scale(0.9,1.1); } 50% { transform: scale(1.1,0.9); } 75% { transform: scale(0.95,1.05); } }

      .vx-heartbeat { animation: vx-heartbeat 1.5s ease infinite; }
      @keyframes vx-heartbeat { 0%,100% { transform: scale(1); } 14% { transform: scale(1.15); } 28% { transform: scale(1); } 42% { transform: scale(1.15); } 70% { transform: scale(1); } }

      .vx-pulse-ring { position: relative; }
      .vx-pulse-ring::before { content: ''; position: absolute; inset: -6px; border-radius: inherit; border: 2px solid var(--vx-primary,#00f5ff); animation: vx-pulse-ring 2s ease-out infinite; opacity: 0; }
      @keyframes vx-pulse-ring { 0% { transform: scale(0.9); opacity: 0.7; } 100% { transform: scale(1.4); opacity: 0; } }

      .vx-swipe-indicator { position: relative; overflow: hidden; }
      .vx-swipe-indicator::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%); animation: vx-shimmer 1.5s infinite; }
      @keyframes vx-shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
    `;
    document.head.appendChild(s);
  }

  _autoDetect() {
    document.querySelectorAll('[data-vx-micro]').forEach(el => {
      const type = el.dataset.nxMicro;
      if (this[type]) this[type](el);
    });
    document.querySelectorAll('[data-vx-magnetic]').forEach(el => this.magnetic(el, { strength: parseFloat(el.dataset.nxMagnetic) || 0.4 }));
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
      el.classList.add('vx-press-ripple');
      el.style.position = el.style.position || 'relative';
      el.addEventListener('click', (e) => {
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const wave = document.createElement('div');
        wave.className = 'vx-ripple-wave';
        wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;`;
        el.appendChild(wave);
        wave.addEventListener('animationend', () => wave.remove());
      });
    });
    return this;
  }

  button3D(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('vx-btn-3d'));
    return this;
  }

  fillSwipe(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('vx-btn-fill'));
    return this;
  }

  borderGlow(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('vx-btn-border-glow'));
    return this;
  }

  float(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('vx-hover-float'));
    return this;
  }

  wiggle(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('vx-wiggle'));
    return this;
  }

  jelly(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('vx-jelly'));
    return this;
  }

  heartbeat(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('vx-heartbeat'));
    return this;
  }

  pulseRing(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('vx-pulse-ring'));
    return this;
  }

  shimmer(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('vx-swipe-indicator'));
    return this;
  }

  clickScale(element) {
    const els = typeof element === 'string' ? document.querySelectorAll(element) : [element];
    els.forEach(el => el.classList.add('vx-click-scale'));
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
