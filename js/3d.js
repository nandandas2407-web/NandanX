class ThreeDEngine {
  constructor() {
    this.initialized = false;
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('vx-3d-styles')) return;
    const s = document.createElement('style');
    s.id = 'vx-3d-styles';
    s.textContent = `
      .vx-glass {
        background: rgba(255,255,255,0.04) !important;
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255,255,255,0.1) !important;
      }
      .vx-holo {
        background: linear-gradient(135deg,
          rgba(255,0,128,0.15),rgba(0,255,255,0.15),rgba(255,255,0,0.15),
          rgba(128,0,255,0.15),rgba(0,255,128,0.15));
        background-size: 300% 300%;
        transition: background-position 0.6s ease;
      }
      .vx-holo:hover { background-position: 100% 100%; }
      .vx-flip-container { perspective: 1000px; }
      .vx-flip-inner { transition: transform 0.7s cubic-bezier(0.23,1,0.32,1); transform-style: preserve-3d; position: relative; }
      .vx-flip-inner.vx-flipped { transform: rotateY(180deg); }
      .vx-flip-front, .vx-flip-back { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      .vx-flip-back { transform: rotateY(180deg); position: absolute; inset: 0; }
      .vx-text-3d {
        transform-style: preserve-3d;
        text-shadow: 1px 1px 0 rgba(0,0,0,0.4), 2px 2px 0 rgba(0,0,0,0.3), 3px 3px 0 rgba(0,0,0,0.2);
        transition: text-shadow 0.3s ease;
      }
      .vx-iso { transform: rotateX(20deg) rotateY(-20deg) rotateZ(0deg); transform-style: preserve-3d; }
      .vx-depth-card { position: relative; transform-style: preserve-3d; }
      .vx-depth-card::before {
        content: ''; position: absolute; inset: 0; transform: translateZ(-8px);
        background: rgba(0,245,255,0.1); border-radius: inherit; pointer-events: none;
      }
      .vx-float-shadow { transition: transform 0.4s ease, box-shadow 0.4s ease; }
      .vx-float-shadow:hover { transform: translateY(-10px); box-shadow: 0 30px 60px rgba(0,0,0,0.4), 0 0 30px rgba(0,245,255,0.15); }
    `;
    document.head.appendChild(s);
  }

  tiltCard(target, options) {
    const opts = Object.assign({ maxAngle: 15, scale: 1.04, glare: false }, options || {});
    VeloxUtils.parseSelector(target).forEach(el => {
      let glare = null;
      el.style.position = 'relative';
      el.style.willChange = 'transform';
      if (opts.glare) {
        const wrap = VeloxUtils.create('div', {}, { position: 'absolute', inset: '0', overflow: 'hidden', borderRadius: 'inherit', pointerEvents: 'none', zIndex: '2' });
        glare = VeloxUtils.create('div', {}, {
          position: 'absolute', top: '-50%', left: '-50%',
          width: '200%', height: '200%',
          background: 'linear-gradient(135deg,rgba(255,255,255,0.2),transparent)',
          opacity: '0', transition: 'opacity 0.3s', transform: 'rotate(-45deg)',
        });
        wrap.appendChild(glare);
        el.appendChild(wrap);
      }
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width - 0.5;
        const cy = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${cy * -opts.maxAngle * 2}deg) rotateY(${cx * opts.maxAngle * 2}deg) scale(${opts.scale})`;
        el.style.transition = 'transform 0.08s ease';
        if (glare) { glare.style.opacity = '1'; glare.style.transform = `rotate(${cx * 60}deg)`; }
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        el.style.transition = 'transform 0.5s ease';
        if (glare) glare.style.opacity = '0';
      });
    });
    return this;
  }

  flipCard(target, options) {
    const trigger = (options && options.trigger) || 'click';
    VeloxUtils.parseSelector(target).forEach(el => {
      el.classList.add('vx-flip-container');
      const inner = el.querySelector('.vx-flip-inner');
      if (!inner) {
        el.style.perspective = '1000px';
        const wrapper = VeloxUtils.create('div', { className: 'vx-flip-inner' }, { width: '100%', height: '100%' });
        [...el.children].forEach(child => wrapper.appendChild(child));
        el.appendChild(wrapper);
      }
      const getInner = () => el.querySelector('.vx-flip-inner');
      if (trigger === 'click') {
        el.addEventListener('click', () => getInner().classList.toggle('vx-flipped'));
      } else {
        el.addEventListener('mouseenter', () => getInner().classList.add('vx-flipped'));
        el.addEventListener('mouseleave', () => getInner().classList.remove('vx-flipped'));
      }
    });
    return this;
  }

  holographic(target) {
    VeloxUtils.parseSelector(target).forEach(el => {
      el.classList.add('vx-holo');
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        el.style.backgroundPosition = `${x}% ${y}%`;
      });
    });
    return this;
  }

  glass(target) {
    VeloxUtils.parseSelector(target).forEach(el => el.classList.add('vx-glass'));
    return this;
  }

  parallax3D(target, options) {
    const depth = (options && options.depth) || 30;
    VeloxUtils.parseSelector(target).forEach(el => {
      document.addEventListener('mousemove', (e) => {
        const cx = (e.clientX / window.innerWidth - 0.5) * depth;
        const cy = (e.clientY / window.innerHeight - 0.5) * depth;
        el.style.transform = `translate(${cx}px,${cy}px)`;
        el.style.transition = 'transform 0.3s ease';
      });
    });
    return this;
  }

  depthScene(container, layers) {
    const el = typeof container === 'string' ? VeloxUtils.qs(container) : container;
    if (!el) return this;
    el.style.perspective = '1000px';
    const depths = [0.1, 0.25, 0.5, 0.75, 1.0];
    document.addEventListener('mousemove', (e) => {
      const cx = (e.clientX / window.innerWidth - 0.5);
      const cy = (e.clientY / window.innerHeight - 0.5);
      VeloxUtils.parseSelector(layers).forEach((layer, i) => {
        const d = (depths[i] || 0.5) * 40;
        layer.style.transform = `translate(${cx * d}px, ${cy * d}px)`;
        layer.style.transition = 'transform 0.2s ease';
      });
    });
    return this;
  }

  text3D(target) {
    VeloxUtils.parseSelector(target).forEach(el => {
      el.classList.add('vx-text-3d');
      el.style.perspective = '600px';
      document.addEventListener('mousemove', (e) => {
        const cx = (e.clientX / window.innerWidth - 0.5) * 20;
        const cy = (e.clientY / window.innerHeight - 0.5) * 20;
        el.style.transform = `perspective(600px) rotateX(${-cy}deg) rotateY(${cx}deg)`;
        el.style.transition = 'transform 0.2s ease';
      });
    });
    return this;
  }

  isometric(target) {
    VeloxUtils.parseSelector(target).forEach(el => {
      el.classList.add('vx-iso');
      el.addEventListener('mouseenter', () => { el.style.transform = 'rotateX(0) rotateY(0)'; el.style.transition = 'transform 0.4s ease'; });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; el.style.transition = 'transform 0.4s ease'; });
    });
    return this;
  }

  prism(target) {
    VeloxUtils.parseSelector(target).forEach(el => {
      el.style.transition = 'filter 0.3s ease';
      el.addEventListener('mouseenter', () => { el.style.animation = 'vx-prism 1s linear infinite'; });
      el.addEventListener('mouseleave', () => { el.style.animation = ''; el.style.filter = ''; });
    });
    if (!document.getElementById('vx-prism-kf')) {
      const s = document.createElement('style');
      s.id = 'vx-prism-kf';
      s.textContent = '@keyframes vx-prism { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }';
      document.head.appendChild(s);
    }
    return this;
  }

  depthCard(target) {
    VeloxUtils.parseSelector(target).forEach(el => el.classList.add('vx-depth-card'));
    return this;
  }

  floatShadow(target) {
    VeloxUtils.parseSelector(target).forEach(el => el.classList.add('vx-float-shadow'));
    return this;
  }

  _autoDetect() {
    const run = () => {
      VeloxUtils.qsa('[data-vx-tilt]').forEach(el => { if (el.dataset.nxTiltDone) return; el.dataset.nxTiltDone = '1'; this.tiltCard(el); });
      VeloxUtils.qsa('[data-vx-holo]').forEach(el => { if (el.dataset.nxHoloDone) return; el.dataset.nxHoloDone = '1'; this.holographic(el); });
      VeloxUtils.qsa('[data-vx-glass]').forEach(el => { if (el.dataset.nxGlassDone) return; el.dataset.nxGlassDone = '1'; this.glass(el); });
      VeloxUtils.qsa('[data-vx-parallax-3d]').forEach(el => { if (el.dataset.nxP3dDone) return; el.dataset.nxP3dDone = '1'; this.parallax3D(el); });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var threeDEngine = new ThreeDEngine();
if (typeof window !== 'undefined') window.Velox3D = threeDEngine;
