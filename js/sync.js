/**
 * NandanX — syncEngine
 * Offline-first data sync, optimistic updates, conflict resolution, multiplayer state
 */
class SyncEngine {
  constructor() {
    this.initialized = false;
    this.stores = new Map();
    this.ws = null;
    this.pendingOps = [];
    this.online = navigator.onLine;
    this.peers = new Map();
    this.clientId = this._generateId();
  }

  init(options = {}) {
    if (this.initialized) return this;
    this.options = options;
    this._setupOnlineListener();
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-sync-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-sync-styles';
    s.textContent = `
      .nx-sync-badge { position: fixed; bottom: 20px; left: 20px; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; font-family: monospace; z-index: 9000; transition: all 0.3s ease; }
      .nx-sync-online { background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }
      .nx-sync-offline { background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
      .nx-sync-syncing { background: rgba(234,179,8,0.15); color: #eab308; border: 1px solid rgba(234,179,8,0.3); }
      .nx-presence-avatars { display: flex; gap: -8px; }
      .nx-presence-avatar { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--nx-bg, #0a0a12); margin-left: -8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; animation: nx-avatar-in 0.2s ease; }
      @keyframes nx-avatar-in { from { transform: scale(0); } to { transform: scale(1); } }
      .nx-cursor-peer { position: fixed; pointer-events: none; z-index: 99990; transition: transform 0.1s linear; }
      .nx-cursor-peer-label { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px; margin-top: 2px; white-space: nowrap; }
    `;
    document.head.appendChild(s);
  }

  _setupOnlineListener() {
    window.addEventListener('online', () => {
      this.online = true;
      this._flushPending();
      this._updateBadge();
    });
    window.addEventListener('offline', () => {
      this.online = false;
      this._updateBadge();
    });
  }

  _generateId() {
    return 'nx-' + Math.random().toString(36).slice(2, 10);
  }

  // Create an offline-first reactive store
  createStore(name, initialState = {}, options = {}) {
    const key = `nx-sync-${name}`;
    let state = initialState;

    // Load from IndexedDB / localStorage
    try {
      const saved = localStorage.getItem(key);
      if (saved) state = { ...initialState, ...JSON.parse(saved) };
    } catch (e) {}

    const subscribers = new Set();
    const history = [{ ...state }];
    let historyIdx = 0;

    const store = {
      name,
      get: () => ({ ...state }),
      set: (partial) => {
        const prev = { ...state };
        state = { ...state, ...partial };
        history.splice(historyIdx + 1);
        history.push({ ...state });
        historyIdx = history.length - 1;
        this._persist(key, state);
        if (this.online && this.ws) this._broadcast({ type: 'sync', store: name, data: state });
        else this.pendingOps.push({ key, state });
        subscribers.forEach(fn => fn(state, prev));
        return store;
      },
      subscribe: (fn) => { subscribers.add(fn); return () => subscribers.delete(fn); },
      undo: () => { if (historyIdx > 0) { historyIdx--; state = { ...history[historyIdx] }; subscribers.forEach(fn => fn(state)); } },
      redo: () => { if (historyIdx < history.length - 1) { historyIdx++; state = { ...history[historyIdx] }; subscribers.forEach(fn => fn(state)); } },
      reset: () => { state = { ...initialState }; this._persist(key, state); subscribers.forEach(fn => fn(state)); },
      bind: (selector, mapFn) => {
        const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!el) return store;
        const update = (s) => {
          const val = mapFn ? mapFn(s) : JSON.stringify(s);
          el.textContent = val;
        };
        update(state);
        subscribers.add(update);
        return store;
      },
    };

