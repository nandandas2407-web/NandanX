class AccessibilityEngine {
  constructor() {
    this.initialized = false;
    this._focusTrap = null;
    this._announcer = null;
    this._shortcuts = new Map();
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._createAnnouncer();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-a11y-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-a11y-styles';
    s.textContent = `
      .nx-sr-only {
        position:absolute;width:1px;height:1px;padding:0;margin:-1px;
        overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;
      }
      .nx-skip-link {
        position:absolute;top:-40px;left:0;background:var(--nx-primary,#00f5ff);
        color:#000;padding:8px 16px;font-weight:700;z-index:999999;
        border-radius:0 0 8px 0;transition:top 0.2s;text-decoration:none;
      }
      .nx-skip-link:focus { top:0; }
      :focus-visible {
        outline:2px solid var(--nx-primary,#00f5ff) !important;
        outline-offset:2px !important;
        border-radius:4px;
      }
      .nx-no-focus-ring :focus:not(:focus-visible) { outline:none; }
      .nx-high-contrast * { filter:contrast(1.5); }
      .nx-large-text * { font-size:120% !important; }
      .nx-reduced-motion * { animation-duration:0.01ms !important; transition-duration:0.01ms !important; }
      .nx-a11y-bar {
        position:fixed;bottom:20px;right:20px;z-index:999998;
        display:flex;flex-direction:column;gap:6px;
      }
      .nx-a11y-btn {
        width:40px;height:40px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.2);
        background:rgba(15,15,26,0.9);backdrop-filter:blur(8px);
        color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;
        transition:background 0.2s,transform 0.2s;
      }
      .nx-a11y-btn:hover { background:var(--nx-primary,#00f5ff);color:#000;transform:scale(1.05); }
      .nx-a11y-btn.nx-active { background:var(--nx-primary,#00f5ff);color:#000; }
      .nx-focus-trap-overlay { position:fixed;inset:0;z-index:99999; }
    `;
    document.head.appendChild(s);
  }

  _createAnnouncer() {
    this._announcer = document.createElement('div');
    this._announcer.setAttribute('aria-live', 'polite');
    this._announcer.setAttribute('aria-atomic', 'true');
    this._announcer.className = 'nx-sr-only';
    document.body.appendChild(this._announcer);
  }

  announce(message, priority) {
    if (!this._announcer) this._createAnnouncer();
    this._announcer.setAttribute('aria-live', priority === 'assertive' ? 'assertive' : 'polite');
    this._announcer.textContent = '';
    setTimeout(() => { this._announcer.textContent = message; }, 50);
    return this;
  }

  skipLink(href, text) {
    const a = document.createElement('a');
    a.href = href || '#main';
    a.className = 'nx-skip-link';
    a.textContent = text || 'Skip to main content';
    document.body.insertBefore(a, document.body.firstChild);
    return this;
  }

  focusTrap(container) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => [...el.querySelectorAll(focusable)].filter(e => !e.disabled && e.offsetParent !== null);
    const handler = e => {
      if (e.key !== 'Tab') return;
      const focusableEls = getFocusable();
      const first = focusableEls[0], last = focusableEls[focusableEls.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { last.focus(); e.preventDefault(); } }
      else { if (document.activeElement === last) { first.focus(); e.preventDefault(); } }
    };
    el.addEventListener('keydown', handler);
    const firstFocusable = getFocusable()[0];
    if (firstFocusable) firstFocusable.focus();
    this._focusTrap = { el, handler };
    return this;
  }

  releaseFocusTrap() {
    if (this._focusTrap) {
      this._focusTrap.el.removeEventListener('keydown', this._focusTrap.handler);
      this._focusTrap = null;
    }
    return this;
  }

  roving(container, options) {
    const opts = Object.assign({ selector: 'button, [role="option"], [role="tab"]', loop: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const getItems = () => [...el.querySelectorAll(opts.selector)];
    el.addEventListener('keydown', e => {
      const items = getItems();
      const current = document.activeElement;
      const idx = items.indexOf(current);
      if (idx === -1) return;
      let next = idx;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { next = idx < items.length - 1 ? idx + 1 : (opts.loop ? 0 : idx); e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { next = idx > 0 ? idx - 1 : (opts.loop ? items.length - 1 : idx); e.preventDefault(); }
      if (e.key === 'Home') { next = 0; e.preventDefault(); }
      if (e.key === 'End') { next = items.length - 1; e.preventDefault(); }
      items.forEach((item, i) => { item.tabIndex = i === next ? 0 : -1; });
      items[next].focus();
    });
    return this;
  }

  label(target, text) {
    NandanXUtils.parseSelector(target).forEach(el => {
      if (!el.getAttribute('aria-label') && !el.id) {
        el.setAttribute('aria-label', text);
      }
    });
    return this;
  }

  live(target, type) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.setAttribute('aria-live', type || 'polite');
      el.setAttribute('aria-atomic', 'true');
    });
    return this;
  }

  role(target, roleName) {
    NandanXUtils.parseSelector(target).forEach(el => el.setAttribute('role', roleName));
    return this;
  }

  expanded(target, isExpanded) {
    NandanXUtils.parseSelector(target).forEach(el => {
      el.setAttribute('aria-expanded', String(!!isExpanded));
    });
    return this;
  }

  highContrast(enabled) {
    document.documentElement.classList.toggle('nx-high-contrast', enabled !== false);
    return this;
  }

  largeText(enabled) {
    document.documentElement.classList.toggle('nx-large-text', enabled !== false);
    return this;
  }

  reducedMotion(enabled) {
    document.documentElement.classList.toggle('nx-reduced-motion', enabled !== false);
    return this;
  }

  toolbar(container, options) {
    const opts = Object.assign({ contrast: true, text: true, motion: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const bar = document.createElement('div');
    bar.className = 'nx-a11y-bar';
    const addBtn = (icon, label, fn) => {
      const btn = document.createElement('button');
      btn.className = 'nx-a11y-btn';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
      btn.textContent = icon;
      btn.addEventListener('click', () => { btn.classList.toggle('nx-active'); fn(btn.classList.contains('nx-active')); });
      bar.appendChild(btn);
    };
    if (opts.contrast) addBtn('◑', 'Toggle high contrast', v => this.highContrast(v));
    if (opts.text) addBtn('A', 'Toggle large text', v => this.largeText(v));
    if (opts.motion) addBtn('✋', 'Reduce motion', v => this.reducedMotion(v));
    el.appendChild(bar);
    return this;
  }

  audit() {
    const issues = [];
    NandanXUtils.qsa('img').forEach(img => { if (!img.alt) issues.push({ el: img, issue: 'Image missing alt attribute', severity: 'error' }); });
    NandanXUtils.qsa('a').forEach(a => { if (!a.textContent.trim() && !a.getAttribute('aria-label')) issues.push({ el: a, issue: 'Link has no accessible text', severity: 'warning' }); });
    NandanXUtils.qsa('button').forEach(btn => { if (!btn.textContent.trim() && !btn.getAttribute('aria-label')) issues.push({ el: btn, issue: 'Button has no accessible text', severity: 'warning' }); });
    NandanXUtils.qsa('input, select, textarea').forEach(input => {
      const hasLabel = document.querySelector(`label[for="${input.id}"]`) || input.closest('label') || input.getAttribute('aria-label');
      if (!hasLabel) issues.push({ el: input, issue: 'Form field missing label', severity: 'error' });
    });
    const headings = NandanXUtils.qsa('h1, h2, h3, h4, h5, h6').map(h => parseInt(h.tagName[1]));
    for (let i = 1; i < headings.length; i++) {
      if (headings[i] - headings[i - 1] > 1) issues.push({ issue: `Heading level skipped: h${headings[i-1]} to h${headings[i]}`, severity: 'warning' });
    }
    if (!document.querySelector('[role="main"], main')) issues.push({ issue: 'No main landmark found', severity: 'warning' });
    return issues;
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-roving]').forEach(el => {
        if (el.dataset.nxRovingDone) return;
        el.dataset.nxRovingDone = '1';
        this.roving(el);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var accessibilityEngine = new AccessibilityEngine();
if (typeof window !== 'undefined') window.NandanXA11y = accessibilityEngine;
