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
    if (document.getElementById('vx-hover-styles')) return;
    const s = document.createElement('style');
    s.id = 'vx-hover-styles';
    s.textContent = `
      .vx-lift { transition: transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease; will-change: transform; }
      .vx-lift:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 60px rgba(0,245,255,0.25), 0 8px 20px rgba(0,0,0,0.3); }

      .vx-neon { transition: box-shadow 0.3s ease; }
      .vx-neon:hover { box-shadow: 0 0 8px var(--vx-neon-color,#00f5ff), 0 0 24px var(--vx-neon-color,#00f5ff), 0 0 50px var(--vx-neon-color,#00f5ff)44; }

      .vx-glitch { position: relative; overflow: hidden; display: inline-block; }
      .vx-glitch::before, .vx-glitch::after {
        content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        pointer-events: none; opacity: 0;
      }
      .vx-glitch:hover { animation: vx-glitch-base 0.3s steps(4); }
      .vx-glitch:hover::before { animation: vx-gc1 0.3s steps(4) infinite; color: #ff006e; clip-path: polygon(0 20%,100% 20%,100% 45%,0 45%); transform: translate(-3px); opacity: 0.85; }
      .vx-glitch:hover::after { animation: vx-gc2 0.3s steps(4) infinite; color: #00f5ff; clip-path: polygon(0 60%,100% 60%,100% 82%,0 82%); transform: translate(3px); opacity: 0.85; }
      @keyframes vx-glitch-base { 0%,100%{transform:translate(0)} 25%{transform:translate(-2px,1px)} 50%{transform:translate(2px,-1px)} 75%{transform:translate(-1px,2px)} }
      @keyframes vx-gc1 { 0%,100%{clip-path:polygon(0 0%,100% 0%,100% 25%,0 25%);transform:translate(-3px)} 33%{clip-path:polygon(0 40%,100% 40%,100% 65%,0 65%);transform:translate(2px)} 66%{clip-path:polygon(0 70%,100% 70%,100% 90%,0 90%);transform:translate(-3px)} }
      @keyframes vx-gc2 { 0%,100%{clip-path:polygon(0 75%,100% 75%,100% 100%,0 100%);transform:translate(3px)} 33%{clip-path:polygon(0 10%,100% 10%,100% 35%,0 35%);transform:translate(-2px)} 66%{clip-path:polygon(0 45%,100% 45%,100% 70%,0 70%);transform:translate(3px)} }

      .vx-spotlight { position: relative; overflow: hidden; }
      .vx-spotlight::after {
        content: ''; position: absolute; inset: 0; opacity: 0; pointer-events: none;
        background: radial-gradient(circle 130px at var(--vx-mx,50%) var(--vx-my,50%), rgba(255,255,255,0.13), transparent 70%);
        transition: opacity 0.3s;
      }
      .vx-spotlight:hover::after { opacity: 1; }

      .vx-liquid { position: relative; overflow: hidden; }
      .vx-liquid::before {
        content: ''; position: absolute; bottom: -100%; left: 50%;
        width: 250%; height: 250%; border-radius: 42%;
        background: rgba(0,245,255,0.12);
        transform: translateX(-50%);
        transition: bottom 0.7s cubic-bezier(0.23,1,0.32,1); pointer-events: none;
      }
      .vx-liquid:hover::before { bottom: -30%; }

      .vx-underline { position: relative; display: inline-block; }
      .vx-underline::after {
        content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px;
        background: var(--vx-primary,#00f5ff);
        transition: width 0.4s cubic-bezier(0.23,1,0.32,1);
      }
      .vx-underline:hover::after { width: 100%; }

      .vx-shake:hover { animation: vx-shake 0.5s cubic-bezier(0.36,0.07,0.19,0.97); }
      @keyframes vx-shake {
        10%,90%{transform:translate(-1px,0)} 20%,80%{transform:translate(2px,0)}
        30%,50%,70%{transform:translate(-3px,0)} 40%,60%{transform:translate(3px,0)}
      }

      .vx-float-hover { transition: transform 0.4s ease; }
      .vx-float-hover:hover { transform: translateY(-6px); }

      .vx-morph { transition: border-radius 0.4s cubic-bezier(0.34,1.56,0.64,1); }
      .vx-morph:hover { border-radius: 50% !important; }

      .vx-skew { transition: transform 0.3s cubic-bezier(0.23,1,0.32,1); display: inline-block; }
      .vx-skew:hover { transform: skewX(-8deg) scale(1.04); }

      .vx-color-shift { transition: background-color 0.4s ease, color 0.4s ease; }

      .vx-border-trace { position: relative; }
      .vx-border-trace::before {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(90deg, var(--vx-primary,#00f5ff) 50%, transparent 50%) top/200% 2px no-repeat,
                    linear-gradient(180deg, var(--vx-primary,#00f5ff) 50%, transparent 50%) right/2px 200% no-repeat;
        background-size: 200% 2px, 2px 200%;
        transition: background-position 0.4s ease; pointer-events: none;
      }
      .vx-border-trace:hover::before { background-position: right top, right bottom; }
    `;
    document.head.appendChild(s);
  }

  lift(target) {
    VeloxUtils.parseSelector(target).forEach(el => el.classList.add('vx-lift'));
    return this;
  }

  neon(target, color) {
    VeloxUtils.parseSelector(target).forEach(el => {
      el.classList.add('vx-neon');
      if (color) el.style.setProperty('--vx-neon-color', color);
    });
    return this;
  }

  glitch(target) {
    VeloxUtils.parseSelector(target).forEach(el => {
      if (!el.dataset.text) el.dataset.text = el.textContent;
      el.classList.add('vx-glitch');
    });
    return this;
  }

  spotlight(target) {
    VeloxUtils.parseSelector(target).forEach(el => {
      el.classList.add('vx-spotlight');
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--vx-mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--vx-my', (e.clientY - r.top) + 'px');
      });
    });
    return this;
  }

  liquid(target) {
    VeloxUtils.parseSelector(target).forEach(el => el.classList.add('vx-liquid'));
    return this;
  }

  tilt(target, options) {
    const opts = Object.assign({ maxAngle: 15, glare: false, scale: 1.04 }, options || {});
    VeloxUtils.parseSelector(target).forEach(el => {
      let glareEl = null;
      if (opts.glare) {
        glareEl = VeloxUtils.create('div', {}, {
          position: 'absolute', inset: '0', borderRadius: 'inherit',
          pointerEvents: 'none', zIndex: '1', overflow: 'hidden',
        });
        const g = VeloxUtils.create('div', {}, {
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
    VeloxUtils.parseSelector(target).forEach(el => {
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
          span.style.color = VeloxUtils.randomHsl(i * 30, 80, 65);
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
    VeloxUtils.parseSelector(target).forEach(el => el.classList.add('vx-border-trace'));
    return this;
  }

  shake(target) {
    VeloxUtils.parseSelector(target).forEach(el => el.classList.add('vx-shake'));
    return this;
  }

  morph(target) {
    VeloxUtils.parseSelector(target).forEach(el => el.classList.add('vx-morph'));
    return this;
  }

  underline(target) {
    VeloxUtils.parseSelector(target).forEach(el => el.classList.add('vx-underline'));
    return this;
  }

  skew(target) {
    VeloxUtils.parseSelector(target).forEach(el => el.classList.add('vx-skew'));
    return this;
  }

  float(target) {
    VeloxUtils.parseSelector(target).forEach(el => el.classList.add('vx-float-hover'));
    return this;
  }

  colorShift(target, hoverColor) {
    VeloxUtils.parseSelector(target).forEach(el => {
      el.classList.add('vx-color-shift');
      const orig = el.style.backgroundColor;
      el.addEventListener('mouseenter', () => { el.style.backgroundColor = hoverColor || '#00f5ff22'; });
      el.addEventListener('mouseleave', () => { el.style.backgroundColor = orig; });
    });
    return this;
  }

  _autoDetect() {
    const run = () => {
      VeloxUtils.qsa('[data-vx-hover]').forEach(el => {
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
if (typeof window !== 'undefined') window.VeloxHover = hoverEngine;
