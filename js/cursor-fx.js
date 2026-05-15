/**
 * VeloxUI — cursorFXEngine
 * Advanced cursor effects: trails, spotlights, magnetic, ink, ripple glow
 */
class CursorFXEngine {
  constructor() {
    this.initialized = false;
    this.effects = new Map();
    this.mx = -100; this.my = -100;
    this.canvas = null;
    this.ctx = null;
    this.raf = null;
    this.trails = [];
    this.activeEffects = new Set();
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this._trackMouse();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('vx-cursorfx-styles')) return;
    const s = document.createElement('style');
    s.id = 'vx-cursorfx-styles';
    s.textContent = `
      .vx-cursor-dot { position: fixed; pointer-events: none; z-index: 99999; border-radius: 50%; mix-blend-mode: difference; }
      .vx-cursor-ring { position: fixed; pointer-events: none; z-index: 99998; border-radius: 50%; border: 2px solid; transition: width 0.2s, height 0.2s; }
      .vx-cursor-text { position: fixed; pointer-events: none; z-index: 99999; font-size: 11px; font-weight: 700; white-space: nowrap; transform: translate(-50%, -50%); }
      .vx-cursor-emoji { position: fixed; pointer-events: none; z-index: 99999; font-size: 24px; transform: translate(-50%, -50%); transition: transform 0.1s; }
      .vx-cursor-spotlight { position: fixed; pointer-events: none; z-index: 9; border-radius: 50%; mix-blend-mode: screen; transform: translate(-50%, -50%); }
      .vx-cursor-blob { position: fixed; pointer-events: none; z-index: 9998; border-radius: 50%; filter: blur(20px); opacity: 0.4; transform: translate(-50%, -50%); }
      body.vx-cursor-hidden { cursor: none !important; }
      body.vx-cursor-hidden * { cursor: none !important; }
    `;
    document.head.appendChild(s);
  }

  _trackMouse() {
    document.addEventListener('mousemove', (e) => {
      this.mx = e.clientX;
      this.my = e.clientY;
    }, { passive: true });
  }

  // Canvas-based trail setup
  _setupCanvas() {
    if (this.canvas) return;
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99990;';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
    if (!this.raf) this._loop();
  }

  _loop() {
    if (!this.ctx) { this.raf = requestAnimationFrame(() => this._loop()); return; }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Draw all active canvas effects
    this.activeEffects.forEach(fn => fn(this.ctx));
    this.raf = requestAnimationFrame(() => this._loop());
  }

  // Pixel / comet trail
  trail(options = {}) {
    this._setupCanvas();
    const color = options.color || '#00f5ff';
    const length = options.length || 20;
    const size = options.size || 4;
    const points = [];

    document.addEventListener('mousemove', (e) => {
      points.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (points.length > length) points.shift();
    }, { passive: true });

    const draw = (ctx) => {
      points.forEach((p, i) => {
        const alpha = (i / points.length) * p.life;
        const s = size * (i / points.length);
        ctx.beginPath();
        ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
        ctx.fillStyle = color.includes('rgb') ? color : this._hexToRgba(color, alpha);
        ctx.fill();
      });
    };
    this.activeEffects.add(draw);
    return { stop: () => this.activeEffects.delete(draw) };
  }

  // Rainbow trail
  rainbowTrail(options = {}) {
    this._setupCanvas();
    const points = [];
    const len = options.length || 30;

    document.addEventListener('mousemove', (e) => {
      points.push({ x: e.clientX, y: e.clientY });
      if (points.length > len) points.shift();
    }, { passive: true });

    const draw = (ctx) => {
      points.forEach((p, i) => {
        const hue = (i / points.length) * 360;
        const alpha = i / points.length;
        const size = (i / points.length) * (options.size || 6);
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue},100%,60%,${alpha})`;
        ctx.fill();
      });
    };
    this.activeEffects.add(draw);
    return { stop: () => this.activeEffects.delete(draw) };
  }

  // Glow spotlight following cursor
  spotlight(options = {}) {
    const size = options.size || 300;
    const color = options.color || 'rgba(0,245,255,0.08)';
    const el = document.createElement('div');
    el.className = 'vx-cursor-spotlight';
    el.style.cssText = `width:${size}px;height:${size}px;background:radial-gradient(circle, ${color} 0%, transparent 70%);`;
    document.body.appendChild(el);

    const ease = options.ease || 0.1;
    let cx = -500, cy = -500;

    const update = () => {
      cx += (this.mx - cx) * ease;
      cy += (this.my - cy) * ease;
      el.style.left = cx + 'px';
      el.style.top = cy + 'px';
      requestAnimationFrame(update);
    };
    update();
    return { el, stop: () => el.remove() };
  }

  // Magnetic blob cursor
  blob(options = {}) {
    const size = options.size || 60;
    const color = options.color || '#00f5ff';
    const el = document.createElement('div');
    el.className = 'vx-cursor-blob';
    el.style.cssText = `width:${size}px;height:${size}px;background:${color};`;
    document.body.appendChild(el);

    const ease = options.ease || 0.12;
    let cx = -100, cy = -100;

    const update = () => {
      cx += (this.mx - cx) * ease;
      cy += (this.my - cy) * ease;
      el.style.left = cx + 'px';
      el.style.top = cy + 'px';
      requestAnimationFrame(update);
    };
    update();
    document.body.classList.add('vx-cursor-hidden');
    return { el, stop: () => { el.remove(); document.body.classList.remove('vx-cursor-hidden'); } };
  }

  // Dot + ring cursor (standard premium cursor)
  dotRing(options = {}) {
    document.body.classList.add('vx-cursor-hidden');
    const dot = document.createElement('div');
    dot.className = 'vx-cursor-dot';
    dot.style.cssText = `width:8px;height:8px;background:${options.color || '#ffffff'};transform:translate(-50%,-50%);`;

    const ring = document.createElement('div');
    ring.className = 'vx-cursor-ring';
    ring.style.cssText = `width:36px;height:36px;border-color:${options.ringColor || '#00f5ff'};transform:translate(-50%,-50%);`;

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let rx = -100, ry = -100;
    const ease = options.ease || 0.15;

    const update = () => {
      dot.style.left = this.mx + 'px';
      dot.style.top = this.my + 'px';
      rx += (this.mx - rx) * ease;
      ry += (this.my - ry) * ease;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(update);
    };
    update();

    // Hover effect on clickable elements
    document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.style.width = '60px'; ring.style.height = '60px';
        ring.style.opacity = '0.5';
      });
      el.addEventListener('mouseleave', () => {
        ring.style.width = '36px'; ring.style.height = '36px';
        ring.style.opacity = '1';
      });
    });

    return { dot, ring, stop: () => { dot.remove(); ring.remove(); document.body.classList.remove('vx-cursor-hidden'); } };
  }

  // Emoji cursor
  emoji(char, options = {}) {
    document.body.classList.add('vx-cursor-hidden');
    const el = document.createElement('div');
    el.className = 'vx-cursor-emoji';
    el.textContent = char;
    document.body.appendChild(el);

    const ease = options.ease || 0.3;
    let cx = -100, cy = -100;

    const update = () => {
      cx += (this.mx - cx) * ease;
      cy += (this.my - cy) * ease;
      el.style.left = cx + 'px';
      el.style.top = cy + 'px';
      requestAnimationFrame(update);
    };
    update();
    return { el, stop: () => { el.remove(); document.body.classList.remove('vx-cursor-hidden'); } };
  }

  // Text label that follows cursor
  textLabel(text, options = {}) {
    const el = document.createElement('div');
    el.className = 'vx-cursor-text';
    el.textContent = text;
    el.style.cssText = `color:${options.color || '#fff'};background:${options.bg || 'rgba(0,0,0,0.7)'};padding:4px 10px;border-radius:20px;font-family:monospace;`;
    document.body.appendChild(el);
    const offset = options.offset || { x: 16, y: -16 };

    const update = () => {
      el.style.left = (this.mx + offset.x) + 'px';
      el.style.top = (this.my + offset.y) + 'px';
      requestAnimationFrame(update);
    };
    update();
    return { el, stop: () => el.remove(), update: (t) => { el.textContent = t; } };
  }

  // Ink splatter on click
  inkSplatter(options = {}) {
    this._setupCanvas();
    const color = options.color || '#00f5ff';
    const splatters = [];

    document.addEventListener('click', (e) => {
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.5;
        const speed = Math.random() * 8 + 3;
        splatters.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 8 + 3,
          life: 1,
        });
      }
    });

    const draw = (ctx) => {
      splatters.forEach((s, i) => {
        s.x += s.vx; s.y += s.vy;
        s.vy += 0.3;
        s.vx *= 0.95; s.vy *= 0.95;
        s.life -= 0.02;
        if (s.life <= 0) { splatters.splice(i, 1); return; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fillStyle = this._hexToRgba(color, s.life);
        ctx.fill();
      });
    };
    this.activeEffects.add(draw);
    return { stop: () => this.activeEffects.delete(draw) };
  }

  // Cursor-reactive elements (elements follow or react to cursor)
  reactive(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    const strength = options.strength || 0.3;
    const ease = options.ease || 0.1;
    const type = options.type || 'magnetic';

    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      let cx = rect.left + rect.width / 2;
      let cy = rect.top + rect.height / 2;
      let tx = cx, ty = cy;

      document.addEventListener('mousemove', (e) => {
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const radius = options.radius || 120;
        if (dist < radius) {
          tx = cx + dx * strength;
          ty = cy + dy * strength;
        } else {
          tx = cx; ty = cy;
        }
      });

      const update = () => {
        const x = parseFloat(el.style.transform.match(/translateX\((.*?)px/)?.[1] || 0);
        const y = parseFloat(el.style.transform.match(/translateY\((.*?)px/)?.[1] || 0);
        const nx = x + (tx - cx - x) * ease;
        const ny = y + (ty - cy - y) * ease;
        if (type === 'magnetic') {
          el.style.transform = `translate(${nx}px, ${ny}px)`;
        } else if (type === 'tilt') {
          const rotX = ny * 0.1;
          const rotY = -nx * 0.1;
          el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        }
        requestAnimationFrame(update);
      };
      update();
    });
    return this;
  }

  _hexToRgba(hex, alpha) {
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}

const cursorFXEngine = new CursorFXEngine();
