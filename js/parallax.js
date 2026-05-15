/**
 * VeloxUI — parallaxEngine
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
    if (document.getElementById('vx-parallax-styles')) return;
    const s = document.createElement('style');
    s.id = 'vx-parallax-styles';
    s.textContent = `
      [data-vx-parallax] { will-change: transform; }
      [data-vx-depth-scene] { perspective: 800px; transform-style: preserve-3d; overflow: hidden; }
      .vx-parallax-layer { will-change: transform; }
      [data-vx-sticky-scene] { position: sticky; top: 0; overflow: hidden; }
      [data-vx-reveal-scene] { opacity: 0; }
      [data-vx-reveal-scene].vx-revealed { opacity: 1; transition: opacity 0.6s ease; }
    `;
    document.head.appendChild(s);
  }

  _autoDetect() {
    this.layers = [];
    document.querySelectorAll('[data-vx-parallax]').forEach(el => {
      const speed = parseFloat(el.dataset.nxParallax) || 0.5;
      const dir = el.dataset.nxParallaxDir || 'y';
      const rect = el.getBoundingClientRect();
      this.layers.push({ el, speed, dir, originTop: rect.top + window.scrollY });
    });

    document.querySelectorAll('[data-vx-depth-scene]').forEach(scene => {
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
    document.querySelectorAll('[data-vx-reveal-scene]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) el.classList.add('vx-revealed');
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
      div.className = 'vx-parallax-layer';
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
    const wrapper = el.querySelector('[data-vx-hscroll-track]') || el.firstElementChild;
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
