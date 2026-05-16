class LayoutEngine {
  constructor() {
    this.initialized = false;
    this._observers = new Map();
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-layout-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-layout-styles';
    s.textContent = `
      .nx-masonry { position:relative; }
      .nx-masonry-col { position:absolute;top:0; }
      .nx-masonry-item { margin-bottom:16px; }
      .nx-grid { display:grid;gap:16px; }
      .nx-flex-center { display:flex;align-items:center;justify-content:center; }
      .nx-flex-between { display:flex;align-items:center;justify-content:space-between; }
      .nx-flex-col { display:flex;flex-direction:column; }
      .nx-sticky-header { position:sticky;top:0;z-index:100; }
      .nx-split { display:grid;grid-template-columns:1fr 1fr;gap:20px; }
      .nx-split-3 { display:grid;grid-template-columns:repeat(3,1fr);gap:20px; }
      .nx-split-4 { display:grid;grid-template-columns:repeat(4,1fr);gap:20px; }
      @media(max-width:768px){.nx-split,.nx-split-3,.nx-split-4{grid-template-columns:1fr;}}
      .nx-aspect-16-9 { aspect-ratio:16/9; }
      .nx-aspect-square { aspect-ratio:1; }
      .nx-aspect-4-3 { aspect-ratio:4/3; }
      .nx-scroll-snap { scroll-snap-type:y mandatory;overflow-y:scroll;height:100vh; }
      .nx-scroll-snap-item { scroll-snap-align:start;height:100vh; }
      .nx-container { max-width:1200px;margin:0 auto;padding:0 24px; }
      .nx-container-sm { max-width:768px;margin:0 auto;padding:0 24px; }
      .nx-container-lg { max-width:1440px;margin:0 auto;padding:0 24px; }
      .nx-full-bleed { width:100vw;position:relative;left:50%;transform:translateX(-50%); }
      .nx-sticky-col { position:sticky;top:24px; }
      .nx-card-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px; }
      .nx-infinite-scroll-sentinel { height:1px;margin-top:-1px; }
    `;
    document.head.appendChild(s);
  }

  masonry(container, options) {
    const opts = Object.assign({ columns: 3, gap: 16, responsive: { 768: 2, 480: 1 } }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('nx-masonry');
    const items = [...el.children];
    items.forEach(item => item.classList.add('nx-masonry-item'));
    const layout = () => {
      const w = el.offsetWidth;
      let cols = opts.columns;
      Object.entries(opts.responsive || {}).sort(([a], [b]) => b - a).forEach(([bp, c]) => { if (w <= parseInt(bp)) cols = c; });
      const colW = (w - opts.gap * (cols - 1)) / cols;
      const colHeights = Array(cols).fill(0);
      items.forEach(item => {
        const minIdx = colHeights.indexOf(Math.min(...colHeights));
        item.style.position = 'absolute';
        item.style.width = colW + 'px';
        item.style.left = (minIdx * (colW + opts.gap)) + 'px';
        item.style.top = colHeights[minIdx] + 'px';
        colHeights[minIdx] += item.offsetHeight + opts.gap;
      });
      el.style.height = Math.max(...colHeights) + 'px';
    };
    layout();
    const ro = new ResizeObserver(NandanXUtils.debounce(layout, 100));
    ro.observe(el);
    this._observers.set(el, ro);
    return { relayout: layout, destroy: () => ro.disconnect() };
  }

  grid(container, options) {
    const opts = Object.assign({ cols: 3, gap: 16, minItemWidth: 280, responsive: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('nx-grid');
    if (opts.responsive) el.style.gridTemplateColumns = `repeat(auto-fill, minmax(${opts.minItemWidth}px, 1fr))`;
    else el.style.gridTemplateColumns = `repeat(${opts.cols}, 1fr)`;
    el.style.gap = opts.gap + 'px';
    return this;
  }

  equalHeights(container, selector) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const items = el.querySelectorAll(selector || ':scope > *');
    const reset = () => { items.forEach(i => { i.style.height = ''; }); };
    const equalize = () => {
      reset();
      const maxH = Math.max(...[...items].map(i => i.offsetHeight));
      items.forEach(i => { i.style.height = maxH + 'px'; });
    };
    equalize();
    window.addEventListener('resize', NandanXUtils.debounce(equalize, 200));
    return this;
  }

  stickyHeader(target, options) {
    const opts = Object.assign({ threshold: 10, shadowOnScroll: true, hideOnDown: false, showOnUp: false }, options || {});
    NandanXUtils.parseSelector(target).forEach(el => {
      el.classList.add('nx-sticky-header');
      let lastScrollY = window.scrollY;
      window.addEventListener('scroll', NandanXUtils.throttle(() => {
        const currentY = window.scrollY;
        if (opts.shadowOnScroll) el.style.boxShadow = currentY > opts.threshold ? '0 4px 30px rgba(0,0,0,0.2)' : '';
        if (opts.hideOnDown || opts.showOnUp) {
          if (currentY > lastScrollY && currentY > opts.threshold) el.style.transform = 'translateY(-100%)';
          else el.style.transform = '';
          el.style.transition = 'transform 0.3s ease';
        }
        lastScrollY = currentY;
      }, 100), { passive: true });
    });
    return this;
  }

  scrollSnap(container, options) {
    const opts = Object.assign({ direction: 'y', padding: 0 }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.style.scrollSnapType = `${opts.direction} mandatory`;
    el.style.overflow = opts.direction === 'y' ? 'scroll' : 'hidden scroll';
    el.style.height = opts.direction === 'y' ? '100vh' : 'auto';
    [...el.children].forEach(child => {
      child.style.scrollSnapAlign = 'start';
      if (opts.direction === 'y') child.style.minHeight = '100vh';
    });
    return this;
  }

  infiniteScroll(container, options) {
    const opts = Object.assign({ onLoadMore: null, threshold: 200, loadingEl: null }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container || window;
    let loading = false;
    const check = () => {
      if (loading) return;
      const scrollEl = el === window ? document.documentElement : el;
      const distFromBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
      if (distFromBottom < opts.threshold) {
        loading = true;
        if (opts.loadingEl) document.querySelector(opts.loadingEl)?.style && (document.querySelector(opts.loadingEl).style.display = 'block');
        Promise.resolve(opts.onLoadMore && opts.onLoadMore()).then(() => {
          loading = false;
          if (opts.loadingEl) document.querySelector(opts.loadingEl)?.style && (document.querySelector(opts.loadingEl).style.display = 'none');
        });
      }
    };
    el.addEventListener('scroll', NandanXUtils.throttle(check, 200), { passive: true });
    return { refresh: check };
  }

  virtualList(container, options) {
    const opts = Object.assign({ items: [], itemHeight: 48, renderItem: null, overscan: 3 }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el || !opts.renderItem) return null;
    el.style.overflow = 'auto';
    el.style.position = 'relative';
    const total = opts.items.length;
    const inner = document.createElement('div');
    inner.style.height = total * opts.itemHeight + 'px';
    inner.style.position = 'relative';
    el.appendChild(inner);
    const getVisible = () => {
      const scrollTop = el.scrollTop;
      const start = Math.max(0, Math.floor(scrollTop / opts.itemHeight) - opts.overscan);
      const end = Math.min(total - 1, Math.ceil((scrollTop + el.clientHeight) / opts.itemHeight) + opts.overscan);
      return { start, end };
    };
    const rendered = new Map();
    const render = () => {
      const { start, end } = getVisible();
      rendered.forEach((node, i) => { if (i < start || i > end) { node.remove(); rendered.delete(i); } });
      for (let i = start; i <= end; i++) {
        if (rendered.has(i)) continue;
        const node = opts.renderItem(opts.items[i], i);
        node.style.position = 'absolute';
        node.style.top = i * opts.itemHeight + 'px';
        node.style.width = '100%';
        node.style.height = opts.itemHeight + 'px';
        inner.appendChild(node);
        rendered.set(i, node);
      }
    };
    render();
    el.addEventListener('scroll', NandanXUtils.throttle(render, 50), { passive: true });
    return { render, getVisible };
  }

  splitPane(container, options) {
    const opts = Object.assign({ direction: 'horizontal', split: 50, minSize: 80, resizable: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el || el.children.length < 2) return this;
    const [pane1, pane2] = el.children;
    el.style.display = 'flex';
    el.style.flexDirection = opts.direction === 'vertical' ? 'column' : 'row';
    el.style.overflow = 'hidden';
    if (opts.direction === 'horizontal') {
      pane1.style.width = opts.split + '%';
      pane2.style.flex = '1';
    } else {
      pane1.style.height = opts.split + '%';
      pane2.style.flex = '1';
    }
    if (opts.resizable) {
      const divider = document.createElement('div');
      divider.style.cssText = opts.direction === 'horizontal'
        ? 'width:4px;cursor:col-resize;background:rgba(255,255,255,0.08);flex-shrink:0;transition:background 0.2s;'
        : 'height:4px;cursor:row-resize;background:rgba(255,255,255,0.08);flex-shrink:0;transition:background 0.2s;';
      divider.addEventListener('mouseenter', () => { divider.style.background = 'var(--nx-primary,#00f5ff)'; });
      divider.addEventListener('mouseleave', () => { divider.style.background = 'rgba(255,255,255,0.08)'; });
      pane1.after(divider);
      let dragging = false;
      divider.addEventListener('mousedown', e => { dragging = true; e.preventDefault(); });
      document.addEventListener('mousemove', e => {
        if (!dragging) return;
        const r = el.getBoundingClientRect();
        if (opts.direction === 'horizontal') {
          const pct = NandanXUtils.clamp(((e.clientX - r.left) / r.width) * 100, opts.minSize / r.width * 100, 100 - opts.minSize / r.width * 100);
          pane1.style.width = pct + '%';
        } else {
          const pct = NandanXUtils.clamp(((e.clientY - r.top) / r.height) * 100, opts.minSize / r.height * 100, 100 - opts.minSize / r.height * 100);
          pane1.style.height = pct + '%';
        }
      });
      document.addEventListener('mouseup', () => { dragging = false; });
    }
    return this;
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-masonry]').forEach(el => {
        if (el.dataset.nxMasonryDone) return;
        el.dataset.nxMasonryDone = '1';
        let opts;
        try { opts = JSON.parse(el.dataset.nxMasonry); } catch { opts = {}; }
        this.masonry(el, opts);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var layoutEngine = new LayoutEngine();
if (typeof window !== 'undefined') window.NandanXLayout = layoutEngine;
