class FormEngine {
  constructor() {
    this.validators = {};
    this.forms = new Map();
    this.initialized = false;
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._registerBuiltins();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('vx-form-styles')) return;
    const s = document.createElement('style');
    s.id = 'vx-form-styles';
    s.textContent = `
      .vx-field { position:relative; margin-bottom:20px; }
      .vx-input, .vx-textarea, .vx-select {
        width:100%;padding:12px 16px;
        background:rgba(255,255,255,0.04);
        border:1.5px solid rgba(255,255,255,0.1);
        border-radius:10px;color:var(--vx-text,#e2e8f0);font-size:14px;
        outline:none;transition:border-color 0.25s ease,box-shadow 0.25s ease,background 0.25s ease;
        font-family:inherit;
      }
      .vx-input:focus, .vx-textarea:focus, .vx-select:focus {
        border-color:var(--vx-primary,#00f5ff);
        box-shadow:0 0 0 3px rgba(0,245,255,0.12);
        background:rgba(0,245,255,0.03);
      }
      .vx-input.vx-valid   { border-color:rgba(0,255,136,0.6); }
      .vx-input.vx-invalid { border-color:rgba(255,0,110,0.7); }
      .vx-label {
        display:block;margin-bottom:6px;font-size:12px;font-weight:600;
        letter-spacing:0.08em;text-transform:uppercase;
        color:rgba(255,255,255,0.5);transition:color 0.2s;
      }
      .vx-field:focus-within .vx-label { color:var(--vx-primary,#00f5ff); }
      .vx-error-msg {
        font-size:11px;color:#ff006e;margin-top:4px;
        opacity:0;transform:translateY(-4px);
        transition:opacity 0.2s ease,transform 0.2s ease;
      }
      .vx-error-msg.vx-visible { opacity:1;transform:none; }
      .vx-float-label .vx-input { padding-top:20px; }
      .vx-float-label .vx-label {
        position:absolute;top:14px;left:16px;margin:0;
        font-size:14px;text-transform:none;letter-spacing:normal;
        pointer-events:none;transition:all 0.2s ease;
      }
      .vx-float-label .vx-input:focus ~ .vx-label,
      .vx-float-label .vx-input:not(:placeholder-shown) ~ .vx-label {
        top:6px;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;
        color:var(--vx-primary,#00f5ff);
      }
      .vx-btn {
        display:inline-flex;align-items:center;justify-content:center;gap:8px;
        padding:12px 28px;border-radius:10px;border:none;cursor:pointer;
        font-size:14px;font-weight:700;letter-spacing:0.04em;
        transition:opacity 0.2s,transform 0.2s,box-shadow 0.2s;
        font-family:inherit;
      }
      .vx-btn-primary {
        background:var(--vx-primary,#00f5ff);color:#000;
        box-shadow:0 0 20px rgba(0,245,255,0.3);
      }
      .vx-btn-secondary {
        background:transparent;color:var(--vx-primary,#00f5ff);
        border:1.5px solid var(--vx-primary,#00f5ff);
      }
      .vx-btn-danger {
        background:var(--vx-secondary,#ff006e);color:#fff;
        box-shadow:0 0 20px rgba(255,0,110,0.3);
      }
      .vx-btn:hover:not(:disabled) { opacity:0.88;transform:translateY(-2px); }
      .vx-btn:active { transform:scale(0.97); }
      .vx-btn:disabled { opacity:0.4;cursor:not-allowed; }
      .vx-btn.vx-loading { pointer-events:none; }
      .vx-btn.vx-loading::after {
        content:'';display:block;width:14px;height:14px;border-radius:50%;
        border:2px solid transparent;border-top-color:currentColor;
        animation:vx-spin 0.6s linear infinite;
      }
      @keyframes vx-spin { to { transform:rotate(360deg); } }
      .vx-range {
        -webkit-appearance:none;width:100%;height:4px;border-radius:2px;
        background:rgba(255,255,255,0.1);outline:none;cursor:pointer;
      }
      .vx-range::-webkit-slider-thumb {
        -webkit-appearance:none;width:18px;height:18px;border-radius:50%;
        background:var(--vx-primary,#00f5ff);box-shadow:0 0 8px var(--vx-primary,#00f5ff);
        cursor:pointer;transition:transform 0.2s;
      }
      .vx-range::-webkit-slider-thumb:hover { transform:scale(1.2); }
      .vx-toggle {
        display:inline-flex;align-items:center;gap:10px;cursor:pointer;
        user-select:none;
      }
      .vx-toggle-track {
        width:44px;height:24px;border-radius:12px;
        background:rgba(255,255,255,0.15);position:relative;
        transition:background 0.3s ease;
      }
      .vx-toggle-thumb {
        position:absolute;top:3px;left:3px;
        width:18px;height:18px;border-radius:50%;
        background:#fff;transition:left 0.3s cubic-bezier(0.34,1.56,0.64,1),background 0.3s;
      }
      .vx-toggle input:checked + .vx-toggle-track { background:var(--vx-primary,#00f5ff); }
      .vx-toggle input:checked + .vx-toggle-track .vx-toggle-thumb { left:23px;background:#000; }
      .vx-toggle input { display:none; }
      .vx-checkbox-custom {
        display:inline-flex;align-items:center;gap:8px;cursor:pointer;user-select:none;
      }
      .vx-checkbox-box {
        width:18px;height:18px;border-radius:4px;
        border:1.5px solid rgba(255,255,255,0.3);
        display:flex;align-items:center;justify-content:center;
        transition:border-color 0.2s,background 0.2s;
        flex-shrink:0;
      }
      .vx-checkbox-custom input:checked ~ .vx-checkbox-box {
        background:var(--vx-primary,#00f5ff);border-color:var(--vx-primary,#00f5ff);
      }
      .vx-checkbox-custom input:checked ~ .vx-checkbox-box::after {
        content:'✓';font-size:11px;color:#000;font-weight:700;
      }
      .vx-checkbox-custom input { display:none; }
      .vx-select {
        appearance:none;
        background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2300f5ff' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
        background-repeat:no-repeat;background-position:right 14px center;padding-right:36px;
      }
      .vx-progress-ring { display:block; }
      .vx-progress-ring-bg { fill:none;stroke:rgba(255,255,255,0.08); }
      .vx-progress-ring-fill {
        fill:none;stroke:var(--vx-primary,#00f5ff);stroke-linecap:round;
        transition:stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1);
      }
    `;
    document.head.appendChild(s);
  }

  _registerBuiltins() {
    this.addValidator('required', v => !!v.trim(), 'This field is required');
    this.addValidator('email', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Enter a valid email address');
    this.addValidator('minLength', (v, p) => v.length >= p, p => `At least ${p} characters required`);
    this.addValidator('maxLength', (v, p) => v.length <= p, p => `Maximum ${p} characters allowed`);
    this.addValidator('pattern', (v, p) => new RegExp(p).test(v), 'Invalid format');
    this.addValidator('number', v => !isNaN(parseFloat(v)) && isFinite(v), 'Must be a number');
    this.addValidator('url', v => { try { new URL(v); return true; } catch { return false; } }, 'Enter a valid URL');
    this.addValidator('tel', v => /^[+\d\s\-().]{7,20}$/.test(v), 'Enter a valid phone number');
    this.addValidator('min', (v, p) => parseFloat(v) >= p, p => `Minimum value is ${p}`);
    this.addValidator('max', (v, p) => parseFloat(v) <= p, p => `Maximum value is ${p}`);
  }

  addValidator(name, fn, message) {
    this.validators[name] = { fn, message };
    return this;
  }

  validate(input, rules) {
    const val = (input.value || '').trim();
    for (const [rule, param] of Object.entries(rules || {})) {
      if (!this.validators[rule]) continue;
      const { fn, message } = this.validators[rule];
      const valid = fn(val, param);
      if (!valid) {
        const msg = typeof message === 'function' ? message(param) : message;
        return { valid: false, message: msg };
      }
    }
    return { valid: true };
  }

  bindField(input, rules, options) {
    const opts = Object.assign({ inline: true, onValidate: null }, options || {});
    const field = input.closest('.vx-field') || input.parentElement;
    let msgEl = field.querySelector('.vx-error-msg');
    if (!msgEl && opts.inline) {
      msgEl = document.createElement('div');
      msgEl.className = 'vx-error-msg';
      field.appendChild(msgEl);
    }
    const check = () => {
      const result = this.validate(input, rules);
      input.classList.toggle('vx-valid', result.valid);
      input.classList.toggle('vx-invalid', !result.valid);
      if (msgEl) {
        msgEl.textContent = result.valid ? '' : result.message;
        msgEl.classList.toggle('vx-visible', !result.valid);
      }
      if (opts.onValidate) opts.onValidate(result);
      return result.valid;
    };
    input.addEventListener('blur', check);
    input.addEventListener('input', VeloxUtils.debounce(check, 400));
    return check;
  }

  bindForm(form, options) {
    const opts = Object.assign({ onSubmit: null, onError: null }, options || {});
    const formEl = typeof form === 'string' ? document.querySelector(form) : form;
    if (!formEl) return this;
    const fields = new Map();
    formEl.querySelectorAll('[data-vx-rules]').forEach(input => {
      let rules;
      try { rules = JSON.parse(input.dataset.nxRules); } catch { rules = {}; }
      const check = this.bindField(input, rules);
      fields.set(input, check);
    });
    formEl.addEventListener('submit', e => {
      e.preventDefault();
      let allValid = true;
      fields.forEach((check) => { if (!check()) allValid = false; });
      if (allValid && opts.onSubmit) opts.onSubmit(new FormData(formEl));
      if (!allValid && opts.onError) opts.onError();
    });
    this.forms.set(formEl, fields);
    return this;
  }

  floatLabel(input) {
    const field = input.closest('.vx-field') || input.parentElement;
    field.classList.add('vx-float-label');
    input.placeholder = ' ';
    return this;
  }

  toggle(container, options) {
    const opts = Object.assign({ label: '', checked: false, onChange: null }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const id = VeloxUtils.uid();
    el.innerHTML = `
      <label class="vx-toggle">
        <input type="checkbox" id="${id}" ${opts.checked ? 'checked' : ''}>
        <div class="vx-toggle-track"><div class="vx-toggle-thumb"></div></div>
        ${opts.label ? `<span>${opts.label}</span>` : ''}
      </label>
    `;
    const input = el.querySelector('input');
    if (opts.onChange) input.addEventListener('change', () => opts.onChange(input.checked));
    return { get: () => input.checked, set: v => { input.checked = v; } };
  }

  checkbox(container, options) {
    const opts = Object.assign({ label: '', checked: false, onChange: null }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    el.innerHTML = `
      <label class="vx-checkbox-custom">
        <input type="checkbox" ${opts.checked ? 'checked' : ''}>
        <div class="vx-checkbox-box"></div>
        ${opts.label ? `<span>${opts.label}</span>` : ''}
      </label>
    `;
    const input = el.querySelector('input');
    if (opts.onChange) input.addEventListener('change', () => opts.onChange(input.checked));
    return { get: () => input.checked, set: v => { input.checked = v; } };
  }

  progressRing(container, options) {
    const opts = Object.assign({ size: 80, strokeWidth: 6, value: 0, color: '#00f5ff', animate: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const r = (opts.size - opts.strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    el.innerHTML = `
      <svg class="vx-progress-ring" width="${opts.size}" height="${opts.size}" style="--vx-primary:${opts.color}">
        <circle class="vx-progress-ring-bg" cx="${opts.size/2}" cy="${opts.size/2}" r="${r}" stroke-width="${opts.strokeWidth}"/>
        <circle class="vx-progress-ring-fill" cx="${opts.size/2}" cy="${opts.size/2}" r="${r}" stroke-width="${opts.strokeWidth}"
          stroke-dasharray="${circ}" stroke-dashoffset="${circ}" transform="rotate(-90 ${opts.size/2} ${opts.size/2})"/>
      </svg>
    `;
    const fill = el.querySelector('.vx-progress-ring-fill');
    const setValue = v => {
      const offset = circ - (v / 100) * circ;
      fill.style.strokeDashoffset = offset;
    };
    if (opts.animate) {
      const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        setValue(opts.value);
      }, { threshold: 0.3 });
      obs.observe(el);
    } else {
      setValue(opts.value);
    }
    return { setValue };
  }

  button(container, options) {
    const opts = Object.assign({ label: 'Button', type: 'primary', loading: false, disabled: false, onClick: null }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const btn = document.createElement('button');
    btn.className = `vx-btn vx-btn-${opts.type}`;
    btn.textContent = opts.label;
    if (opts.disabled) btn.disabled = true;
    if (opts.loading) btn.classList.add('vx-loading');
    if (opts.onClick) btn.addEventListener('click', opts.onClick);
    el.appendChild(btn);
    return {
      setLoading: v => btn.classList.toggle('vx-loading', v),
      setDisabled: v => { btn.disabled = v; },
      setText: v => { btn.textContent = v; },
    };
  }

  _autoDetect() {
    const run = () => {
      VeloxUtils.qsa('[data-vx-form]').forEach(el => {
        if (el.dataset.nxFormDone) return;
        el.dataset.nxFormDone = '1';
        this.bindForm(el);
      });
      VeloxUtils.qsa('.vx-float-label .vx-input').forEach(el => {
        el.placeholder = ' ';
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var formEngine = new FormEngine();
if (typeof window !== 'undefined') window.VeloxForm = formEngine;
