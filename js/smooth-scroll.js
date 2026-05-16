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
