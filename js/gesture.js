class GestureEngine {
  constructor() {
    this.initialized = false;
    this._recognizers = new Map();
  }

  init() {
    if (this.initialized) return this;
    this.initialized = true;
    return this;
  }

  on(target, gesture, handler, options) {
    VeloxUtils.parseSelector(target).forEach(el => this._attach(el, gesture, handler, options));
    return this;
  }

  _attach(el, gesture, handler, options) {
    const opts = Object.assign({ threshold: 50, timeout: 500 }, options || {});
    const id = gesture + '-' + VeloxUtils.uid();
    let start = null, startTime = 0, touches = [];

    const onStart = e => {
      const pt = e.touches ? e.touches[0] : e;
      start = { x: pt.clientX, y: pt.clientY };
      startTime = Date.now();
      touches = e.touches ? [...e.touches] : [];
    };

    const onEnd = e => {
      if (!start) return;
      const pt = e.changedTouches ? e.changedTouches[0] : e;
      const dx = pt.clientX - start.x;
      const dy = pt.clientY - start.y;
      const elapsed = Date.now() - startTime;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const ctx = { dx, dy, dist, angle, elapsed, target: el, originalEvent: e };

      if (gesture === 'swipe-left'  && dx < -opts.threshold && Math.abs(dy) < 80) handler(ctx);
      if (gesture === 'swipe-right' && dx >  opts.threshold && Math.abs(dy) < 80) handler(ctx);
      if (gesture === 'swipe-up'    && dy < -opts.threshold && Math.abs(dx) < 80) handler(ctx);
      if (gesture === 'swipe-down'  && dy >  opts.threshold && Math.abs(dx) < 80) handler(ctx);
      if (gesture === 'swipe') handler(ctx);
      if (gesture === 'tap' && dist < 10 && elapsed < 300) handler(ctx);
      start = null;
    };

    if (gesture.startsWith('swipe') || gesture === 'tap') {
      el.addEventListener('touchstart', onStart, { passive: true });
      el.addEventListener('touchend', onEnd, { passive: true });
      el.addEventListener('mousedown', onStart);
      el.addEventListener('mouseup', onEnd);
    }

    if (gesture === 'doubletap') {
      let lastTap = 0;
      el.addEventListener('touchend', e => {
        const now = Date.now();
        if (now - lastTap < 300) handler({ target: el, originalEvent: e });
        lastTap = now;
      }, { passive: true });
    }

    if (gesture === 'longpress') {
      let timer = null;
      el.addEventListener('touchstart', e => {
        const pt = e.touches[0];
        start = { x: pt.clientX, y: pt.clientY };
        timer = setTimeout(() => {
          handler({ target: el, x: start.x, y: start.y, originalEvent: e });
        }, opts.timeout);
      }, { passive: true });
      el.addEventListener('touchend', () => clearTimeout(timer), { passive: true });
      el.addEventListener('touchmove', e => {
        if (!start) return;
        const pt = e.touches[0];
        if (Math.hypot(pt.clientX - start.x, pt.clientY - start.y) > 10) clearTimeout(timer);
      }, { passive: true });
    }

    if (gesture === 'pinch') {
      let initDist = null;
      el.addEventListener('touchstart', e => {
        if (e.touches.length === 2) {
          initDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
        }
      }, { passive: true });
      el.addEventListener('touchmove', e => {
        if (e.touches.length !== 2 || !initDist) return;
        const newDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        handler({ scale: newDist / initDist, delta: newDist - initDist, target: el, originalEvent: e });
      }, { passive: true });
      el.addEventListener('touchend', () => { initDist = null; }, { passive: true });
    }

    if (gesture === 'rotate') {
      let initAngle = null;
      const getAngle = (t1, t2) => Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180 / Math.PI;
      el.addEventListener('touchstart', e => {
        if (e.touches.length === 2) initAngle = getAngle(e.touches[0], e.touches[1]);
      }, { passive: true });
      el.addEventListener('touchmove', e => {
        if (e.touches.length !== 2 || initAngle === null) return;
        const angle = getAngle(e.touches[0], e.touches[1]);
        handler({ rotation: angle - initAngle, angle, target: el, originalEvent: e });
      }, { passive: true });
      el.addEventListener('touchend', () => { initAngle = null; }, { passive: true });
    }

    if (gesture === 'hover') {
      el.addEventListener('mouseenter', e => handler({ type: 'enter', target: el, originalEvent: e }));
      el.addEventListener('mouseleave', e => handler({ type: 'leave', target: el, originalEvent: e }));
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        handler({ type: 'move', x: e.clientX - r.left, y: e.clientY - r.top, target: el, originalEvent: e });
      });
    }

    if (gesture === 'drag') {
      let dragging = false, lastX, lastY;
      el.addEventListener('mousedown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
      document.addEventListener('mousemove', e => {
        if (!dragging) return;
        handler({ dx: e.clientX - lastX, dy: e.clientY - lastY, x: e.clientX, y: e.clientY, target: el, originalEvent: e });
        lastX = e.clientX; lastY = e.clientY;
      });
      document.addEventListener('mouseup', () => { dragging = false; });
    }

    this._recognizers.set(id, { el, gesture, handler });
    return this;
  }

  swipeLeft(target, handler, options) { return this.on(target, 'swipe-left', handler, options); }
  swipeRight(target, handler, options) { return this.on(target, 'swipe-right', handler, options); }
  swipeUp(target, handler, options) { return this.on(target, 'swipe-up', handler, options); }
  swipeDown(target, handler, options) { return this.on(target, 'swipe-down', handler, options); }
  tap(target, handler, options) { return this.on(target, 'tap', handler, options); }
  doubleTap(target, handler, options) { return this.on(target, 'doubletap', handler, options); }
  longPress(target, handler, options) { return this.on(target, 'longpress', handler, options); }
  pinch(target, handler, options) { return this.on(target, 'pinch', handler, options); }
  rotate(target, handler, options) { return this.on(target, 'rotate', handler, options); }
  hover(target, handler, options) { return this.on(target, 'hover', handler, options); }
  drag(target, handler, options) { return this.on(target, 'drag', handler, options); }

  swipeCarousel(el, nextFn, prevFn) {
    this.swipeLeft(el, nextFn);
    this.swipeRight(el, prevFn);
    return this;
  }

  keyboard(keys, handler, options) {
    const opts = Object.assign({ target: document, ctrl: false, shift: false, alt: false }, options || {});
    const keyList = Array.isArray(keys) ? keys : [keys];
    opts.target.addEventListener('keydown', e => {
      if (opts.ctrl && !e.ctrlKey && !e.metaKey) return;
      if (opts.shift && !e.shiftKey) return;
      if (opts.alt && !e.altKey) return;
      if (keyList.includes(e.key) || keyList.includes(e.code)) {
        if (opts.preventDefault) e.preventDefault();
        handler({ key: e.key, code: e.code, originalEvent: e });
      }
    });
    return this;
  }

  shortcut(combo, handler) {
    const parts = combo.toLowerCase().split('+');
    const key = parts[parts.length - 1];
    const ctrl = parts.includes('ctrl') || parts.includes('cmd');
    const shift = parts.includes('shift');
    const alt = parts.includes('alt');
    return this.keyboard(key, handler, { ctrl, shift, alt, preventDefault: true });
  }

  tiltWatch(el, handler) {
    if (!window.DeviceOrientationEvent) return this;
    window.addEventListener('deviceorientation', e => {
      handler({ beta: e.beta || 0, gamma: e.gamma || 0, alpha: e.alpha || 0, target: el });
    });
    return this;
  }
}

var gestureEngine = new GestureEngine();
if (typeof window !== 'undefined') window.VeloxGesture = gestureEngine;
