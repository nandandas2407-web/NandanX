class StorageEngine {
  constructor() {
    this.initialized = false;
    this._prefix = 'nx_';
    this._cache = new Map();
    this._dbName = 'NandanXDB';
    this._dbVersion = 1;
    this._db = null;
  }

  init(options) {
    if (this.initialized) return this;
    const opts = Object.assign({ prefix: 'vx_', dbName: 'NandanXDB' }, options || {});
    this._prefix = opts.prefix;
    this._dbName = opts.dbName;
    this.initialized = true;
    return this;
  }

  _key(k) { return this._prefix + k; }

  local = {
    set: (key, value, ttl) => {
      const item = { value, timestamp: Date.now(), ttl: ttl || null };
      try { localStorage.setItem(this._key(key), JSON.stringify(item)); } catch {}
      this._cache.set(key, item);
      return this;
    },
    get: (key, fallback) => {
      const cached = this._cache.get(key);
      if (cached) {
        if (!cached.ttl || Date.now() - cached.timestamp < cached.ttl) return cached.value;
        this.local.remove(key);
        return fallback !== undefined ? fallback : null;
      }
      try {
        const raw = localStorage.getItem(this._key(key));
        if (!raw) return fallback !== undefined ? fallback : null;
        const item = JSON.parse(raw);
        if (item.ttl && Date.now() - item.timestamp > item.ttl) {
          this.local.remove(key);
          return fallback !== undefined ? fallback : null;
        }
        this._cache.set(key, item);
        return item.value;
      } catch { return fallback !== undefined ? fallback : null; }
    },
    remove: (key) => {
      try { localStorage.removeItem(this._key(key)); } catch {}
      this._cache.delete(key);
      return this;
    },
    has: (key) => this.local.get(key) !== null,
    keys: () => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this._prefix)) keys.push(k.slice(this._prefix.length));
      }
      return keys;
    },
    clear: (pattern) => {
      const keys = this.local.keys();
      keys.forEach(k => {
        if (!pattern || new RegExp(pattern).test(k)) this.local.remove(k);
      });
      return this;
    },
    update: (key, updater) => {
      const current = this.local.get(key);
      this.local.set(key, typeof updater === 'function' ? updater(current) : Object.assign({}, current, updater));
      return this;
    },
  };

  session = {
    set: (key, value) => {
      try { sessionStorage.setItem(this._key(key), JSON.stringify(value)); } catch {}
      return this;
    },
    get: (key, fallback) => {
      try {
        const raw = sessionStorage.getItem(this._key(key));
        return raw !== null ? JSON.parse(raw) : (fallback !== undefined ? fallback : null);
      } catch { return fallback !== undefined ? fallback : null; }
    },
    remove: (key) => { try { sessionStorage.removeItem(this._key(key)); } catch {} return this; },
    clear: () => { try { sessionStorage.clear(); } catch {} return this; },
    has: (key) => this.session.get(key) !== null,
  };

  cookie = {
    set: (name, value, options) => {
      const opts = Object.assign({ days: 7, path: '/', secure: false, sameSite: 'Lax' }, options || {});
      const expires = new Date(Date.now() + opts.days * 864e5).toUTCString();
      let cookie = `${this._key(name)}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=${opts.path}; SameSite=${opts.sameSite}`;
      if (opts.secure) cookie += '; Secure';
      document.cookie = cookie;
      return this;
    },
    get: (name, fallback) => {
      const key = this._key(name);
      const match = document.cookie.split('; ').find(r => r.startsWith(key + '='));
      if (!match) return fallback !== undefined ? fallback : null;
      try { return JSON.parse(decodeURIComponent(match.split('=')[1])); } catch { return null; }
    },
    remove: (name) => {
      document.cookie = `${this._key(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      return this;
    },
    has: (name) => this.cookie.get(name) !== null,
  };

  memory = {
    _store: new Map(),
    set: (key, value) => { this.memory._store.set(key, value); return this; },
    get: (key, fallback) => this.memory._store.has(key) ? this.memory._store.get(key) : (fallback !== undefined ? fallback : null),
    remove: (key) => { this.memory._store.delete(key); return this; },
    has: (key) => this.memory._store.has(key),
    clear: () => { this.memory._store.clear(); return this; },
  };

  openDB(stores) {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error('IndexedDB not supported')); return; }
      const req = indexedDB.open(this._dbName, this._dbVersion);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        (stores || ['default']).forEach(name => {
          if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
        });
      };
      req.onsuccess = e => { this._db = e.target.result; resolve(this._db); };
      req.onerror = () => reject(req.error);
    });
  }

  idb = {
    set: (store, id, data) => {
      return new Promise((resolve, reject) => {
        if (!this._db) { reject(new Error('DB not open. Call openDB() first')); return; }
        const tx = this._db.transaction(store, 'readwrite');
        tx.objectStore(store).put(Object.assign({ id }, data));
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    },
    get: (store, id) => {
      return new Promise((resolve, reject) => {
        if (!this._db) { reject(new Error('DB not open')); return; }
        const req = this._db.transaction(store).objectStore(store).get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    },
    getAll: (store) => {
      return new Promise((resolve, reject) => {
        if (!this._db) { reject(new Error('DB not open')); return; }
        const req = this._db.transaction(store).objectStore(store).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    },
    delete: (store, id) => {
      return new Promise((resolve, reject) => {
        if (!this._db) { reject(new Error('DB not open')); return; }
        const tx = this._db.transaction(store, 'readwrite');
        tx.objectStore(store).delete(id);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    },
    clear: (store) => {
      return new Promise((resolve, reject) => {
        if (!this._db) { reject(new Error('DB not open')); return; }
        const tx = this._db.transaction(store, 'readwrite');
        tx.objectStore(store).clear();
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    },
  };

  getSize() {
    let size = 0;
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith(this._prefix)) size += localStorage.getItem(key)?.length || 0;
      }
    } catch {}
    return { bytes: size * 2, kb: (size * 2 / 1024).toFixed(2), mb: (size * 2 / 1024 / 1024).toFixed(4) };
  }

  export(keys) {
    const data = {};
    const exportKeys = keys || this.local.keys();
    exportKeys.forEach(k => { data[k] = this.local.get(k); });
    return JSON.stringify(data);
  }

  import(json) {
    try {
      const data = JSON.parse(json);
      Object.entries(data).forEach(([k, v]) => this.local.set(k, v));
      return true;
    } catch { return false; }
  }
}

var storageEngine = new StorageEngine();
if (typeof window !== 'undefined') window.NandanXStorage = storageEngine;
