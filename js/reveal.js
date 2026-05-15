/**
 * VeloxUI — revealEngine
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
    if (document.getElementById('vx-reveal-styles')) return;
    const s = document.createElement('style'); s.id = 'vx-reveal-styles';
    s.textContent = `
      [data-vx-reveal] { opacity: 0; transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.23,1,0.32,1), filter 0.7s ease; will-change: transform, opacity; }
      [data-vx-reveal="up"] { transform: translateY(40px); }
      [data-vx-reveal="down"] { transform: translateY(-40px); }
      [data-vx-reveal="left"] { transform: translateX(-40px); }
      [data-vx-reveal="right"] { transform: translateX(40px); }
      [data-vx-reveal="scale"] { transform: scale(0.85); }
      [data-vx-reveal="blur"] { filter: blur(12px); transform: translateY(20px); }
      [data-vx-reveal="flip"] { transform: rotateX(-80deg); transform-origin: top; }
      [data-vx-reveal="rotate"] { transform: rotate(-10deg) translateY(30px); }
      [data-vx-reveal].vx-revealed { opacity: 1 !important; transform: none !important; filter: none !important; }
      .vx-clip-reveal { clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%); transition: clip-path 0.8s cubic-bezier(0.23,1,0.32,1); }
      .vx-clip-reveal.vx-revealed { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
      .vx-progress-bar-reveal { height: 4px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }
      .vx-progress-fill { height: 100%; background: var(--vx-primary,#00f5ff); border-radius: 4px; width: 0%; transition: width 1.2s cubic-bezier(0.23,1,0.32,1); box-shadow: 0 0 8px var(--vx-glow,rgba(0,245,255,0.5)); }
    `;
    document.head.appendChild(s);
  }
  _autoDetect() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseFloat(el.dataset.nxDelay || 0);
        setTimeout(() => el.classList.add('vx-revealed'), delay);
        if (el.dataset.nxProgress !== undefined) this._animateProgress(el);
        this.observer.unobserve(el);
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-vx-reveal]').forEach(el => this.observer.observe(el));
    document.querySelectorAll('[data-vx-progress]').forEach(el => {
      el.classList.add('vx-progress-bar-reveal');
      const fill = document.createElement('div');
      fill.className = 'vx-progress-fill';
      el.appendChild(fill);
      const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { fill.style.width = (el.dataset.nxProgress || 50) + '%'; obs.disconnect(); }
      }, { threshold: 0.5 });
      obs.observe(el);
    });
    // Stagger groups
    document.querySelectorAll('[data-vx-stagger]').forEach(container => {
      const delay = parseFloat(container.dataset.nxStagger || 80);
      const children = Array.from(container.children);
      children.forEach((child, i) => {
        child.setAttribute('data-vx-reveal', child.dataset.nxReveal || 'up');
        child.setAttribute('data-vx-delay', i * delay);
        this.observer.observe(child);
      });
    });
  }
  _animateProgress(el) {
    const fill = el.querySelector('.vx-progress-fill');
    if (fill) fill.style.width = (el.dataset.nxProgress || 50) + '%';
  }
  reveal(selector, options = {}) {
    const els = typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
    els.forEach((el, i) => {
      el.setAttribute('data-vx-reveal', options.effect || 'up');
      el.setAttribute('data-vx-delay', (options.delay || 0) + i * (options.stagger || 0));
      if (this.observer) this.observer.observe(el);
    });
    return this;
  }
  progressBar(selector, value, options = {}) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return this;
    el.classList.add('vx-progress-bar-reveal');
    if (!el.querySelector('.vx-progress-fill')) {
      const fill = document.createElement('div');
      fill.className = 'vx-progress-fill';
      if (options.color) fill.style.background = options.color;
      el.appendChild(fill);
    }
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { el.querySelector('.vx-progress-fill').style.width = value + '%'; obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(el);
    return this;
  }
}
const revealEngine = new RevealEngine();
