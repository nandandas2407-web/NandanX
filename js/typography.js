/**
 * VeloxUI — typographyEngine
 * Text splitting, kinetic typography, char/word/line animations
 */
class TypographyEngine {
  constructor() {
    this.initialized = false;
    this.splitElements = new Map();
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('vx-typo-styles')) return;
    const s = document.createElement('style');
    s.id = 'vx-typo-styles';
    s.textContent = `
      .vx-char, .vx-word, .vx-line { display: inline-block; }
      .vx-chars-wrap { overflow: hidden; display: inline-block; }
      .vx-word-wrap { overflow: hidden; display: inline-block; }
      .vx-line-wrap { overflow: hidden; display: block; }

      /* Char animation presets */
      .vx-char { opacity: 0; transform: translateY(110%); }
      .vx-char.vx-in { opacity: 1; transform: translateY(0); transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.23,1,0.32,1); }

      .vx-typo-blur .vx-char { opacity: 0; filter: blur(8px); transform: scale(0.8); }
      .vx-typo-blur .vx-char.vx-in { opacity: 1; filter: blur(0); transform: scale(1); transition: all 0.6s cubic-bezier(0.23,1,0.32,1); }

      .vx-typo-rotate .vx-char { opacity: 0; transform: rotate(-90deg) translateY(-50%); transform-origin: center bottom; }
      .vx-typo-rotate .vx-char.vx-in { opacity: 1; transform: rotate(0) translateY(0); transition: all 0.5s cubic-bezier(0.23,1,0.32,1); }

      .vx-typo-wave .vx-char { display: inline-block; }
      .vx-kinetic { white-space: nowrap; overflow: hidden; }
      .vx-marquee-inner { display: inline-flex; }
      .vx-marquee-inner .vx-marquee-track { animation: vx-marquee-scroll linear infinite; white-space: nowrap; }
      @keyframes vx-marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

      .vx-highlight-span { position: relative; }
      .vx-highlight-span::after { content: ''; position: absolute; bottom: 0; left: 0; height: 0.15em; width: 100%; background: var(--vx-primary, #00f5ff); transform: scaleX(0); transform-origin: left; transition: transform 0.4s cubic-bezier(0.23,1,0.32,1); }
      .vx-highlight-span.vx-in::after { transform: scaleX(1); }

      .vx-count-up { font-variant-numeric: tabular-nums; }
      .vx-typewriter-cursor::after { content: '|'; animation: vx-blink 0.7s step-end infinite; color: var(--vx-primary, #00f5ff); }
      @keyframes vx-blink { 50% { opacity: 0; } }
    `;
    document.head.appendChild(s);
  }

  _autoDetect() {
    document.querySelectorAll('[data-vx-split]').forEach(el => {
      const type = el.dataset.nxSplit || 'chars';
      const effect = el.dataset.nxEffect || 'slide';
      this.split(el, { type, effect, trigger: 'scroll' });
    });
    document.querySelectorAll('[data-vx-marquee]').forEach(el => {
      this.marquee(el, { speed: parseFloat(el.dataset.nxMarquee) || 40 });
    });
    document.querySelectorAll('[data-vx-count]').forEach(el => {
      this.countUp(el, parseFloat(el.dataset.nxCount), { trigger: 'scroll' });
    });
  }

  // Split text into chars/words/lines
  split(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const type = options.type || 'chars';
    const effect = options.effect || 'slide';
    const stagger = options.stagger || 30;
    const delay = options.delay || 0;

    el.classList.add(`vx-typo-${effect}`);
    const originalText = el.textContent;
    let html = '';

    if (type === 'chars') {
      originalText.split('').forEach((char, i) => {
        if (char === ' ') { html += ' '; return; }
        html += `<span class="vx-chars-wrap"><span class="vx-char" style="transition-delay:${delay + i * stagger}ms">${char}</span></span>`;
      });
    } else if (type === 'words') {
      originalText.split(' ').forEach((word, i) => {
        html += `<span class="vx-word-wrap"><span class="vx-word vx-char" style="transition-delay:${delay + i * stagger * 3}ms">${word}</span></span> `;
      });
    } else if (type === 'lines') {
      originalText.split('\n').forEach((line, i) => {
        html += `<span class="vx-line-wrap"><span class="vx-line vx-char" style="transition-delay:${delay + i * stagger * 5}ms">${line}</span></span>`;
      });
    }

    el.innerHTML = html;
    this.splitElements.set(el, { type, originalText });

    if (options.trigger === 'scroll') {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          el.querySelectorAll('.vx-char').forEach(c => c.classList.add('vx-in'));
          observer.disconnect();
        }
      }, { threshold: 0.1 });
      observer.observe(el);
    } else if (options.trigger === 'hover') {
      el.addEventListener('mouseenter', () => el.querySelectorAll('.vx-char').forEach(c => c.classList.add('vx-in')));
      el.addEventListener('mouseleave', () => el.querySelectorAll('.vx-char').forEach(c => c.classList.remove('vx-in')));
    } else {
      requestAnimationFrame(() => el.querySelectorAll('.vx-char').forEach(c => c.classList.add('vx-in')));
    }
    return this;
  }

  // Infinite marquee / ticker
  marquee(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const speed = options.speed || 40; // px/s
    const gap = options.gap || 40;
    const direction = options.direction || 'left';
    const pauseOnHover = options.pauseOnHover !== false;

    el.classList.add('vx-kinetic');
    const inner = document.createElement('div');
    inner.className = 'vx-marquee-inner';
    const track = document.createElement('div');
    track.className = 'vx-marquee-track';
    track.innerHTML = el.innerHTML + el.innerHTML; // duplicate
    inner.appendChild(track);
    el.innerHTML = '';
    el.appendChild(inner);

    const trackW = track.scrollWidth / 2;
    const duration = trackW / speed;
    track.style.animationDuration = `${duration}s`;
    track.style.animationDirection = direction === 'right' ? 'reverse' : 'normal';

    if (pauseOnHover) {
      el.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
      el.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
    }
    return this;
  }

  // Kinetic wave text
  wave(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const speed = options.speed || 1.5;
    const amplitude = options.amplitude || 8;
    const chars = el.textContent.split('');

    el.innerHTML = chars.map((c, i) =>
      c === ' ' ? ' ' : `<span class="vx-char" style="display:inline-block">${c}</span>`
    ).join('');

    const spans = el.querySelectorAll('.vx-char');
    let t = 0;
    const animate = () => {
      spans.forEach((span, i) => {
        span.style.transform = `translateY(${Math.sin(t + i * 0.4) * amplitude}px)`;
      });
      t += 0.05 * speed;
      requestAnimationFrame(animate);
    };
    animate();
    return this;
  }

  // Count up animation
  countUp(element, target, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const duration = options.duration || 2000;
    const decimals = options.decimals || 0;
    const prefix = options.prefix || '';
    const suffix = options.suffix || '';
    const ease = t => 1 - Math.pow(1 - t, 3);
    el.classList.add('vx-count-up');

    const run = () => {
      let start = null;
      const from = parseFloat(options.from || 0);
      const step = (ts) => {
        if (!start) start = ts;
        const t = Math.min((ts - start) / duration, 1);
        const val = from + (target - from) * ease(t);
        el.textContent = prefix + val.toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (options.trigger !== false) {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { run(); observer.disconnect(); }
      }, { threshold: 0.5 });
      observer.observe(el);
    } else { run(); }
    return this;
  }

  // Glitch text effect
  glitch(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const original = el.textContent;
    const chars = '!<>-_\\/[]{}—=+*^?#@$%&';
    const iterations = options.iterations || 8;
    let frame = 0;

    const randomize = () => {
      if (frame >= iterations) { el.textContent = original; return; }
      el.textContent = original.split('').map((c, i) => {
        if (i < frame / iterations * original.length) return c;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      frame++;
      setTimeout(randomize, options.speed || 40);
    };

    const trigger = options.trigger || 'hover';
    if (trigger === 'hover') {
      el.addEventListener('mouseenter', () => { frame = 0; randomize(); });
    } else if (trigger === 'auto') {
      setInterval(() => { frame = 0; randomize(); }, options.interval || 3000);
    } else {
      frame = 0; randomize();
    }
    return this;
  }

  // Highlight underline text reveal
  highlight(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.innerHTML = `<span class="vx-highlight-span">${el.innerHTML}</span>`;
    const span = el.querySelector('.vx-highlight-span');
    if (options.color) span.style.setProperty('--vx-primary', options.color);
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { span.classList.add('vx-in'); observer.disconnect(); }
    }, { threshold: 0.5 });
    observer.observe(el);
    return this;
  }

  // Staggered word reveal on scroll
  staggerReveal(element, options = {}) {
    return this.split(element, { type: 'words', effect: 'slide', trigger: 'scroll', stagger: options.stagger || 60, delay: options.delay || 0 });
  }

  // Rotating text (cycle through words)
  rotatingText(element, words, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const interval = options.interval || 2500;
    const duration = options.duration || 400;
    let idx = 0;
    el.style.cssText += `display:inline-block;overflow:hidden;vertical-align:bottom;`;

    const inner = document.createElement('span');
    inner.style.cssText = 'display:inline-block;';
    inner.textContent = words[0];
    el.appendChild(inner);

    setInterval(() => {
      idx = (idx + 1) % words.length;
      inner.style.transition = `transform ${duration}ms cubic-bezier(0.23,1,0.32,1), opacity ${duration}ms ease`;
      inner.style.transform = 'translateY(-100%)';
      inner.style.opacity = '0';
      setTimeout(() => {
        inner.textContent = words[idx];
        inner.style.transition = 'none';
        inner.style.transform = 'translateY(100%)';
        inner.style.opacity = '0';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          inner.style.transition = `transform ${duration}ms cubic-bezier(0.23,1,0.32,1), opacity ${duration}ms ease`;
          inner.style.transform = 'translateY(0)';
          inner.style.opacity = '1';
        }));
      }, duration + 50);
    }, interval);
    return this;
  }

  // 3D flip text
  flipText(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const chars = el.textContent.split('');
    el.innerHTML = chars.map((c, i) =>
      c === ' ' ? ' ' : `<span style="display:inline-block;transition:transform 0.4s ${i * 0.04}s ease">${c}</span>`
    ).join('');
    el.addEventListener('mouseenter', () => {
      el.querySelectorAll('span').forEach(s => s.style.transform = 'rotateY(360deg)');
    });
    el.addEventListener('mouseleave', () => {
      el.querySelectorAll('span').forEach(s => s.style.transform = 'rotateY(0deg)');
    });
    return this;
  }
}

const typographyEngine = new TypographyEngine();
