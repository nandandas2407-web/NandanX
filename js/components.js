class ComponentEngine {
  constructor() {
    this.initialized = false;
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-comp-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-comp-styles';
    s.textContent = `
      .nx-accordion { border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden; }
      .nx-accordion-item { border-bottom:1px solid rgba(255,255,255,0.06); }
      .nx-accordion-item:last-child { border-bottom:none; }
      .nx-accordion-header {
        width:100%;padding:16px 20px;background:transparent;border:none;
        color:var(--nx-text,#e2e8f0);font-size:15px;font-weight:600;
        text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;
        transition:background 0.2s;font-family:inherit;
      }
      .nx-accordion-header:hover { background:rgba(255,255,255,0.04); }
      .nx-accordion-header.nx-open { color:var(--nx-primary,#00f5ff); }
      .nx-accordion-icon { transition:transform 0.3s ease;font-size:12px;opacity:0.6; }
      .nx-accordion-header.nx-open .nx-accordion-icon { transform:rotate(180deg); }
      .nx-accordion-body {
        max-height:0;overflow:hidden;
        transition:max-height 0.4s cubic-bezier(0.23,1,0.32,1),padding 0.3s ease;
        padding:0 20px;color:rgba(226,232,240,0.7);font-size:14px;line-height:1.7;
      }
      .nx-accordion-body.nx-open { max-height:500px;padding:4px 20px 20px; }

      .nx-tabs { display:flex;flex-direction:column; }
      .nx-tab-list {
        display:flex;gap:4px;border-bottom:1px solid rgba(255,255,255,0.08);
        overflow-x:auto;scrollbar-width:none;
      }
      .nx-tab-list::-webkit-scrollbar { display:none; }
      .nx-tab-btn {
        padding:10px 20px;border:none;background:transparent;
        color:rgba(226,232,240,0.5);font-size:13px;font-weight:600;
        cursor:pointer;white-space:nowrap;position:relative;font-family:inherit;
        transition:color 0.2s;border-radius:8px 8px 0 0;
      }
      .nx-tab-btn:hover { color:var(--nx-text,#e2e8f0); }
      .nx-tab-btn.nx-active { color:var(--nx-primary,#00f5ff); }
      .nx-tab-btn.nx-active::after {
        content:'';position:absolute;bottom:-1px;left:0;right:0;height:2px;
        background:var(--nx-primary,#00f5ff);border-radius:2px 2px 0 0;
      }
      .nx-tab-panel { display:none;padding:24px 0;animation:nx-tab-in 0.3s ease; }
      .nx-tab-panel.nx-active { display:block; }
      @keyframes nx-tab-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

      .nx-carousel { position:relative;overflow:hidden; }
      .nx-carousel-track { display:flex;transition:transform 0.45s cubic-bezier(0.23,1,0.32,1); }
      .nx-carousel-slide { flex:0 0 100%;min-width:0; }
      .nx-carousel-btn {
        position:absolute;top:50%;transform:translateY(-50%);z-index:10;
        width:44px;height:44px;border-radius:50%;border:none;
        background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);
        color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;
        transition:background 0.2s,transform 0.2s;
      }
      .nx-carousel-btn:hover { background:var(--nx-primary,#00f5ff);color:#000;transform:translateY(-50%) scale(1.05); }
      .nx-carousel-prev { left:12px; }
      .nx-carousel-next { right:12px; }
      .nx-carousel-dots { display:flex;justify-content:center;gap:6px;padding:12px 0; }
      .nx-carousel-dot {
        width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.2);
        cursor:pointer;transition:background 0.2s,transform 0.2s;border:none;padding:0;
      }
      .nx-carousel-dot.nx-active { background:var(--nx-primary,#00f5ff);transform:scale(1.3); }

      .nx-stepper { display:flex;align-items:flex-start;gap:0; }
      .nx-step { flex:1;display:flex;flex-direction:column;align-items:center;position:relative; }
      .nx-step:not(:last-child)::after {
        content:'';position:absolute;top:18px;left:50%;right:-50%;height:2px;
        background:rgba(255,255,255,0.1);z-index:0;
      }
      .nx-step.nx-done::after { background:var(--nx-primary,#00f5ff); }
      .nx-step-circle {
        width:36px;height:36px;border-radius:50%;border:2px solid rgba(255,255,255,0.15);
        display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;
        background:var(--nx-bg,#0f0f1a);z-index:1;position:relative;color:rgba(255,255,255,0.4);
        transition:all 0.3s;
      }
      .nx-step.nx-active .nx-step-circle { border-color:var(--nx-primary,#00f5ff);color:var(--nx-primary,#00f5ff);box-shadow:0 0 16px rgba(0,245,255,0.3); }
      .nx-step.nx-done  .nx-step-circle { background:var(--nx-primary,#00f5ff);border-color:var(--nx-primary,#00f5ff);color:#000; }
      .nx-step-label { margin-top:8px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.4);text-align:center; }
      .nx-step.nx-active .nx-step-label { color:var(--nx-primary,#00f5ff); }
      .nx-step.nx-done .nx-step-label { color:rgba(255,255,255,0.7); }

      .nx-badge {
        display:inline-flex;align-items:center;justify-content:center;
        padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.04em;
        line-height:1.6;
      }
      .nx-badge-primary { background:rgba(0,245,255,0.15);color:var(--nx-primary,#00f5ff); }
      .nx-badge-secondary { background:rgba(255,0,110,0.15);color:var(--nx-secondary,#ff006e); }
      .nx-badge-success { background:rgba(0,255,136,0.15);color:#00ff88; }
      .nx-badge-warning { background:rgba(255,230,0,0.15);color:#ffe600; }
      .nx-badge-danger  { background:rgba(255,0,110,0.15);color:#ff4d4f; }
      .nx-badge-dot::before {
        content:'';display:inline-block;width:6px;height:6px;border-radius:50%;
        background:currentColor;margin-right:5px;
      }

      .nx-alert {
        padding:14px 18px;border-radius:10px;border:1px solid transparent;
        display:flex;align-items:flex-start;gap:12px;font-size:14px;
        animation:nx-tab-in 0.3s ease;
      }
      .nx-alert-info    { background:rgba(0,245,255,0.06);border-color:rgba(0,245,255,0.2);color:#d0f7ff; }
      .nx-alert-success { background:rgba(0,255,136,0.06);border-color:rgba(0,255,136,0.2);color:#d0ffe8; }
      .nx-alert-warning { background:rgba(255,230,0,0.06);border-color:rgba(255,230,0,0.2);color:#fffbd0; }
      .nx-alert-error   { background:rgba(255,0,110,0.06);border-color:rgba(255,0,110,0.2);color:#ffd0e0; }
      .nx-alert-icon { font-size:18px;flex-shrink:0; }
      .nx-alert-close { margin-left:auto;background:none;border:none;cursor:pointer;opacity:0.5;font-size:16px;color:inherit;padding:0; }
      .nx-alert-close:hover { opacity:1; }

      .nx-chip {
        display:inline-flex;align-items:center;gap:6px;
        padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;
        background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);
        color:var(--nx-text,#e2e8f0);cursor:default;transition:all 0.2s;
      }
      .nx-chip:hover { background:rgba(0,245,255,0.1);border-color:rgba(0,245,255,0.3); }
      .nx-chip-remove { background:none;border:none;cursor:pointer;opacity:0.5;font-size:14px;padding:0;color:inherit;line-height:1; }
      .nx-chip-remove:hover { opacity:1; }

      .nx-divider {
        display:flex;align-items:center;gap:12px;color:rgba(255,255,255,0.3);
        font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;
        margin:16px 0;
      }
      .nx-divider::before,.nx-divider::after {
        content:'';flex:1;height:1px;background:rgba(255,255,255,0.08);
      }
    `;
    document.head.appendChild(s);
  }

  accordion(container, items, options) {
    const opts = Object.assign({ multiple: false, defaultOpen: null }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.className = 'nx-accordion';
    el.innerHTML = '';
    const itemEls = [];
    items.forEach((item, i) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'nx-accordion-item';
      const header = document.createElement('button');
      header.className = 'nx-accordion-header';
      header.innerHTML = `<span>${item.title}</span><span class="nx-accordion-icon">▼</span>`;
      const body = document.createElement('div');
      body.className = 'nx-accordion-body';
      body.innerHTML = typeof item.content === 'string' ? item.content : '';
      itemEl.appendChild(header);
      itemEl.appendChild(body);
      el.appendChild(itemEl);
      itemEls.push({ header, body });
      if (opts.defaultOpen === i) { header.classList.add('nx-open'); body.classList.add('nx-open'); }
      header.addEventListener('click', () => {
        const open = header.classList.contains('nx-open');
        if (!opts.multiple) itemEls.forEach(({ header: h, body: b }) => { h.classList.remove('nx-open'); b.classList.remove('nx-open'); });
        if (!open || opts.multiple) { header.classList.toggle('nx-open', !open); body.classList.toggle('nx-open', !open); }
      });
    });
    return { open: i => { itemEls[i]?.header.classList.add('nx-open'); itemEls[i]?.body.classList.add('nx-open'); },
             close: i => { itemEls[i]?.header.classList.remove('nx-open'); itemEls[i]?.body.classList.remove('nx-open'); } };
  }

  tabs(container, items, options) {
    const opts = Object.assign({ defaultTab: 0 }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.className = 'nx-tabs';
    const tabList = document.createElement('div');
    tabList.className = 'nx-tab-list';
    const panels = [];
    items.forEach((item, i) => {
      const btn = document.createElement('button');
      btn.className = 'nx-tab-btn' + (i === opts.defaultTab ? ' nx-active' : '');
      btn.textContent = item.label;
      const panel = document.createElement('div');
      panel.className = 'nx-tab-panel' + (i === opts.defaultTab ? ' nx-active' : '');
      panel.innerHTML = item.content;
      panels.push({ btn, panel });
      btn.addEventListener('click', () => {
        panels.forEach(p => { p.btn.classList.remove('nx-active'); p.panel.classList.remove('nx-active'); });
        btn.classList.add('nx-active');
        panel.classList.add('nx-active');
      });
      tabList.appendChild(btn);
    });
    el.appendChild(tabList);
    panels.forEach(p => el.appendChild(p.panel));
    return { setTab: i => panels[i]?.btn.click() };
  }

  carousel(container, slides, options) {
    const opts = Object.assign({ autoplay: false, interval: 3000, dots: true, arrows: true, loop: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.className = 'nx-carousel';
    const track = document.createElement('div');
    track.className = 'nx-carousel-track';
    slides.forEach(slide => {
      const slideEl = document.createElement('div');
      slideEl.className = 'nx-carousel-slide';
      slideEl.innerHTML = typeof slide === 'string' ? slide : slide.content || '';
      track.appendChild(slideEl);
    });
    el.appendChild(track);
    let current = 0;
    const total = slides.length;
    const go = i => {
      current = opts.loop ? ((i % total) + total) % total : NandanXUtils.clamp(i, 0, total - 1);
      track.style.transform = `translateX(-${current * 100}%)`;
      if (dotsContainer) dotsContainer.querySelectorAll('.nx-carousel-dot').forEach((d, j) => d.classList.toggle('nx-active', j === current));
    };
    if (opts.arrows) {
      const prev = document.createElement('button');
      prev.className = 'nx-carousel-btn nx-carousel-prev';
      prev.innerHTML = '‹';
      const next = document.createElement('button');
      next.className = 'nx-carousel-btn nx-carousel-next';
      next.innerHTML = '›';
      prev.addEventListener('click', () => go(current - 1));
      next.addEventListener('click', () => go(current + 1));
      el.appendChild(prev);
      el.appendChild(next);
    }
    let dotsContainer = null;
    if (opts.dots) {
      dotsContainer = document.createElement('div');
      dotsContainer.className = 'nx-carousel-dots';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'nx-carousel-dot' + (i === 0 ? ' nx-active' : '');
        dot.addEventListener('click', () => go(i));
        dotsContainer.appendChild(dot);
      });
      el.appendChild(dotsContainer);
    }
    if (opts.autoplay) setInterval(() => go(current + 1), opts.interval);
    let startX = 0;
    el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(dx < 0 ? current + 1 : current - 1);
    });
    return { next: () => go(current + 1), prev: () => go(current - 1), goTo: go, getCurrent: () => current };
  }

  stepper(container, steps, options) {
    const opts = Object.assign({ current: 0 }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.className = 'nx-stepper';
    steps.forEach((step, i) => {
      const stepEl = document.createElement('div');
      const label = typeof step === 'string' ? step : step.label;
      stepEl.className = 'nx-step' + (i < opts.current ? ' nx-done' : i === opts.current ? ' nx-active' : '');
      stepEl.innerHTML = `<div class="nx-step-circle">${i < opts.current ? '✓' : i + 1}</div><div class="nx-step-label">${label}</div>`;
      el.appendChild(stepEl);
    });
    return {
      setStep: i => {
        el.querySelectorAll('.nx-step').forEach((s, j) => {
          s.classList.toggle('nx-done', j < i);
          s.classList.toggle('nx-active', j === i);
          s.classList.remove(...(j >= i ? ['nx-done'] : []));
          s.querySelector('.nx-step-circle').textContent = j < i ? '✓' : j + 1;
        });
      }
    };
  }

  badge(container, text, type) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const b = document.createElement('span');
    b.className = `nx-badge nx-badge-${type || 'primary'}`;
    b.textContent = text;
    el.appendChild(b);
    return this;
  }

  alert(container, options) {
    const opts = Object.assign({ type: 'info', message: '', title: '', dismissible: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const icons = { info: 'ℹ', success: '✓', warning: '⚠', error: '✕' };
    const a = document.createElement('div');
    a.className = `nx-alert nx-alert-${opts.type}`;
    a.innerHTML = `
      <span class="nx-alert-icon">${opts.icon || icons[opts.type]}</span>
      <div>
        ${opts.title ? `<div style="font-weight:700;margin-bottom:4px">${opts.title}</div>` : ''}
        <div>${opts.message}</div>
      </div>
      ${opts.dismissible ? '<button class="nx-alert-close">✕</button>' : ''}
    `;
    el.appendChild(a);
    a.querySelector('.nx-alert-close')?.addEventListener('click', () => { a.style.opacity = '0'; setTimeout(() => a.remove(), 300); });
    return a;
  }

  chip(container, text, options) {
    const opts = Object.assign({ removable: false, onRemove: null }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const c = document.createElement('div');
    c.className = 'nx-chip';
    c.innerHTML = text + (opts.removable ? '<button class="nx-chip-remove">✕</button>' : '');
    el.appendChild(c);
    if (opts.removable) c.querySelector('.nx-chip-remove').addEventListener('click', () => { c.remove(); if (opts.onRemove) opts.onRemove(); });
    return c;
  }

  divider(container, text) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const d = document.createElement('div');
    d.className = 'nx-divider';
    d.textContent = text || '';
    el.appendChild(d);
    return this;
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-accordion]').forEach(el => {
        if (el.dataset.nxAccordionDone) return;
        el.dataset.nxAccordionDone = '1';
        let items;
        try { items = JSON.parse(el.dataset.nxAccordion); } catch { return; }
        this.accordion(el, items);
      });
      NandanXUtils.qsa('[data-nx-tabs]').forEach(el => {
        if (el.dataset.nxTabsDone) return;
        el.dataset.nxTabsDone = '1';
        let items;
        try { items = JSON.parse(el.dataset.nxTabs); } catch { return; }
        this.tabs(el, items);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var componentEngine = new ComponentEngine();
if (typeof window !== 'undefined') window.NandanXComponent = componentEngine;