    this.stores.set(name, store);
    return store;
  }

  _persist(key, state) {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
  }

  _flushPending() {
    if (!this.ws || !this.pendingOps.length) return;
    this.pendingOps.forEach(op => this._broadcast({ type: 'sync', key: op.key, data: op.state }));
    this.pendingOps = [];
    this._updateBadge('syncing');
    setTimeout(() => this._updateBadge('online'), 1000);
  }

  _broadcast(msg) {
    if (this.ws?.readyState === 1) {
      this.ws.send(JSON.stringify({ ...msg, clientId: this.clientId }));
    }
  }

  // Connect to sync server
  connect(url, options = {}) {
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      this.online = true;
      this._flushPending();
      this._updateBadge('online');
      this._broadcast({ type: 'join', clientId: this.clientId, name: options.name || 'Anonymous' });
      if (options.onConnect) options.onConnect();
    };
    this.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.clientId === this.clientId) return;
      if (msg.type === 'sync' && this.stores.has(msg.store)) {
        const store = this.stores.get(msg.store);
        const current = store.get();
        const merged = options.merge ? options.merge(current, msg.data) : { ...current, ...msg.data };
        store.set(merged);
      }
      if (msg.type === 'join') this._addPeer(msg.clientId, msg.name, options);
      if (msg.type === 'leave') this._removePeer(msg.clientId);
      if (msg.type === 'cursor') this._updatePeerCursor(msg.clientId, msg.x, msg.y);
      if (options.onMessage) options.onMessage(msg);
    };
    this.ws.onclose = () => {
      this.online = false;
      this._updateBadge('offline');
      if (options.onDisconnect) options.onDisconnect();
    };
    return this;
  }

  // Multiplayer cursor sharing
  shareCursors(options = {}) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth).toFixed(3);
      const y = (e.clientY / window.innerHeight).toFixed(3);
      this._broadcast({ type: 'cursor', x, y });
    });
    return this;
  }

  _addPeer(id, name, options) {
    const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    this.peers.set(id, { id, name, color });
    // Show cursor
    const cursor = document.createElement('div');
    cursor.className = 'nx-cursor-peer';
    cursor.id = `nx-peer-${id}`;
    cursor.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M0 0L16 6L8 8L6 16L0 0Z" fill="${color}"/></svg><div class="nx-cursor-peer-label" style="background:${color};color:#fff">${name}</div>`;
    document.body.appendChild(cursor);
  }

  _removePeer(id) {
    document.getElementById(`nx-peer-${id}`)?.remove();
    this.peers.delete(id);
  }

  _updatePeerCursor(id, rx, ry) {
    const cursor = document.getElementById(`nx-peer-${id}`);
    if (cursor) {
      cursor.style.left = (rx * window.innerWidth) + 'px';
      cursor.style.top = (ry * window.innerHeight) + 'px';
    }
  }

  // Presence badge (show who's online)
  showPresence(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    el.classList.add('nx-presence-avatars');
    const update = () => {
      el.innerHTML = '';
      this.peers.forEach(peer => {
        const av = document.createElement('div');
        av.className = 'nx-presence-avatar';
        av.style.background = peer.color;
        av.textContent = (peer.name || '?')[0].toUpperCase();
        av.title = peer.name;
        el.appendChild(av);
      });
    };
    this.ws.addEventListener('message', update);
    return this;
  }

  showBadge(options = {}) {
    if (!this.badge) {
      this.badge = document.createElement('div');
      this.badge.className = 'nx-sync-badge';
      document.body.appendChild(this.badge);
    }
    this._updateBadge(this.online ? 'online' : 'offline');
    return this;
  }

  _updateBadge(state) {
    if (!this.badge) return;
    const states = {
      online: ['nx-sync-online', '● Synced'],
      offline: ['nx-sync-offline', '◌ Offline'],
      syncing: ['nx-sync-syncing', '↻ Syncing...'],
    };
    const [cls, text] = states[state || (this.online ? 'online' : 'offline')];
    this.badge.className = 'nx-sync-badge ' + cls;
    this.badge.textContent = text;
  }

  disconnect() {
    this.ws?.close();
    return this;
  }
}

const syncEngine = new SyncEngine();
