/**
 * NandanX — svgMorphEngine
 * SVG path morphing, drawing animations, shape transitions, blob morphing
 */
class SVGMorphEngine {
  constructor() {
    this.initialized = false;
    this.morphs = new Map();
    this.drawings = new Map();
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-svg-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-svg-styles';
    s.textContent = `
      [data-nx-draw] path, [data-nx-draw] line, [data-nx-draw] circle, [data-nx-draw] polyline {
        stroke-dasharray: var(--nx-path-len, 1000);
        stroke-dashoffset: var(--nx-path-len, 1000);
        transition: stroke-dashoffset var(--nx-draw-dur, 1.5s) cubic-bezier(0.4, 0, 0.2, 1);
      }
      [data-nx-draw].nx-drawn path, [data-nx-draw].nx-drawn line,
      [data-nx-draw].nx-drawn circle, [data-nx-draw].nx-drawn polyline {
        stroke-dashoffset: 0;
      }
      .nx-morph-svg { overflow: visible; }
    `;
    document.head.appendChild(s);
  }

  // Normalize path to same number of commands (basic)
  _normalizePaths(from, to) {
    // Simple numeric interpolation between path d values
    const numFrom = from.match(/-?[\d.]+/g).map(Number);
    const numTo = to.match(/-?[\d.]+/g).map(Number);
    const len = Math.min(numFrom.length, numTo.length);
    return { from: numFrom.slice(0, len), to: numTo.slice(0, len), template: from, len };
  }

  _interpolatePath(from, to, t, template) {
    const nums = from.map((n, i) => n + (to[i] - n) * t);
    let idx = 0;
    return template.replace(/-?[\d.]+/g, () => nums[idx++]?.toFixed(2) || '0');
  }

  // Morph between two SVG paths
  morph(element, fromPath, toPath, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const duration = options.duration || 800;
    const ease = options.ease || (t => t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2);
    const repeat = options.repeat || false;
    const yoyo = options.yoyo || false;

    const { from, to, template } = this._normalizePaths(fromPath, toPath);
    let start = null;
    let forward = true;

    const anim = (ts) => {
      if (!start) start = ts;
      let t = Math.min((ts - start) / duration, 1);
      const easedT = ease(forward ? t : 1 - t);
      const current = this._interpolatePath(from, to, easedT, template);
      el.setAttribute('d', current);

      if (t < 1) {
        requestAnimationFrame(anim);
      } else if (repeat) {
        start = null;
        if (yoyo) forward = !forward;
        requestAnimationFrame(anim);
      } else if (options.onComplete) options.onComplete();
    };
    requestAnimationFrame(anim);
    return this;
  }

  // Morph through multiple paths in sequence
  morphSequence(element, paths, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;
    const duration = options.duration || 600;
    const delay = options.delay || 0;
    let idx = 0;

    const next = () => {
      const fromPath = paths[idx];
      const toPath = paths[(idx + 1) % paths.length];
      idx = (idx + 1) % paths.length;
      this.morph(el, fromPath, toPath, { duration, onComplete: () => {
        if (options.loop !== false) setTimeout(next, delay);
      }});
    };
    setTimeout(next, delay);
    return this;
  }

