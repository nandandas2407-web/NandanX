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
    if (document.getElementById('nx-form-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-form-styles';
    s.textContent = `
      .nx-field { position:relative; margin-bottom:20px; }
      .nx-input, .nx-textarea, .nx-select {
        width:100%;padding:12px 16px;
        background:rgba(255,255,255,0.04);
        border:1.5px solid rgba(255,255,255,0.1);
        border-radius:10px;color:var(--nx-text,#e2e8f0);font-size:14px;
        outline:none;transition:border-color 0.25s ease,box-shadow 0.25s ease,background 0.25s ease;
        font-family:inherit;
      }
      .nx-input:focus, .nx-textarea:focus, .nx-select:focus {
        border-color:var(--nx-primary,#00f5ff);
        box-shadow:0 0 0 3px rgba(0,245,255,0.12);
        background:rgba(0,245,255,0.03);
      }
      .nx-input.nx-valid   { border-color:rgba(0,255,136,0.6); }
      .nx-input.nx-invalid { border-color:rgba(255,0,110,0.7); }
      .nx-label {
        display:block;margin-bottom:6px;font-size:12px;font-weight:600;
        letter-spacing:0.08em;text-transform:uppercase;
        color:rgba(255,255,255,0.5);transition:color 0.2s;
      }
      .nx-field:focus-within .nx-label { color:var(--nx-primary,#00f5ff); }
      .nx-error-msg {
        font-size:11px;color:#ff006e;margin-top:4px;
        opacity:0;transform:translateY(-4px);
        transition:opacity 0.2s ease,transform 0.2s ease;
      }
      .nx-error-msg.nx-visible { opacity:1;transform:none; }
      .nx-float-label .nx-input { padding-top:20px; }
      .nx-float-label .nx-label {
        position:absolute;top:14px;left:16px;margin:0;
        font-size:14px;text-transform:none;letter-spacing:normal;
        pointer-events:none;transition:all 0.2s ease;
      }
      .nx-float-label .nx-input:focus ~ .nx-label,
      .nx-float-label .nx-input:not(:placeholder-shown) ~ .nx-label {
        top:6px;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;
        color:var(--nx-primary,#00f5ff);
      }
      .nx-btn {
        display:inline-flex;align-items:center;justify-content:center;gap:8px;
        padding:12px 28px;border-radius:10px;border:none;cursor:pointer;
        font-size:14px;font-weight:700;letter-spacing:0.04em;
        transition:opacity 0.2s,transform 0.2s,box-shadow 0.2s;
        font-family:inherit;
      }
      .nx-btn-primary {
        background:var(--nx-primary,#00f5ff);color:#000;
        box-shadow:0 0 20px rgba(0,245,255,0.3);
      }
      .nx-btn-secondary {
        background:transparent;color:var(--nx-primary,#00f5ff);
        border:1.5px solid var(--nx-primary,#00f5ff);
      }
      .nx-btn-danger {
        background:var(--nx-secondary,#ff006e);color:#fff;
        box-shadow:0 0 20px rgba(255,0,110,0.3);
      }
      .nx-btn:hover:not(:disabled) { opacity:0.88;transform:translateY(-2px); }
      .nx-btn:active { transform:scale(0.97); }
      .nx-btn:disabled { opacity:0.4;cursor:not-allowed; }
      .nx-btn.nx-loading { pointer-events:none; }
      .nx-btn.nx-loading::after {
        content:'';display:block;width:14px;height:14px;border-radius:50%;
        border:2px solid transparent;border-top-color:currentColor;
        animation:nx-spin 0.6s linear infinite;
      }
      @keyframes nx-spin { to { transform:rotate(360deg); } }
      .nx-range {
        -webkit-appearance:none;width:100%;height:4px;border-radius:2px;
        background:rgba(255,255,255,0.1);outline:none;cursor:pointer;
      }
      .nx-range::-webkit-slider-thumb {
        -webkit-appearance:none;width:18px;height:18px;border-radius:50%;
        background:var(--nx-primary,#00f5ff);box-shadow:0 0 8px var(--nx-primary,#00f5ff);
        cursor:pointer;transition:transform 0.2s;
      }
      .nx-range::-webkit-slider-thumb:hover { transform:scale(1.2); }
      .nx-toggle {
        display:inline-flex;align-items:center;gap:10px;cursor:pointer;
        user-select:none;
      }
      .nx-toggle-track {
        width:44px;height:24px;border-radius:12px;
        background:rgba(255,255,255,0.15);position:relative;
        transition:background 0.3s ease;
      }
      .nx-toggle-thumb {
        position:absolute;top:3px;left:3px;
        width:18px;height:18px;border-radius:50%;
        background:#fff;transition:left 0.3s cubic-bezier(0.34,1.56,0.64,1),background 0.3s;
      }
      .nx-toggle input:checked + .nx-toggle-track { background:var(--nx-primary,#00f5ff); }
      .nx-toggle input:checked + .nx-toggle-track .nx-toggle-thumb { left:23px;background:#000; }
      .nx-toggle input { display:none; }
      .nx-checkbox-custom {
        display:inline-flex;align-items:center;gap:8px;cursor:pointer;user-select:none;
      }
      .nx-checkbox-box {
        width:18px;height:18px;border-radius:4px;
        border:1.5px solid rgba(255,255,255,0.3);
        display:flex;align-items:center;justify-content:center;
        transition:border-color 0.2s,background 0.2s;
        flex-shrink:0;
      }
      .nx-checkbox-custom input:checked ~ .nx-checkbox-box {
        background:var(--nx-primary,#00f5ff);border-color:var(--nx-primary,#00f5ff);
      }
      .nx-checkbox-custom input:checked ~ .nx-checkbox-box::after {
        content:'✓';font-size:11px;color:#000;font-weight:700;
      }
      .nx-checkbox-custom input { display:none; }
      .nx-select {
        appearance:none;
        background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2300f5ff' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
        background-repeat:no-repeat;background-position:right 14px center;padding-right:36px;
      }
      .nx-progress-ring { display:block; }
      .nx-progress-ring-bg { fill:none;stroke:rgba(255,255,255,0.08); }
      .nx-progress-ring-fill {
        fill:none;stroke:var(--nx-primary,#00f5ff);stroke-linecap:round;
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
    const field = input.closest('.nx-field') || input.parentElement;
    let msgEl = field.querySelector('.nx-error-msg');
    if (!msgEl && opts.inline) {
      msgEl = document.createElement('div');
      msgEl.className = 'nx-error-msg';
      field.appendChild(msgEl);
    }
    const check = () => {
      const result = this.validate(input, rules);
      input.classList.toggle('nx-valid', result.valid);
      input.classList.toggle('nx-invalid', !result.valid);
      if (msgEl) {
        msgEl.textContent = result.valid ? '' : result.message;
        msgEl.classList.toggle('nx-visible', !result.valid);
      }
      if (opts.onValidate) opts.onValidate(result);
      return result.valid;
    };
    input.addEventListener('blur', check);
    input.addEventListener('input', NandanXUtils.debounce(check, 400));
    return check;
  }

  bindForm(form, options) {
    const opts = Object.assign({ onSubmit: null, onError: null }, options || {});
    const formEl = typeof form === 'string' ? document.querySelector(form) : form;
    if (!formEl) return this;
    const fields = new Map();
    formEl.querySelectorAll('[data-nx-rules]').forEach(input => {
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
    const field = input.closest('.nx-field') || input.parentElement;
    field.classList.add('nx-float-label');
    input.placeholder = ' ';
    return this;
  }

  toggle(container, options) {
    const opts = Object.assign({ label: '', checked: false, onChange: null }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const id = NandanXUtils.uid();
    el.innerHTML = `
      <label class="nx-toggle">
        <input type="checkbox" id="${id}" ${opts.checked ? 'checked' : ''}>
        <div class="nx-toggle-track"><div class="nx-toggle-thumb"></div></div>
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
      <label class="nx-checkbox-custom">
        <input type="checkbox" ${opts.checked ? 'checked' : ''}>
        <div class="nx-checkbox-box"></div>
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
      <svg class="nx-progress-ring" width="${opts.size}" height="${opts.size}" style="--nx-primary:${opts.color}">
        <circle class="nx-progress-ring-bg" cx="${opts.size/2}" cy="${opts.size/2}" r="${r}" stroke-width="${opts.strokeWidth}"/>
        <circle class="nx-progress-ring-fill" cx="${opts.size/2}" cy="${opts.size/2}" r="${r}" stroke-width="${opts.strokeWidth}"
          stroke-dasharray="${circ}" stroke-dashoffset="${circ}" transform="rotate(-90 ${opts.size/2} ${opts.size/2})"/>
      </svg>
    `;
    const fill = el.querySelector('.nx-progress-ring-fill');
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
    btn.className = `nx-btn nx-btn-${opts.type}`;
    btn.textContent = opts.label;
    if (opts.disabled) btn.disabled = true;
    if (opts.loading) btn.classList.add('nx-loading');
    if (opts.onClick) btn.addEventListener('click', opts.onClick);
    el.appendChild(btn);
    return {
      setLoading: v => btn.classList.toggle('nx-loading', v),
      setDisabled: v => { btn.disabled = v; },
      setText: v => { btn.textContent = v; },
    };
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-form]').forEach(el => {
        if (el.dataset.nxFormDone) return;
        el.dataset.nxFormDone = '1';
        this.bindForm(el);
      });
      NandanXUtils.qsa('.nx-float-label .nx-input').forEach(el => {
        el.placeholder = ' ';
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var formEngine = new FormEngine();
if (typeof window !== 'undefined') window.NandanXForm = formEngine;
