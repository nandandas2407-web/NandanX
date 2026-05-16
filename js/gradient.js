/**
 * NandanX — gradientEngine
 * Dynamic gradients, mesh gradients, animated backgrounds, auto dark mode
 */
class GradientEngine {
  constructor() {
    this.initialized = false;
    this.darkMode = false;
    this.observers = [];
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    if (options.autoDark) this.autoDarkMode(options.autoDark);
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-gradient-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-gradient-styles';
    s.textContent = `
      .nx-gradient-mesh { position: relative; overflow: hidden; }
      .nx-gradient-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.6; animation: nx-orb-float linear infinite; pointer-events: none; }
      @keyframes nx-orb-float {
        0% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(30px, -20px) scale(1.1); }
        66% { transform: translate(-20px, 30px) scale(0.9); }
        100% { transform: translate(0, 0) scale(1); }
      }
      .nx-animated-gradient {
        background-size: 200% 200%;
        animation: nx-gradient-shift 6s ease infinite;
      }
      @keyframes nx-gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .nx-dark-mode { filter: invert(1) hue-rotate(180deg); }
      .nx-dark-mode img, .nx-dark-mode video, .nx-dark-mode canvas { filter: invert(1) hue-rotate(180deg); }

      :root.nx-dark {
        --nx-bg: #0a0a12;
        --nx-text: #e2e8f0;
        --nx-surface: rgba(255,255,255,0.04);
        --nx-border: rgba(255,255,255,0.08);
      }
      :root.nx-light {
        --nx-bg: #f8fafc;
        --nx-text: #0f172a;
        --nx-surface: rgba(0,0,0,0.04);
        --nx-border: rgba(0,0,0,0.08);
      }
      .nx-transition-colors * { transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease; }
      .nx-glass {
        background: rgba(255,255,255,0.08);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.15);
      }
      .nx-neumorphism {
        background: #e0e5ec;
        box-shadow: 9px 9px 16px #b8bec7, -9px -9px 16px #ffffff;
      }
      .nx-neumorphism-dark {
        background: #1e2030;
        box-shadow: 9px 9px 16px #151720, -9px -9px 16px #272940;
      }
    `;
    document.head.appendChild(s);
  }

  // Animated mesh gradient background
  meshGradient(container, colors, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('nx-gradient-mesh');
    el.style.position = el.style.position || 'relative';

    const orbs = colors || ['#ff006e', '#00f5ff', '#7c3aed', '#00ff88'];
    const sizes = options.sizes || ['400px', '350px', '300px', '250px'];
    const durations = options.durations || [8, 12, 10, 14];

    orbs.forEach((color, i) => {
      const orb = document.createElement('div');
      orb.className = 'nx-gradient-orb';
      const size = sizes[i] || '300px';
      orb.style.cssText = `
        width: ${size}; height: ${size};
        background: ${color};
        top: ${Math.random() * 80}%;
        left: ${Math.random() * 80}%;
        animation-duration: ${durations[i] || 10}s;
        animation-delay: ${-Math.random() * 5}s;
      `;
      el.appendChild(orb);
    });
    return this;
  }

  // Animated gradient on element
  animated(element, colors, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const dir = options.direction || '135deg';
    el.style.background = `linear-gradient(${dir}, ${colors.join(', ')}, ${colors[0]})`;
    el.style.backgroundSize = '200% 200%';
    el.classList.add('nx-animated-gradient');
    if (options.duration) el.style.animationDuration = options.duration;
    return this;
  }

  // Conic gradient
  conic(element, colors, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const stops = colors.map((c, i) => `${c} ${(i / colors.length) * 360}deg`).join(', ');
    el.style.background = `conic-gradient(from ${options.from || 0}deg, ${stops})`;
    return this;
  }

  // Radial glow
  radialGlow(element, color, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const size = options.size || '80%';
    el.style.background = `radial-gradient(circle at center, ${color}${options.opacity || '33'} 0%, transparent ${size})`;
    return this;
  }

  // Glassmorphism
  glass(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const opacity = options.opacity || 0.1;
    const blur = options.blur || 20;
    const border = options.border || '1px solid rgba(255,255,255,0.15)';
    const bg = options.dark ? `rgba(0,0,0,${opacity})` : `rgba(255,255,255,${opacity})`;
    el.style.background = bg;
    el.style.backdropFilter = `blur(${blur}px)`;
    el.style.webkitBackdropFilter = `blur(${blur}px)`;
    el.style.border = border;
    return this;
  }

  // Neumorphism
  neumorphism(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.classList.add(options.dark ? 'nx-neumorphism-dark' : 'nx-neumorphism');
    if (options.borderRadius) el.style.borderRadius = options.borderRadius;
    return this;
  }

  // Auto dark mode based on system preference
  autoDarkMode(options = {}) {
    const apply = (dark) => {
      this.darkMode = dark;
      document.documentElement.classList.toggle('nx-dark', dark);
      document.documentElement.classList.toggle('nx-light', !dark);
      if (options.transition) document.body.classList.add('nx-transition-colors');
      if (options.onChange) options.onChange(dark);
    };

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    apply(mq.matches);
    mq.addEventListener('change', e => apply(e.matches));

    if (options.toggle) {
      const btn = typeof options.toggle === 'string' ? document.querySelector(options.toggle) : options.toggle;
      if (btn) btn.addEventListener('click', () => apply(!this.darkMode));
    }
    return this;
  }

  // Theme generator from base color
  generateTheme(baseColor, options = {}) {
    const hsl = this._hexToHSL(baseColor);
    const vars = {
      '--nx-primary': baseColor,
      '--nx-primary-light': `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(95, hsl.l + 20)}%)`,
      '--nx-primary-dark': `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(5, hsl.l - 20)}%)`,
      '--nx-secondary': `hsl(${(hsl.h + 180) % 360}, ${hsl.s}%, ${hsl.l}%)`,
      '--nx-accent': `hsl(${(hsl.h + 90) % 360}, ${hsl.s}%, ${hsl.l}%)`,
      '--nx-glow': `hsla(${hsl.h}, 100%, 60%, 0.4)`,
    };

    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    return vars;
  }

  _hexToHSL(hex) {
    let r = parseInt(hex.slice(1,3),16)/255;
    let g = parseInt(hex.slice(3,5),16)/255;
    let b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max+min)/2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      switch(max) {
        case r: h = (g-b)/d + (g<b?6:0); break;
        case g: h = (b-r)/d + 2; break;
        case b: h = (r-g)/d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
  }

  // Dynamic gradient text
  gradientText(element, colors, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const dir = options.direction || '135deg';
    el.style.background = `linear-gradient(${dir}, ${colors.join(', ')})`;
    el.style.webkitBackgroundClip = 'text';
    el.style.backgroundClip = 'text';
    el.style.webkitTextFillColor = 'transparent';
    if (options.animate) {
      el.style.backgroundSize = '200% 200%';
      el.classList.add('nx-animated-gradient');
    }
    return this;
  }

  // Background that reacts to mouse position
  mouseGradient(element, colors, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
      el.style.background = `radial-gradient(circle at ${x}% ${y}%, ${colors[0]}, ${colors[1] || '#0a0a12'})`;
    });
    return this;
  }
}

const gradientEngine = new GradientEngine();