  // Animate SVG path drawing (write-on effect)
  draw(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const duration = options.duration || 1500;
    const stagger = options.stagger || 100;
    const trigger = options.trigger !== false; // trigger on scroll by default

    const paths = el.querySelectorAll('path, line, circle, polyline, ellipse, rect');
    paths.forEach((path, i) => {
      const len = path.getTotalLength ? path.getTotalLength() : 1000;
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.style.transition = `stroke-dashoffset ${duration}ms ${i * stagger}ms cubic-bezier(0.4,0,0.2,1)`;
    });

    const reveal = () => {
      paths.forEach(path => { path.style.strokeDashoffset = 0; });
      if (options.onComplete) setTimeout(options.onComplete, duration + paths.length * stagger);
    };

    if (trigger) {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { reveal(); observer.disconnect(); }
      }, { threshold: 0.2 });
      observer.observe(el);
    } else {
      reveal();
    }
    return this;
  }

  // Animated blob shapes
  blob(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const colors = options.colors || ['#00f5ff', '#7c3aed', '#ff006e'];
    const speed = options.speed || 4000;
    const size = options.size || 200;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.style.cssText = `width:${size}px;height:${size}px;overflow:visible;`;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const grad = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    grad.innerHTML = `<radialGradient id="blob-g-${Date.now()}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${colors[0]}"/>
      <stop offset="100%" stop-color="${colors[1] || colors[0]}"/>
    </radialGradient>`;
    svg.appendChild(grad);
    path.setAttribute('fill', `url(#${grad.firstChild.id})`);
    svg.appendChild(path);
    el.appendChild(svg);

    const cx = size / 2, cy = size / 2, r = size * 0.38;
    const pts = 8;
    let t = 0;

    const genBlob = (time) => {
      const points = [];
      for (let i = 0; i < pts; i++) {
        const angle = (i / pts) * Math.PI * 2;
        const noise = Math.sin(time * 0.0015 + i * 1.3) * 0.22 + Math.cos(time * 0.001 + i * 2.1) * 0.15;
        const rad = r * (1 + noise);
        points.push([cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad]);
      }
      let d = `M ${points[0][0]} ${points[0][1]}`;
      for (let i = 0; i < pts; i++) {
        const p1 = points[i], p2 = points[(i + 1) % pts];
        const mid = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
        d += ` Q ${p1[0]} ${p1[1]} ${mid[0]} ${mid[1]}`;
      }
      d += ' Z';
      return d;
    };

    const animate = (ts) => {
      path.setAttribute('d', genBlob(ts));
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    return svg;
  }

  // Text to SVG path morph
  textMorph(element, texts, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;
    const interval = options.interval || 3000;
    const duration = options.duration || 800;
    let idx = 0;

    const update = () => {
      el.style.transition = `opacity ${duration * 0.3}ms ease`;
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = texts[idx];
        el.style.opacity = '1';
        idx = (idx + 1) % texts.length;
      }, duration * 0.3);
    };

    setInterval(update, interval);
    return this;
  }

  // Shape transition (div background morphing via clip-path)
  clipMorph(element, shapes, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const clips = {
      circle: 'circle(50% at 50% 50%)',
      ellipse: 'ellipse(60% 40% at 50% 50%)',
      hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
      triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
      diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
      squircle: 'polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)',
      rect: 'inset(0%)',
    };
    const duration = options.duration || 600;
    const delay = options.delay || 2000;
    let idx = 0;

    el.style.transition = `clip-path ${duration}ms cubic-bezier(0.4,0,0.2,1)`;

    const cycle = () => {
      const shape = shapes[idx];
      el.style.clipPath = clips[shape] || shape;
      idx = (idx + 1) % shapes.length;
      setTimeout(cycle, delay);
    };
    cycle();
    return this;
  }

  // Animated SVG icon on hover/click
  animateIcon(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const type = options.type || 'spin';

    if (type === 'spin') {
      el.addEventListener('mouseenter', () => {
        el.style.transition = 'transform 0.5s ease';
        el.style.transform = 'rotate(180deg)';
      });
      el.addEventListener('mouseleave', () => { el.style.transform = 'rotate(0deg)'; });
    } else if (type === 'pulse') {
      el.style.animation = 'nx-svg-pulse 1.5s ease-in-out infinite';
      if (!document.getElementById('nx-svg-anim')) {
        const s = document.createElement('style');
        s.id = 'nx-svg-anim';
        s.textContent = `@keyframes nx-svg-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }`;
        document.head.appendChild(s);
      }
    } else if (type === 'shake') {
      el.addEventListener('click', () => {
        el.style.animation = 'nx-svg-shake 0.4s ease';
        el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
        if (!document.getElementById('nx-svg-shake')) {
          const s = document.createElement('style');
          s.id = 'nx-svg-shake';
          s.textContent = `@keyframes nx-svg-shake { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-15deg)} 75%{transform:rotate(15deg)} }`;
          document.head.appendChild(s);
        }
      });
    }
    return this;
  }
}

const svgMorphEngine = new SVGMorphEngine();
