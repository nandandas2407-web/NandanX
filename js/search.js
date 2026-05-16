class SearchEngine {
  constructor() {
    this.initialized = false;
    this._indexes = new Map();
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-search-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-search-styles';
    s.textContent = `
      .nx-search-wrap { position:relative; }
      .nx-search-input {
        width:100%;padding:12px 16px 12px 42px;
        background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);
        border-radius:10px;color:var(--nx-text,#e2e8f0);font-size:14px;
        outline:none;transition:border-color 0.25s ease,box-shadow 0.25s ease;
        font-family:inherit;
      }
      .nx-search-input:focus {
        border-color:var(--nx-primary,#00f5ff);
        box-shadow:0 0 0 3px rgba(0,245,255,0.1);
      }
      .nx-search-icon {
        position:absolute;left:14px;top:50%;transform:translateY(-50%);
        opacity:0.4;font-size:16px;pointer-events:none;
      }
      .nx-search-clear {
        position:absolute;right:12px;top:50%;transform:translateY(-50%);
        background:none;border:none;cursor:pointer;opacity:0.4;color:inherit;
        font-size:16px;transition:opacity 0.2s;display:none;
      }
      .nx-search-clear:hover { opacity:1; }
      .nx-search-input:not(:placeholder-shown) ~ .nx-search-clear { display:block; }
      .nx-search-results {
        position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:10000;
        background:var(--nx-bg,#0f0f1a);border:1px solid rgba(255,255,255,0.1);
        border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,0.5);
        max-height:320px;overflow-y:auto;overflow-x:hidden;
        opacity:0;transform:translateY(-6px);pointer-events:none;
        transition:opacity 0.2s ease,transform 0.2s ease;
      }
      .nx-search-results.nx-active { opacity:1;transform:none;pointer-events:all; }
      .nx-search-result-item {
        padding:12px 16px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.04);
        font-size:14px;color:var(--nx-text,#e2e8f0);display:flex;align-items:center;gap:10px;
        transition:background 0.15s;
      }
      .nx-search-result-item:last-child { border-bottom:none; }
      .nx-search-result-item:hover, .nx-search-result-item.nx-selected { background:rgba(0,245,255,0.06); }
      .nx-search-result-item mark { background:none;color:var(--nx-primary,#00f5ff);font-weight:700; }
      .nx-search-empty { padding:20px;text-align:center;opacity:0.4;font-size:13px; }
      .nx-filter-bar { display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px; }
      .nx-filter-chip {
        padding:6px 14px;border-radius:20px;border:1.5px solid rgba(255,255,255,0.1);
        background:rgba(255,255,255,0.04);color:rgba(226,232,240,0.7);
        cursor:pointer;font-size:12px;font-weight:600;transition:all 0.2s;
        font-family:inherit;
      }
      .nx-filter-chip:hover { border-color:var(--nx-primary,#00f5ff); }
      .nx-filter-chip.nx-active { background:var(--nx-primary,#00f5ff);color:#000;border-color:transparent; }
      .nx-highlight { background:rgba(0,245,255,0.15);color:var(--nx-primary,#00f5ff);border-radius:2px;padding:0 2px; }
    `;
    document.head.appendChild(s);
  }

  createIndex(name, data, options) {
    const opts = Object.assign({ fields: null, idField: 'id', tokenize: true }, options || {});
    const index = data.map((item, i) => {
      const fields = opts.fields || Object.keys(item);
      const text = fields.map(f => String(item[f] || '')).join(' ');
      const tokens = opts.tokenize ? NandanXUtils.tokenize(text) : [text.toLowerCase()];
      return { id: item[opts.idField] || i, item, text: text.toLowerCase(), tokens };
    });
    this._indexes.set(name, { index, opts });
    return this;
  }

  search(name, query, options) {
    const opts = Object.assign({ limit: 20, fuzzy: false, minScore: 0.3 }, options || {});
    const idx = this._indexes.get(name);
    if (!idx) return [];
    if (!query || !query.trim()) return idx.index.slice(0, opts.limit).map(r => ({ ...r, score: 1 }));
    const q = query.toLowerCase().trim();
    const qTokens = NandanXUtils.tokenize(q);
    const results = idx.index.map(record => {
      let score = 0;
      if (record.text.includes(q)) score += 1;
      qTokens.forEach(t => {
        if (record.text.includes(t)) score += 0.5 / qTokens.length;
        if (opts.fuzzy) record.tokens.forEach(rt => { if (this._fuzzyMatch(t, rt)) score += 0.2 / qTokens.length; });
      });
      return { ...record, score };
    }).filter(r => r.score >= opts.minScore).sort((a, b) => b.score - a.score).slice(0, opts.limit);
    return results;
  }

  _fuzzyMatch(query, target) {
    let qi = 0;
    for (let i = 0; i < target.length && qi < query.length; i++) {
      if (target[i] === query[qi]) qi++;
    }
    return qi === query.length;
  }

  _highlight(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
  }

  liveSearch(container, options) {
    const opts = Object.assign({
      data: [], fields: null, placeholder: 'Search…', onSelect: null,
      onResults: null, debounce: 200, minChars: 1, maxResults: 8,
      renderItem: null, emptyText: 'No results found',
    }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const indexName = 'live-' + NandanXUtils.uid();
    this.createIndex(indexName, opts.data, { fields: opts.fields });
    el.className = 'nx-search-wrap';
    el.innerHTML = `
      <span class="nx-search-icon">⌕</span>
      <input class="nx-search-input" placeholder="${opts.placeholder}" autocomplete="off" type="search">
      <button class="nx-search-clear" aria-label="Clear search">✕</button>
      <div class="nx-search-results"></div>
    `;
    const input = el.querySelector('.nx-search-input');
    const results = el.querySelector('.nx-search-results');
    const clearBtn = el.querySelector('.nx-search-clear');
    let selected = -1;
    const showResults = (items) => {
      if (!items.length) {
        results.innerHTML = `<div class="nx-search-empty">${opts.emptyText}</div>`;
        results.classList.add('nx-active');
        return;
      }
      results.innerHTML = items.map((r, i) => {
        const label = opts.renderItem ? opts.renderItem(r.item, r.score) : this._highlight(r.text.slice(0, 60), input.value);
        return `<div class="nx-search-result-item" data-idx="${i}">${label}</div>`;
      }).join('');
      results.classList.add('nx-active');
      selected = -1;
    };
    const hide = () => { results.classList.remove('nx-active'); selected = -1; };
    input.addEventListener('input', NandanXUtils.debounce(() => {
      const q = input.value.trim();
      if (q.length < opts.minChars) { hide(); return; }
      const found = this.search(indexName, q, { limit: opts.maxResults });
      if (opts.onResults) opts.onResults(found);
      showResults(found);
    }, opts.debounce));
    results.addEventListener('click', e => {
      const item = e.target.closest('.nx-search-result-item');
      if (!item) return;
      const idx = parseInt(item.dataset.idx);
      const q = input.value.trim();
      const found = this.search(indexName, q, { limit: opts.maxResults });
      if (found[idx] && opts.onSelect) opts.onSelect(found[idx].item, found[idx]);
      input.value = '';
      hide();
    });
    input.addEventListener('keydown', e => {
      const items = results.querySelectorAll('.nx-search-result-item');
      if (e.key === 'ArrowDown') { selected = Math.min(selected + 1, items.length - 1); e.preventDefault(); }
      if (e.key === 'ArrowUp') { selected = Math.max(selected - 1, -1); e.preventDefault(); }
      if (e.key === 'Escape') { hide(); input.blur(); }
      items.forEach((el, i) => el.classList.toggle('nx-selected', i === selected));
      if (e.key === 'Enter' && selected >= 0) items[selected].click();
    });
    clearBtn.addEventListener('click', () => { input.value = ''; hide(); input.focus(); });
    document.addEventListener('click', e => { if (!el.contains(e.target)) hide(); });
    return { update: data => { this.createIndex(indexName, data, { fields: opts.fields }); } };
  }

  filterList(container, options) {
    const opts = Object.assign({ filters: [], selector: ':scope > *', field: 'data-category', all: 'All' }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const bar = document.createElement('div');
    bar.className = 'nx-filter-bar';
    const items = [...el.querySelectorAll(opts.selector)];
    const allFilters = ['all', ...opts.filters];
    let active = 'all';
    allFilters.forEach(f => {
      const btn = document.createElement('button');
      btn.className = 'nx-filter-chip' + (f === 'all' ? ' nx-active' : '');
      btn.textContent = f === 'all' ? opts.all : f;
      btn.addEventListener('click', () => {
        active = f;
        bar.querySelectorAll('.nx-filter-chip').forEach(b => b.classList.toggle('nx-active', b.textContent === btn.textContent));
        items.forEach(item => {
          const cat = item.getAttribute(opts.field) || '';
          const show = f === 'all' || cat.includes(f);
          item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          item.style.opacity = show ? '1' : '0';
          item.style.transform = show ? 'scale(1)' : 'scale(0.95)';
          item.style.pointerEvents = show ? '' : 'none';
          setTimeout(() => { item.style.display = show ? '' : 'none'; }, show ? 0 : 300);
        });
      });
      bar.appendChild(btn);
    });
    el.insertBefore(bar, el.firstChild);
    return { filter: f => bar.querySelector(`[data-f="${f}"]`)?.click() };
  }

  highlight(container, query) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el || !query) return this;
    const walk = (node) => {
      if (node.nodeType === 3) {
        const text = node.textContent;
        const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        if (re.test(text)) {
          const span = document.createElement('span');
          span.innerHTML = text.replace(re, '<mark class="nx-highlight">$1</mark>');
          node.replaceWith(span);
        }
      } else if (node.nodeType === 1 && !['SCRIPT', 'STYLE', 'MARK'].includes(node.tagName)) {
        [...node.childNodes].forEach(walk);
      }
    };
    walk(el);
    return this;
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-filter]').forEach(el => {
        if (el.dataset.nxFilterDone) return;
        el.dataset.nxFilterDone = '1';
        let opts;
        try { opts = JSON.parse(el.dataset.nxFilter); } catch { opts = {}; }
        this.filterList(el, opts);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var searchEngine = new SearchEngine();
if (typeof window !== 'undefined') window.NandanXSearch = searchEngine;
