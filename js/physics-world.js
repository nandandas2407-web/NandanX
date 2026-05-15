/**
 * VeloxUI — physicsWorldEngine
 * 2D physics: gravity, bounce, collision, spring, rope, inertia, ragdoll
 */
class PhysicsWorldEngine {
  constructor() {
    this.initialized = false;
    this.bodies = [];
    this.constraints = [];
    this.gravity = { x: 0, y: 0.5 };
    this.canvas = null;
    this.ctx = null;
    this.raf = null;
    this.paused = false;
    this.bounds = null;
    this.debug = false;
  }

  init(options = {}) {
    if (this.initialized) return this;
    this.gravity = options.gravity || { x: 0, y: 0.5 };
    this.debug = options.debug || false;
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('vx-physworld-styles')) return;
    const s = document.createElement('style');
    s.id = 'vx-physworld-styles';
    s.textContent = `
      .vx-physics-body { position: absolute; will-change: transform; cursor: grab; }
      .vx-physics-body:active { cursor: grabbing; }
      .vx-physics-canvas { position: absolute; top: 0; left: 0; pointer-events: none; }
    `;
    document.head.appendChild(s);
  }

  // Create a DOM element physics body
  createBody(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const body = {
      el,
      x: options.x !== undefined ? options.x : rect.left + rect.width / 2,
      y: options.y !== undefined ? options.y : rect.top + rect.height / 2,
      vx: options.vx || 0,
      vy: options.vy || 0,
      mass: options.mass || 1,
      restitution: options.restitution !== undefined ? options.restitution : 0.6,
      friction: options.friction !== undefined ? options.friction : 0.98,
      w: rect.width,
      h: rect.height,
      fixed: options.fixed || false,
      sleeping: false,
      sleepCounter: 0,
      userData: options.userData || {},
    };
    el.style.position = 'fixed';
    el.style.left = '0px';
    el.style.top = '0px';
    el.style.transform = `translate(${body.x - body.w / 2}px, ${body.y - body.h / 2}px)`;
    el.style.willChange = 'transform';
    if (options.draggable !== false) this._makeDraggable(body);
    this.bodies.push(body);
    if (!this.raf) this._loop();
    return body;
  }

  _makeDraggable(body) {
    let isDragging = false, ox = 0, oy = 0;
    body.el.addEventListener('mousedown', (e) => {
      isDragging = true;
      ox = e.clientX - body.x;
      oy = e.clientY - body.y;
      body.vx = 0; body.vy = 0;
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      body.x = e.clientX - ox;
      body.y = e.clientY - oy;
      body.vx = 0; body.vy = 0;
    });
    document.addEventListener('mouseup', () => { isDragging = false; });
  }

  _loop() {
    if (this.paused) { this.raf = requestAnimationFrame(() => this._loop()); return; }

    this.bodies.forEach(b => {
      if (b.fixed) return;
      // Gravity
      b.vx += this.gravity.x / b.mass;
      b.vy += this.gravity.y / b.mass;
      // Friction
      b.vx *= b.friction;
      b.vy *= b.friction;
      // Integrate
      b.x += b.vx;
      b.y += b.vy;
      // Bounds
      const bnd = this.bounds || { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight };
      // Floor
      if (b.y + b.h / 2 > bnd.y + bnd.h) {
        b.y = bnd.y + bnd.h - b.h / 2;
        b.vy *= -b.restitution;
        b.vx *= 0.85;
      }
      // Ceiling
      if (b.y - b.h / 2 < bnd.y) { b.y = bnd.y + b.h / 2; b.vy *= -b.restitution; }
      // Walls
      if (b.x - b.w / 2 < bnd.x) { b.x = bnd.x + b.w / 2; b.vx *= -b.restitution; }
      if (b.x + b.w / 2 > bnd.x + bnd.w) { b.x = bnd.x + bnd.w - b.w / 2; b.vx *= -b.restitution; }

      // Update DOM
      b.el.style.transform = `translate(${b.x - b.w / 2}px, ${b.y - b.h / 2}px)`;
    });

    // Constraints (springs/ropes)
    this.constraints.forEach(c => this._solveConstraint(c));

    this.raf = requestAnimationFrame(() => this._loop());
  }

  _solveConstraint(c) {
    const a = c.a, b = c.b;
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;
    const force = (dist - c.length) * c.stiffness;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    if (!a.fixed) { a.vx += fx / a.mass; a.vy += fy / a.mass; }
    if (!b.fixed) { b.vx -= fx / b.mass; b.vy -= fy / b.mass; }

    if (c.type === 'rope' && dist > c.length) {
      const correction = (dist - c.length) / 2;
      const nx = dx / dist * correction;
      const ny = dy / dist * correction;
      if (!a.fixed) { a.x += nx; a.y += ny; }
      if (!b.fixed) { b.x -= nx; b.y -= ny; }
    }
  }

  spring(bodyA, bodyB, options = {}) {
    this.constraints.push({
      a: bodyA, b: bodyB,
      length: options.length || 100,
      stiffness: options.stiffness || 0.1,
      type: 'spring',
    });
    return this;
  }

  rope(bodyA, bodyB, options = {}) {
    this.constraints.push({
      a: bodyA, b: bodyB,
      length: options.length || 120,
      stiffness: options.stiffness || 0.8,
      type: 'rope',
    });
    return this;
  }

  applyForce(body, fx, fy) {
    body.vx += fx / body.mass;
    body.vy += fy / body.mass;
    return this;
  }

  applyImpulse(body, fx, fy) {
    body.vx += fx;
    body.vy += fy;
    return this;
  }

  explosion(x, y, radius, force, options = {}) {
    this.bodies.forEach(b => {
      if (b.fixed) return;
      const dx = b.x - x, dy = b.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius && dist > 0) {
        const f = (1 - dist / radius) * force;
        b.vx += (dx / dist) * f / b.mass;
        b.vy += (dy / dist) * f / b.mass;
      }
    });
    return this;
  }

  setBounds(x, y, w, h) {
    this.bounds = { x, y, w, h };
    return this;
  }

  // Cloth simulation (grid of constrained points)
  cloth(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const cols = options.cols || 20;
    const rows = options.rows || 15;
    const segW = (el.offsetWidth || 400) / cols;
    const segH = (el.offsetHeight || 300) / rows;
    const rect = el.getBoundingClientRect();

    const canvas = document.createElement('canvas');
    canvas.className = 'vx-physics-canvas';
    canvas.width = el.offsetWidth;
    canvas.height = el.offsetHeight;
    el.style.position = 'relative';
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const points = [];
    const constraints = [];

    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        points.push({
          x: c * segW,
          y: r * segH,
          px: c * segW,
          py: r * segH,
          pinned: r === 0,
          vx: 0, vy: 0,
        });
      }
    }

    const getIdx = (r, c) => r * (cols + 1) + c;
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        if (c < cols) constraints.push([getIdx(r, c), getIdx(r, c + 1), segW]);
        if (r < rows) constraints.push([getIdx(r, c), getIdx(r + 1, c), segH]);
      }
    }

    const wind = options.wind || 0.1;
    const gravity = options.gravity || 0.4;
    const damping = 0.99;

    document.addEventListener('mousemove', (e) => {
      const rx = e.clientX - rect.left;
      const ry = e.clientY - rect.top;
      points.forEach(p => {
        if (p.pinned) return;
        const dx = rx - p.x, dy = ry - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 30) { p.x += dx * 0.15; p.y += dy * 0.15; }
      });
    });

    const update = () => {
      points.forEach(p => {
        if (p.pinned) return;
        const vx = (p.x - p.px) * damping + (Math.random() - 0.4) * wind;
        const vy = (p.y - p.py) * damping + gravity;
        p.px = p.x; p.py = p.y;
        p.x += vx; p.y += vy;
        if (p.y > canvas.height) { p.y = canvas.height; p.py = p.y; }
      });
      for (let iter = 0; iter < 3; iter++) {
        constraints.forEach(([ai, bi, len]) => {
          const a = points[ai], b = points[bi];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx*dx + dy*dy) || 0.001;
          const diff = (dist - len) / dist / 2;
          if (!a.pinned) { a.x += dx * diff; a.y += dy * diff; }
          if (!b.pinned) { b.x -= dx * diff; b.y -= dy * diff; }
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = options.color || 'rgba(0,245,255,0.5)';
      ctx.lineWidth = 1;
      constraints.forEach(([ai, bi]) => {
        const a = points[ai], b = points[bi];
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
    };

    const loop = () => { update(); draw(); requestAnimationFrame(loop); };
    loop();
    return this;
  }

  pause() { this.paused = true; return this; }
  resume() { this.paused = false; return this; }

  remove(body) {
    this.bodies = this.bodies.filter(b => b !== body);
    return this;
  }

  clear() {
    this.bodies = [];
    this.constraints = [];
    cancelAnimationFrame(this.raf);
    this.raf = null;
    return this;
  }
}

const physicsWorldEngine = new PhysicsWorldEngine();
