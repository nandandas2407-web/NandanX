/**
 * NandanX — builderEngine
 * Drag & Drop visual builder, resizable panels, snap grid, export
 */
class BuilderEngine {
  constructor() {
    this.initialized = false;
    this.canvas = null;
    this.selected = null;
    this.history = [];
    this.historyIdx = -1;
    this.grid = 8;
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-builder-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-builder-styles';
    s.textContent = `
      .nx-builder { position: relative; overflow: hidden; background: #0d0d1a; }
      .nx-builder-canvas { position: absolute; inset: 0; }
      .nx-builder-grid { background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 24px 24px; }
      .nx-builder-el { position: absolute; cursor: move; user-select: none; box-sizing: border-box; }
      .nx-builder-el.nx-selected { outline: 2px solid #00f5ff; outline-offset: 2px; }
      .nx-resize-handle { position: absolute; width: 8px; height: 8px; background: #00f5ff; border-radius: 2px; z-index: 10; }
      .nx-rh-se { bottom: -4px; right: -4px; cursor: se-resize; }
      .nx-rh-ne { top: -4px; right: -4px; cursor: ne-resize; }
      .nx-rh-sw { bottom: -4px; left: -4px; cursor: sw-resize; }
      .nx-builder-toolbar { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; background: rgba(20,20,35,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 8px 12px; z-index: 100; backdrop-filter: blur(12px); }
      .nx-tool-btn { padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(226,232,240,0.7); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: monospace; }
      .nx-tool-btn:hover, .nx-tool-btn.nx-active { background: rgba(0,245,255,0.1); color: #00f5ff; border-color: rgba(0,245,255,0.3); }
      .nx-builder-props { position: absolute; right: 12px; top: 12px; width: 200px; background: rgba(20,20,35,0.95); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; z-index: 100; backdrop-filter: blur(12px); font-size: 12px; color: rgba(226,232,240,0.7); }
      .nx-prop-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
      .nx-prop-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 3px 8px; color: #e2e8f0; font-size: 11px; width: 80px; outline: none; font-family: monospace; }
    `;
    document.head.appendChild(s);
  }

  create(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.classList.add('nx-builder');
    const canvas = document.createElement('div');
    canvas.className = 'nx-builder-canvas' + (options.grid !== false ? ' nx-builder-grid' : '');
    el.appendChild(canvas);
    this.canvas = canvas;

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'nx-builder-toolbar';
    const tools = [
      { id: 'text', label: '📝 Text', color: '#e2e8f0', bg: 'transparent', border: '1px solid rgba(255,255,255,0.2)', w: 120, h: 40 },
      { id: 'box', label: '⬜ Box', color: 'transparent', bg: 'rgba(0,245,255,0.1)', border: '1px solid #00f5ff', w: 120, h: 80 },
      { id: 'btn', label: '🔲 Button', color: '#000', bg: '#00f5ff', border: 'none', w: 100, h: 36 },
      { id: 'img', label: '🖼 Image', color: 'transparent', bg: '#1a1a2e', border: '2px dashed rgba(255,255,255,0.2)', w: 160, h: 100 },
      { id: 'circle', label: '⭕ Circle', color: 'transparent', bg: 'rgba(124,58,237,0.3)', border: '2px solid #7c3aed', w: 80, h: 80, radius: '50%' },
    ];

    tools.forEach(tool => {
      const btn = document.createElement('button');
      btn.className = 'nx-tool-btn';
      btn.textContent = tool.label;
      btn.addEventListener('click', () => {
        const x = Math.random() * (canvas.offsetWidth - tool.w - 40) + 20;
        const y = Math.random() * (canvas.offsetHeight - tool.h - 40) + 20;
        this.addElement(canvas, { ...tool, x, y });
      });
      toolbar.appendChild(btn);
    });

    // Undo/Redo/Export
    const undoBtn = document.createElement('button');
    undoBtn.className = 'nx-tool-btn';
    undoBtn.textContent = '↩ Undo';
    undoBtn.addEventListener('click', () => this.undo());

    const exportBtn = document.createElement('button');
    exportBtn.className = 'nx-tool-btn';
    exportBtn.textContent = '⬇ Export';
    exportBtn.addEventListener('click', () => this.export(canvas));

    toolbar.appendChild(undoBtn);
    toolbar.appendChild(exportBtn);
    el.appendChild(toolbar);

    // Props panel
    this.propsPanel = document.createElement('div');
    this.propsPanel.className = 'nx-builder-props';
    this.propsPanel.innerHTML = '<div style="font-weight:700;color:#00f5ff;margin-bottom:10px;font-family:monospace;font-size:11px;">PROPERTIES</div><div class="nx-no-sel" style="color:rgba(226,232,240,0.3);font-size:11px;">Select an element</div>';
    el.appendChild(this.propsPanel);

    // Click on canvas deselect
    canvas.addEventListener('click', (e) => {
      if (e.target === canvas) this._deselect();
    });

    return { canvas, addElement: (cfg) => this.addElement(canvas, cfg), export: () => this.export(canvas) };
  }

