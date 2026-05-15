/**
 * VeloxUI — pageTransitionEngine
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
    if (document.getElementById('vx-transition-styles')) return;
    const s = document.createElement('style');
    s.id = 'vx-transition-styles';
    s.textContent = `
      .vx-page-overlay {
        position: fixed; inset: 0; z-index: 99999;
        pointer-events: none;
        transform-origin: center;
      }
      .vx-curtain {
        position: fixed; inset: 0; z-index: 99999;
        transform: scaleY(0); transform-origin: bottom;
        pointer-events: none;
      }
      .vx-curtain-top {
        position: fixed; top: 0; left: 0; right: 0; height: 50%; z-index: 99999;
        transform: translateY(-100%); pointer-events: none;
      }
      .vx-curtain-bottom {
        position: fixed; bottom: 0; left: 0; right: 0; height: 50%; z-index: 99999;
        transform: translateY(100%); pointer-events: none;
      }
      .vx-transition-blocks {
        position: fixed; inset: 0; z-index: 99999;
        display: grid; pointer-events: none;
      }
      .vx-transition-block {
        background: var(--vx-primary, #00f5ff);
        transform: scaleY(0);
        transform-origin: bottom;
      }
      .vx-loader-bar {
        position: fixed; top: 0; left: 0; height: 3px; z-index: 999999;
        background: var(--vx-primary, #00f5ff);
        width: 0%; transition: width 0.3s ease;
        box-shadow: 0 0 10px var(--vx-primary, #00f5ff);
      }
      @keyframes vx-page-fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes vx-page-slide-in { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .vx-page-enter { animation: vx-page-fade-in 0.4s ease; }
      .vx-page-enter-slide { animation: vx-page-slide-in 0.4s cubic-bezier(0.23,1,0.32,1); }
    `;
    document.head.appendChild(s);
  }

  _createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'vx-page-overlay';
    document.body.appendChild(this.overlay);
    // Loader bar
    this.loaderBar = document.createElement('div');
    this.loaderBar.className = 'vx-loader-bar';
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
    const color = options.color || getComputedStyle(document.documentElement).getPropertyValue('--vx-primary') || '#00f5ff';
    return new Promise(resolve => {
      const curtain = document.createElement('div');
      curtain.className = 'vx-curtain';
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
      top.className = 'vx-curtain-top';
      bot.className = 'vx-curtain-bottom';
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
      grid.className = 'vx-transition-blocks';
      grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      document.body.appendChild(grid);

      for (let i = 0; i < cols; i++) {
        const block = document.createElement('div');
        block.className = 'vx-transition-block';
        block.style.background = color;
        block.style.transitionDelay = `${i * 40}ms`;
        block.style.transition = `transform ${duration/2}ms cubic-bezier(0.86,0,0.07,1) ${i * 40}ms`;
        grid.appendChild(block);
      }

      requestAnimationFrame(() => {
        grid.querySelectorAll('.vx-transition-block').forEach(b => b.style.transform = 'scaleY(1)');
      });

      const totalIn = duration / 2 + cols * 40;
      setTimeout(() => {
        if (options.onMiddle) options.onMiddle();
        grid.querySelectorAll('.vx-transition-block').forEach((b, i) => {
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
