class MediaEngine {
  constructor() {
    this.initialized = false;
    this._lazyObserver = null;
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._setupLazy();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('vx-media-styles')) return;
    const s = document.createElement('style');
    s.id = 'vx-media-styles';
    s.textContent = `
      .vx-img-wrap { position:relative;overflow:hidden;display:block; }
      .vx-img-wrap img { width:100%;height:100%;object-fit:cover;transition:transform 0.5s cubic-bezier(0.23,1,0.32,1); }
      .vx-img-wrap:hover img { transform:scale(1.06); }
      .vx-img-blur-load { filter:blur(20px);transition:filter 0.8s ease; }
      .vx-img-blur-load.vx-loaded { filter:blur(0); }
      .vx-img-overlay {
        position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.7));
        opacity:0;transition:opacity 0.3s ease;
      }
      .vx-img-wrap:hover .vx-img-overlay { opacity:1; }
      .vx-img-caption {
        position:absolute;bottom:0;left:0;right:0;padding:16px;
        color:#fff;font-size:14px;font-weight:600;
        transform:translateY(100%);transition:transform 0.3s cubic-bezier(0.23,1,0.32,1);
      }
      .vx-img-wrap:hover .vx-img-caption { transform:none; }
      .vx-parallax-img { overflow:hidden;display:block; }
      .vx-parallax-img img { will-change:transform;transform:scale(1.15); }
      .vx-img-zoom-overlay {
        position:fixed;inset:0;z-index:500000;
        background:rgba(0,0,0,0.9);backdrop-filter:blur(8px);
        display:flex;align-items:center;justify-content:center;
        opacity:0;pointer-events:none;transition:opacity 0.3s ease;
      }
      .vx-img-zoom-overlay.vx-active { opacity:1;pointer-events:all; }
      .vx-img-zoom-overlay img {
        max-width:90vw;max-height:90vh;object-fit:contain;
        border-radius:8px;box-shadow:0 0 80px rgba(0,0,0,0.8);
        transform:scale(0.95);transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
      }
      .vx-img-zoom-overlay.vx-active img { transform:scale(1); }
      .vx-img-close {
        position:absolute;top:20px;right:20px;width:36px;height:36px;
        background:rgba(255,255,255,0.1);border:none;border-radius:50%;
        color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;
        transition:background 0.2s;
      }
      .vx-img-close:hover { background:rgba(255,0,110,0.4); }
      .vx-lazy { opacity:0;transition:opacity 0.6s ease; }
      .vx-lazy.vx-loaded { opacity:1; }
      .vx-skeleton {
        background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.04) 75%);
        background-size:200% 100%;animation:vx-skeleton 1.5s infinite;border-radius:4px;
      }
      @keyframes vx-skeleton { to { background-position:-200% 0; } }
      .vx-img-tilt { perspective:1000px; }
      .vx-img-tilt img { transition:transform 0.1s ease;border-radius:inherit; }
      .vx-video-wrap { position:relative;overflow:hidden; }
      .vx-video-wrap video { width:100%;height:100%;object-fit:cover;display:block; }
      .vx-video-overlay {
        position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,0.3);transition:opacity 0.3s;cursor:pointer;
      }
      .vx-video-overlay.vx-hidden { opacity:0;pointer-events:none; }
      .vx-play-btn {
        width:60px;height:60px;background:rgba(255,255,255,0.2);backdrop-filter:blur(8px);
        border-radius:50%;display:flex;align-items:center;justify-content:center;
        font-size:22px;color:#fff;transition:transform 0.2s,background 0.2s;
      }
      .vx-play-btn:hover { transform:scale(1.1);background:var(--vx-primary,#00f5ff);color:#000; }
    `;
    document.head.appendChild(s);
  }

  _setupLazy() {
    this._lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const src = el.dataset.nxSrc || el.dataset.src;
        if (src) {
          const img = new Image();
          img.onload = () => {
            el.src = src;
            el.classList.add('vx-loaded');
          };
          img.src = src;
        }
        this._lazyObserver.unobserve(el);
      });
    }, { rootMargin: '50px' });
  }

  lazy(target) {
    VeloxUtils.parseSelector(target).forEach(el => {
      el.classList.add('vx-lazy');
      this._lazyObserver.observe(el);
    });
    return this;
  }

  hover(target, options) {
    const opts = Object.assign({ zoom: true, overlay: true, caption: '' }, options || {});
    VeloxUtils.parseSelector(target).forEach(el => {
      let img = el.tagName === 'IMG' ? el : el.querySelector('img');
      if (!img) return;
      let wrap = el.tagName === 'IMG' ? (() => {
        const w = document.createElement('div');
        w.className = 'vx-img-wrap';
        img.replaceWith(w); w.appendChild(img);
        return w;
      })() : el;
      wrap.classList.add('vx-img-wrap');
      if (opts.overlay) {
        const overlay = document.createElement('div');
        overlay.className = 'vx-img-overlay';
        wrap.appendChild(overlay);
      }
      if (opts.caption) {
        const cap = document.createElement('div');
        cap.className = 'vx-img-caption';
        cap.textContent = opts.caption;
        wrap.appendChild(cap);
      }
    });
    return this;
  }

  zoom(target) {
    let overlay = document.querySelector('.vx-img-zoom-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'vx-img-zoom-overlay';
      overlay.innerHTML = `<button class="vx-img-close">✕</button><img>`;
      document.body.appendChild(overlay);
      overlay.querySelector('.vx-img-close').addEventListener('click', () => overlay.classList.remove('vx-active'));
      overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('vx-active'); });
    }
    const zoomImg = overlay.querySelector('img');
    VeloxUtils.parseSelector(target).forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        zoomImg.src = img.src;
        overlay.classList.add('vx-active');
      });
    });
    return this;
  }

  parallaxImage(target, speed) {
    const spd = speed || 0.3;
    VeloxUtils.parseSelector(target).forEach(el => {
      el.classList.add('vx-parallax-img');
      const img = el.querySelector('img') || (el.tagName === 'IMG' ? el : null);
      if (!img) return;
      const update = () => {
        const r = el.getBoundingClientRect();
        const progress = (window.innerHeight / 2 - r.top - r.height / 2) / window.innerHeight;
        img.style.transform = `scale(1.15) translateY(${progress * spd * 100}%)`;
      };
      window.addEventListener('scroll', update, { passive: true });
      update();
    });
    return this;
  }

  skeleton(target, options) {
    const opts = Object.assign({ width: '100%', height: '20px', count: 1 }, options || {});
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return this;
    el.innerHTML = Array.from({ length: opts.count }, (_, i) => `
      <div class="vx-skeleton" style="width:${Array.isArray(opts.width) ? opts.width[i] : opts.width};height:${opts.height};margin-bottom:10px;"></div>
    `).join('');
    return this;
  }

  tilt(target, options) {
    const opts = Object.assign({ maxAngle: 12, perspective: 800, scale: 1.04 }, options || {});
    VeloxUtils.parseSelector(target).forEach(el => {
      el.classList.add('vx-img-tilt');
      const img = el.querySelector('img') || el;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width - 0.5;
        const cy = (e.clientY - r.top) / r.height - 0.5;
        img.style.transform = `perspective(${opts.perspective}px) rotateY(${cx * opts.maxAngle * 2}deg) rotateX(${-cy * opts.maxAngle * 2}deg) scale(${opts.scale})`;
      });
      el.addEventListener('mouseleave', () => { img.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)'; });
    });
    return this;
  }

  video(target, options) {
    const opts = Object.assign({ autoplay: false, loop: false, muted: true, controls: false }, options || {});
    VeloxUtils.parseSelector(target).forEach(vid => {
      if (vid.tagName !== 'VIDEO') return;
      const wrap = document.createElement('div');
      wrap.className = 'vx-video-wrap';
      vid.replaceWith(wrap); wrap.appendChild(vid);
      if (!opts.autoplay) {
        const overlay = document.createElement('div');
        overlay.className = 'vx-video-overlay';
        overlay.innerHTML = '<div class="vx-play-btn">▶</div>';
        wrap.appendChild(overlay);
        overlay.addEventListener('click', () => {
          vid.play();
          overlay.classList.add('vx-hidden');
        });
        vid.addEventListener('ended', () => overlay.classList.remove('vx-hidden'));
      }
      if (opts.loop) vid.loop = true;
      if (opts.muted) vid.muted = true;
    });
    return this;
  }

  blurLoad(target) {
    VeloxUtils.parseSelector(target).forEach(img => {
      if (img.dataset.nxSrc) {
        img.classList.add('vx-img-blur-load');
        const full = new Image();
        full.onload = () => { img.src = img.dataset.nxSrc; img.classList.add('vx-loaded'); };
        full.src = img.dataset.nxSrc;
      }
    });
    return this;
  }

  _autoDetect() {
    const run = () => {
      VeloxUtils.qsa('img[data-vx-src], img[data-src]').forEach(el => {
        if (el.dataset.nxLazyDone) return;
        el.dataset.nxLazyDone = '1';
        this.lazy(el);
      });
      VeloxUtils.qsa('[data-vx-zoom]').forEach(el => {
        if (el.dataset.nxZoomDone) return;
        el.dataset.nxZoomDone = '1';
        this.zoom(el);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var mediaEngine = new MediaEngine();
if (typeof window !== 'undefined') window.VeloxMedia = mediaEngine;
