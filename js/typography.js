/**
 * NandanX — typographyEngine
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
    if (document.getElementById('nx-typo-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-typo-styles';
    s.textContent = `
      .nx-char, .nx-word, .nx-line { display: inline-block; }
      .nx-chars-wrap { overflow: hidden; display: inline-block; }
      .nx-word-wrap { overflow: hidden; display: inline-block; }
      .nx-line-wrap { overflow: hidden; display: block; }

      /* Char animation presets */
      .nx-char { opacity: 0; transform: translateY(110%); }
      .nx-char.nx-in { opacity: 1; transform: translateY(0); transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.23,1,0.32,1); }

      .nx-typo-blur .nx-char { opacity: 0; filter: blur(8px); transform: scale(0.8); }
      .nx-typo-blur .nx-char.nx-in { opacity: 1; filter: blur(0); transform: scale(1); transition: all 0.6s cubic-bezier(0.23,1,0.32,1); }

      .nx-typo-rotate .nx-char { opacity: 0; transform: rotate(-90deg) translateY(-50%); transform-origin: center bottom; }
      .nx-typo-rotate .nx-char.nx-in { opacity: 1; transform: rotate(0) translateY(0); transition: all 0.5s cubic-bezier(0.23,1,0.32,1); }

      .nx-typo-wave .nx-char { display: inline-block; }
      .nx-kinetic { white-space: nowrap; overflow: hidden; }
      .nx-marquee-inner { display: inline-flex; }
      .nx-marquee-inner .nx-marquee-track { animation: nx-marquee-scroll linear infinite; white-space: nowrap; }
      @keyframes nx-marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

      .nx-highlight-span { position: relative; }
      .nx-highlight-span::after { content: ''; position: absolute; bottom: 0; left: 0; height: 0.15em; width: 100%; background: var(--nx-primary, #00f5ff); transform: scaleX(0); transform-origin: left; transition: transform 0.4s cubic-bezier(0.23,1,0.32,1); }
      .nx-highlight-span.nx-in::after { transform: scaleX(1); }

      .nx-count-up { font-variant-numeric: tabular-nums; }
      .nx-typewriter-cursor::after { content: '|'; animation: nx-blink 0.7s step-end infinite; color: var(--nx-primary, #00f5ff); }
      @keyframes nx-blink { 50% { opacity: 0; } }
    `;
    document.head.appendChild(s);
  }

  _autoDetect() {
    document.querySelectorAll('[data-nx-split]').forEach(el => {
      const type = el.dataset.nxSplit || 'chars';
      const effect = el.dataset.nxEffect || 'slide';
      this.split(el, { type, effect, trigger: 'scroll' });
    });
    document.querySelectorAll('[data-nx-marquee]').forEach(el => {
      this.marquee(el, { speed: parseFloat(el.dataset.nxMarquee) || 40 });
    });
    document.querySelectorAll('[data-nx-count]').forEach(el => {
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

    el.classList.add(`nx-typo-${effect}`);
    const originalText = el.textContent;
    let html = '';

    if (type === 'chars') {
      originalText.split('').forEach((char, i) => {
        if (char === ' ') { html += ' '; return; }
        html += `<span class="nx-chars-wrap"><span class="nx-char" style="transition-delay:${delay + i * stagger}ms">${char}</span></span>`;
      });
    } else if (type === 'words') {
      originalText.split(' ').forEach((word, i) => {
        html += `<span class="nx-word-wrap"><span class="nx-word nx-char" style="transition-delay:${delay + i * stagger * 3}ms">${word}</span></span> `;
      });
    } else if (type === 'lines') {
      originalText.split('\n').forEach((line, i) => {
        html += `<span class="nx-line-wrap"><span class="nx-line nx-char" style="transition-delay:${delay + i * stagger * 5}ms">${line}</span></span>`;
      });
    }

    el.innerHTML = html;
    this.splitElements.set(el, { type, originalText });

    if (options.trigger === 'scroll') {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          el.querySelectorAll('.nx-char').forEach(c => c.classList.add('nx-in'));
          observer.disconnect();
        }
      }, { threshold: 0.1 });
      observer.observe(el);
    } else if (options.trigger === 'hover') {
      el.addEventListener('mouseenter', () => el.querySelectorAll('.nx-char').forEach(c => c.classList.add('nx-in')));
      el.addEventListener('mouseleave', () => el.querySelectorAll('.nx-char').forEach(c => c.classList.remove('nx-in')));
    } else {
      requestAnimationFrame(() => el.querySelectorAll('.nx-char').forEach(c => c.classList.add('nx-in')));
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

    el.classList.add('nx-kinetic');
    const inner = document.createElement('div');
    inner.className = 'nx-marquee-inner';
    const track = document.createElement('div');
    track.className = 'nx-marquee-track';
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
      c === ' ' ? ' ' : `<span class="nx-char" style="display:inline-block">${c}</span>`
    ).join('');

    const spans = el.querySelectorAll('.nx-char');
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
    el.classList.add('nx-count-up');

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
    el.innerHTML = `<span class="nx-highlight-span">${el.innerHTML}</span>`;
    const span = el.querySelector('.nx-highlight-span');
    if (options.color) span.style.setProperty('--nx-primary', options.color);
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { span.classList.add('nx-in'); observer.disconnect(); }
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
