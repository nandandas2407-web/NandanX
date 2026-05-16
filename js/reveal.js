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
