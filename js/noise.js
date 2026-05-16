class NoiseEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.rafId = null;
    this.mode = null;
    this.initialized = false;
    this._permTable = null;
  }

  init() {
    if (this.initialized) return this;
    this._buildPermTable();
    this.initialized = true;
    return this;
  }

  _buildPermTable() {
    const p = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    this._permTable = [...p, ...p];
  }

  _fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  _lerp(a, b, t) { return a + t * (b - a); }
  _grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return (h & 1 ? -u : u) + (h & 2 ? -v : v);
  }

  perlin(x, y) {
    if (!this._permTable) this._buildPermTable();
    const p = this._permTable;
    const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = this._fade(xf), v = this._fade(yf);
    const aa = p[p[xi] + yi], ab = p[p[xi] + yi + 1];
    const ba = p[p[xi + 1] + yi], bb = p[p[xi + 1] + yi + 1];
    return this._lerp(
      this._lerp(this._grad(aa, xf, yf), this._grad(ba, xf - 1, yf), u),
      this._lerp(this._grad(ab, xf, yf - 1), this._grad(bb, xf - 1, yf - 1), u),
      v
    );
  }

  fbm(x, y, octaves, lacunarity, gain) {
    const oct = octaves || 4, lac = lacunarity || 2, g = gain || 0.5;
    let value = 0, amplitude = 1, frequency = 1, max = 0;
    for (let i = 0; i < oct; i++) {
      value += this.perlin(x * frequency, y * frequency) * amplitude;
      max += amplitude;
      amplitude *= g;
      frequency *= lac;
    }
    return value / max;
  }

  noiseBackground(container, options) {
    if (!this.initialized) this.init();
    const opts = Object.assign({
      color1: '#0f0f1a', color2: '#00f5ff', opacity: 0.08,
      scale: 3, animate: true, speed: 0.002
    }, options || {});
    const target = typeof container === 'string' ? document.querySelector(container) : container || document.body;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    target.style.position = target.style.position || 'relative';
    target.insertBefore(canvas, target.firstChild);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let t = 0;
    const draw = () => {
      canvas.width = target.offsetWidth;
      canvas.height = target.offsetHeight;
      const W = canvas.width, H = canvas.height;
      const imageData = ctx.createImageData(W, H);
      const data = imageData.data;
      const c1 = NandanXUtils.hexToRgb(opts.color1) || { r: 15, g: 15, b: 26 };
      const c2 = NandanXUtils.hexToRgb(opts.color2) || { r: 0, g: 245, b: 255 };
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const n = (this.fbm(x / W * opts.scale + t, y / H * opts.scale + t) + 1) / 2;
          const i = (y * W + x) * 4;
          data[i] = Math.round(c1.r + (c2.r - c1.r) * n);
          data[i + 1] = Math.round(c1.g + (c2.g - c1.g) * n);
          data[i + 2] = Math.round(c1.b + (c2.b - c1.b) * n);
          data[i + 3] = Math.round(opts.opacity * 255);
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };
    draw();
    if (opts.animate) {
      const animate = () => {
        t += opts.speed;
        draw();
        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
    return this;
  }

  gradientMesh(container, options) {
    const opts = Object.assign({
      colors: ['#00f5ff', '#ff006e', '#7c3aed', '#00ff88'],
      pointCount: 6, animate: true, speed: 0.003, blur: 80
    }, options || {});
    const target = typeof container === 'string' ? document.querySelector(container) : container || document.body;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;filter:blur(${opts.blur}px);`;
    target.style.position = target.style.position || 'relative';
    target.insertBefore(canvas, target.firstChild);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const points = Array.from({ length: opts.pointCount }, (_, i) => ({
      x: Math.random(), y: Math.random(),
      vx: NandanXUtils.randomBetween(-0.001, 0.001),
      vy: NandanXUtils.randomBetween(-0.001, 0.001),
      color: opts.colors[i % opts.colors.length],
    }));
    const draw = () => {
      canvas.width = target.offsetWidth;
      canvas.height = target.offsetHeight;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      points.forEach(p => {
        if (opts.animate) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > 1) p.vx *= -1;
          if (p.y < 0 || p.y > 1) p.vy *= -1;
        }
        const gx = p.x * W, gy = p.y * H;
        const r = Math.max(W, H) * 0.7;
        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
        grad.addColorStop(0, p.color + 'cc');
        grad.addColorStop(1, 'transparent');
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      });
    };
    draw();
    if (opts.animate) {
      const animate = () => { draw(); requestAnimationFrame(animate); };
      requestAnimationFrame(animate);
    }
    return this;
  }

  aurora(container, options) {
    const opts = Object.assign({
      colors: ['rgba(0,245,255,0.3)', 'rgba(124,58,237,0.25)', 'rgba(0,255,136,0.2)'],
      layers: 3, speed: 0.5
    }, options || {});
    const target = typeof container === 'string' ? document.querySelector(container) : container || document.body;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    target.style.position = target.style.position || 'relative';
    target.insertBefore(canvas, target.firstChild);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let t = 0;
    const draw = () => {
      canvas.width = target.offsetWidth;
      canvas.height = target.offsetHeight;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      for (let l = 0; l < opts.layers; l++) {
        ctx.beginPath();
        const offset = (l / opts.layers) * Math.PI * 2;
        ctx.moveTo(0, H * 0.4);
        for (let x = 0; x <= W; x += 4) {
          const y = H * 0.4 + Math.sin(x / W * Math.PI * 3 + t * opts.speed + offset) * H * 0.12
            + Math.sin(x / W * Math.PI * 5 + t * opts.speed * 1.3 + offset) * H * 0.06;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, 0); ctx.lineTo(0, 0);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, 0, 0, H * 0.6);
        grad.addColorStop(0, opts.colors[l % opts.colors.length]);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();
      }
      t += 0.01;
    };
    draw();
    const animate = () => { draw(); requestAnimationFrame(animate); };
    requestAnimationFrame(animate);
    return this;
  }

  dots(container, options) {
    const opts = Object.assign({ color: '#00f5ff', size: 1.5, gap: 24, opacity: 0.15 }, options || {});
    const target = typeof container === 'string' ? document.querySelector(container) : container || document.body;
    target.style.position = target.style.position || 'relative';
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    target.insertBefore(canvas, target.firstChild);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      canvas.width = target.offsetWidth;
      canvas.height = target.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = opts.color;
      ctx.globalAlpha = opts.opacity;
      for (let x = opts.gap; x < canvas.width; x += opts.gap) {
        for (let y = opts.gap; y < canvas.height; y += opts.gap) {
          ctx.beginPath();
          ctx.arc(x, y, opts.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };
    draw();
    window.addEventListener('resize', NandanXUtils.debounce(draw, 200));
    return this;
  }

  grid(container, options) {
    const opts = Object.assign({ color: '#00f5ff', opacity: 0.07, size: 40 }, options || {});
    const target = typeof container === 'string' ? document.querySelector(container) : container || document.body;
    target.style.position = target.style.position || 'relative';
    const div = document.createElement('div');
    div.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;
      background-image: linear-gradient(${opts.color}${Math.round(opts.opacity*255).toString(16).padStart(2,'0')} 1px, transparent 1px),
                        linear-gradient(90deg, ${opts.color}${Math.round(opts.opacity*255).toString(16).padStart(2,'0')} 1px, transparent 1px);
      background-size: ${opts.size}px ${opts.size}px;`;
    target.insertBefore(div, target.firstChild);
    return this;
  }

  scanlines(container, options) {
    const opts = Object.assign({ opacity: 0.03, lineHeight: 2, gap: 4 }, options || {});
    const target = typeof container === 'string' ? document.querySelector(container) : container || document.body;
    target.style.position = target.style.position || 'relative';
    const div = document.createElement('div');
    div.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;
      background: repeating-linear-gradient(0deg, rgba(0,0,0,${opts.opacity}) 0px, rgba(0,0,0,${opts.opacity}) ${opts.lineHeight}px, transparent ${opts.lineHeight}px, transparent ${opts.lineHeight + opts.gap}px);`;
    target.appendChild(div);
    return this;
  }
}

var noiseEngine = new NoiseEngine();
if (typeof window !== 'undefined') window.NandanXNoise = noiseEngine;
