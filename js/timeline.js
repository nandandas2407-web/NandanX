class TimelineEngine {
  constructor() {
    this.initialized = false;
    this._sequences = new Map();
    this._tweens = new Map();
  }

  init() {
    if (this.initialized) return this;
    this.initialized = true;
    return this;
  }

  tween(target, from, to, options) {
    const opts = Object.assign({ duration: 600, easing: NandanXUtils.easeOutQuart, delay: 0, onUpdate: null, onComplete: null }, options || {});
    const els = NandanXUtils.parseSelector(target);
    return new Promise(resolve => {
      setTimeout(() => {
        const start = performance.now();
        const tick = (now) => {
          const p = NandanXUtils.clamp((now - start) / opts.duration, 0, 1);
          const ep = opts.easing(p);
          els.forEach(el => {
            Object.keys(to).forEach(prop => {
              const fromVal = parseFloat(from[prop] !== undefined ? from[prop] : getComputedStyle(el)[prop]) || 0;
              const toVal = parseFloat(to[prop]) || 0;
              const unit = String(to[prop]).replace(/[\d.-]/g, '') || '';
              el.style[prop] = (fromVal + (toVal - fromVal) * ep) + unit;
            });
            if (opts.onUpdate) opts.onUpdate(ep, p, el);
          });
          if (p < 1) requestAnimationFrame(tick);
          else { if (opts.onComplete) opts.onComplete(); resolve(); }
        };
        requestAnimationFrame(tick);
      }, opts.delay);
    });
  }

  animate(target, keyframes, options) {
    const opts = Object.assign({ duration: 600, easing: 'cubic-bezier(0.23,1,0.32,1)', fill: 'forwards', delay: 0, iterations: 1 }, options || {});
    const els = NandanXUtils.parseSelector(target);
    // Use Web Animations API if available, otherwise fallback to CSS transition
    if (els.length && typeof els[0].animate === 'function') {
      const animations = els.map(el => (typeof el.animate === "function" ? el.animate(keyframes, {
        duration: opts.duration,
        easing: opts.easing,
        fill: opts.fill,
        delay: opts.delay,
        iterations: opts.iterations,
      }) : null));
      return Promise.all(animations.map(a => a.finished));
    }
    // CSS fallback: apply last keyframe styles directly via transition
    els.forEach(el => {
      const last = keyframes[keyframes.length - 1] || {};
      el.style.transition = `all ${opts.duration}ms ${opts.easing} ${opts.delay}ms`;
      Object.assign(el.style, last);
    });
    return Promise.resolve(els);
  }

  timeline(steps) {
    const id = NandanXUtils.uid();
    let time = 0;
    const schedule = [];
    const tl = {
      to: (target, props, options) => {
        const opts = Object.assign({ duration: 600, offset: null }, options || {});
        const startAt = opts.offset !== null ? opts.offset : time;
        schedule.push({ type: 'tween', target, props, opts, startAt });
        time = startAt + opts.duration;
        return tl;
      },
      add: (fn, offset) => {
        schedule.push({ type: 'fn', fn, startAt: offset !== undefined ? offset : time });
        return tl;
      },
      pause: (duration) => {
        time += duration;
        return tl;
      },
      play: () => {
        const start = performance.now();
        const pending = [...schedule];
        const done = new Set();
        const tweenStates = new Map();
        pending.forEach((step, i) => {
          if (step.type === 'tween') tweenStates.set(i, { started: false, startTime: null });
        });
        const tick = (now) => {
          const elapsed = now - start;
          pending.forEach((step, i) => {
            if (done.has(i)) return;
            if (elapsed < step.startAt) return;
            if (step.type === 'fn') {
              step.fn(elapsed);
              done.add(i);
              return;
            }
            const state = tweenStates.get(i);
            if (!state.started) { state.started = true; state.startTime = now; }
            const p = NandanXUtils.clamp((now - state.startTime) / step.opts.duration, 0, 1);
            const ep = step.opts.easing ? step.opts.easing(p) : NandanXUtils.easeOutQuart(p);
            NandanXUtils.parseSelector(step.target).forEach(el => {
              Object.keys(step.props).forEach(prop => {
                const val = step.props[prop];
                if (typeof val === 'string') {
                  const unit = val.replace(/[\d.-]/g, '');
                  const num = parseFloat(val);
                  const current = parseFloat(getComputedStyle(el)[prop]) || 0;
                  el.style[prop] = (current + (num - current) * ep) + unit;
                }
              });
            });
            if (p >= 1) done.add(i);
          });
          if (done.size < pending.length) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        this._sequences.set(id, tl);
        return tl;
      },
    };
    return tl;
  }

  entrance(target, type, options) {
    const opts = Object.assign({ duration: 700, delay: 0, stagger: 0 }, options || {});
    const els = NandanXUtils.parseSelector(target);
    const effects = {
      fadeUp:     [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'translateY(0)' }],
      fadeDown:   [{ opacity: 0, transform: 'translateY(-30px)' }, { opacity: 1, transform: 'translateY(0)' }],
      fadeLeft:   [{ opacity: 0, transform: 'translateX(40px)' }, { opacity: 1, transform: 'translateX(0)' }],
      fadeRight:  [{ opacity: 0, transform: 'translateX(-40px)' }, { opacity: 1, transform: 'translateX(0)' }],
      zoomIn:     [{ opacity: 0, transform: 'scale(0.7)' }, { opacity: 1, transform: 'scale(1)' }],
      zoomOut:    [{ opacity: 0, transform: 'scale(1.3)' }, { opacity: 1, transform: 'scale(1)' }],
      flipX:      [{ opacity: 0, transform: 'rotateX(60deg)' }, { opacity: 1, transform: 'rotateX(0)' }],
      flipY:      [{ opacity: 0, transform: 'rotateY(60deg)' }, { opacity: 1, transform: 'rotateY(0)' }],
      rotateIn:   [{ opacity: 0, transform: 'rotate(-180deg) scale(0.5)' }, { opacity: 1, transform: 'rotate(0) scale(1)' }],
      bounceIn:   [{ opacity: 0, transform: 'scale(0.3)' }, { opacity: 1, transform: 'scale(1)' }],
      slideUp:    [{ opacity: 0, transform: 'translateY(100%)' }, { opacity: 1, transform: 'translateY(0)' }],
      popIn:      [{ opacity: 0, transform: 'scale(0) rotate(45deg)' }, { opacity: 1, transform: 'scale(1) rotate(0deg)' }],
    };
    const kf = effects[type] || effects.fadeUp;
    const easing = type.includes('bounce') || type.includes('pop') ? 'cubic-bezier(0.34,1.56,0.64,1)' : 'cubic-bezier(0.23,1,0.32,1)';
    return Promise.all(els.map((el, i) => el.animate(kf, {
      duration: opts.duration,
      delay: opts.delay + i * opts.stagger,
      fill: 'forwards',
      easing,
    }).finished));
  }

  exit(target, type, options) {
    const opts = Object.assign({ duration: 500, delay: 0 }, options || {});
    const els = NandanXUtils.parseSelector(target);
    const effects = {
      fadeUp:   [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-20px)' }],
      fadeDown: [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(20px)' }],
      zoomOut:  [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.8)' }],
      collapse: [{ opacity: 1, maxHeight: '500px' }, { opacity: 0, maxHeight: '0px' }],
    };
    const kf = effects[type] || effects.fadeUp;
    if (els.length && typeof els[0].animate === 'function') {
      return Promise.all(els.map(el => el.animate(kf, { duration: opts.duration, delay: opts.delay, fill: 'forwards' }).finished));
    }
    els.forEach(el => { const last = kf[kf.length-1]||{}; el.style.transition='all '+opts.duration+'ms'; Object.assign(el.style, last); });
    return Promise.resolve(els);
  }

  loop(target, keyframes, options) {
    const opts = Object.assign({ duration: 2000, easing: 'ease-in-out', iterations: Infinity }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      if (typeof el.animate === 'function') {
        (typeof el.animate === "function" ? el.animate(keyframes, { duration: opts.duration, easing: opts.easing, iterations: opts.iterations }) : null);
      } else {
        // CSS keyframe animation fallback
        const last = keyframes[keyframes.length - 1] || {};
        el.style.transition = 'all ' + opts.duration + 'ms ' + opts.easing;
        Object.assign(el.style, last);
      }
    });
    return this;
  }

  pulse(target, options) {
    return this.loop(target, [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.08)', opacity: 0.8 },
      { transform: 'scale(1)', opacity: 1 },
    ], options);
  }

  float(target, options) {
    return this.loop(target, [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-12px)' },
      { transform: 'translateY(0)' },
    ], Object.assign({ duration: 3000 }, options || {}));
  }

  spin(target, options) {
    const opts = Object.assign({ duration: 2000, direction: 'normal' }, options || {});
    return this.loop(target, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
      Object.assign({ easing: 'linear' }, opts));
  }

  shake(target, options) {
    const opts = Object.assign({ duration: 500, intensity: 8 }, options || {});
    const n = opts.intensity;
    return this.animate(target, [
      { transform: `translateX(0)` },
      { transform: `translateX(-${n}px)` },
      { transform: `translateX(${n}px)` },
      { transform: `translateX(-${n * 0.5}px)` },
      { transform: `translateX(${n * 0.5}px)` },
      { transform: `translateX(0)` },
    ], Object.assign({ easing: 'ease-in-out' }, opts));
  }

  staggerEnter(target, type, options) {
    const opts = Object.assign({ stagger: 80, duration: 600 }, options || {});
    const parent = typeof target === 'string' ? document.querySelector(target) : target;
    if (!parent) return Promise.resolve();
    const children = [...parent.children];
    return this.entrance(children, type, Object.assign({ stagger: opts.stagger, duration: opts.duration }, options));
  }

  scrollEntrance(target, type, options) {
    NandanXUtils.parseSelector(target).forEach(el => {
      const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        this.entrance(el, type || 'fadeUp', options);
      }, { threshold: 0.1 });
      obs.observe(el);
    });
    return this;
  }
}

var timelineEngine = new TimelineEngine();
if (typeof window !== 'undefined') window.NandanXTimeline = timelineEngine;
