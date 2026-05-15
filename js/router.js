class RouterEngine {
  constructor() {
    this.routes = new Map();
    this.middleware = [];
    this.current = null;
    this.history = [];
    this.initialized = false;
    this._outlet = null;
    this._404handler = null;
    this._transitioning = false;
    this._transition = 'fade';
  }

  init(options) {
    if (this.initialized) return this;
    const opts = Object.assign({ outlet: '#vx-outlet', transition: 'fade', base: '' }, options || {});
    this._outlet = typeof opts.outlet === 'string' ? document.querySelector(opts.outlet) : opts.outlet;
    this._transition = opts.transition;
    this._base = opts.base;
    this._injectStyles();
    window.addEventListener('popstate', () => this._handle(location.pathname));
    document.addEventListener('click', e => {
      const a = e.target.closest('[data-vx-route], a[href^="/"]');
      if (!a) return;
      const href = a.dataset.nxRoute || a.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('//')) {
        e.preventDefault();
        this.navigate(href);
      }
    });
    this.initialized = true;
    this._handle(location.pathname);
    return this;
  }

  _injectStyles() {
    if (document.getElementById('vx-router-styles')) return;
    const s = document.createElement('style');
    s.id = 'vx-router-styles';
    s.textContent = `
      .vx-page { width:100%;min-height:100%; }
      .vx-page-enter { animation:vx-page-in 0.4s cubic-bezier(0.23,1,0.32,1) forwards; }
      .vx-page-exit  { animation:vx-page-out 0.3s ease forwards; }
      @keyframes vx-page-in  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
      @keyframes vx-page-out { from{opacity:1} to{opacity:0} }
      .vx-page-slide-enter { animation:vx-slide-in 0.4s cubic-bezier(0.23,1,0.32,1) forwards; }
      @keyframes vx-slide-in { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:none} }
      .vx-nav-link { transition:color 0.2s; cursor:pointer; }
      .vx-nav-link.vx-active { color:var(--vx-primary,#00f5ff); }
      .vx-breadcrumb { display:flex;align-items:center;gap:8px;font-size:13px;opacity:0.7; }
      .vx-breadcrumb-sep { opacity:0.4; }
    `;
    document.head.appendChild(s);
  }

  on(path, handler, options) {
    const opts = Object.assign({ title: null, meta: {} }, options || {});
    const pattern = this._pathToRegex(path);
    this.routes.set(path, { pattern, handler, path, opts });
    return this;
  }

  use(fn) {
    this.middleware.push(fn);
    return this;
  }

  notFound(handler) {
    this._404handler = handler;
    return this;
  }

  navigate(path, options) {
    const opts = Object.assign({ replace: false, data: {} }, options || {});
    const fullPath = (this._base + path).replace('//', '/');
    if (this._transitioning) return this;
    if (opts.replace) history.replaceState({ data: opts.data }, '', fullPath);
    else history.pushState({ data: opts.data }, '', fullPath);
    this._handle(fullPath, opts.data);
    return this;
  }

  back() { history.back(); return this; }
  forward() { history.forward(); return this; }

  async _handle(pathname, data) {
    const path = pathname.replace(this._base, '') || '/';
    let matched = null;
    let params = {};
    for (const [, route] of this.routes) {
      const m = path.match(route.pattern);
      if (m) {
        matched = route;
        params = m.groups || {};
        break;
      }
    }
    const ctx = { path, params, data: data || {}, query: Object.fromEntries(new URLSearchParams(location.search)) };
    for (const mw of this.middleware) {
      const cont = await mw(ctx);
      if (cont === false) return;
    }
    if (!matched) {
      if (this._404handler) this._404handler(ctx);
      return;
    }
    if (matched.opts.title) document.title = typeof matched.opts.title === 'function' ? matched.opts.title(ctx) : matched.opts.title;
    this._updateNavLinks(path);
    this.history.push(path);
    this.current = path;
    if (this._outlet) {
      await this._transitionOut();
      const content = await matched.handler(ctx);
      if (content !== undefined) this._outlet.innerHTML = content;
      this._transitionIn();
    } else {
      matched.handler(ctx);
    }
    VeloxUtils.emit(document, 'vx:navigate', ctx);
  }

  async _transitionOut() {
    if (!this._outlet || !this._outlet.children.length) return;
    return new Promise(resolve => {
      this._outlet.classList.add('vx-page-exit');
      setTimeout(() => { this._outlet.classList.remove('vx-page-exit'); resolve(); }, 300);
    });
  }

  _transitionIn() {
    if (!this._outlet) return;
    const cls = this._transition === 'slide' ? 'vx-page-slide-enter' : 'vx-page-enter';
    this._outlet.classList.add(cls);
    setTimeout(() => this._outlet.classList.remove(cls), 400);
  }

  _updateNavLinks(path) {
    VeloxUtils.qsa('[data-vx-route], a[href^="/"]').forEach(el => {
      const href = el.dataset.nxRoute || el.getAttribute('href');
      el.classList.toggle('vx-active', href === path || (href !== '/' && path.startsWith(href)));
    });
  }

  _pathToRegex(path) {
    const pattern = path
      .replace(/\//g, '\\/')
      .replace(/:([a-zA-Z_]+)/g, '(?<$1>[^/]+)')
      .replace(/\*/g, '.*');
    return new RegExp(`^${pattern}$`);
  }

  breadcrumb(container, paths) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const items = paths || this.history.slice(-3).map(p => ({ label: p.split('/').pop() || 'Home', path: p }));
    el.className = 'vx-breadcrumb';
    el.innerHTML = items.map((item, i) => `
      <span ${i < items.length - 1 ? `data-vx-route="${item.path}" class="vx-nav-link"` : ''}>
        ${item.label || item}
      </span>
      ${i < items.length - 1 ? '<span class="vx-breadcrumb-sep">/</span>' : ''}
    `).join('');
    return this;
  }

  getCurrentPath() { return this.current; }
  getHistory() { return [...this.history]; }
}

var routerEngine = new RouterEngine();
if (typeof window !== 'undefined') window.VeloxRouter = routerEngine;
