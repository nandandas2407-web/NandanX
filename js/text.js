class TextEngine {
  constructor() {
    this.initialized = false;
    this._splitCache = new WeakMap();
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-text-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-text-styles';
    s.textContent = `
      .nx-typewriter-cursor::after {
        content: '|';
        animation: nx-blink 0.7s step-end infinite;
        color: var(--nx-primary, #00f5ff);
        margin-left: 2px;
      }
      @keyframes nx-blink { 0%,100%{opacity:1} 50%{opacity:0} }
      .nx-char { display: inline-block; }
      .nx-word { display: inline-block; }
      .nx-line { display: block; overflow: hidden; }
      .nx-scramble-char { display: inline-block; transition: color 0.1s; }
      .nx-gradient-text {
        background: linear-gradient(135deg, var(--nx-primary,#00f5ff), var(--nx-secondary,#ff006e), var(--nx-accent,#7c3aed));
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text; background-size: 200% auto;
        animation: nx-gradient-shift 3s linear infinite;
      }
      @keyframes nx-gradient-shift { to { background-position: 200% center; } }
      .nx-neon-text {
        color: var(--nx-neon-txt, #00f5ff);
        text-shadow: 0 0 7px var(--nx-neon-txt, #00f5ff), 0 0 21px var(--nx-neon-txt, #00f5ff), 0 0 42px var(--nx-neon-txt, #00f5ff);
        animation: nx-neon-flicker 4s infinite;
      }
      @keyframes nx-neon-flicker {
        0%,19%,21%,23%,25%,54%,56%,100% { opacity:1; }
        20%,24%,55% { opacity:0.4; }
      }
      .nx-glitch-text { position: relative; }
      .nx-glitch-text::before, .nx-glitch-text::after {
        content: attr(data-text); position: absolute; top: 0; left: 0;
        width: 100%; height: 100%; pointer-events: none;
      }
      .nx-glitch-text::before { color: #ff006e; animation: nx-gt1 2s infinite; clip-path: polygon(0 15%, 100% 15%, 100% 40%, 0 40%); }
      .nx-glitch-text::after  { color: #00f5ff; animation: nx-gt2 2s infinite; clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%); }
      @keyframes nx-gt1 { 0%,100%{transform:translate(0)} 20%{transform:translate(-3px,1px)} 40%{transform:translate(3px,-1px)} 60%{transform:translate(-2px,2px)} 80%{transform:translate(2px,-2px)} }
      @keyframes nx-gt2 { 0%,100%{transform:translate(0)} 20%{transform:translate(3px,-1px)} 40%{transform:translate(-3px,1px)} 60%{transform:translate(2px,-2px)} 80%{transform:translate(-2px,2px)} }
      .nx-wave-char { display: inline-block; animation: nx-wave-ch 1.2s ease-in-out infinite; }
      @keyframes nx-wave-ch { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-0.4em)} }
      .nx-blur-text { filter: blur(8px); opacity:0; transition: filter 0.8s ease, opacity 0.8s ease; }
      .nx-blur-text.nx-visible { filter: blur(0); opacity:1; }
    `;
    document.head.appendChild(s);
  }

  typewriter(target, options) {
    const opts = Object.assign({ speed: 50, cursor: true, loop: false, deleteSpeed: 30, pauseAfter: 2000 }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      const text = opts.text || el.textContent;
      el.textContent = '';
      if (opts.cursor) el.classList.add('nx-typewriter-cursor');
      let i = 0, deleting = false;
      const type = () => {
        if (!deleting) {
          el.textContent = text.slice(0, i + 1);
          i++;
          if (i === text.length) {
            if (opts.loop) setTimeout(() => { deleting = true; tick(); }, opts.pauseAfter);
            return;
          }
          setTimeout(tick, opts.speed);
        } else {
          el.textContent = text.slice(0, i - 1);
          i--;
          if (i === 0) { deleting = false; setTimeout(tick, 400); return; }
          setTimeout(tick, opts.deleteSpeed);
        }
      };
      const tick = () => type();
      type();
    });
    return this;
  }

  scramble(target, options) {
    const opts = Object.assign({ speed: 40, chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%', onHover: true }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      const original = el.textContent;
      const doScramble = () => {
        let iter = 0;
        const max = original.length * 3;
        const interval = setInterval(() => {
          el.textContent = original.split('').map((ch, i) => {
            if (ch === ' ') return ' ';
            if (i < Math.floor(iter / 3)) return ch;
            return opts.chars[Math.floor(Math.random() * opts.chars.length)];
          }).join('');
          iter++;
          if (iter >= max) { el.textContent = original; clearInterval(interval); }
        }, opts.speed);
      };
      if (opts.onHover) el.addEventListener('mouseenter', doScramble);
      else doScramble();
    });
    return this;
  }

  splitChars(target) {
    const els = NandanXUtils.parseSelector(target);
    els.forEach(el => {
      if (this._splitCache.has(el)) return;
      const text = el.textContent;
      el.innerHTML = text.split('').map(ch =>
        `<span class="nx-char" style="display:inline-block">${ch === ' ' ? '&nbsp;' : ch}</span>`
      ).join('');
      this._splitCache.set(el, text);
    });
    return els;
  }

  splitWords(target) {
    const els = NandanXUtils.parseSelector(target);
    els.forEach(el => {
      const text = el.textContent;
      el.innerHTML = text.split(' ').map(w =>
        `<span class="nx-word" style="display:inline-block">${w}&nbsp;</span>`
      ).join('');
    });
    return els;
  }

  revealChars(target, options) {
    const opts = Object.assign({ stagger: 30, duration: 600, direction: 'up' }, options || {});
    const els = this.splitChars(target);
    els.forEach(el => {
      const chars = [...el.querySelectorAll('.nx-char')];
      chars.forEach((ch, i) => {
        ch.style.opacity = '0';
        ch.style.transform = opts.direction === 'up' ? 'translateY(20px)' : opts.direction === 'down' ? 'translateY(-20px)' : 'scale(0)';
        ch.style.transition = `opacity ${opts.duration}ms ease, transform ${opts.duration}ms cubic-bezier(0.34,1.56,0.64,1)`;
        ch.style.transitionDelay = `${i * opts.stagger}ms`;
      });
      const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        chars.forEach(ch => { ch.style.opacity = '1'; ch.style.transform = 'none'; });
      }, { threshold: 0.1 });
      obs.observe(el);
    });
    return this;
  }

  revealWords(target, options) {
    const opts = Object.assign({ stagger: 80, duration: 700 }, options || {});
    const els = this.splitWords(target);
    els.forEach(el => {
      const words = [...el.querySelectorAll('.nx-word')];
      words.forEach((w, i) => {
        w.style.opacity = '0';
        w.style.transform = 'translateY(30px)';
        w.style.transition = `opacity ${opts.duration}ms ease, transform ${opts.duration}ms cubic-bezier(0.23,1,0.32,1)`;
        w.style.transitionDelay = `${i * opts.stagger}ms`;
      });
      const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        words.forEach(w => { w.style.opacity = '1'; w.style.transform = 'none'; });
      }, { threshold: 0.1 });
      obs.observe(el);
    });
    return this;
  }

  gradient(target, colors) {
    const c = colors || ['#00f5ff', '#ff006e', '#7c3aed'];
    NandanXUtils.parseSelector(target).forEach(el => {
      el.style.background = `linear-gradient(135deg, ${c.join(', ')})`;
      el.style.webkitBackgroundClip = 'text';
      el.style.webkitTextFillColor = 'transparent';
      el.style.backgroundClip = 'text';
      el.style.backgroundSize = '200% auto';
      el.style.animation = 'nx-gradient-shift 3s linear infinite';
    });
    return this;
  }

  neon(target, color) {
    NandanXUtils.parseSelector(target).forEach(el => {
      if (color) el.style.setProperty('--nx-neon-txt', color);
      el.classList.add('nx-neon-text');
    });
    return this;
  }

  glitch(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.dataset.text = el.textContent;
      el.classList.add('nx-glitch-text');
    });
    return this;
  }

  wave(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      const text = el.textContent;
      el.innerHTML = text.split('').map((ch, i) =>
        `<span class="nx-wave-char" style="animation-delay:${i * 0.08}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
      ).join('');
    });
    return this;
  }

  counter(target, options) {
    const opts = Object.assign({ from: 0, duration: 2000, decimals: 0, prefix: '', suffix: '', easing: NandanXUtils.easeOutQuart }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      const to = parseFloat(el.dataset.nxTarget || el.textContent) || opts.to || 0;
      const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const tick = now => {
          const p = NandanXUtils.clamp((now - start) / opts.duration, 0, 1);
          const val = opts.from + (to - opts.from) * opts.easing(p);
          el.textContent = opts.prefix + val.toFixed(opts.decimals) + opts.suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.3 });
      obs.observe(el);
    });
    return this;
  }

  flipCounter(target, options) {
    const opts = Object.assign({ duration: 2000, from: 0 }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      const to = parseInt(el.dataset.nxTarget || el.textContent) || 0;
      const digits = String(to).length;
      el.style.display = 'inline-flex';
      el.style.gap = '2px';
      const cols = Array.from({ length: digits }, () => {
        const col = document.createElement('span');
        col.style.cssText = 'display:inline-block;overflow:hidden;height:1em;position:relative;';
        const inner = document.createElement('span');
        inner.style.cssText = 'display:block;transition:transform 0.6s cubic-bezier(0.34,1.56,0.64,1);';
        inner.innerHTML = Array.from({ length: 10 }, (_, i) => `<span style="display:block;text-align:center">${i}</span>`).join('');
        col.appendChild(inner);
        el.appendChild(col);
        return inner;
      });
      el.textContent = '';
      cols.forEach(c => el.appendChild(c.parentElement));
      const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        const toStr = String(to).padStart(digits, '0');
        cols.forEach((inner, i) => {
          const d = parseInt(toStr[i]);
          setTimeout(() => {
            inner.style.transform = `translateY(-${d * 1}em)`;
          }, i * 100);
        });
      }, { threshold: 0.3 });
      obs.observe(el);
    });
    return this;
  }

  highlight(target, color) {
    const c = color || 'rgba(0,245,255,0.25)';
    NandanXUtils.parseSelector(target).forEach(el => {
      el.style.background = `linear-gradient(transparent 60%, ${c} 60%)`;
      el.style.backgroundSize = '0% 100%';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.transition = 'background-size 0.6s ease';
      const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        el.style.backgroundSize = '100% 100%';
      }, { threshold: 0.5 });
      obs.observe(el);
    });
    return this;
  }

  blur(target) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-blur-text');
      const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        el.classList.add('nx-visible');
      }, { threshold: 0.1 });
      obs.observe(el);
    });
    return this;
  }

  multiType(target, texts, options) {
    const opts = Object.assign({ speed: 60, deleteSpeed: 35, pause: 2000, loop: true }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-typewriter-cursor');
      let ti = 0, ci = 0, deleting = false;
      const tick = () => {
        const current = texts[ti % texts.length];
        if (!deleting) {
          el.textContent = current.slice(0, ci + 1);
          ci++;
          if (ci === current.length) {
            setTimeout(() => { deleting = true; tick(); }, opts.pause);
            return;
          }
          setTimeout(tick, opts.speed);
        } else {
          el.textContent = current.slice(0, ci - 1);
          ci--;
          if (ci === 0) {
            deleting = false;
            ti++;
            if (!opts.loop && ti >= texts.length) return;
            setTimeout(tick, 300);
            return;
          }
          setTimeout(tick, opts.deleteSpeed);
        }
      };
      tick();
    });
    return this;
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-text]').forEach(el => {
        if (el.dataset.nxTextDone) return;
        el.dataset.nxTextDone = '1';
        const effect = el.dataset.nxText;
        if (effect === 'typewriter') this.typewriter(el);
        else if (effect === 'scramble') this.scramble(el);
        else if (effect === 'gradient') this.gradient(el);
        else if (effect === 'neon') this.neon(el);
        else if (effect === 'glitch') this.glitch(el);
        else if (effect === 'wave') this.wave(el);
        else if (effect === 'reveal-chars') this.revealChars(el);
        else if (effect === 'reveal-words') this.revealWords(el);
        else if (effect === 'blur') this.blur(el);
        else if (effect === 'highlight') this.highlight(el);
        else if (effect === 'counter') this.counter(el);
        else if (effect === 'flip-counter') this.flipCounter(el);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var textEngine = new TextEngine();
if (typeof window !== 'undefined') window.NandanXText = textEngine;
