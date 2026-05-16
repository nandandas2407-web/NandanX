/**
 * NandanX — particleSystemEngine
 * Advanced particle systems: fire, smoke, stars, confetti, snow, bubbles, dust
 */
class ParticleSystemEngine {
  constructor() {
    this.initialized = false;
    this.systems = new Map();
    this.canvas = null;
    this.ctx = null;
    this.raf = null;
  }

  init(options = {}) {
    if (this.initialized) return this;
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9990;';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return this;
    this._resize();
    window.addEventListener('resize', () => this._resize());
    this._loop();
    this.initialized = true;
    return this;
  }

  _ensureInit() { if (!this.initialized) this.init(); }

  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _loop() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.systems.forEach((system, id) => {
      system.update();
      system.draw(ctx);
      if (system.done) this.systems.delete(id);
    });
    this.raf = requestAnimationFrame(() => this._loop());
  }

  _uid() { return Math.random().toString(36).slice(2); }

  // Fire effect
  fire(x, y, options = {}) {
    this._ensureInit();
    const count = options.count || 80;
    const id = this._uid();
    const particles = [];
    const w = options.width || 60;
    const color1 = options.color1 || '#ff6600';
    const color2 = options.color2 || '#ffcc00';
    const onCanvas = options.canvas;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * w,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(Math.random() * 4 + 2),
        life: 1,
        decay: Math.random() * 0.015 + 0.01,
        size: Math.random() * 12 + 4,
      });
    }

    const system = {
      done: false,
      update: () => {
        particles.forEach(p => {
          p.x += p.vx + Math.sin(Date.now() * 0.003 + p.y) * 0.3;
          p.y += p.vy;
          p.vy += 0.05;
          p.size *= 0.98;
          p.life -= p.decay;
          if (p.life <= 0) {
            p.life = 1;
            p.x = x + (Math.random() - 0.5) * w;
            p.y = y;
            p.vy = -(Math.random() * 4 + 2);
            p.size = Math.random() * 12 + 4;
          }
        });
      },
      draw: (ctx) => {
        particles.forEach(p => {
          const alpha = Math.max(0, p.life);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `rgba(255,255,180,${alpha})`);
          grad.addColorStop(0.4, color2.replace(')', `,${alpha})`).replace('rgb', 'rgba'));
          grad.addColorStop(1, `rgba(255,50,0,0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        });
      },
    };

    this.systems.set(id, system);
    if (options.duration) setTimeout(() => this.systems.delete(id), options.duration);
    return { id, stop: () => this.systems.delete(id) };
  }

  // Snow effect
  snow(options = {}) {
    this._ensureInit();
    const count = options.count || 120;
    const id = this._uid();
    const w = this.canvas.width, h = this.canvas.height;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 4 + 1,
      vy: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.5,
      wobble: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.5 + 0.5,
    }));

    const system = {
      done: false,
      update: () => {
        particles.forEach(p => {
          p.wobble += 0.02;
          p.x += p.vx + Math.sin(p.wobble) * 0.5;
          p.y += p.vy;
          if (p.y > this.canvas.height + 10) { p.y = -10; p.x = Math.random() * this.canvas.width; }
          if (p.x > this.canvas.width + 10) p.x = -10;
          if (p.x < -10) p.x = this.canvas.width + 10;
        });
      },
      draw: (ctx) => {
        ctx.save();
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
          ctx.fill();
        });
        ctx.restore();
      },
    };
    this.systems.set(id, system);
    return { id, stop: () => this.systems.delete(id) };
  }

  // Confetti burst
  confetti(x, y, options = {}) {
    this._ensureInit();
    const count = options.count || 80;
    const colors = options.colors || ['#ff006e', '#00f5ff', '#00ff88', '#ffcc00', '#ff6600', '#7c3aed'];
    const id = this._uid();
    const particles = Array.from({ length: count }, () => ({
      x, y,
      vx: (Math.random() - 0.5) * 12,
      vy: -(Math.random() * 10 + 5),
      rotation: Math.random() * 360,
      rotVel: (Math.random() - 0.5) * 8,
      w: Math.random() * 12 + 4,
      h: Math.random() * 6 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
      gravity: 0.25,
    }));

    const system = {
      done: false,
      update: () => {
        let allDead = true;
        particles.forEach(p => {
          p.x += p.vx;
          p.vy += p.gravity;
          p.y += p.vy;
          p.rotation += p.rotVel;
          p.life -= 0.008;
          if (p.life > 0) allDead = false;
        });
        if (allDead) system.done = true;
      },
      draw: (ctx) => {
        particles.forEach(p => {
          if (p.life <= 0) return;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation * Math.PI / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
      },
    };
    this.systems.set(id, system);
    return { id, stop: () => this.systems.delete(id) };
  }

  // Star field
  starfield(options = {}) {
    this._ensureInit();
    const count = options.count || 200;
    const speed = options.speed || 0.5;
    const id = this._uid();
    const cx = this.canvas.width / 2, cy = this.canvas.height / 2;

    const stars = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * this.canvas.width * 2,
      y: (Math.random() - 0.5) * this.canvas.height * 2,
      z: Math.random() * this.canvas.width,
      pz: 0,
    }));

    const system = {
      done: false,
      update: () => {
        stars.forEach(s => {
          s.pz = s.z;
          s.z -= speed * 3;
          if (s.z <= 0) {
            s.x = (Math.random() - 0.5) * this.canvas.width * 2;
            s.y = (Math.random() - 0.5) * this.canvas.height * 2;
            s.z = this.canvas.width;
            s.pz = s.z;
          }
        });
      },
      draw: (ctx) => {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        stars.forEach(s => {
          const sx = (s.x / s.z) * this.canvas.width + cx;
          const sy = (s.y / s.z) * this.canvas.height + cy;
          const px = (s.x / s.pz) * this.canvas.width + cx;
          const py = (s.y / s.pz) * this.canvas.height + cy;
          const size = Math.max(0.5, (1 - s.z / this.canvas.width) * 3);
          const alpha = 1 - s.z / this.canvas.width;
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = size;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        });
        ctx.restore();
      },
    };
    this.systems.set(id, system);
    return { id, stop: () => this.systems.delete(id) };
  }

  // Smoke / dust
  smoke(x, y, options = {}) {
    this._ensureInit();
    const count = options.count || 30;
    const color = options.color || 'rgba(150,150,150,';
    const id = this._uid();

    const particles = Array.from({ length: count }, () => ({
      x: x + (Math.random() - 0.5) * 20,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(Math.random() * 1.5 + 0.5),
      size: Math.random() * 20 + 10,
      life: 1,
      decay: Math.random() * 0.005 + 0.003,
    }));

    const system = {
      done: false,
      update: () => {
        let allDead = true;
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.size += 0.4;
          p.vx *= 0.99;
          p.life -= p.decay;
          if (p.life > 0) allDead = false;
        });
        if (allDead) system.done = true;
      },
      draw: (ctx) => {
        particles.forEach(p => {
          if (p.life <= 0) return;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          g.addColorStop(0, color + (p.life * 0.3) + ')');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        });
      },
    };
    this.systems.set(id, system);
    return { id, stop: () => this.systems.delete(id) };
  }

  // Bubbles floating up
  bubbles(container, options = {}) {
    this._ensureInit();
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    const rect = el ? el.getBoundingClientRect() : { x: 0, y: window.innerHeight, width: window.innerWidth };
    const count = options.count || 20;
    const color = options.color || '#00f5ff';
    const id = this._uid();

    const spawn = () => ({
      x: rect.left + Math.random() * rect.width,
      y: rect.bottom || window.innerHeight,
      size: Math.random() * 12 + 4,
      vy: -(Math.random() * 1.5 + 0.5),
      vx: (Math.random() - 0.5) * 0.5,
      life: 1,
      decay: Math.random() * 0.003 + 0.002,
      wobble: Math.random() * Math.PI * 2,
    });

    const particles = Array.from({ length: count }, spawn);
    const system = {
      done: false,
      update: () => {
        particles.forEach(p => {
          p.wobble += 0.05;
          p.x += p.vx + Math.sin(p.wobble) * 0.5;
          p.y += p.vy;
          p.life -= p.decay;
          if (p.life <= 0) Object.assign(p, spawn());
        });
      },
      draw: (ctx) => {
        particles.forEach(p => {
          ctx.save();
          ctx.globalAlpha = p.life * 0.6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          // Shine
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${p.life * 0.4})`;
          ctx.fill();
          ctx.restore();
        });
      },
    };
    this.systems.set(id, system);
    return { id, stop: () => this.systems.delete(id) };
  }

  // Click-triggered confetti burst
  clickConfetti(target, options = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return this;
    el.addEventListener('click', (e) => {
      this.confetti(e.clientX, e.clientY, options);
    });
    return this;
  }

  stop(id) {
    if (id) this.systems.delete(id);
    else this.systems.clear();
    return this;
  }
}

const particleSystemEngine = new ParticleSystemEngine();
