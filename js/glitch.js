/**
 * NandanX — glitchEngine
 * Glitch effects: RGB split, scanlines, VHS, pixel corruption, digital noise
 */
class GlitchEngine {
  constructor() {
    this.initialized = false;
    this.activeGlitches = new Map();
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-glitch-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-glitch-styles';
    s.textContent = `
      .nx-glitch { position: relative; }
      .nx-glitch::before, .nx-glitch::after {
        content: attr(data-text);
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        overflow: hidden;
      }
      .nx-glitch::before {
        color: #ff006e; clip: rect(0, 0, 0, 0);
        animation: nx-glitch-1 2s infinite linear alternate-reverse;
      }
      .nx-glitch::after {
        color: #00f5ff; clip: rect(0, 0, 0, 0);
        animation: nx-glitch-2 2s infinite linear alternate-reverse;
      }
      @keyframes nx-glitch-1 {
        0% { clip: rect(22px, 9999px, 56px, 0); transform: translate(-4px); }
        20% { clip: rect(73px, 9999px, 89px, 0); transform: translate(4px); }
        40% { clip: rect(12px, 9999px, 28px, 0); transform: translate(-2px); }
        60% { clip: rect(85px, 9999px, 91px, 0); transform: translate(3px); }
        80% { clip: rect(45px, 9999px, 68px, 0); transform: translate(-3px); }
        100% { clip: rect(31px, 9999px, 47px, 0); transform: translate(2px); }
      }
      @keyframes nx-glitch-2 {
        0% { clip: rect(65px, 9999px, 99px, 0); transform: translate(4px); }
        20% { clip: rect(15px, 9999px, 35px, 0); transform: translate(-4px); }
        40% { clip: rect(78px, 9999px, 95px, 0); transform: translate(2px); }
        60% { clip: rect(8px, 9999px, 24px, 0); transform: translate(-2px); }
        80% { clip: rect(55px, 9999px, 72px, 0); transform: translate(4px); }
        100% { clip: rect(38px, 9999px, 58px, 0); transform: translate(-3px); }
      }
      .nx-glitch-hover::before, .nx-glitch-hover::after { animation: none; }
      .nx-glitch-hover:hover::before { animation: nx-glitch-1 0.3s steps(2) infinite; }
      .nx-glitch-hover:hover::after { animation: nx-glitch-2 0.3s steps(2) infinite; }

      .nx-scanlines {
        position: relative;
        overflow: hidden;
      }
      .nx-scanlines::after {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
          0deg, transparent, transparent 2px,
          rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px
        );
        pointer-events: none;
        z-index: 10;
      }
      .nx-vhs {
        position: relative;
        overflow: hidden;
      }
      .nx-vhs::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 3px;
        background: rgba(255,255,255,0.15);
        z-index: 10;
        animation: nx-vhs-scan 3s linear infinite;
        pointer-events: none;
      }
      @keyframes nx-vhs-scan {
        from { top: -3px; }
        to { top: 100%; }
      }
      .nx-chromatic { filter: url(#nx-chromatic-aberration); }
      .nx-pixel-glitch { image-rendering: pixelated; }

      .nx-hologram {
        position: relative;
        overflow: hidden;
      }
      .nx-hologram::before {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
          0deg, transparent, transparent 6px,
          rgba(0,245,255,0.03) 6px, rgba(0,245,255,0.03) 7px
        );
        pointer-events: none;
        z-index: 5;
        animation: nx-holo-flicker 4s infinite;
      }
      @keyframes nx-holo-flicker {
        0%,100% { opacity: 1; }
        92% { opacity: 1; }
        93% { opacity: 0.6; }
        94% { opacity: 1; }
        96% { opacity: 0.3; }
        97% { opacity: 1; }
      }

      .nx-glitch-block { position: relative; overflow: hidden; }
      @keyframes nx-block-glitch {
        0% { transform: translate(0); }
        10% { transform: translate(-3px, 2px); clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%); }
        20% { transform: translate(3px, -2px); }
        30% { transform: translate(0); }
        60% { transform: translate(2px, 1px); clip-path: polygon(0 60%, 100% 60%, 100% 75%, 0 75%); }
        70% { transform: translate(-2px, -1px); }
        80% { transform: translate(0); }
      }
    `;
    document.head.appendChild(s);
    this._injectSVGFilters();
  }

