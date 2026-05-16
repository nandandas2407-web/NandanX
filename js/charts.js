class CanvasEngine {
  constructor() {
    this.initialized = false;
    this._charts = new Map();
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-canvas-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-canvas-styles';
    s.textContent = `
      .nx-chart-wrap { position:relative;width:100%;height:100%; }
      .nx-chart-canvas { display:block;width:100%;height:100%; }
      .nx-chart-tooltip {
        position:absolute;pointer-events:none;z-index:1000;
        background:rgba(15,15,26,0.95);border:1px solid rgba(0,245,255,0.25);
        border-radius:8px;padding:8px 12px;font-size:12px;color:#e2e8f0;
        box-shadow:0 4px 20px rgba(0,0,0,0.4);opacity:0;
        transition:opacity 0.15s ease;white-space:nowrap;
      }
    `;
    document.head.appendChild(s);
  }

  _createChart(container, width, height) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.innerHTML = '<div class="nx-chart-wrap"></div>';
    const wrap = el.querySelector('.nx-chart-wrap');
    wrap.style.width = width ? width + 'px' : '100%';
    wrap.style.height = height ? height + 'px' : '100%';
    const canvas = document.createElement('canvas');
    canvas.className = 'nx-chart-canvas';
    const dpr = window.devicePixelRatio || 1;
    const W = wrap.offsetWidth || parseInt(width) || 400;
    const H = wrap.offsetHeight || parseInt(height) || 240;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    wrap.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return this;
    ctx.scale(dpr, dpr);
    const tip = document.createElement('div');
    tip.className = 'nx-chart-tooltip';
    wrap.appendChild(tip);
    return { canvas, ctx, wrap, tip, W, H, dpr };
  }

  lineChart(container, data, options) {
    const opts = Object.assign({
      colors: ['#00f5ff', '#ff006e', '#7c3aed', '#00ff88'],
      lineWidth: 2.5, fill: true, fillOpacity: 0.12,
      animate: true, duration: 1200, grid: true,
      padding: { top: 30, right: 20, bottom: 40, left: 45 },
      pointRadius: 4,
    }, options || {});
    const chart = this._createChart(container, opts.width, opts.height);
    if (!chart) return this;
    const { ctx, W, H, tip } = chart;
    const pad = opts.padding;
    const iW = W - pad.left - pad.right;
    const iH = H - pad.top - pad.bottom;
    // Normalize data: support array, { values, labels }, or { data, labels }
    const rawData = (data && !Array.isArray(data)) ? (data.values || data.data || []) : data;
    if (data && !Array.isArray(data) && data.labels) opts.labels = opts.labels || data.labels;
    const normalized = rawData || [];
    const datasets = Array.isArray(normalized[0]) ? normalized.map((d, i) => ({ values: d, color: opts.colors[i % opts.colors.length] })) : [{ values: normalized, color: opts.colors[0] }];
    const allVals = datasets.flatMap(d => d.values);
    const minV = opts.min !== undefined ? opts.min : Math.min(...allVals) * 0.9;
    const maxV = opts.max !== undefined ? opts.max : Math.max(...allVals) * 1.1;
    const labels = opts.labels || datasets[0].values.map((_, i) => i);
    const xStep = iW / (labels.length - 1 || 1);
    const toX = i => pad.left + i * xStep;
    const toY = v => pad.top + iH - ((v - minV) / (maxV - minV)) * iH;
    const draw = (progress) => {
      ctx.clearRect(0, 0, W, H);
      if (opts.grid) {
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
          const y = pad.top + (iH / 4) * i;
          ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + iW, y); ctx.stroke();
          const val = maxV - ((maxV - minV) / 4) * i;
          ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '10px sans-serif';
          ctx.textAlign = 'right'; ctx.fillText(val.toFixed(0), pad.left - 6, y + 4);
        }
        labels.forEach((l, i) => {
          ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(String(l), toX(i), H - pad.bottom + 16);
        });
      }
      datasets.forEach(({ values, color }) => {
        const count = Math.ceil(values.length * progress);
        if (count < 2) return;
        ctx.strokeStyle = color; ctx.lineWidth = opts.lineWidth;
        ctx.shadowBlur = 8; ctx.shadowColor = color;
        ctx.beginPath();
        values.slice(0, count).forEach((v, i) => {
          i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v));
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
        if (opts.fill) {
          const c2 = NandanXUtils.hexToRgb(color);
          const fillColor = c2 ? `rgba(${c2.r},${c2.g},${c2.b},${opts.fillOpacity})` : color + '1e';
          ctx.lineTo(toX(count - 1), pad.top + iH);
          ctx.lineTo(toX(0), pad.top + iH);
          ctx.closePath();
          ctx.fillStyle = fillColor; ctx.fill();
          ctx.beginPath();
          values.slice(0, count).forEach((v, i) => {
            i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v));
          });
        }
        if (opts.pointRadius > 0) {
          values.slice(0, count).forEach((v, i) => {
            ctx.beginPath();
            ctx.arc(toX(i), toY(v), opts.pointRadius, 0, Math.PI * 2);
            ctx.fillStyle = color; ctx.fill();
          });
        }
      });
    };
    if (opts.animate) NandanXUtils.animate(opts.duration, p => draw(NandanXUtils.easeOutQuart(p)));
    else draw(1);
    this._charts.set(chart.canvas, { type: 'line', draw, datasets, toX, toY, labels, chart, tip });
    return this;
  }

  barChart(container, data, options) {
    const opts = Object.assign({
      colors: ['#00f5ff', '#ff006e', '#7c3aed', '#00ff88'],
      barRadius: 4, gap: 0.25, animate: true, duration: 1000,
      padding: { top: 30, right: 20, bottom: 40, left: 45 },
      horizontal: false,
    }, options || {});
    const chart = this._createChart(container, opts.width, opts.height);
    if (!chart) return this;
    const { ctx, W, H } = chart;
    const pad = opts.padding;
    const iW = W - pad.left - pad.right;
    const iH = H - pad.top - pad.bottom;
    const values = Array.isArray(data) ? data : (data.values || data.data || []);
    if (!Array.isArray(data) && data.labels) opts.labels = opts.labels || data.labels;
    const maxV = values.length ? Math.max(...values) * 1.1 : 1;
    const labels = (Array.isArray(data) ? null : data.labels) || opts.labels || values.map((_, i) => i);
    const colors = data.colors || values.map((_, i) => opts.colors[i % opts.colors.length]);
    const barW = (iW / values.length) * (1 - opts.gap);
    const barGap = (iW / values.length) * opts.gap;
    const toH = v => (v / maxV) * iH;
    const draw = (progress) => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + (iH / 4) * i;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + iW, y); ctx.stroke();
        const val = maxV - (maxV / 4) * i;
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(0), pad.left - 6, y + 4);
      }
      values.forEach((v, i) => {
        const bH = toH(v) * progress;
        const x = pad.left + i * (barW + barGap) + barGap / 2;
        const y = pad.top + iH - bH;
        ctx.fillStyle = colors[i];
        ctx.shadowBlur = 10; ctx.shadowColor = colors[i];
        const r = opts.barRadius;
        ctx.beginPath();
        ctx.moveTo(x + r, y); ctx.lineTo(x + barW - r, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
        ctx.lineTo(x + barW, y + bH); ctx.lineTo(x, y + bH);
        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(String(labels[i]), x + barW / 2, H - pad.bottom + 16);
      });
    };
    if (opts.animate) NandanXUtils.animate(opts.duration, p => draw(NandanXUtils.easeOutQuart(p)));
    else draw(1);
    return this;
  }

  donutChart(container, data, options) {
    const opts = Object.assign({
      colors: ['#00f5ff', '#ff006e', '#7c3aed', '#00ff88', '#ffe600'],
      animate: true, duration: 1200, innerRadius: 0.6, gap: 0.02,
      showLegend: true,
    }, options || {});
    const chart = this._createChart(container, opts.width, opts.height);
    if (!chart) return this;
    const { ctx, W, H } = chart;
    const cx = W / 2, cy = H / 2 - (opts.showLegend ? 20 : 0);
    const outerR = Math.min(cx, cy) * 0.85;
    const innerR = outerR * opts.innerRadius;
    const values = data.values || data;
    const total = values.reduce((a, b) => a + b, 0);
    const labels = data.labels || values.map((_, i) => `Item ${i + 1}`);
    const colors = data.colors || values.map((_, i) => opts.colors[i % opts.colors.length]);
    const slices = values.map((v, i) => ({ value: v, label: labels[i], color: colors[i], angle: (v / total) * Math.PI * 2 }));
    const draw = (progress) => {
      ctx.clearRect(0, 0, W, H);
      let startAngle = -Math.PI / 2;
      slices.forEach(sl => {
        const endAngle = startAngle + sl.angle * progress;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle, endAngle);
        ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = sl.color;
        ctx.shadowBlur = 12; ctx.shadowColor = sl.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        startAngle = endAngle + opts.gap;
      });
      if (opts.showLegend && progress === 1) {
        const itemW = W / slices.length;
        slices.forEach((sl, i) => {
          const x = i * itemW + 8;
          const y = H - 24;
          ctx.fillStyle = sl.color;
          ctx.beginPath(); ctx.arc(x + 6, y + 4, 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left';
          ctx.fillText(`${sl.label} (${((sl.value/total)*100).toFixed(0)}%)`, x + 14, y + 8);
        });
      }
    };
    if (opts.animate) NandanXUtils.animate(opts.duration, p => draw(NandanXUtils.easeOutQuart(p)));
    else draw(1);
    return this;
  }

  areaChart(container, data, options) {
    return this.lineChart(container, data, Object.assign({ fill: true, fillOpacity: 0.2 }, options || {}));
  }

  sparkline(container, data, options) {
    const opts = Object.assign({ color: '#00f5ff', lineWidth: 2, height: 48, fill: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const dpr = window.devicePixelRatio || 1;
    const W = el.offsetWidth || 120;
    const H = opts.height;
    const canvas = document.createElement('canvas');
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px'; canvas.style.display = 'block';
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return this;
    ctx.scale(dpr, dpr);
    const minV = Math.min(...data), maxV = Math.max(...data);
    const toX = i => (i / (data.length - 1)) * W;
    const toY = v => H - ((v - minV) / (maxV - minV || 1)) * H * 0.85 - H * 0.05;
    ctx.strokeStyle = opts.color; ctx.lineWidth = opts.lineWidth;
    ctx.shadowBlur = 6; ctx.shadowColor = opts.color;
    ctx.beginPath();
    data.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.stroke(); ctx.shadowBlur = 0;
    if (opts.fill) {
      const c = NandanXUtils.hexToRgb(opts.color);
      ctx.lineTo(toX(data.length - 1), H); ctx.lineTo(0, H); ctx.closePath();
      ctx.fillStyle = c ? `rgba(${c.r},${c.g},${c.b},0.12)` : opts.color + '1e';
      ctx.fill();
    }
    return this;
  }

  gauge(container, value, options) {
    const opts = Object.assign({
      min: 0, max: 100, color: '#00f5ff', bgColor: 'rgba(255,255,255,0.08)',
      lineWidth: 16, animate: true, label: '', size: 180,
    }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.style.position = 'relative';
    const dpr = window.devicePixelRatio || 1;
    const S = opts.size;
    const canvas = document.createElement('canvas');
    canvas.width = S * dpr; canvas.height = S * dpr;
    canvas.style.width = S + 'px'; canvas.style.height = S + 'px';
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return this;
    ctx.scale(dpr, dpr);
    const cx = S / 2, cy = S / 2, r = S / 2 - opts.lineWidth;
    const startAngle = Math.PI * 0.75, endFull = Math.PI * 2.25;
    const pct = (value - opts.min) / (opts.max - opts.min);
    const draw = p => {
      ctx.clearRect(0, 0, S, S);
      ctx.beginPath(); ctx.arc(cx, cy, r, startAngle, endFull);
      ctx.strokeStyle = opts.bgColor; ctx.lineWidth = opts.lineWidth; ctx.lineCap = 'round'; ctx.stroke();
      const endAngle = startAngle + (endFull - startAngle) * p;
      ctx.beginPath(); ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.strokeStyle = opts.color; ctx.shadowBlur = 12; ctx.shadowColor = opts.color; ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#e2e8f0'; ctx.textAlign = 'center'; ctx.font = `bold ${S * 0.2}px sans-serif`;
      ctx.fillText(Math.round(value * p) + (opts.suffix || ''), cx, cy + 8);
      if (opts.label) {
        ctx.font = `${S * 0.08}px sans-serif`; ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText(opts.label, cx, cy + S * 0.18);
      }
    };
    if (opts.animate) NandanXUtils.animate(1200, p => draw(NandanXUtils.easeOutQuart(p)));
    else draw(1);
    return this;
  }
}

var canvasEngine = new CanvasEngine();
if (typeof window !== 'undefined') window.NandanXCanvas = canvasEngine;
