/**
 * NandanX — advancedUIEngine
 * 3D carousels, physics sliders, virtual scroll, advanced dropdowns, animated modals
 */
class AdvancedUIEngine {
  constructor() {
    this.initialized = false;
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-advui-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-advui-styles';
    s.textContent = `
      /* 3D Carousel */
      .nx-carousel-3d { perspective: 1000px; }
      .nx-carousel-track { transform-style: preserve-3d; position: relative; width: 100%; height: 100%; transition: transform 0.6s cubic-bezier(0.23,1,0.32,1); }
      .nx-carousel-slide { position: absolute; top: 0; left: 0; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 12px; overflow: hidden; }

      /* Physics Slider */
      .nx-slider { position: relative; user-select: none; }
      .nx-slider-track { height: 6px; background: var(--nx-surface, rgba(255,255,255,0.07)); border-radius: 6px; position: relative; cursor: pointer; }
      .nx-slider-fill { height: 100%; background: var(--nx-primary, #00f5ff); border-radius: 6px; transition: width 0.05s; box-shadow: 0 0 8px var(--nx-glow, rgba(0,245,255,0.4)); }
      .nx-slider-thumb { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; border-radius: 50%; background: var(--nx-primary, #00f5ff); box-shadow: 0 0 12px var(--nx-glow, rgba(0,245,255,0.5)); cursor: grab; transition: transform 0.2s ease; }
      .nx-slider-thumb:active { cursor: grabbing; transform: translate(-50%, -50%) scale(1.3); }
      .nx-slider-value { font-size: 12px; font-family: monospace; color: var(--nx-primary, #00f5ff); margin-top: 8px; text-align: center; }

      /* Virtual Scroll */
      .nx-virtual-scroll { overflow-y: auto; position: relative; }
      .nx-virtual-scroll::-webkit-scrollbar { width: 4px; }
      .nx-virtual-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      .nx-virtual-viewport { position: relative; }
      .nx-virtual-content { position: absolute; top: 0; left: 0; width: 100%; }

      /* Advanced Dropdown */
      .nx-dropdown { position: relative; display: inline-block; }
      .nx-dropdown-menu { position: absolute; top: calc(100% + 8px); left: 0; min-width: 200px; background: var(--nx-bg-2, #1a1a2e); border: 1px solid var(--nx-border, rgba(255,255,255,0.08)); border-radius: 12px; overflow: hidden; z-index: 1000; transform-origin: top; transform: scaleY(0); opacity: 0; transition: transform 0.2s cubic-bezier(0.23,1,0.32,1), opacity 0.2s ease; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
      .nx-dropdown-menu.nx-open { transform: scaleY(1); opacity: 1; }
      .nx-dropdown-item { padding: 10px 16px; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.15s; color: var(--nx-text, #e2e8f0); }
      .nx-dropdown-item:hover { background: var(--nx-surface, rgba(255,255,255,0.05)); }
      .nx-dropdown-item.nx-active { color: var(--nx-primary, #00f5ff); }
      .nx-dropdown-divider { height: 1px; background: var(--nx-border, rgba(255,255,255,0.06)); margin: 4px 0; }
      .nx-dropdown-search { padding: 10px 14px; border-bottom: 1px solid var(--nx-border, rgba(255,255,255,0.06)); }
      .nx-dropdown-search input { width: 100%; background: transparent; border: none; outline: none; font-size: 13px; color: var(--nx-text, #e2e8f0); }

      /* Animated Tabs */
      .nx-adv-tabs { position: relative; }
      .nx-adv-tab-bar { display: flex; position: relative; border-bottom: 1px solid var(--nx-border, rgba(255,255,255,0.08)); }
      .nx-adv-tab-btn { padding: 10px 20px; cursor: pointer; font-size: 14px; font-weight: 500; color: var(--nx-text-muted, rgba(226,232,240,0.5)); transition: color 0.2s; border: none; background: transparent; font-family: inherit; }
      .nx-adv-tab-btn.nx-active { color: var(--nx-primary, #00f5ff); }
      .nx-adv-tab-indicator { position: absolute; bottom: -1px; height: 2px; background: var(--nx-primary, #00f5ff); transition: left 0.3s cubic-bezier(0.23,1,0.32,1), width 0.3s cubic-bezier(0.23,1,0.32,1); box-shadow: 0 0 8px var(--nx-glow, rgba(0,245,255,0.5)); }
      .nx-adv-panel { display: none; animation: nx-panel-in 0.25s ease; }
      .nx-adv-panel.nx-active { display: block; }
      @keyframes nx-panel-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

      /* Accordion */
      .nx-accordion-item { border-bottom: 1px solid var(--nx-border, rgba(255,255,255,0.06)); }
      .nx-accordion-header { padding: 16px 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 15px; font-weight: 500; transition: color 0.2s; user-select: none; }
      .nx-accordion-header:hover { color: var(--nx-primary, #00f5ff); }
      .nx-accordion-icon { transition: transform 0.3s ease; }
      .nx-accordion-item.nx-open .nx-accordion-icon { transform: rotate(180deg); }
      .nx-accordion-body { max-height: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0.23,1,0.32,1); }
      .nx-accordion-inner { padding: 0 20px 16px; font-size: 14px; color: var(--nx-text-muted, rgba(226,232,240,0.6)); line-height: 1.7; }

      /* Rating */
      .nx-rating { display: flex; gap: 4px; cursor: pointer; }
      .nx-star { font-size: 24px; color: rgba(255,255,255,0.2); transition: transform 0.15s ease, color 0.15s ease; }
      .nx-star.nx-active { color: #eab308; }
      .nx-star:hover { transform: scale(1.2); }
    `;
    document.head.appendChild(s);
  }

