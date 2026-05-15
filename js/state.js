class StateEngine {
  constructor() {
    this.stores = new Map();
    this.initialized = false;
  }

  init() {
    if (this.initialized) return this;
    this.initialized = true;
    return this;
  }

  createStore(name, initialState, options) {
    const opts = Object.assign({ persist: false, middleware: [] }, options || {});
    const listeners = new Set();
    const history = [];
    let state = opts.persist ? this._loadPersisted(name, initialState) : Object.assign({}, initialState);

    const store = {
      name,
      getState: () => Object.assign({}, state),
      setState: (updates) => {
        const patch = typeof updates === 'function' ? updates(state) : updates;
        const prev = Object.assign({}, state);
        let next = Object.assign({}, state, patch);
        for (const mw of opts.middleware) {
          const result = mw({ state: prev, next, patch, store });
          if (result && typeof result === 'object') next = result;
        }
        history.push({ prev, next, timestamp: Date.now() });
        state = next;
        if (opts.persist) this._persist(name, state);
        listeners.forEach(fn => fn(state, prev, patch));
        VeloxUtils.emit(document, `vx:state:${name}`, { state, prev, patch });
        return store;
      },
      subscribe: (fn) => {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
      reset: () => {
        store.setState(initialState);
        return store;
      },
      getHistory: () => [...history],
      undo: () => {
        if (history.length < 2) return store;
        history.pop();
        const prev = history[history.length - 1];
        state = Object.assign({}, prev ? prev.next : initialState);
        listeners.forEach(fn => fn(state, null, null));
        return store;
      },
      bind: (el, key, options) => {
        this._bindElement(el, store, key, options);
        return store;
      },
      computed: (fn) => {
        let cached = fn(state);
        store.subscribe(s => { cached = fn(s); });
        return { get: () => cached };
      },
    };

    this.stores.set(name, store);
    return store;
  }

  getStore(name) { return this.stores.get(name) || null; }

  _persist(name, state) {
    try { localStorage.setItem(`vx-state-${name}`, JSON.stringify(state)); } catch {}
  }

  _loadPersisted(name, fallback) {
    try {
      const saved = localStorage.getItem(`vx-state-${name}`);
      return saved ? JSON.parse(saved) : Object.assign({}, fallback);
    } catch { return Object.assign({}, fallback); }
  }

  _bindElement(target, store, key, options) {
    const opts = Object.assign({ event: 'input', transform: null, format: null }, options || {});
    VeloxUtils.parseSelector(target).forEach(el => {
      const update = (state) => {
        const val = key.split('.').reduce((o, k) => o?.[k], state);
        const display = opts.format ? opts.format(val) : val;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
          if (el.type === 'checkbox') el.checked = !!display;
          else el.value = display !== undefined && display !== null ? display : '';
        } else {
          el.textContent = display !== undefined && display !== null ? display : '';
        }
      };
      update(store.getState());
      store.subscribe(update);
      el.addEventListener(opts.event, e => {
        let val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        if (opts.transform) val = opts.transform(val);
        const patch = {};
        const keys = key.split('.');
        let obj = patch;
        keys.forEach((k, i) => {
          if (i === keys.length - 1) obj[k] = val;
          else { obj[k] = {}; obj = obj[k]; }
        });
        store.setState(patch);
      });
    });
    return this;
  }

  link(store1, store2, mapping) {
    Object.entries(mapping).forEach(([key1, key2]) => {
      store1.subscribe(state => {
        const val = key1.split('.').reduce((o, k) => o?.[k], state);
        const patch = {};
        const keys = key2.split('.');
        let obj = patch;
        keys.forEach((k, i) => {
          if (i === keys.length - 1) obj[k] = val;
          else { obj[k] = {}; obj = obj[k]; }
        });
        store2.setState(patch);
      });
    });
    return this;
  }

  middleware = {
    logger: (opts) => ({ state, next, patch }) => {
      if (opts?.enabled !== false) console.log('[VeloxUI Store]', { prev: state, patch, next });
      return next;
    },
    validate: (schema) => ({ next }) => {
      for (const [key, rule] of Object.entries(schema)) {
        if (rule.required && (next[key] === undefined || next[key] === null)) {
          console.warn(`[VeloxUI Store] Validation failed: ${key} is required`);
        }
        if (rule.type && next[key] !== undefined && typeof next[key] !== rule.type) {
          console.warn(`[VeloxUI Store] Type mismatch: ${key} should be ${rule.type}`);
        }
      }
      return next;
    },
    immutable: () => ({ next }) => Object.freeze(next),
  };
}

var stateEngine = new StateEngine();
if (typeof window !== 'undefined') window.VeloxState = stateEngine;
