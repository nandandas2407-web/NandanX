class ThemeEngine {
  constructor() {
    this.themes = new Map();
    this.current = null;
    this.initialized = false;
    this._transitionDuration = 400;
    this._storageKey = 'nx-theme';
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
    if (document.getElementById('nx-theme-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-theme-styles';
    s.textContent = `
      body { transition:background-color 0.4s ease,color 0.4s ease; }
      .nx-theme-toggle {
        display:inline-flex;align-items:center;justify-content:center;
        width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;
        background:rgba(255,255,255,0.08);font-size:18px;
        transition:background 0.2s,transform 0.3s;
      }
      .nx-theme-toggle:hover { background:rgba(255,255,255,0.15);transform:rotate(20deg); }
      .nx-color-picker { display:flex;gap:8px;flex-wrap:wrap; }
      .nx-color-swatch {
        width:24px;height:24px;border-radius:50%;cursor:pointer;border:2px solid transparent;
        transition:transform 0.15s,border-color 0.15s;
      }
      .nx-color-swatch:hover, .nx-color-swatch.nx-active { transform:scale(1.2);border-color:#fff; }
      .nx-theme-switcher { display:flex;gap:8px;flex-wrap:wrap; }
      .nx-theme-btn {
        padding:6px 14px;border-radius:20px;border:1.5px solid rgba(255,255,255,0.15);
        background:rgba(255,255,255,0.04);color:var(--nx-text,#e2e8f0);
        cursor:pointer;font-size:12px;font-weight:600;transition:all 0.2s;
        font-family:inherit;
      }
      .nx-theme-btn:hover { border-color:var(--nx-primary,#00f5ff); }
      .nx-theme-btn.nx-active { background:var(--nx-primary,#00f5ff);color:#000;border-color:transparent; }
    `;
    document.head.appendChild(s);
  }

  _registerDefaults() {
    this.define('dark', {
      '--nx-bg': '#0f0f1a',
      '--nx-bg-2': '#1a1a2e',
      '--nx-text': '#e2e8f0',
      '--nx-text-muted': 'rgba(226,232,240,0.5)',
      '--nx-primary': '#00f5ff',
      '--nx-secondary': '#ff006e',
      '--nx-accent': '#7c3aed',
      '--nx-border': 'rgba(255,255,255,0.08)',
      '--nx-surface': 'rgba(255,255,255,0.04)',
      'background': '#0f0f1a',
      'color': '#e2e8f0',
    });
    this.define('light', {
      '--nx-bg': '#f8fafc',
      '--nx-bg-2': '#f1f5f9',
      '--nx-text': '#0f172a',
      '--nx-text-muted': 'rgba(15,23,42,0.5)',
      '--nx-primary': '#0077ff',
      '--nx-secondary': '#e01068',
      '--nx-accent': '#5b21b6',
      '--nx-border': 'rgba(0,0,0,0.08)',
      '--nx-surface': 'rgba(0,0,0,0.03)',
      'background': '#f8fafc',
      'color': '#0f172a',
    });
    this.define('neon', {
      '--nx-bg': '#000010',
      '--nx-bg-2': '#05051a',
      '--nx-text': '#ffffff',
      '--nx-text-muted': 'rgba(255,255,255,0.5)',
      '--nx-primary': '#00ff88',
      '--nx-secondary': '#ff00ff',
      '--nx-accent': '#ffff00',
      '--nx-border': 'rgba(0,255,136,0.15)',
      '--nx-surface': 'rgba(0,255,136,0.04)',
      'background': '#000010',
      'color': '#fff',
    });
    this.define('ocean', {
      '--nx-bg': '#04101a',
      '--nx-bg-2': '#071e2e',
      '--nx-text': '#d0f0ff',
      '--nx-text-muted': 'rgba(208,240,255,0.5)',
      '--nx-primary': '#00b4d8',
      '--nx-secondary': '#0077b6',
      '--nx-accent': '#48cae4',
      '--nx-border': 'rgba(0,180,216,0.15)',
      '--nx-surface': 'rgba(0,180,216,0.05)',
      'background': '#04101a',
      'color': '#d0f0ff',
    });
    this.define('sunset', {
      '--nx-bg': '#120804',
      '--nx-bg-2': '#1e0d06',
      '--nx-text': '#ffeedd',
      '--nx-text-muted': 'rgba(255,238,221,0.5)',
      '--nx-primary': '#ff8c00',
      '--nx-secondary': '#ff4500',
      '--nx-accent': '#ffd700',
      '--nx-border': 'rgba(255,140,0,0.15)',
      '--nx-surface': 'rgba(255,140,0,0.05)',
      'background': '#120804',
      'color': '#ffeedd',
    });
    this.define('forest', {
      '--nx-bg': '#041408',
      '--nx-bg-2': '#081f0e',
      '--nx-text': '#d4edda',
      '--nx-text-muted': 'rgba(212,237,218,0.5)',
      '--nx-primary': '#2dce89',
      '--nx-secondary': '#52c41a',
      '--nx-accent': '#b7eb8f',
      '--nx-border': 'rgba(45,206,137,0.15)',
      '--nx-surface': 'rgba(45,206,137,0.04)',
      'background': '#041408',
      'color': '#d4edda',
    });
    this.define('midnight', {
      '--nx-bg': '#08080f',
      '--nx-bg-2': '#10101e',
      '--nx-text': '#c8c8e0',
      '--nx-text-muted': 'rgba(200,200,224,0.5)',
      '--nx-primary': '#7c3aed',
      '--nx-secondary': '#a855f7',
      '--nx-accent': '#c084fc',
      '--nx-border': 'rgba(124,58,237,0.2)',
      '--nx-surface': 'rgba(124,58,237,0.06)',
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
    NandanXUtils.emit(document, 'vx:theme', { name, prev });
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
    btn.className = 'nx-theme-toggle';
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
    wrap.className = 'nx-theme-switcher';
    list.forEach(name => {
      const btn = document.createElement('button');
      btn.className = 'nx-theme-btn' + (this.current === name ? ' nx-active' : '');
      btn.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      btn.addEventListener('click', () => {
        this.set(name);
        wrap.querySelectorAll('.nx-theme-btn').forEach(b => b.classList.toggle('nx-active', b.textContent.toLowerCase() === name));
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
    wrap.className = 'nx-color-picker';
    opts.colors.forEach(color => {
      const sw = document.createElement('div');
      sw.className = 'nx-color-swatch';
      sw.style.background = color;
      sw.addEventListener('click', () => {
        wrap.querySelectorAll('.nx-color-swatch').forEach(s => s.classList.remove('nx-active'));
        sw.classList.add('nx-active');
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
      NandanXUtils.qsa('[data-nx-theme-toggle]').forEach(el => {
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
if (typeof window !== 'undefined') window.NandanXTheme = themeEngine;
