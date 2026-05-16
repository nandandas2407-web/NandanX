class MagnetEngine {
  constructor() {
    this.elements = [];
    this.rafId = null;
    this.mouse = { x: 0, y: 0 };
    this.initialized = false;
  }

  init() {
    if (this.initialized) return this;
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    this._loop();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  attract(target, options) {
    const opts = Object.assign({ radius: 100, strength: 0.35, scale: 1.08 }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      el.style.transition = 'box-shadow 0.3s ease';
      el.style.willChange = 'transform';
      this.elements.push({ el, type: 'attract', opts, ox: 0, oy: 0, cx: 0, cy: 0, active: false });
    });
    return this;
  }

  repel(target, options) {
    const opts = Object.assign({ radius: 100, strength: 0.35 }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      this.elements.push({ el, type: 'repel', opts, ox: 0, oy: 0, cx: 0, cy: 0, active: false });
    });
    return this;
  }

  elastic(target, options) {
    const opts = Object.assign({ stiffness: 0.12, damping: 0.75 }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      let dragging = false, sx = 0, sy = 0, mx = 0, my = 0;
      let vx = 0, vy = 0, cx = 0, cy = 0;
      el.style.cursor = 'grab';
      el.addEventListener('mousedown', (e) => {
        dragging = true;
        const r = el.getBoundingClientRect();
        sx = e.clientX - r.left - r.width / 2;
        sy = e.clientY - r.top - r.height / 2;
        el.style.cursor = 'grabbing';
        e.preventDefault();
      });
      document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        mx = e.clientX - sx;
        my = e.clientY - sy;
      });
      document.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        el.style.cursor = 'grab';
        mx = 0; my = 0;
      });
      const tick = () => {
        requestAnimationFrame(tick);
        if (dragging) {
          const r = el.getBoundingClientRect();
          cx = NandanXUtils.lerp(cx, mx - (r.left + r.width / 2 + window.scrollX), 0.3);
          cy = NandanXUtils.lerp(cy, my - (r.top + r.height / 2 + window.scrollY), 0.3);
        } else {
          vx += (0 - cx) * opts.stiffness;
          vy += (0 - cy) * opts.stiffness;
          vx *= opts.damping;
          vy *= opts.damping;
          cx += vx;
          cy += vy;
        }
        el.style.transform = `translate(${cx}px,${cy}px)`;
      };
      tick();
    });
    return this;
  }

  gravity(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      let x = 0, y = 0, vx = NandanXUtils.randomBetween(-2, 2), vy = -2;
      const tick = () => {
        requestAnimationFrame(tick);
        vy += NandanXConfig.physics.gravity;
        vx *= NandanXConfig.physics.airResistance;
        x += vx; y += vy;
        const wh = window.innerHeight - el.offsetHeight;
        const ww = window.innerWidth - el.offsetWidth;
        if (y > wh) { y = wh; vy *= -NandanXConfig.physics.bounce; }
        if (y < 0) { y = 0; vy *= -0.5; }
        if (x > ww) { x = ww; vx *= -1; }
        if (x < 0) { x = 0; vx *= -1; }
        el.style.position = 'fixed';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
      };
      tick();
    });
    return this;
  }

  wobble(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.addEventListener('mouseenter', () => {
        let t = 0, amp = 6;
        const tick = () => {
          t += 0.3; amp *= 0.92;
          el.style.transform = `rotate(${Math.sin(t) * amp}deg)`;
          if (amp > 0.1) requestAnimationFrame(tick);
          else el.style.transform = '';
        };
        requestAnimationFrame(tick);
      });
    });
    return this;
  }

  bouncyClick(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.addEventListener('mousedown', () => {
        el.style.transition = 'transform 0.1s ease';
        el.style.transform = 'scale(0.9)';
      });
      el.addEventListener('mouseup', () => {
        el.style.transform = 'scale(1.12)';
        setTimeout(() => { el.style.transform = 'scale(1)'; }, 120);
      });
    });
    return this;
  }

  float(target) {
    NandanXUtils.parseSelector(target).forEach((el, i) => {
      let t = i * 0.5;
      el.style.willChange = 'transform';
      const tick = () => {
        requestAnimationFrame(tick);
        t += 0.02;
        const y = Math.sin(t) * 8;
        const r = Math.sin(t * 0.5) * 1.5;
        el.style.transform = `translateY(${y}px) rotate(${r}deg)`;
      };
      tick();
    });
    return this;
  }

  orbital(target, options) {
    const opts = Object.assign({ radius: 60, speed: 0.02 }, options || {});
    NandanXUtils.parseSelector(target).forEach((el, i) => {
      let angle = i * ((Math.PI * 2) / 3);
      el.style.position = 'absolute';
      const tick = () => {
        requestAnimationFrame(tick);
        angle += opts.speed;
        el.style.transform = `translate(${Math.cos(angle) * opts.radius}px,${Math.sin(angle) * opts.radius}px)`;
      };
      tick();
    });
    return this;
  }

  snapGrid(target, options) {
    const gridSize = (options && options.gridSize) || 40;
    NandanXUtils.parseSelector(target).forEach(el => {
      let dragging = false, startX = 0, startY = 0, ox = 0, oy = 0;
      el.style.cursor = 'grab';
      el.addEventListener('mousedown', (e) => {
        dragging = true;
        startX = e.clientX; startY = e.clientY;
        el.style.cursor = 'grabbing';
        e.preventDefault();
      });
      document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        el.style.transform = `translate(${ox + e.clientX - startX}px,${oy + e.clientY - startY}px)`;
      });
      document.addEventListener('mouseup', (e) => {
        if (!dragging) return;
        dragging = false;
        el.style.cursor = 'grab';
        ox = Math.round((ox + e.clientX - startX) / gridSize) * gridSize;
        oy = Math.round((oy + e.clientY - startY) / gridSize) * gridSize;
        el.style.transition = 'transform 0.2s ease';
        el.style.transform = `translate(${ox}px,${oy}px)`;
        setTimeout(() => { el.style.transition = ''; }, 220);
      });
    });
    return this;
  }

  _loop() {
    requestAnimationFrame(() => this._loop());
    this.elements.forEach(item => {
      const { el, type, opts } = item;
      const c = NandanXUtils.getCenter(el);
      const dx = this.mouse.x - c.x;
      const dy = this.mouse.y - c.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      const inside = d < opts.radius;

      if (inside) {
        const factor = (1 - d / opts.radius) * opts.strength * (type === 'repel' ? -1 : 1);
        item.cx = NandanXUtils.lerp(item.cx, dx * factor, 0.12);
        item.cy = NandanXUtils.lerp(item.cy, dy * factor, 0.12);
        item.active = true;
      } else {
        item.cx = NandanXUtils.lerp(item.cx, 0, 0.1);
        item.cy = NandanXUtils.lerp(item.cy, 0, 0.1);
        item.active = false;
      }
      const scale = inside && opts.scale ? NandanXUtils.lerp(1, opts.scale, (1 - d / opts.radius)) : 1;
      el.style.transform = `translate(${item.cx}px,${item.cy}px) scale(${scale})`;
    });
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-magnet]').forEach(el => {
        if (el.dataset.nxMagnetDone) return;
        el.dataset.nxMagnetDone = '1';
        this.attract(el);
      });
      NandanXUtils.qsa('[data-nx-elastic]').forEach(el => {
        if (el.dataset.nxElasticDone) return;
        el.dataset.nxElasticDone = '1';
        this.elastic(el);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var magnetEngine = new MagnetEngine();
if (typeof window !== 'undefined') window.NandanXMagnet = magnetEngine;