  _injectSVGFilters() {
    if (document.getElementById('nx-svg-filters')) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'nx-svg-filters';
    svg.style.cssText = 'position:absolute;width:0;height:0;';
    svg.innerHTML = `
      <defs>
        <filter id="nx-chromatic-aberration">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" in="SourceGraphic"/>
          <feOffset dx="-3" dy="0" in="red" result="red-shift"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" in="SourceGraphic"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" in="SourceGraphic"/>
          <feOffset dx="3" dy="0" in="blue" result="blue-shift"/>
          <feMerge><feMergeNode in="red-shift"/><feMergeNode in="green"/><feMergeNode in="blue-shift"/></feMerge>
        </filter>
        <filter id="nx-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
          <feBlend in="SourceGraphic" mode="multiply"/>
        </filter>
        <filter id="nx-vhs-distort">
          <feTurbulence type="turbulence" baseFrequency="0.0 0.02" numOctaves="1" result="turbulence"/>
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="5" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
    `;
    document.body.insertBefore(svg, document.body.firstChild);
  }

  _autoDetect() {
    document.querySelectorAll('[data-nx-glitch]').forEach(el => {
      const type = el.dataset.nxGlitch || 'text';
      this[type]?.(el);
    });
  }

  // CSS glitch text
  text(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.dataset.text = el.textContent;
    if (options.hover) el.classList.add('nx-glitch', 'nx-glitch-hover');
    else el.classList.add('nx-glitch');
    el.style.color = options.color || '#e2e8f0';
    return this;
  }

  // Canvas-based RGB split glitch on any element
  rgbSplit(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.style.filter = 'url(#nx-chromatic-aberration)';
    if (options.animate) {
      let on = true;
      setInterval(() => {
        el.style.filter = on ? 'url(#nx-chromatic-aberration)' : 'none';
        on = !on;
      }, options.interval || 3000);
    }
    return this;
  }

  // VHS effect (scanline + distort)
  vhs(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.classList.add('nx-vhs', 'nx-scanlines');
    if (options.chromatic) el.classList.add('nx-chromatic');
    return this;
  }

  // Scanlines overlay
  scanlines(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) el.classList.add('nx-scanlines');
    return this;
  }

  // Digital noise (canvas overlay)
  noise(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5;opacity:' + (options.opacity || 0.05);
    el.style.position = el.style.position || 'relative';
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const draw = () => {
      canvas.width = el.offsetWidth;
      canvas.height = el.offsetHeight;
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const val = Math.random() * 255;
        imageData.data[i] = val;
        imageData.data[i+1] = val;
        imageData.data[i+2] = val;
        imageData.data[i+3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
    };
    draw();
    setInterval(draw, options.fps ? 1000 / options.fps : 80);
    return this;
  }

  // Hologram effect
  hologram(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) el.classList.add('nx-hologram');
    return this;
  }

  // Canvas pixel corruption burst
  pixelCorrupt(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;

    const burst = () => {
      const canvas = document.createElement('canvas');
      const rect = el.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.cssText = `position:absolute;top:0;left:0;pointer-events:none;z-index:100;`;
      el.style.position = el.style.position || 'relative';
      el.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const colors = options.colors || ['#ff006e', '#00f5ff', '#00ff88', '#ffcc00'];
      let frames = 0;

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const w = Math.random() * 60 + 10;
          const h = Math.random() * 8 + 2;
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)] + '99';
          ctx.fillRect(x, y, w, h);
        }
        frames++;
        if (frames < 12) requestAnimationFrame(draw);
        else canvas.remove();
      };
      draw();
    };

    const trigger = options.trigger || 'hover';
    if (trigger === 'hover') el.addEventListener('mouseenter', burst);
    else if (trigger === 'click') el.addEventListener('click', burst);
    else if (trigger === 'auto') setInterval(burst, options.interval || 3000);
    else burst();
    return this;
  }

  // TV static noise burst
  static(element, duration = 600) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const canvas = document.createElement('canvas');
    canvas.width = el.offsetWidth || 300;
    canvas.height = el.offsetHeight || 200;
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:100;opacity:0.3;';
    el.style.position = el.style.position || 'relative';
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const end = Date.now() + duration;
    const draw = () => {
      const img = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() > 0.5 ? 255 : 0;
        img.data[i] = v; img.data[i+1] = v; img.data[i+2] = v; img.data[i+3] = 200;
      }
      ctx.putImageData(img, 0, 0);
      if (Date.now() < end) requestAnimationFrame(draw);
      else canvas.remove();
    };
    draw();
    return this;
  }
}

const glitchEngine = new GlitchEngine();
