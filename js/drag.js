class DragEngine {
  constructor() {
    this.initialized = false;
    this._draggables = new Map();
    this._dropzones = new Map();
    this._sortables = new Map();
    this._currentDrag = null;
    this._ghost = null;
    this._offset = { x: 0, y: 0 };
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('vx-drag-styles')) return;
    const s = document.createElement('style');
    s.id = 'vx-drag-styles';
    s.textContent = `
      .vx-draggable { cursor:grab;user-select:none;touch-action:none; }
      .vx-draggable:active { cursor:grabbing; }
      .vx-draggable.vx-dragging { opacity:0.4; }
      .vx-drag-ghost {
        position:fixed;pointer-events:none;z-index:999999;
        opacity:0.85;box-shadow:0 8px 30px rgba(0,0,0,0.4);
        transform:rotate(2deg) scale(1.04);
        transition:transform 0.15s ease;
      }
      .vx-dropzone {
        transition:background 0.2s ease,border-color 0.2s ease;
        border:2px dashed transparent;border-radius:10px;
      }
      .vx-dropzone.vx-drag-over {
        background:rgba(0,245,255,0.06);
        border-color:rgba(0,245,255,0.4);
        box-shadow:inset 0 0 20px rgba(0,245,255,0.08);
      }
      .vx-sortable-item { cursor:grab;user-select:none;transition:transform 0.2s ease; }
      .vx-sortable-item.vx-sort-dragging { opacity:0.3;cursor:grabbing; }
      .vx-sort-placeholder {
        border:2px dashed rgba(0,245,255,0.35);border-radius:8px;
        background:rgba(0,245,255,0.04);transition:all 0.15s ease;
      }
      .vx-resize-handle {
        position:absolute;width:10px;height:10px;background:var(--vx-primary,#00f5ff);
        border-radius:50%;opacity:0;transition:opacity 0.2s;cursor:se-resize;z-index:10;
      }
      .vx-resizable:hover .vx-resize-handle { opacity:0.8; }
      .vx-resizable { position:relative;overflow:hidden; }
    `;
    document.head.appendChild(s);
  }

  draggable(target, options) {
    if (!this.initialized) this.init();
    const opts = Object.assign({ axis: 'both', bounds: null, snap: false, snapDistance: 20, onStart: null, onMove: null, onEnd: null }, options || {});
    VeloxUtils.parseSelector(target).forEach(el => {
      el.classList.add('vx-draggable');
      let startX, startY, elX, elY, dragging = false;
      let origPos = window.getComputedStyle(el).position;
      const onStart = e => {
        e.preventDefault();
        const pt = e.touches ? e.touches[0] : e;
        startX = pt.clientX; startY = pt.clientY;
        const r = el.getBoundingClientRect();
        elX = r.left; elY = r.top;
        dragging = true;
        el.classList.add('vx-dragging');
        if (el.style.position === '' || origPos === 'static') {
          el.style.position = 'relative';
          el.style.left = '0px'; el.style.top = '0px';
        }
        if (opts.onStart) opts.onStart({ el, x: elX, y: elY });
      };
      const onMove = e => {
        if (!dragging) return;
        const pt = e.touches ? e.touches[0] : e;
        let dx = pt.clientX - startX;
        let dy = pt.clientY - startY;
        if (opts.axis === 'x') dy = 0;
        if (opts.axis === 'y') dx = 0;
        const newLeft = parseFloat(el.style.left || 0) + dx;
        const newTop = parseFloat(el.style.top || 0) + dy;
        el.style.left = newLeft + 'px';
        el.style.top = newTop + 'px';
        startX = pt.clientX; startY = pt.clientY;
        this._checkDropzones(el, pt.clientX, pt.clientY);
        if (opts.onMove) opts.onMove({ el, x: newLeft, y: newTop, dx, dy });
      };
      const onEnd = e => {
        if (!dragging) return;
        dragging = false;
        el.classList.remove('vx-dragging');
        this._dropzones.forEach((dz) => dz.el.classList.remove('vx-drag-over'));
        this._tryDrop(el, e);
        if (opts.onEnd) opts.onEnd({ el, x: parseFloat(el.style.left), y: parseFloat(el.style.top) });
      };
      el.addEventListener('mousedown', onStart);
      el.addEventListener('touchstart', onStart, { passive: false });
      document.addEventListener('mousemove', onMove);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchend', onEnd);
      this._draggables.set(el, { opts });
    });
    return this;
  }

  dropzone(target, options) {
    if (!this.initialized) this.init();
    const opts = Object.assign({ accept: null, onDrop: null, onEnter: null, onLeave: null }, options || {});
    VeloxUtils.parseSelector(target).forEach(el => {
      el.classList.add('vx-dropzone');
      this._dropzones.set(el, { el, opts });
    });
    return this;
  }

  _checkDropzones(dragEl, x, y) {
    this._dropzones.forEach(({ el, opts }) => {
      const r = el.getBoundingClientRect();
      const over = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      el.classList.toggle('vx-drag-over', over);
    });
  }

  _tryDrop(dragEl, e) {
    const pt = e.changedTouches ? e.changedTouches[0] : e;
    this._dropzones.forEach(({ el, opts }) => {
      const r = el.getBoundingClientRect();
      if (pt.clientX >= r.left && pt.clientX <= r.right && pt.clientY >= r.top && pt.clientY <= r.bottom) {
        if (opts.onDrop) opts.onDrop({ dragged: dragEl, zone: el });
      }
    });
  }

  sortable(container, options) {
    if (!this.initialized) this.init();
    const opts = Object.assign({ handle: null, onSort: null, animation: 150, ghostClass: 'vx-sort-dragging' }, options || {});
    VeloxUtils.parseSelector(container).forEach(el => {
      el.querySelectorAll(':scope > *').forEach(child => child.classList.add('vx-sortable-item'));
      let dragging = null, placeholder = null;
      const getItems = () => [...el.querySelectorAll('.vx-sortable-item')];
      el.addEventListener('mousedown', e => {
        const item = e.target.closest('.vx-sortable-item');
        if (!item) return;
        if (opts.handle && !e.target.closest(opts.handle)) return;
        e.preventDefault();
        dragging = item;
        dragging.classList.add(opts.ghostClass);
        placeholder = document.createElement('div');
        placeholder.className = 'vx-sort-placeholder';
        placeholder.style.width = item.offsetWidth + 'px';
        placeholder.style.height = item.offsetHeight + 'px';
        item.after(placeholder);
      });
      document.addEventListener('mousemove', e => {
        if (!dragging) return;
        const items = getItems().filter(i => i !== dragging && i !== placeholder);
        const { clientY } = e;
        for (const item of items) {
          const r = item.getBoundingClientRect();
          const mid = r.top + r.height / 2;
          if (clientY < mid) { item.before(placeholder); break; }
          else if (item === items[items.length - 1]) { el.appendChild(placeholder); }
        }
      });
      document.addEventListener('mouseup', () => {
        if (!dragging) return;
        placeholder.replaceWith(dragging);
        dragging.classList.remove(opts.ghostClass);
        if (opts.onSort) opts.onSort({ container: el, order: getItems().map(i => i.dataset.nxId || i.textContent) });
        dragging = null; placeholder = null;
      });
      this._sortables.set(el, { opts });
    });
    return this;
  }

  resizable(target, options) {
    if (!this.initialized) this.init();
    const opts = Object.assign({ minWidth: 80, minHeight: 40, onResize: null }, options || {});
    VeloxUtils.parseSelector(target).forEach(el => {
      el.classList.add('vx-resizable');
      const handle = document.createElement('div');
      handle.className = 'vx-resize-handle';
      handle.style.cssText = 'bottom:-5px;right:-5px;';
      el.appendChild(handle);
      let resizing = false, startX, startY, startW, startH;
      handle.addEventListener('mousedown', e => {
        e.preventDefault(); resizing = true;
        startX = e.clientX; startY = e.clientY;
        startW = el.offsetWidth; startH = el.offsetHeight;
      });
      document.addEventListener('mousemove', e => {
        if (!resizing) return;
        const w = Math.max(opts.minWidth, startW + e.clientX - startX);
        const h = Math.max(opts.minHeight, startH + e.clientY - startY);
        el.style.width = w + 'px'; el.style.height = h + 'px';
        if (opts.onResize) opts.onResize({ el, width: w, height: h });
      });
      document.addEventListener('mouseup', () => { resizing = false; });
    });
    return this;
  }

  freeCanvas(container, options) {
    const opts = Object.assign({ color: '#00f5ff', lineWidth: 3, background: 'transparent' }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.style.position = 'relative';
    const canvas = document.createElement('canvas');
    canvas.width = el.offsetWidth || 400; canvas.height = el.offsetHeight || 300;
    canvas.style.cssText = 'display:block;cursor:crosshair;touch-action:none;';
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (opts.background !== 'transparent') { ctx.fillStyle = opts.background; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    let drawing = false, lastX = 0, lastY = 0;
    const getPos = e => {
      const r = canvas.getBoundingClientRect();
      const pt = e.touches ? e.touches[0] : e;
      return { x: pt.clientX - r.left, y: pt.clientY - r.top };
    };
    canvas.addEventListener('mousedown', e => { drawing = true; const p = getPos(e); lastX = p.x; lastY = p.y; });
    canvas.addEventListener('touchstart', e => { e.preventDefault(); drawing = true; const p = getPos(e); lastX = p.x; lastY = p.y; }, { passive: false });
    canvas.addEventListener('mousemove', e => {
      if (!drawing) return;
      const p = getPos(e);
      ctx.strokeStyle = opts.color; ctx.lineWidth = opts.lineWidth; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(p.x, p.y); ctx.stroke();
      lastX = p.x; lastY = p.y;
    });
    canvas.addEventListener('touchmove', e => { e.preventDefault(); canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY })); }, { passive: false });
    document.addEventListener('mouseup', () => { drawing = false; });
    document.addEventListener('touchend', () => { drawing = false; });
    return {
      clear: () => ctx.clearRect(0, 0, canvas.width, canvas.height),
      setColor: c => { opts.color = c; },
      setSize: s => { opts.lineWidth = s; },
      toDataURL: () => canvas.toDataURL(),
    };
  }
}

var dragEngine = new DragEngine();
if (typeof window !== 'undefined') window.VeloxDrag = dragEngine;
