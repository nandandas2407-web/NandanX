class PhysicsEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.effects = [];
    this.rafId = null;
    this.initialized = false;
    this._globalClickEffect = null;
    this._globalClickHandler = null;
  }

  init() {
    if (this.initialized) return this;
    this.canvas = NandanXUtils.createCanvas(window.innerWidth, window.innerHeight, { zIndex: '9995', mixBlendMode: 'screen' });
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    window.addEventListener('resize', () => NandanXUtils.resizeCanvas(this.canvas));
    this._loop();
    this.initialized = true;
    return this;
  }

  _ensureInit() { if (!this.initialized) this.init(); }

  ripple(x, y, color) {
    this._ensureInit();
    const c = color || '#00f5ff';
    const rings = [{ r: 0, maxR: 120, alpha: 0.8, speed: 4 }, { r: 0, maxR: 90, alpha: 0.5, speed: 3 }, { r: 0, maxR: 60, alpha: 0.3, speed: 2 }];
    this.effects.push({
      type: 'ripple', x, y, c, rings,
      done: false,
      draw: (ctx) => {
        rings.forEach(ring => {
          ring.r += ring.speed;
          const a = ring.alpha * (1 - ring.r / ring.maxR);
          if (a <= 0) return;
          ctx.beginPath();
          ctx.arc(x, y, ring.r, 0, Math.PI * 2);
          ctx.strokeStyle = c;
          ctx.lineWidth = 2;
          ctx.globalAlpha = a;
          ctx.stroke();
          ctx.globalAlpha = 1;
        });
        if (rings.every(ring => ring.r >= ring.maxR)) this.done = true;
      }
    });
    return this;
  }

  shockwave(x, y, color) {
    this._ensureInit();
    const c = color || '#00f5ff';
    let r = 0, maxR = 250, done = false;
    this.effects.push({
      done: false,
      draw: (ctx) => {
        r += 12;
        const a = NandanXUtils.clamp(1 - r / maxR, 0, 1);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = c;
        ctx.lineWidth = 4 * a;
        ctx.globalAlpha = a;
        ctx.stroke();
        ctx.globalAlpha = 1;
        NandanXUtils.drawGlow(ctx, x, y, r * 0.3, c + '44');
        if (r >= maxR) this.done = true;
      }
    });
    const eff = this.effects[this.effects.length - 1];
    const innerDone = () => { eff.done = true; };
    setTimeout(innerDone, 2000);
    return this;
  }

  pixelExplosion(x, y) {
    this._ensureInit();
    const count = 50;
    const pixels = Array.from({ length: count }, () => ({
      x, y,
      vx: NandanXUtils.randomBetween(-8, 8),
      vy: NandanXUtils.randomBetween(-12, -2),
      w: NandanXUtils.randomBetween(4, 14),
      h: NandanXUtils.randomBetween(4, 14),
      rot: Math.random() * Math.PI * 2,
      rotV: NandanXUtils.randomBetween(-0.15, 0.15),
      color: NandanXUtils.randomHsl(null, 80, 60),
      life: 1, decay: NandanXUtils.randomBetween(0.015, 0.03),
    }));
    this.effects.push({
      done: false,
      draw: (ctx) => {
        let alive = 0;
        pixels.forEach(p => {
          p.life -= p.decay;
          if (p.life <= 0) return;
          alive++;
          p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.vx *= 0.98; p.rot += p.rotV;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
        if (alive === 0) this.done = true;
      }
    });
    const eff = this.effects[this.effects.length - 1];
    return this;
  }

  inkSpread(x, y, color) {
    this._ensureInit();
    const c = color || '#ff006e';
    const blobs = Array.from({ length: 18 }, () => ({
      x, y,
      vx: NandanXUtils.randomBetween(-4, 4),
      vy: NandanXUtils.randomBetween(-4, 4),
      r: 2, maxR: NandanXUtils.randomBetween(20, 50),
      life: 1, decay: NandanXUtils.randomBetween(0.008, 0.018),
    }));
    this.effects.push({
      done: false,
      draw: (ctx) => {
        let alive = 0;
        blobs.forEach(b => {
          b.life -= b.decay;
          if (b.life <= 0) return;
          alive++;
          b.x += b.vx; b.y += b.vy; b.vx *= 0.92; b.vy *= 0.92;
          b.r = Math.min(b.r + 1.5, b.maxR);
          NandanXUtils.drawCircle(ctx, b.x, b.y, b.r, c, b.life * 0.7);
        });
        if (alive === 0) this.done = true;
      }
    });
    return this;
  }

  energyPulse(x, y, color) {
    this._ensureInit();
    const c = color || '#ffe600';
    const count = 28;
    const parts = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const spd = NandanXUtils.randomBetween(3, 8);
      return { x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, life: 1, decay: 0.02, r: NandanXUtils.randomBetween(2, 5) };
    });
    let coreR = 0;
    this.effects.push({
      done: false,
      draw: (ctx) => {
        coreR = Math.min(coreR + 3, 60);
        NandanXUtils.drawGlow(ctx, x, y, coreR, c + '66');
        let alive = 0;
        parts.forEach(p => {
          p.life -= p.decay;
          if (p.life <= 0) return;
          alive++;
          p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.vy *= 0.97;
          NandanXUtils.drawCircle(ctx, p.x, p.y, p.r * p.life, c, p.life);
        });
        if (alive === 0 && coreR >= 60) this.done = true;
      }
    });
    return this;
  }

  waterRipple(x, y) {
    this._ensureInit();
    const waves = Array.from({ length: 5 }, (_, i) => ({ r: 0, delay: i * 8, alpha: 0.6 }));
    let t = 0;
    this.effects.push({
      done: false,
      draw: (ctx) => {
        t++;
        waves.forEach(w => {
          if (t < w.delay) return;
          w.r += 3;
          const a = w.alpha * (1 - w.r / 200);
          if (a <= 0) return;
          ctx.save();
          ctx.scale(1, 0.4);
          ctx.beginPath();
          ctx.arc(x, y / 0.4, w.r, 0, Math.PI * 2);
          ctx.strokeStyle = '#7dd3fc';
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = a;
          ctx.stroke();
          ctx.restore();
          ctx.globalAlpha = 1;
        });
        if (waves.every(w => (1 - w.r / 200) <= 0)) this.done = true;
      }
    });
    return this;
  }

  lightning(x1, y1, x2, y2) {
    this._ensureInit();
    const buildBolt = (ax, ay, bx, by, roughness) => {
      if (Math.hypot(bx - ax, by - ay) < 8 || roughness < 2) return [[ax, ay, bx, by]];
      const mx = (ax + bx) / 2 + NandanXUtils.randomBetween(-roughness, roughness);
      const my = (ay + by) / 2 + NandanXUtils.randomBetween(-roughness, roughness);
      return [...buildBolt(ax, ay, mx, my, roughness / 2), ...buildBolt(mx, my, bx, by, roughness / 2)];
    };
    const segs = buildBolt(x1, y1, x2, y2, 80);
    let life = 1;
    this.effects.push({
      done: false,
      draw: (ctx) => {
        life -= 0.04;
        if (life <= 0) { this.done = true; return; }
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 2 * life;
        ctx.shadowColor = '#00f5ff';
        ctx.shadowBlur = 12;
        ctx.globalAlpha = life;
        segs.forEach(([ax, ay, bx, by]) => {
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    });
    const eff = this.effects[this.effects.length - 1];
    setTimeout(() => { eff.done = true; }, 1200);
    return this;
  }

  attachToClicks(target, effect, options) {
    const els = typeof target === 'string' ? NandanXUtils.qsa(target) : [target];
    els.forEach(el => {
      el.addEventListener('click', (e) => {
        const x = e.clientX, y = e.clientY;
        if (effect === 'ripple') this.ripple(x, y);
        else if (effect === 'shockwave') this.shockwave(x, y);
        else if (effect === 'pixels' || effect === 'pixelExplosion') this.pixelExplosion(x, y);
        else if (effect === 'inkSpread') this.inkSpread(x, y);
        else if (effect === 'energyPulse') this.energyPulse(x, y);
        else if (effect === 'waterRipple') this.waterRipple(x, y);
      });
    });
    return this;
  }

  globalClicks(effect) {
    if (this._globalClickHandler) document.removeEventListener('click', this._globalClickHandler);
    this._globalClickEffect = effect;
    this._globalClickHandler = (e) => {
      const x = e.clientX, y = e.clientY;
      const eff = this._globalClickEffect;
      if (eff === 'ripple') this.ripple(x, y);
      else if (eff === 'shockwave') this.shockwave(x, y);
      else if (eff === 'pixelExplosion') this.pixelExplosion(x, y);
      else if (eff === 'inkSpread') this.inkSpread(x, y);
      else if (eff === 'energyPulse') this.energyPulse(x, y);
      else if (eff === 'waterRipple') this.waterRipple(x, y);
      else if (eff === 'lightning') {
        const x2 = NandanXUtils.randomBetween(0, window.innerWidth);
        const y2 = NandanXUtils.randomBetween(0, window.innerHeight);
        this.lightning(x, y, x2, y2);
      }
    };
    document.addEventListener('click', this._globalClickHandler);
    return this;
  }

  _loop() {
    requestAnimationFrame(() => this._loop());
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const eff = this.effects[i];
      if (eff.done) { this.effects.splice(i, 1); continue; }
      eff.draw(this.ctx);
    }
  }
}

var physicsEngine = new PhysicsEngine();
if (typeof window !== 'undefined') window.NandanXPhysics = physicsEngine;
