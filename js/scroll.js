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
      threshold: VeloxConfig.scroll.threshold,
      rootMargin: VeloxConfig.scroll.rootMargin,
      staggerDelay: VeloxConfig.scroll.staggerDelay,
    }, options || {});
    this._injectStyles();
    this._setupObserver();
    this._autoDetect();
    this._bindScroll();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('vx-scroll-styles')) return;
    const s = document.createElement('style');
    s.id = 'vx-scroll-styles';
    s.textContent = `
      .vx-fade-up    { opacity:0; transform:translateY(40px); transition:opacity .7s ease,transform .7s cubic-bezier(.23,1,.32,1); }
      .vx-fade-down  { opacity:0; transform:translateY(-40px); transition:opacity .7s ease,transform .7s cubic-bezier(.23,1,.32,1); }
      .vx-fade-left  { opacity:0; transform:translateX(50px); transition:opacity .7s ease,transform .7s cubic-bezier(.23,1,.32,1); }
      .vx-fade-right { opacity:0; transform:translateX(-50px); transition:opacity .7s ease,transform .7s cubic-bezier(.23,1,.32,1); }
      .vx-zoom-in    { opacity:0; transform:scale(0.83); transition:opacity .6s ease,transform .6s cubic-bezier(.34,1.56,.64,1); }
      .vx-zoom-out   { opacity:0; transform:scale(1.18); transition:opacity .6s ease,transform .6s ease; }
      .vx-flip-x     { opacity:0; transform:rotateX(65deg); transform-origin:bottom center; perspective:900px; transition:opacity .6s ease,transform .6s cubic-bezier(.23,1,.32,1); }
      .vx-flip-y     { opacity:0; transform:rotateY(65deg); perspective:900px; transition:opacity .6s ease,transform .6s cubic-bezier(.23,1,.32,1); }
      .vx-blur-reveal { opacity:0; filter:blur(20px); transform:scale(0.96); transition:opacity .8s ease,filter .8s ease,transform .8s cubic-bezier(.23,1,.32,1); }
      .vx-skew-reveal { opacity:0; transform:skewX(-15deg) translateX(-30px); transition:opacity .6s ease,transform .6s cubic-bezier(.23,1,.32,1); }
      .vx-clip-reveal { opacity:0; clip-path:inset(0 100% 0 0); transition:opacity .6s ease,clip-path .8s cubic-bezier(.23,1,.32,1); }
      .vx-cinematic   { opacity:0; transform:scale(1.08); filter:brightness(0.3); transition:opacity 1.2s ease,transform 1.2s ease,filter 1.2s ease; }
      .vx-float-up    { opacity:0; transform:translateY(60px) rotate(3deg); transition:opacity .7s ease,transform .9s cubic-bezier(.34,1.56,.64,1); }
      .vx-swing-in    { opacity:0; transform:rotateZ(-8deg) translateY(20px); transform-origin:top center; transition:opacity .6s ease,transform .7s cubic-bezier(.34,1.56,.64,1); }

      .vx-visible { opacity:1 !important; transform:none !important; filter:none !important; clip-path:none !important; }

      .vx-progress-bar {
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
          setTimeout(() => el.classList.add('vx-visible'), delay);
          if (!el.dataset.nxRepeat) this.observer.unobserve(el);
        } else if (el.dataset.nxRepeat) {
          el.classList.remove('vx-visible');
        }
      });
    }, {
      threshold: this.options.threshold,
      rootMargin: this.options.rootMargin,
    });
  }

  reveal(target, type, options) {
    const typeMap = {
      'fade-up': 'vx-fade-up', 'fade-down': 'vx-fade-down',
      'fade-left': 'vx-fade-left', 'fade-right': 'vx-fade-right',
      'zoom-in': 'vx-zoom-in', 'zoom-out': 'vx-zoom-out',
      'flip-x': 'vx-flip-x', 'flip-y': 'vx-flip-y',
      'blur-reveal': 'vx-blur-reveal', 'skew-reveal': 'vx-skew-reveal',
      'clip-reveal': 'vx-clip-reveal', 'cinematic': 'vx-cinematic',
      'float-up': 'vx-float-up', 'swing-in': 'vx-swing-in',
    };
    const cls = typeMap[type] || 'vx-fade-up';
    VeloxUtils.parseSelector(target).forEach((el, i) => {
      el.classList.add(cls);
      if (options && options.delay) el.dataset.nxDelay = options.delay + i * 60;
      if (options && options.repeat) el.dataset.nxRepeat = '1';
      this.observer.observe(el);
    });
    return this;
  }

  stagger(target, delay) {
    const d = delay || this.options.staggerDelay;
    VeloxUtils.parseSelector(target).forEach(container => {
      [...container.children].forEach((child, i) => {
        child.classList.add('vx-fade-up');
        child.dataset.nxDelay = i * d;
        this.observer.observe(child);
      });
    });
    return this;
  }

  counter(target, options) {
    VeloxUtils.parseSelector(target).forEach(el => {
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
          const p = VeloxUtils.clamp((now - start) / duration, 0, 1);
          const val = VeloxUtils.easeOutQuart(p) * to;
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
    VeloxUtils.parseSelector(target).forEach(el => {
      this.parallaxEls.push({ el, speed });
    });
    return this;
  }

  horizontalScroll(target) {
    VeloxUtils.parseSelector(target).forEach(el => {
      this.horizontalEls.push(el);
    });
    return this;
  }

  showProgress() {
    if (this.progressBar) return this;
    this.progressBar = VeloxUtils.create('div', { className: 'vx-progress-bar' });
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
          const progress = VeloxUtils.clamp(-r.top / (r.height - window.innerHeight), 0, 1);
          el.style.transform = `translateX(${-progress * (r.width - window.innerWidth)}px)`;
        });
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  _autoDetect() {
    const run = () => {
      VeloxUtils.qsa('[data-vx-scroll]').forEach(el => {
        if (el.dataset.nxScrollDone) return;
        el.dataset.nxScrollDone = '1';
        this.reveal(el, el.dataset.nxScroll);
      });
      VeloxUtils.qsa('[data-vx-parallax]').forEach(el => {
        if (el.dataset.nxParallaxDone) return;
        el.dataset.nxParallaxDone = '1';
        this.parallax(el, { speed: parseFloat(el.dataset.nxSpeed || '0.4') });
      });
      VeloxUtils.qsa('.vx-counter').forEach(el => {
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
if (typeof window !== 'undefined') window.VeloxScroll = scrollEngine;
