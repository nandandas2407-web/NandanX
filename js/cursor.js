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
