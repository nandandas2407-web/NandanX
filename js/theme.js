class ThemeEngine {
  constructor() {
    this.themes = new Map();
    this.current = null;
    this.initialized = false;
    this._transitionDuration = 400;
    this._storageKey = 'vx-theme';
  }

  init(options) {
    if (this.initialized) return this;
    const opts = Object.assign({ persist: true, auto: true, transition: true }, options || {});
    this._persist = opts.persist;
    this._injectStyles();
    this._registerDefaults();
    if (opts.auto) this._autoDetect();
    if (opts.persist) {
      const saved = localStorage.getItem(this._storageKey);
      if (saved && this.themes.has(saved)) this.set(saved);
    }
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('vx-theme-styles')) return;
    const s = document.createElement('style');
    s.id = 'vx-theme-styles';
    s.textContent = `
      body { transition:background-color 0.4s ease,color 0.4s ease; }
      .vx-theme-toggle {
        display:inline-flex;align-items:center;justify-content:center;
        width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;
        background:rgba(255,255,255,0.08);font-size:18px;
        transition:background 0.2s,transform 0.3s;
      }
      .vx-theme-toggle:hover { background:rgba(255,255,255,0.15);transform:rotate(20deg); }
      .vx-color-picker { display:flex;gap:8px;flex-wrap:wrap; }
      .vx-color-swatch {
        width:24px;height:24px;border-radius:50%;cursor:pointer;border:2px solid transparent;
        transition:transform 0.15s,border-color 0.15s;
      }
      .vx-color-swatch:hover, .vx-color-swatch.vx-active { transform:scale(1.2);border-color:#fff; }
      .vx-theme-switcher { display:flex;gap:8px;flex-wrap:wrap; }
      .vx-theme-btn {
        padding:6px 14px;border-radius:20px;border:1.5px solid rgba(255,255,255,0.15);
        background:rgba(255,255,255,0.04);color:var(--vx-text,#e2e8f0);
        cursor:pointer;font-size:12px;font-weight:600;transition:all 0.2s;
        font-family:inherit;
      }
      .vx-theme-btn:hover { border-color:var(--vx-primary,#00f5ff); }
      .vx-theme-btn.vx-active { background:var(--vx-primary,#00f5ff);color:#000;border-color:transparent; }
    `;
    document.head.appendChild(s);
  }

  _registerDefaults() {
    this.define('dark', {
      '--vx-bg': '#0f0f1a',
      '--vx-bg-2': '#1a1a2e',
      '--vx-text': '#e2e8f0',
      '--vx-text-muted': 'rgba(226,232,240,0.5)',
      '--vx-primary': '#00f5ff',
      '--vx-secondary': '#ff006e',
      '--vx-accent': '#7c3aed',
      '--vx-border': 'rgba(255,255,255,0.08)',
      '--vx-surface': 'rgba(255,255,255,0.04)',
      'background': '#0f0f1a',
      'color': '#e2e8f0',
    });
    this.define('light', {
      '--vx-bg': '#f8fafc',
      '--vx-bg-2': '#f1f5f9',
      '--vx-text': '#0f172a',
      '--vx-text-muted': 'rgba(15,23,42,0.5)',
      '--vx-primary': '#0077ff',
      '--vx-secondary': '#e01068',
      '--vx-accent': '#5b21b6',
      '--vx-border': 'rgba(0,0,0,0.08)',
      '--vx-surface': 'rgba(0,0,0,0.03)',
      'background': '#f8fafc',
      'color': '#0f172a',
    });
    this.define('neon', {
      '--vx-bg': '#000010',
      '--vx-bg-2': '#05051a',
      '--vx-text': '#ffffff',
      '--vx-text-muted': 'rgba(255,255,255,0.5)',
      '--vx-primary': '#00ff88',
      '--vx-secondary': '#ff00ff',
      '--vx-accent': '#ffff00',
      '--vx-border': 'rgba(0,255,136,0.15)',
      '--vx-surface': 'rgba(0,255,136,0.04)',
      'background': '#000010',
      'color': '#fff',
    });
    this.define('ocean', {
      '--vx-bg': '#04101a',
      '--vx-bg-2': '#071e2e',
      '--vx-text': '#d0f0ff',
      '--vx-text-muted': 'rgba(208,240,255,0.5)',
      '--vx-primary': '#00b4d8',
      '--vx-secondary': '#0077b6',
      '--vx-accent': '#48cae4',
      '--vx-border': 'rgba(0,180,216,0.15)',
      '--vx-surface': 'rgba(0,180,216,0.05)',
      'background': '#04101a',
      'color': '#d0f0ff',
    });
    this.define('sunset', {
      '--vx-bg': '#120804',
      '--vx-bg-2': '#1e0d06',
      '--vx-text': '#ffeedd',
      '--vx-text-muted': 'rgba(255,238,221,0.5)',
      '--vx-primary': '#ff8c00',
      '--vx-secondary': '#ff4500',
      '--vx-accent': '#ffd700',
      '--vx-border': 'rgba(255,140,0,0.15)',
      '--vx-surface': 'rgba(255,140,0,0.05)',
      'background': '#120804',
      'color': '#ffeedd',
    });
    this.define('forest', {
      '--vx-bg': '#041408',
      '--vx-bg-2': '#081f0e',
      '--vx-text': '#d4edda',
      '--vx-text-muted': 'rgba(212,237,218,0.5)',
      '--vx-primary': '#2dce89',
      '--vx-secondary': '#52c41a',
      '--vx-accent': '#b7eb8f',
      '--vx-border': 'rgba(45,206,137,0.15)',
      '--vx-surface': 'rgba(45,206,137,0.04)',
      'background': '#041408',
      'color': '#d4edda',
    });
    this.define('midnight', {
      '--vx-bg': '#08080f',
      '--vx-bg-2': '#10101e',
      '--vx-text': '#c8c8e0',
      '--vx-text-muted': 'rgba(200,200,224,0.5)',
      '--vx-primary': '#7c3aed',
      '--vx-secondary': '#a855f7',
      '--vx-accent': '#c084fc',
      '--vx-border': 'rgba(124,58,237,0.2)',
      '--vx-surface': 'rgba(124,58,237,0.06)',
      'background': '#08080f',
      'color': '#c8c8e0',
    });
  }

  define(name, vars) {
    this.themes.set(name, vars);
    return this;
  }

  set(name, options) {
    const opts = Object.assign({ animate: true }, options || {});
    const theme = this.themes.get(name);
    if (!theme) return this;
    if (opts.animate) {
      document.documentElement.style.transition = `background-color ${this._transitionDuration}ms ease, color ${this._transitionDuration}ms ease`;
    }
    Object.entries(theme).forEach(([key, val]) => {
      if (key.startsWith('--')) document.documentElement.style.setProperty(key, val);
      else if (key === 'background') document.body.style.background = val;
      else if (key === 'color') document.body.style.color = val;
    });
    if (this._persist) localStorage.setItem(this._storageKey, name);
    const prev = this.current;
    this.current = name;
    document.documentElement.dataset.nxTheme = name;
    VeloxUtils.emit(document, 'vx:theme', { name, prev });
    return this;
  }

  toggle(a, b) {
    const themeA = a || 'dark';
    const themeB = b || 'light';
    return this.set(this.current === themeA ? themeB : themeA);
  }

  get(name) { return this.themes.get(name || this.current); }
  getAll() { return [...this.themes.keys()]; }

  createToggle(container, options) {
    const opts = Object.assign({ themes: ['dark', 'light'], icon: '🌓' }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const btn = document.createElement('button');
    btn.className = 'vx-theme-toggle';
    btn.textContent = opts.icon;
    btn.addEventListener('click', () => this.toggle(...opts.themes));
    el.appendChild(btn);
    return this;
  }

  createSwitcher(container, themes) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const list = themes || [...this.themes.keys()];
    const wrap = document.createElement('div');
    wrap.className = 'vx-theme-switcher';
    list.forEach(name => {
      const btn = document.createElement('button');
      btn.className = 'vx-theme-btn' + (this.current === name ? ' vx-active' : '');
      btn.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      btn.addEventListener('click', () => {
        this.set(name);
        wrap.querySelectorAll('.vx-theme-btn').forEach(b => b.classList.toggle('vx-active', b.textContent.toLowerCase() === name));
      });
      wrap.appendChild(btn);
    });
    el.appendChild(wrap);
    return this;
  }

  colorPicker(container, variable, options) {
    const opts = Object.assign({ colors: ['#00f5ff','#ff006e','#7c3aed','#00ff88','#ffe600','#ff8c00','#e01068','#00b4d8'], onChange: null }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const wrap = document.createElement('div');
    wrap.className = 'vx-color-picker';
    opts.colors.forEach(color => {
      const sw = document.createElement('div');
      sw.className = 'vx-color-swatch';
      sw.style.background = color;
      sw.addEventListener('click', () => {
        wrap.querySelectorAll('.vx-color-swatch').forEach(s => s.classList.remove('vx-active'));
        sw.classList.add('vx-active');
        if (variable) document.documentElement.style.setProperty(variable, color);
        if (opts.onChange) opts.onChange(color);
      });
      wrap.appendChild(sw);
    });
    el.appendChild(wrap);
    return this;
  }

  autoSystem() {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => this.set(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', apply);
    if (!localStorage.getItem(this._storageKey)) apply();
    return this;
  }

  _autoDetect() {
    const run = () => {
      VeloxUtils.qsa('[data-vx-theme-toggle]').forEach(el => {
        if (el.dataset.nxThemeDone) return;
        el.dataset.nxThemeDone = '1';
        el.addEventListener('click', () => this.toggle());
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var themeEngine = new ThemeEngine();
if (typeof window !== 'undefined') window.VeloxTheme = themeEngine;
