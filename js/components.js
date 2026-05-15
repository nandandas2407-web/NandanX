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
    if (document.getElementById('vx-comp-styles')) return;
    const s = document.createElement('style');
    s.id = 'vx-comp-styles';
    s.textContent = `
      .vx-accordion { border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden; }
      .vx-accordion-item { border-bottom:1px solid rgba(255,255,255,0.06); }
      .vx-accordion-item:last-child { border-bottom:none; }
      .vx-accordion-header {
        width:100%;padding:16px 20px;background:transparent;border:none;
        color:var(--vx-text,#e2e8f0);font-size:15px;font-weight:600;
        text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;
        transition:background 0.2s;font-family:inherit;
      }
      .vx-accordion-header:hover { background:rgba(255,255,255,0.04); }
      .vx-accordion-header.vx-open { color:var(--vx-primary,#00f5ff); }
      .vx-accordion-icon { transition:transform 0.3s ease;font-size:12px;opacity:0.6; }
      .vx-accordion-header.vx-open .vx-accordion-icon { transform:rotate(180deg); }
      .vx-accordion-body {
        max-height:0;overflow:hidden;
        transition:max-height 0.4s cubic-bezier(0.23,1,0.32,1),padding 0.3s ease;
        padding:0 20px;color:rgba(226,232,240,0.7);font-size:14px;line-height:1.7;
      }
      .vx-accordion-body.vx-open { max-height:500px;padding:4px 20px 20px; }

      .vx-tabs { display:flex;flex-direction:column; }
      .vx-tab-list {
        display:flex;gap:4px;border-bottom:1px solid rgba(255,255,255,0.08);
        overflow-x:auto;scrollbar-width:none;
      }
      .vx-tab-list::-webkit-scrollbar { display:none; }
      .vx-tab-btn {
        padding:10px 20px;border:none;background:transparent;
        color:rgba(226,232,240,0.5);font-size:13px;font-weight:600;
        cursor:pointer;white-space:nowrap;position:relative;font-family:inherit;
        transition:color 0.2s;border-radius:8px 8px 0 0;
      }
      .vx-tab-btn:hover { color:var(--vx-text,#e2e8f0); }
      .vx-tab-btn.vx-active { color:var(--vx-primary,#00f5ff); }
      .vx-tab-btn.vx-active::after {
        content:'';position:absolute;bottom:-1px;left:0;right:0;height:2px;
        background:var(--vx-primary,#00f5ff);border-radius:2px 2px 0 0;
      }
      .vx-tab-panel { display:none;padding:24px 0;animation:vx-tab-in 0.3s ease; }
      .vx-tab-panel.vx-active { display:block; }
      @keyframes vx-tab-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

      .vx-carousel { position:relative;overflow:hidden; }
      .vx-carousel-track { display:flex;transition:transform 0.45s cubic-bezier(0.23,1,0.32,1); }
      .vx-carousel-slide { flex:0 0 100%;min-width:0; }
      .vx-carousel-btn {
        position:absolute;top:50%;transform:translateY(-50%);z-index:10;
        width:44px;height:44px;border-radius:50%;border:none;
        background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);
        color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;
        transition:background 0.2s,transform 0.2s;
      }
      .vx-carousel-btn:hover { background:var(--vx-primary,#00f5ff);color:#000;transform:translateY(-50%) scale(1.05); }
      .vx-carousel-prev { left:12px; }
      .vx-carousel-next { right:12px; }
      .vx-carousel-dots { display:flex;justify-content:center;gap:6px;padding:12px 0; }
      .vx-carousel-dot {
        width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.2);
        cursor:pointer;transition:background 0.2s,transform 0.2s;border:none;padding:0;
      }
      .vx-carousel-dot.vx-active { background:var(--vx-primary,#00f5ff);transform:scale(1.3); }

      .vx-stepper { display:flex;align-items:flex-start;gap:0; }
      .vx-step { flex:1;display:flex;flex-direction:column;align-items:center;position:relative; }
      .vx-step:not(:last-child)::after {
        content:'';position:absolute;top:18px;left:50%;right:-50%;height:2px;
        background:rgba(255,255,255,0.1);z-index:0;
      }
      .vx-step.vx-done::after { background:var(--vx-primary,#00f5ff); }
      .vx-step-circle {
        width:36px;height:36px;border-radius:50%;border:2px solid rgba(255,255,255,0.15);
        display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;
        background:var(--vx-bg,#0f0f1a);z-index:1;position:relative;color:rgba(255,255,255,0.4);
        transition:all 0.3s;
      }
      .vx-step.vx-active .vx-step-circle { border-color:var(--vx-primary,#00f5ff);color:var(--vx-primary,#00f5ff);box-shadow:0 0 16px rgba(0,245,255,0.3); }
      .vx-step.vx-done  .vx-step-circle { background:var(--vx-primary,#00f5ff);border-color:var(--vx-primary,#00f5ff);color:#000; }
      .vx-step-label { margin-top:8px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.4);text-align:center; }
      .vx-step.vx-active .vx-step-label { color:var(--vx-primary,#00f5ff); }
      .vx-step.vx-done .vx-step-label { color:rgba(255,255,255,0.7); }

      .vx-badge {
        display:inline-flex;align-items:center;justify-content:center;
        padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.04em;
        line-height:1.6;
      }
      .vx-badge-primary { background:rgba(0,245,255,0.15);color:var(--vx-primary,#00f5ff); }
      .vx-badge-secondary { background:rgba(255,0,110,0.15);color:var(--vx-secondary,#ff006e); }
      .vx-badge-success { background:rgba(0,255,136,0.15);color:#00ff88; }
      .vx-badge-warning { background:rgba(255,230,0,0.15);color:#ffe600; }
      .vx-badge-danger  { background:rgba(255,0,110,0.15);color:#ff4d4f; }
      .vx-badge-dot::before {
        content:'';display:inline-block;width:6px;height:6px;border-radius:50%;
        background:currentColor;margin-right:5px;
      }

      .vx-alert {
        padding:14px 18px;border-radius:10px;border:1px solid transparent;
        display:flex;align-items:flex-start;gap:12px;font-size:14px;
        animation:vx-tab-in 0.3s ease;
      }
      .vx-alert-info    { background:rgba(0,245,255,0.06);border-color:rgba(0,245,255,0.2);color:#d0f7ff; }
      .vx-alert-success { background:rgba(0,255,136,0.06);border-color:rgba(0,255,136,0.2);color:#d0ffe8; }
      .vx-alert-warning { background:rgba(255,230,0,0.06);border-color:rgba(255,230,0,0.2);color:#fffbd0; }
      .vx-alert-error   { background:rgba(255,0,110,0.06);border-color:rgba(255,0,110,0.2);color:#ffd0e0; }
      .vx-alert-icon { font-size:18px;flex-shrink:0; }
      .vx-alert-close { margin-left:auto;background:none;border:none;cursor:pointer;opacity:0.5;font-size:16px;color:inherit;padding:0; }
      .vx-alert-close:hover { opacity:1; }

      .vx-chip {
        display:inline-flex;align-items:center;gap:6px;
        padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;
        background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);
        color:var(--vx-text,#e2e8f0);cursor:default;transition:all 0.2s;
      }
      .vx-chip:hover { background:rgba(0,245,255,0.1);border-color:rgba(0,245,255,0.3); }
      .vx-chip-remove { background:none;border:none;cursor:pointer;opacity:0.5;font-size:14px;padding:0;color:inherit;line-height:1; }
      .vx-chip-remove:hover { opacity:1; }

      .vx-divider {
        display:flex;align-items:center;gap:12px;color:rgba(255,255,255,0.3);
        font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;
        margin:16px 0;
      }
      .vx-divider::before,.vx-divider::after {
        content:'';flex:1;height:1px;background:rgba(255,255,255,0.08);
      }
    `;
    document.head.appendChild(s);
  }

  accordion(container, items, options) {
    const opts = Object.assign({ multiple: false, defaultOpen: null }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.className = 'vx-accordion';
    el.innerHTML = '';
    const itemEls = [];
    items.forEach((item, i) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'vx-accordion-item';
      const header = document.createElement('button');
      header.className = 'vx-accordion-header';
      header.innerHTML = `<span>${item.title}</span><span class="vx-accordion-icon">▼</span>`;
      const body = document.createElement('div');
      body.className = 'vx-accordion-body';
      body.innerHTML = typeof item.content === 'string' ? item.content : '';
      itemEl.appendChild(header);
      itemEl.appendChild(body);
      el.appendChild(itemEl);
      itemEls.push({ header, body });
      if (opts.defaultOpen === i) { header.classList.add('vx-open'); body.classList.add('vx-open'); }
      header.addEventListener('click', () => {
        const open = header.classList.contains('vx-open');
        if (!opts.multiple) itemEls.forEach(({ header: h, body: b }) => { h.classList.remove('vx-open'); b.classList.remove('vx-open'); });
        if (!open || opts.multiple) { header.classList.toggle('vx-open', !open); body.classList.toggle('vx-open', !open); }
      });
    });
    return { open: i => { itemEls[i]?.header.classList.add('vx-open'); itemEls[i]?.body.classList.add('vx-open'); },
             close: i => { itemEls[i]?.header.classList.remove('vx-open'); itemEls[i]?.body.classList.remove('vx-open'); } };
  }

  tabs(container, items, options) {
    const opts = Object.assign({ defaultTab: 0 }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.className = 'vx-tabs';
    const tabList = document.createElement('div');
    tabList.className = 'vx-tab-list';
    const panels = [];
    items.forEach((item, i) => {
      const btn = document.createElement('button');
      btn.className = 'vx-tab-btn' + (i === opts.defaultTab ? ' vx-active' : '');
      btn.textContent = item.label;
      const panel = document.createElement('div');
      panel.className = 'vx-tab-panel' + (i === opts.defaultTab ? ' vx-active' : '');
      panel.innerHTML = item.content;
      panels.push({ btn, panel });
      btn.addEventListener('click', () => {
        panels.forEach(p => { p.btn.classList.remove('vx-active'); p.panel.classList.remove('vx-active'); });
        btn.classList.add('vx-active');
        panel.classList.add('vx-active');
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
    el.className = 'vx-carousel';
    const track = document.createElement('div');
    track.className = 'vx-carousel-track';
    slides.forEach(slide => {
      const slideEl = document.createElement('div');
      slideEl.className = 'vx-carousel-slide';
      slideEl.innerHTML = typeof slide === 'string' ? slide : slide.content || '';
      track.appendChild(slideEl);
    });
    el.appendChild(track);
    let current = 0;
    const total = slides.length;
    const go = i => {
      current = opts.loop ? ((i % total) + total) % total : VeloxUtils.clamp(i, 0, total - 1);
      track.style.transform = `translateX(-${current * 100}%)`;
      if (dotsContainer) dotsContainer.querySelectorAll('.vx-carousel-dot').forEach((d, j) => d.classList.toggle('vx-active', j === current));
    };
    if (opts.arrows) {
      const prev = document.createElement('button');
      prev.className = 'vx-carousel-btn vx-carousel-prev';
      prev.innerHTML = '‹';
      const next = document.createElement('button');
      next.className = 'vx-carousel-btn vx-carousel-next';
      next.innerHTML = '›';
      prev.addEventListener('click', () => go(current - 1));
      next.addEventListener('click', () => go(current + 1));
      el.appendChild(prev);
      el.appendChild(next);
    }
    let dotsContainer = null;
    if (opts.dots) {
      dotsContainer = document.createElement('div');
      dotsContainer.className = 'vx-carousel-dots';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'vx-carousel-dot' + (i === 0 ? ' vx-active' : '');
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
    el.className = 'vx-stepper';
    steps.forEach((step, i) => {
      const stepEl = document.createElement('div');
      const label = typeof step === 'string' ? step : step.label;
      stepEl.className = 'vx-step' + (i < opts.current ? ' vx-done' : i === opts.current ? ' vx-active' : '');
      stepEl.innerHTML = `<div class="vx-step-circle">${i < opts.current ? '✓' : i + 1}</div><div class="vx-step-label">${label}</div>`;
      el.appendChild(stepEl);
    });
    return {
      setStep: i => {
        el.querySelectorAll('.vx-step').forEach((s, j) => {
          s.classList.toggle('vx-done', j < i);
          s.classList.toggle('vx-active', j === i);
          s.classList.remove(...(j >= i ? ['vx-done'] : []));
          s.querySelector('.vx-step-circle').textContent = j < i ? '✓' : j + 1;
        });
      }
    };
  }

  badge(container, text, type) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const b = document.createElement('span');
    b.className = `vx-badge vx-badge-${type || 'primary'}`;
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
    a.className = `vx-alert vx-alert-${opts.type}`;
    a.innerHTML = `
      <span class="vx-alert-icon">${opts.icon || icons[opts.type]}</span>
      <div>
        ${opts.title ? `<div style="font-weight:700;margin-bottom:4px">${opts.title}</div>` : ''}
        <div>${opts.message}</div>
      </div>
      ${opts.dismissible ? '<button class="vx-alert-close">✕</button>' : ''}
    `;
    el.appendChild(a);
    a.querySelector('.vx-alert-close')?.addEventListener('click', () => { a.style.opacity = '0'; setTimeout(() => a.remove(), 300); });
    return a;
  }

  chip(container, text, options) {
    const opts = Object.assign({ removable: false, onRemove: null }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const c = document.createElement('div');
    c.className = 'vx-chip';
    c.innerHTML = text + (opts.removable ? '<button class="vx-chip-remove">✕</button>' : '');
    el.appendChild(c);
    if (opts.removable) c.querySelector('.vx-chip-remove').addEventListener('click', () => { c.remove(); if (opts.onRemove) opts.onRemove(); });
    return c;
  }

  divider(container, text) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const d = document.createElement('div');
    d.className = 'vx-divider';
    d.textContent = text || '';
    el.appendChild(d);
    return this;
  }

  _autoDetect() {
    const run = () => {
      VeloxUtils.qsa('[data-vx-accordion]').forEach(el => {
        if (el.dataset.nxAccordionDone) return;
        el.dataset.nxAccordionDone = '1';
        let items;
        try { items = JSON.parse(el.dataset.nxAccordion); } catch { return; }
        this.accordion(el, items);
      });
      VeloxUtils.qsa('[data-vx-tabs]').forEach(el => {
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
if (typeof window !== 'undefined') window.VeloxComponent = componentEngine;
