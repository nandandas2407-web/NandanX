class ParticleEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.systems = new Map();
    this.rafId = null;
    this.mouse = { x: -1000, y: -1000 };
    this.initialized = false;
  }

  init(options) {
    if (this.initialized) return this;
    this.canvas = VeloxUtils.createCanvas(window.innerWidth, window.innerHeight, { zIndex: '9990', mixBlendMode: 'screen' });
    document.body.insertBefore(this.canvas, document.body.firstChild);
    this.ctx = this.canvas.getContext('2d');
    window.addEventListener('resize', () => {
      VeloxUtils.resizeCanvas(this.canvas);
      this.systems.forEach(sys => { if (sys.onResize) sys.onResize(); });
    });
    document.addEventListener('mousemove', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
    this._loop();
    this.initialized = true;
    return this;
  }

  _ensureInit() {
    if (!this.initialized) this.init();
  }

  ambient(options) {
    this._ensureInit();
    const opts = Object.assign({ count: 60, color: '#00f5ff', connectDistance: 140 }, options || {});
    const W = () => window.innerWidth, H = () => window.innerHeight;
    const pts = Array.from({ length: opts.count }, () => ({
      x: Math.random() * W(), y: Math.random() * H(),
      vx: VeloxUtils.randomBetween(-0.3, 0.3), vy: VeloxUtils.randomBetween(-0.3, 0.3),
      r: VeloxUtils.randomBetween(1, 2.5), opacity: VeloxUtils.randomBetween(0.3, 0.8),
    }));
    this.systems.set('ambient', {
      draw: (ctx) => {
        pts.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = W(); if (p.x > W()) p.x = 0;
          if (p.y < 0) p.y = H(); if (p.y > H()) p.y = 0;
          const dx = this.mouse.x - p.x, dy = this.mouse.y - p.y;
          const md = Math.sqrt(dx * dx + dy * dy);
          if (md < 100) { p.x -= dx * 0.02; p.y -= dy * 0.02; }
          VeloxUtils.drawCircle(ctx, p.x, p.y, p.r, opts.color, p.opacity);
        });
        ctx.strokeStyle = opts.color;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < opts.connectDistance) {
              ctx.globalAlpha = (1 - d / opts.connectDistance) * 0.4;
              ctx.beginPath();
              ctx.moveTo(pts[i].x, pts[i].y);
              ctx.lineTo(pts[j].x, pts[j].y);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
      }
    });
    return this;
  }

  constellation(options) {
    this._ensureInit();
    const opts = Object.assign({ count: 100, color: '#ffffff' }, options || {});
    const W = () => window.innerWidth, H = () => window.innerHeight;
    const stars = Array.from({ length: opts.count }, () => ({
      x: Math.random() * W(), y: Math.random() * H(),
      r: VeloxUtils.randomBetween(0.5, 2),
      opacity: VeloxUtils.randomBetween(0.4, 1),
      twinkle: Math.random() * Math.PI * 2,
    }));
    this.systems.set('constellation', {
      draw: (ctx) => {
        stars.forEach(s => {
          s.twinkle += 0.02;
          const op = s.opacity * (0.6 + 0.4 * Math.sin(s.twinkle));
          VeloxUtils.drawCircle(ctx, s.x, s.y, s.r, opts.color, op);
          const dx = this.mouse.x - s.x, dy = this.mouse.y - s.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 150) {
            s.x = VeloxUtils.lerp(s.x, s.x + dx * 0.005, 0.5);
            s.y = VeloxUtils.lerp(s.y, s.y + dy * 0.005, 0.5);
            if (d < 80) {
              ctx.strokeStyle = opts.color;
              ctx.lineWidth = 0.6;
              ctx.globalAlpha = (1 - d / 80) * 0.5;
              ctx.beginPath();
              ctx.moveTo(this.mouse.x, this.mouse.y);
              ctx.lineTo(s.x, s.y);
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }
        });
      }
    });
    return this;
  }

  fireworks(options) {
    this._ensureInit();
    const rockets = [];
    const sparks = [];
    const colors = ['#00f5ff', '#ff006e', '#ffe600', '#00ff88', '#ff69b4', '#7c3aed'];
    const launch = () => {
      rockets.push({
        x: VeloxUtils.randomBetween(window.innerWidth * 0.2, window.innerWidth * 0.8),
        y: window.innerHeight + 10,
        vy: VeloxUtils.randomBetween(-14, -10),
        vx: VeloxUtils.randomBetween(-1.5, 1.5),
        color: colors[Math.floor(Math.random() * colors.length)],
        trail: [],
      });
    };
    let lastLaunch = 0;
    this.systems.set('fireworks', {
      draw: (ctx) => {
        const now = performance.now();
        if (now - lastLaunch > VeloxUtils.randomBetween(400, 900)) {
          launch();
          lastLaunch = now;
        }
        rockets.forEach((r, ri) => {
          r.trail.push({ x: r.x, y: r.y });
          if (r.trail.length > 12) r.trail.shift();
          r.x += r.vx; r.y += r.vy;
          r.vy += 0.25;
          if (r.vy >= -2) {
            const count = VeloxUtils.randomInt(80, 120);
            for (let i = 0; i < count; i++) {
              const angle = (i / count) * Math.PI * 2;
              const spd = VeloxUtils.randomBetween(1, 8);
              sparks.push({ x: r.x, y: r.y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, life: 1, decay: VeloxUtils.randomBetween(0.012, 0.025), color: r.color, r: VeloxUtils.randomBetween(1, 3) });
            }
            rockets.splice(ri, 1);
            return;
          }
          r.trail.forEach((pt, ti) => {
            const a = (ti / r.trail.length) * 0.8;
            VeloxUtils.drawCircle(ctx, pt.x, pt.y, 2, r.color, a);
          });
          VeloxUtils.drawCircle(ctx, r.x, r.y, 3, r.color, 1);
        });
        for (let i = sparks.length - 1; i >= 0; i--) {
          const sp = sparks[i];
          sp.life -= sp.decay;
          sp.x += sp.vx; sp.y += sp.vy;
          sp.vy += 0.08; sp.vx *= 0.97;
          if (sp.life <= 0) { sparks.splice(i, 1); continue; }
          VeloxUtils.drawCircle(ctx, sp.x, sp.y, sp.r * sp.life, sp.color, sp.life);
        }
      }
    });
    return this;
  }

  matrixRain(options) {
    this._ensureInit();
    const opts = Object.assign({ color: '#00ff41', fontSize: 14 }, options || {});
    const cols = Math.floor(window.innerWidth / opts.fontSize);
    const drops = Array.from({ length: cols }, () => Math.random() * -50);
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
    let frame = 0;
    this.systems.set('matrixRain', {
      draw: (ctx) => {
        frame++;
        if (frame % 3 !== 0) return;
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = opts.color;
        ctx.font = opts.fontSize + 'px monospace';
        drops.forEach((y, i) => {
          const ch = chars[Math.floor(Math.random() * chars.length)];
          ctx.globalAlpha = 0.9;
          ctx.fillText(ch, i * opts.fontSize, y * opts.fontSize);
          ctx.globalAlpha = 1;
          if (y * opts.fontSize > this.canvas.height && Math.random() > 0.975) drops[i] = 0;
          drops[i] += 0.5;
        });
      }
    });
    return this;
  }

  warpSpeed(options) {
    this._ensureInit();
    const opts = Object.assign({ count: 200, speed: 6, color: '#ffffff' }, options || {});
    const cx = () => window.innerWidth / 2, cy = () => window.innerHeight / 2;
    const stars = Array.from({ length: opts.count }, () => ({
      x: VeloxUtils.randomBetween(-window.innerWidth / 2, window.innerWidth / 2),
      y: VeloxUtils.randomBetween(-window.innerHeight / 2, window.innerHeight / 2),
      z: Math.random() * window.innerWidth,
      pz: 0,
    }));
    stars.forEach(s => { s.pz = s.z; });
    this.systems.set('warpSpeed', {
      draw: (ctx) => {
        const W = window.innerWidth, H = window.innerHeight;
        stars.forEach(s => {
          s.pz = s.z;
          s.z -= opts.speed;
          if (s.z <= 0) {
            s.x = VeloxUtils.randomBetween(-W / 2, W / 2);
            s.y = VeloxUtils.randomBetween(-H / 2, H / 2);
            s.z = W; s.pz = s.z;
          }
          const sx = (s.x / s.z) * W + cx();
          const sy = (s.y / s.z) * H + cy();
          const px = (s.x / s.pz) * W + cx();
          const py = (s.y / s.pz) * H + cy();
          const r = VeloxUtils.clamp(2 * (1 - s.z / W), 0.1, 3);
          const alpha = VeloxUtils.clamp(1 - s.z / W, 0, 1);
          ctx.strokeStyle = opts.color;
          ctx.lineWidth = r;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(sx, sy);
          ctx.stroke();
          ctx.globalAlpha = 1;
        });
      }
    });
    return this;
  }

  clickExplosion(colors) {
    this._ensureInit();
    const palette = colors || ['#00f5ff', '#ff006e', '#ffe600'];
    const bursts = [];
    document.addEventListener('click', (e) => {
      const count = 20;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const spd = VeloxUtils.randomBetween(3, 10);
        bursts.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
          life: 1, decay: VeloxUtils.randomBetween(0.03, 0.07),
          r: VeloxUtils.randomBetween(2, 6),
          color: palette[Math.floor(Math.random() * palette.length)],
        });
      }
    });
    this.systems.set('clickExplosion', {
      draw: (ctx) => {
        for (let i = bursts.length - 1; i >= 0; i--) {
          const b = bursts[i];
          b.life -= b.decay; b.x += b.vx; b.y += b.vy; b.vy += 0.15; b.vx *= 0.97;
          if (b.life <= 0) { bursts.splice(i, 1); continue; }
          VeloxUtils.drawCircle(ctx, b.x, b.y, b.r * b.life, b.color, b.life);
        }
      }
    });
    return this;
  }

  remove(name) {
    this.systems.delete(name);
    return this;
  }

  clear() {
    this.systems.clear();
    if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return this;
  }

  _loop() {
    requestAnimationFrame(() => this._loop());
    if (!this.ctx || this.systems.size === 0) return;
    if (!this.systems.has('matrixRain')) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.systems.forEach(sys => sys.draw(this.ctx));
  }
}

var particleEngine = new ParticleEngine();
if (typeof window !== 'undefined') window.VeloxParticle = particleEngine;