  addElement(canvas, cfg) {
    const el = document.createElement('div');
    el.className = 'nx-builder-el';
    el.style.cssText = `
      left: ${this._snap(cfg.x || 0)}px;
      top: ${this._snap(cfg.y || 0)}px;
      width: ${cfg.w || 120}px;
      height: ${cfg.h || 60}px;
      background: ${cfg.bg || 'transparent'};
      border: ${cfg.border || 'none'};
      color: ${cfg.color || '#e2e8f0'};
      border-radius: ${cfg.radius || '8px'};
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-family: inherit;
    `;
    el.textContent = cfg.label || cfg.id || 'Element';
    el.contentEditable = true;
    canvas.appendChild(el);

    // Resize handles
    ['se', 'ne', 'sw'].forEach(pos => {
      const handle = document.createElement('div');
      handle.className = `nx-resize-handle nx-rh-${pos}`;
      el.appendChild(handle);
      this._makeResizable(el, handle, pos);
    });

    this._makeDraggable(el, canvas);
    el.addEventListener('click', (e) => { e.stopPropagation(); this._select(el); });
    this._saveHistory(canvas);
    return el;
  }

  _snap(v) { return Math.round(v / this.grid) * this.grid; }

  _makeDraggable(el, canvas) {
    let isDragging = false, ox = 0, oy = 0;
    el.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('nx-resize-handle')) return;
      isDragging = true;
      ox = e.clientX - el.offsetLeft;
      oy = e.clientY - el.offsetTop;
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      el.style.left = this._snap(e.clientX - ox) + 'px';
      el.style.top = this._snap(e.clientY - oy) + 'px';
      this._updateProps(el);
    });
    document.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; this._saveHistory(canvas); } });
  }

  _makeResizable(el, handle, pos) {
    let isResizing = false, sx = 0, sy = 0, sw = 0, sh = 0;
    handle.addEventListener('mousedown', (e) => {
      isResizing = true;
      sx = e.clientX; sy = e.clientY;
      sw = el.offsetWidth; sh = el.offsetHeight;
      e.preventDefault(); e.stopPropagation();
    });
    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (pos.includes('e')) el.style.width = this._snap(Math.max(40, sw + dx)) + 'px';
      if (pos.includes('s')) el.style.height = this._snap(Math.max(20, sh + dy)) + 'px';
      if (pos.includes('n')) { el.style.height = this._snap(Math.max(20, sh - dy)) + 'px'; el.style.top = this._snap(el.offsetTop + dy) + 'px'; }
    });
    document.addEventListener('mouseup', () => { isResizing = false; });
  }

  _select(el) {
    this._deselect();
    this.selected = el;
    el.classList.add('nx-selected');
    this._updateProps(el);
  }

  _deselect() {
    if (this.selected) this.selected.classList.remove('nx-selected');
    this.selected = null;
    if (this.propsPanel) this.propsPanel.innerHTML = '<div style="font-weight:700;color:#00f5ff;margin-bottom:10px;font-family:monospace;font-size:11px;">PROPERTIES</div><div style="color:rgba(226,232,240,0.3);font-size:11px;">Select an element</div>';
  }

  _updateProps(el) {
    if (!this.propsPanel || this.selected !== el) return;
    this.propsPanel.innerHTML = `
      <div style="font-weight:700;color:#00f5ff;margin-bottom:10px;font-family:monospace;font-size:11px;">PROPERTIES</div>
      <div class="nx-prop-row"><span>X</span><input class="nx-prop-input" value="${el.offsetLeft}" onchange="this.closest('.nx-builder').querySelector('.nx-selected').style.left=this.value+'px'"/></div>
      <div class="nx-prop-row"><span>Y</span><input class="nx-prop-input" value="${el.offsetTop}" onchange="this.closest('.nx-builder').querySelector('.nx-selected').style.top=this.value+'px'"/></div>
      <div class="nx-prop-row"><span>W</span><input class="nx-prop-input" value="${el.offsetWidth}" onchange="this.closest('.nx-builder').querySelector('.nx-selected').style.width=this.value+'px'"/></div>
      <div class="nx-prop-row"><span>H</span><input class="nx-prop-input" value="${el.offsetHeight}" onchange="this.closest('.nx-builder').querySelector('.nx-selected').style.height=this.value+'px'"/></div>
      <div class="nx-prop-row"><span>Opacity</span><input class="nx-prop-input" type="number" min="0" max="1" step="0.1" value="${el.style.opacity||1}" onchange="this.closest('.nx-builder').querySelector('.nx-selected').style.opacity=this.value"/></div>
    `;
  }

  _saveHistory(canvas) {
    this.history = this.history.slice(0, this.historyIdx + 1);
    this.history.push(canvas.innerHTML);
    this.historyIdx = this.history.length - 1;
  }

  undo() {
    if (this.historyIdx > 0) {
      this.historyIdx--;
      this.canvas.innerHTML = this.history[this.historyIdx];
    }
  }

  export(canvas) {
    const html = `<div style="position:relative;width:${canvas.offsetWidth}px;height:${canvas.offsetHeight}px;">${canvas.innerHTML}</div>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'nx-builder-export.html';
    a.click();
  }
}

const builderEngine = new BuilderEngine();