  _autoDetect() {
    document.querySelectorAll('[data-nx-carousel]').forEach(el => this.carousel3D(el));
    document.querySelectorAll('[data-nx-slider]').forEach(el => {
      const opts = { min: parseFloat(el.dataset.min || 0), max: parseFloat(el.dataset.max || 100), value: parseFloat(el.dataset.value || 50) };
      this.slider(el, opts);
    });
    document.querySelectorAll('[data-nx-accordion]').forEach(el => this.accordion(el));
    document.querySelectorAll('[data-nx-dropdown]').forEach(el => this.dropdown(el));
    document.querySelectorAll('[data-nx-tabs]').forEach(el => this.tabs(el));
  }

  // 3D coverflow carousel
  carousel3D(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('nx-carousel-3d');
    const slides = Array.from(el.children);
    if (!slides.length) return this;

    const track = document.createElement('div');
    track.className = 'nx-carousel-track';
    slides.forEach(slide => { slide.classList.add('nx-carousel-slide'); track.appendChild(slide); });
    el.appendChild(track);

    let current = 0;
    const total = slides.length;
    const gap = options.gap || 300;

    const update = () => {
      slides.forEach((slide, i) => {
        const offset = i - current;
        const tx = offset * gap;
        const tz = -Math.abs(offset) * 100;
        const ry = offset * (options.rotateY || 30);
        const opacity = 1 - Math.abs(offset) * 0.3;
        const scale = 1 - Math.abs(offset) * 0.1;
        slide.style.cssText = `transform: translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${scale}); opacity:${opacity}; z-index:${total - Math.abs(offset)};`;
        slide.style.transition = 'all 0.5s cubic-bezier(0.23,1,0.32,1)';
      });
    };
    update();

    const prev = () => { current = (current - 1 + total) % total; update(); };
    const next = () => { current = (current + 1) % total; update(); };

    // Auto-add nav if not present
    if (options.nav !== false) {
      const prevBtn = document.createElement('button');
      prevBtn.innerHTML = '‹';
      prevBtn.style.cssText = 'position:absolute;left:10px;top:50%;transform:translateY(-50%);z-index:100;background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:24px;padding:8px 12px;border-radius:8px;cursor:pointer;';
      const nextBtn = document.createElement('button');
      nextBtn.innerHTML = '›';
      nextBtn.style.cssText = prevBtn.style.cssText + 'left:auto;right:10px;';
      prevBtn.addEventListener('click', prev);
      nextBtn.addEventListener('click', next);
      el.style.position = 'relative';
      el.appendChild(prevBtn);
      el.appendChild(nextBtn);
    }

    // Swipe
    let startX = 0;
    el.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
    el.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    });

    if (options.autoplay) setInterval(next, options.autoplay);
    return { prev, next, goTo: (i) => { current = i; update(); } };
  }

  // Physics-based range slider
  slider(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('nx-slider');
    const min = options.min || 0, max = options.max || 100;
    let value = options.value || min;

    el.innerHTML = `<div class="nx-slider-track"><div class="nx-slider-fill"></div><div class="nx-slider-thumb"></div></div>${options.showValue !== false ? '<div class="nx-slider-value">' + value + '</div>' : ''}`;

    const track = el.querySelector('.nx-slider-track');
    const fill = el.querySelector('.nx-slider-fill');
    const thumb = el.querySelector('.nx-slider-thumb');
    const label = el.querySelector('.nx-slider-value');

    let vx = 0, isDragging = false, targetPct = 0;

    const setPct = (pct) => {
      pct = Math.max(0, Math.min(1, pct));
      targetPct = pct;
    };

    const getVal = (pct) => Math.round(min + (max - min) * pct);

    // Physics spring update
    let currentPct = (value - min) / (max - min);
    const physics = () => {
      const spring = 0.18, damping = 0.7;
      vx = vx * damping + (targetPct - currentPct) * spring;
      currentPct += vx;
      currentPct = Math.max(0, Math.min(1, currentPct));
      fill.style.width = `${currentPct * 100}%`;
      thumb.style.left = `${currentPct * 100}%`;
      value = getVal(currentPct);
      if (label) label.textContent = (options.prefix || '') + value + (options.suffix || '');
      if (options.onChange) options.onChange(value);
      requestAnimationFrame(physics);
    };
    targetPct = currentPct;
    physics();

    const setFromEvent = (e) => {
      const rect = track.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      setPct(x / rect.width);
    };

    track.addEventListener('mousedown', (e) => { isDragging = true; setFromEvent(e); });
    document.addEventListener('mousemove', (e) => { if (isDragging) setFromEvent(e); });
    document.addEventListener('mouseup', () => { isDragging = false; });
    track.addEventListener('touchstart', (e) => { isDragging = true; setFromEvent(e); }, { passive: true });
    document.addEventListener('touchmove', (e) => { if (isDragging) setFromEvent(e); }, { passive: true });
    document.addEventListener('touchend', () => { isDragging = false; });

    return { getValue: () => value, setValue: (v) => setPct((v - min) / (max - min)) };
  }

  // Virtual scroll (no lag for huge lists)
  virtualScroll(container, items, renderItem, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    const itemH = options.itemHeight || 60;
    const buffer = options.buffer || 5;
    el.classList.add('nx-virtual-scroll');

    const viewport = document.createElement('div');
    viewport.className = 'nx-virtual-viewport';
    viewport.style.height = `${items.length * itemH}px`;
    const content = document.createElement('div');
    content.className = 'nx-virtual-content';
    viewport.appendChild(content);
    el.appendChild(viewport);

    const render = () => {
      const scrollTop = el.scrollTop;
      const start = Math.max(0, Math.floor(scrollTop / itemH) - buffer);
      const end = Math.min(items.length, Math.ceil((scrollTop + el.clientHeight) / itemH) + buffer);
      content.style.top = `${start * itemH}px`;
      content.innerHTML = '';
      for (let i = start; i < end; i++) {
        const itemEl = renderItem(items[i], i);
        itemEl.style.height = itemH + 'px';
        content.appendChild(itemEl);
      }
    };

    el.addEventListener('scroll', render, { passive: true });
    render();
    return { refresh: render, scrollTo: (idx) => { el.scrollTop = idx * itemH; } };
  }

  // Advanced dropdown with search
  dropdown(trigger, options = {}) {
    const btn = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
    if (!btn) return this;

    const wrap = document.createElement('div');
    wrap.className = 'nx-dropdown';
    btn.parentNode.insertBefore(wrap, btn);
    wrap.appendChild(btn);

    const menu = document.createElement('div');
    menu.className = 'nx-dropdown-menu';

    if (options.search) {
      const searchWrap = document.createElement('div');
      searchWrap.className = 'nx-dropdown-search';
      const searchInput = document.createElement('input');
      searchInput.placeholder = 'Search...';
      searchWrap.appendChild(searchInput);
      menu.appendChild(searchWrap);
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase();
        menu.querySelectorAll('.nx-dropdown-item').forEach(item => {
          item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      });
    }

    (options.items || []).forEach(item => {
      if (item === 'divider') {
        const d = document.createElement('div');
        d.className = 'nx-dropdown-divider';
        menu.appendChild(d);
        return;
      }
      const el = document.createElement('div');
      el.className = 'nx-dropdown-item';
      el.innerHTML = (item.icon ? `<span>${item.icon}</span>` : '') + `<span>${item.label}</span>`;
      el.addEventListener('click', () => {
        menu.querySelectorAll('.nx-dropdown-item').forEach(i => i.classList.remove('nx-active'));
        el.classList.add('nx-active');
        if (options.onSelect) options.onSelect(item);
        menu.classList.remove('nx-open');
        btn.textContent = (item.icon ? item.icon + ' ' : '') + item.label;
      });
      menu.appendChild(el);
    });

    wrap.appendChild(menu);
    btn.addEventListener('click', (e) => { e.stopPropagation(); menu.classList.toggle('nx-open'); });
    document.addEventListener('click', () => menu.classList.remove('nx-open'));
    return this;
  }

  // Animated tabs with sliding indicator
  tabs(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('nx-adv-tabs');

    const buttons = el.querySelectorAll('[data-tab-btn]') || [];
    const panels = el.querySelectorAll('[data-tab-panel]') || [];
    const bar = el.querySelector('.nx-adv-tab-bar') || el;
    const indicator = document.createElement('div');
    indicator.className = 'nx-adv-tab-indicator';
    bar.appendChild(indicator);

    const activate = (idx) => {
      buttons.forEach((btn, i) => btn.classList.toggle('nx-active', i === idx));
      panels.forEach((panel, i) => panel.classList.toggle('nx-active', i === idx));
      const activeBtn = buttons[idx];
      if (activeBtn) {
        indicator.style.left = activeBtn.offsetLeft + 'px';
        indicator.style.width = activeBtn.offsetWidth + 'px';
      }
    };

    buttons.forEach((btn, i) => btn.addEventListener('click', () => activate(i)));
    activate(0);
    return { activate };
  }

  // Accordion
  accordion(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const items = el.querySelectorAll('.nx-accordion-item');
    items.forEach(item => {
      const header = item.querySelector('.nx-accordion-header');
      const body = item.querySelector('.nx-accordion-body');
      if (!header || !body) return;
      if (!header.querySelector('.nx-accordion-icon')) {
        const icon = document.createElement('span');
        icon.className = 'nx-accordion-icon';
        icon.textContent = '▾';
        header.appendChild(icon);
      }
      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('nx-open');
        if (!options.multi) items.forEach(i => { i.classList.remove('nx-open'); i.querySelector('.nx-accordion-body').style.maxHeight = '0'; });
        if (!isOpen) {
          item.classList.add('nx-open');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
    return this;
  }

  // Star rating
  rating(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('nx-rating');
    const max = options.max || 5;
    let value = options.value || 0;

    for (let i = 1; i <= max; i++) {
      const star = document.createElement('span');
      star.className = 'nx-star';
      star.textContent = '★';
      star.dataset.value = i;
      star.addEventListener('mouseenter', () => el.querySelectorAll('.nx-star').forEach((s, j) => s.classList.toggle('nx-active', j < i)));
      star.addEventListener('mouseleave', () => el.querySelectorAll('.nx-star').forEach((s, j) => s.classList.toggle('nx-active', j < value)));
      star.addEventListener('click', () => {
        value = i;
        if (options.onChange) options.onChange(value);
      });
      el.appendChild(star);
    }

    el.querySelectorAll('.nx-star').forEach((s, j) => s.classList.toggle('nx-active', j < value));
    return { getValue: () => value };
  }
}

const advancedUIEngine = new AdvancedUIEngine();
