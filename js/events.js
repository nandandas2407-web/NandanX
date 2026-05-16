class EventBusEngine {
  constructor() {
    this.initialized = false;
    this._events = new Map();
    this._once = new Map();
    this._history = [];
    this._maxHistory = 100;
    this._wildcards = new Map();
    this._reactive = new Map();
    this._watchers = new Map();
  }

  init() {
    if (this.initialized) return this;
    this.initialized = true;
    return this;
  }

  on(event, handler, options) {
    const opts = Object.assign({ priority: 0, context: null }, options || {});
    if (!this._events.has(event)) this._events.set(event, []);
    const listeners = this._events.get(event);
    const entry = { handler, opts };
    listeners.push(entry);
    listeners.sort((a, b) => b.opts.priority - a.opts.priority);
    return () => this.off(event, handler);
  }

  once(event, handler, options) {
    const wrapper = (...args) => { this.off(event, wrapper); handler(...args); };
    this._once.set(handler, wrapper);
    return this.on(event, wrapper, options);
  }

  off(event, handler) {
    if (!event) { this._events.clear(); return this; }
    if (!handler) { this._events.delete(event); return this; }
    const listeners = this._events.get(event);
    if (!listeners) return this;
    const wrapped = this._once.get(handler) || handler;
    const idx = listeners.findIndex(e => e.handler === wrapped);
    if (idx !== -1) listeners.splice(idx, 1);
    this._once.delete(handler);
    return this;
  }

  emit(event, data, options) {
    const opts = Object.assign({ async: false, bubble: true }, options || {});
    const payload = { event, data, timestamp: Date.now() };
    this._history.unshift(payload);
    if (this._history.length > this._maxHistory) this._history.pop();

    const listeners = this._events.get(event) || [];
    const wildcardListeners = [];
    this._wildcards.forEach((handler, pattern) => {
      if (new RegExp(pattern).test(event)) wildcardListeners.push({ handler, opts: {} });
    });

    const all = [...listeners, ...wildcardListeners];
    if (opts.async) {
      setTimeout(() => all.forEach(({ handler }) => handler(data, payload)), 0);
    } else {
      all.forEach(({ handler }) => { try { handler(data, payload); } catch (err) { console.error('[NandanX EventBus]', event, err); } });
    }

    if (opts.bubble) document.dispatchEvent(new CustomEvent('vx:bus:' + event, { detail: payload, bubbles: true }));
    return this;
  }

  onWildcard(pattern, handler) {
    const id = NandanXUtils.uid();
    this._wildcards.set(id, handler);
    return () => this._wildcards.delete(id);
  }

  getHistory(event) {
    if (event) return this._history.filter(h => h.event === event);
    return [...this._history];
  }

  clearHistory() { this._history = []; return this; }

  has(event) { return this._events.has(event) && this._events.get(event).length > 0; }

  listenerCount(event) { return (this._events.get(event) || []).length; }

  reactive(target, callback) {
    const id = NandanXUtils.uid();
    const handler = new Proxy(target, {
      set: (obj, prop, value) => {
        const oldVal = obj[prop];
        obj[prop] = value;
        if (oldVal !== value) {
          const watchers = this._watchers.get(id + ':' + prop) || [];
          watchers.forEach(fn => fn(value, oldVal, prop));
          if (callback) callback(prop, value, oldVal, handler);
          this.emit('vx:reactive:change', { id, prop, value, oldValue: oldVal });
        }
        return true;
      },
      deleteProperty: (obj, prop) => {
        const oldVal = obj[prop];
        delete obj[prop];
        if (callback) callback(prop, undefined, oldVal, handler);
        return true;
      }
    });
    this._reactive.set(id, { target, handler });
    handler.__rxId = id;
    return handler;
  }

  watch(reactiveObj, prop, handler) {
    const id = reactiveObj.__rxId;
    if (!id) return this;
    const key = id + ':' + prop;
    if (!this._watchers.has(key)) this._watchers.set(key, []);
    this._watchers.get(key).push(handler);
    return () => {
      const wl = this._watchers.get(key);
      if (wl) wl.splice(wl.indexOf(handler), 1);
    };
  }

  computed(deps, fn) {
    let value = fn(...deps.map(d => typeof d === 'function' ? d() : d));
    const update = () => { value = fn(...deps.map(d => typeof d === 'function' ? d() : d)); };
    return { get: () => value, invalidate: update };
  }

  createChannel(name) {
    return {
      on: (event, handler) => this.on(name + ':' + event, handler),
      once: (event, handler) => this.once(name + ':' + event, handler),
      off: (event, handler) => this.off(name + ':' + event, handler),
      emit: (event, data) => this.emit(name + ':' + event, data),
    };
  }

  pipe(sourceEvent, targetEvent, transform) {
    return this.on(sourceEvent, data => {
      const output = transform ? transform(data) : data;
      this.emit(targetEvent, output);
    });
  }

  debounce(event, handler, delay) {
    let timer;
    return this.on(event, data => {
      clearTimeout(timer);
      timer = setTimeout(() => handler(data), delay);
    });
  }

  throttle(event, handler, limit) {
    let last = 0;
    return this.on(event, data => {
      const now = Date.now();
      if (now - last >= limit) { last = now; handler(data); }
    });
  }

  bridge(domElement, domEvent, busEvent) {
    domElement.addEventListener(domEvent, e => this.emit(busEvent || domEvent, e));
    return this;
  }

  destroy() {
    this._events.clear();
    this._once.clear();
    this._wildcards.clear();
    this._reactive.clear();
    this._watchers.clear();
    this._history = [];
    return this;
  }
}

var eventBusEngine = new EventBusEngine();
if (typeof window !== 'undefined') window.NandanXEvents = eventBusEngine;
