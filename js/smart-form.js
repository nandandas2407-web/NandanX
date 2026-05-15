/**
 * VeloxUI — smartFormEngine
 * Smart form validation, auto UX, inline errors, password strength, autofill
 */
class SmartFormEngine {
  constructor() {
    this.initialized = false;
    this.forms = new Map();
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('vx-smartform-styles')) return;
    const s = document.createElement('style');
    s.id = 'vx-smartform-styles';
    s.textContent = `
      .vx-field { position: relative; margin-bottom: 20px; }
      .vx-field-input { width: 100%; padding: 12px 16px; background: var(--vx-surface, rgba(255,255,255,0.05)); border: 1.5px solid var(--vx-border, rgba(255,255,255,0.1)); border-radius: 10px; font-size: 14px; color: var(--vx-text, #e2e8f0); outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease; font-family: inherit; }
      .vx-field-input:focus { border-color: var(--vx-primary, #00f5ff); box-shadow: 0 0 0 3px rgba(0,245,255,0.1); }
      .vx-field-label { font-size: 12px; font-weight: 600; color: var(--vx-text-muted, rgba(226,232,240,0.6)); margin-bottom: 6px; display: block; letter-spacing: 0.04em; text-transform: uppercase; transition: color 0.2s; }
      .vx-field.vx-focused .vx-field-label { color: var(--vx-primary, #00f5ff); }
      .vx-field.vx-valid .vx-field-input { border-color: #22c55e; }
      .vx-field.vx-invalid .vx-field-input { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
      .vx-field-error { font-size: 12px; color: #ef4444; margin-top: 5px; display: none; padding-left: 4px; }
      .vx-field.vx-invalid .vx-field-error { display: block; animation: vx-shake-x 0.3s ease; }
      .vx-field-hint { font-size: 11px; color: var(--vx-text-muted, rgba(226,232,240,0.4)); margin-top: 4px; }
      .vx-field-icon { position: absolute; right: 12px; bottom: 13px; font-size: 16px; pointer-events: none; }
      .vx-field.vx-valid .vx-field-icon { color: #22c55e; }
      .vx-field.vx-invalid .vx-field-icon { color: #ef4444; }
      @keyframes vx-shake-x { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }

      /* Password strength */
      .vx-pw-strength { margin-top: 8px; }
      .vx-pw-bar { height: 4px; border-radius: 4px; background: var(--vx-border, rgba(255,255,255,0.08)); overflow: hidden; }
      .vx-pw-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease, background 0.3s ease; width: 0%; }
      .vx-pw-label { font-size: 11px; margin-top: 4px; }

      /* Float label */
      .vx-float-field { position: relative; margin-bottom: 20px; }
      .vx-float-input { width: 100%; padding: 20px 16px 8px; background: var(--vx-surface, rgba(255,255,255,0.05)); border: 1.5px solid var(--vx-border, rgba(255,255,255,0.1)); border-radius: 10px; font-size: 14px; color: var(--vx-text, #e2e8f0); outline: none; transition: border-color 0.2s; font-family: inherit; }
      .vx-float-input:focus { border-color: var(--vx-primary, #00f5ff); }
      .vx-float-label { position: absolute; left: 16px; top: 14px; font-size: 14px; color: var(--vx-text-muted, rgba(226,232,240,0.5)); pointer-events: none; transition: all 0.2s cubic-bezier(0.23,1,0.32,1); }
      .vx-float-input:focus ~ .vx-float-label,
      .vx-float-input:not(:placeholder-shown) ~ .vx-float-label { top: 6px; font-size: 10px; color: var(--vx-primary, #00f5ff); letter-spacing: 0.06em; text-transform: uppercase; font-weight: 600; }

      /* Character counter */
      .vx-char-count { font-size: 11px; text-align: right; color: var(--vx-text-muted, rgba(226,232,240,0.4)); margin-top: 3px; }
      .vx-char-count.vx-over { color: #ef4444; }

      /* Submit button state */
      .vx-submit-btn { position: relative; overflow: hidden; }
      .vx-submit-btn.vx-loading { pointer-events: none; opacity: 0.7; }
      .vx-submit-btn.vx-loading::after { content: ''; position: absolute; right: 14px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.3); border-top-color: rgba(0,0,0,0.8); border-radius: 50%; animation: vx-spin 0.6s linear infinite; }
      @keyframes vx-spin { to { transform: translateY(-50%) rotate(360deg); } }
      .vx-submit-btn.vx-success { background: #22c55e !important; }
    `;
    document.head.appendChild(s);
  }

  _autoDetect() {
    document.querySelectorAll('[data-vx-smartform]').forEach(form => this.enhance(form));
    document.querySelectorAll('[data-vx-float-label]').forEach(wrap => this.floatLabel(wrap));
    document.querySelectorAll('[data-vx-pw-strength]').forEach(input => this.passwordStrength(input));
  }

  // Enhance entire form with validation
  enhance(form, options = {}) {
    const el = typeof form === 'string' ? document.querySelector(form) : form;
    if (!el) return this;
    const rules = options.rules || {};

    el.querySelectorAll('[data-vx-validate]').forEach(input => {
      const r = rules[input.name] || this._parseRules(input.dataset.nxValidate);
      const field = input.closest('.vx-field');
      const errEl = field?.querySelector('.vx-field-error');
      const icon = field?.querySelector('.vx-field-icon');

      input.addEventListener('blur', () => this._validateField(input, r, field, errEl, icon));
      input.addEventListener('input', () => {
        if (field?.classList.contains('vx-invalid')) this._validateField(input, r, field, errEl, icon);
      });
    });

    el.addEventListener('submit', (e) => {
      let valid = true;
      el.querySelectorAll('[data-vx-validate]').forEach(input => {
        const r = rules[input.name] || this._parseRules(input.dataset.nxValidate);
        const field = input.closest('.vx-field');
        const errEl = field?.querySelector('.vx-field-error');
        const icon = field?.querySelector('.vx-field-icon');
        if (!this._validateField(input, r, field, errEl, icon)) valid = false;
      });
      if (!valid) { e.preventDefault(); if (options.onInvalid) options.onInvalid(); }
      else if (options.onValid) {
        e.preventDefault();
        const data = new FormData(el);
        options.onValid(Object.fromEntries(data));
      }
    });

    this.forms.set(el, { rules });
    return this;
  }

  _parseRules(str = '') {
    const rules = {};
    str.split('|').forEach(rule => {
      const [name, val] = rule.split(':');
      rules[name] = val || true;
    });
    return rules;
  }

  _validateField(input, rules, field, errEl, icon) {
    const val = input.value.trim();
    let error = '';

    if (rules.required && !val) error = rules.requiredMsg || 'This field is required';
    else if (rules.email && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) error = 'Invalid email address';
    else if (rules.min && val.length < parseInt(rules.min)) error = `Minimum ${rules.min} characters`;
    else if (rules.max && val.length > parseInt(rules.max)) error = `Maximum ${rules.max} characters`;
    else if (rules.minVal && parseFloat(val) < parseFloat(rules.minVal)) error = `Minimum value is ${rules.minVal}`;
    else if (rules.maxVal && parseFloat(val) > parseFloat(rules.maxVal)) error = `Maximum value is ${rules.maxVal}`;
    else if (rules.pattern && !new RegExp(rules.pattern).test(val)) error = rules.patternMsg || 'Invalid format';
    else if (rules.match) {
      const other = document.querySelector(`[name="${rules.match}"]`);
      if (other && other.value !== input.value) error = `Must match ${rules.match}`;
    }
    else if (rules.url && val && !/^https?:\/\/.+/.test(val)) error = 'Invalid URL';
    else if (rules.phone && val && !/^\+?[\d\s()-]{7,}$/.test(val)) error = 'Invalid phone number';
    else if (rules.number && val && isNaN(Number(val))) error = 'Must be a number';
    else if (rules.custom && typeof rules.custom === 'function') error = rules.custom(val) || '';

    if (field) {
      field.classList.toggle('vx-valid', !error);
      field.classList.toggle('vx-invalid', !!error);
    }
    if (errEl) errEl.textContent = error;
    if (icon) icon.textContent = error ? '✗' : (val ? '✓' : '');
    return !error;
  }

  // Float label input
  floatLabel(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('vx-float-field');
    const input = el.querySelector('input, textarea');
    const label = el.querySelector('label');
    if (!input || !label) return this;
    input.classList.add('vx-float-input');
    input.placeholder = ' ';
    label.classList.add('vx-float-label');
    input.addEventListener('focus', () => el.classList.add('vx-focused'));
    input.addEventListener('blur', () => el.classList.remove('vx-focused'));
    return this;
  }

  // Password strength meter
  passwordStrength(input, options = {}) {
    const el = typeof input === 'string' ? document.querySelector(input) : input;
    if (!el) return this;

    const wrap = document.createElement('div');
    wrap.className = 'vx-pw-strength';
    wrap.innerHTML = '<div class="vx-pw-bar"><div class="vx-pw-fill"></div></div><div class="vx-pw-label"></div>';
    el.parentNode.insertBefore(wrap, el.nextSibling);

    const fill = wrap.querySelector('.vx-pw-fill');
    const label = wrap.querySelector('.vx-pw-label');

    const levels = [
      { min: 0, color: '#ef4444', text: 'Too weak', width: '20%' },
      { min: 20, color: '#f97316', text: 'Weak', width: '40%' },
      { min: 40, color: '#eab308', text: 'Fair', width: '60%' },
      { min: 60, color: '#3b82f6', text: 'Good', width: '80%' },
      { min: 80, color: '#22c55e', text: 'Strong', width: '100%' },
    ];

    el.addEventListener('input', () => {
      const val = el.value;
      let score = 0;
      if (val.length >= 8) score += 20;
      if (val.length >= 12) score += 10;
      if (/[A-Z]/.test(val)) score += 20;
      if (/[0-9]/.test(val)) score += 20;
      if (/[^A-Za-z0-9]/.test(val)) score += 20;
      if (val.length >= 16) score += 10;

      const level = [...levels].reverse().find(l => score >= l.min) || levels[0];
      fill.style.width = level.width;
      fill.style.background = level.color;
      label.textContent = val ? level.text : '';
      label.style.color = level.color;
    });
    return this;
  }

  // Character counter
  charCounter(input, options = {}) {
    const el = typeof input === 'string' ? document.querySelector(input) : input;
    if (!el) return this;
    const max = options.max || parseInt(el.maxLength) || 140;
    const counter = document.createElement('div');
    counter.className = 'vx-char-count';
    counter.textContent = `0/${max}`;
    el.parentNode.insertBefore(counter, el.nextSibling);
    el.addEventListener('input', () => {
      const len = el.value.length;
      counter.textContent = `${len}/${max}`;
      counter.classList.toggle('vx-over', len > max);
    });
    return this;
  }

  // Submit button loading state
  submitState(btn, options = {}) {
    const el = typeof btn === 'string' ? document.querySelector(btn) : btn;
    if (!el) return;
    el.classList.add('vx-submit-btn');
    const original = el.textContent;
    return {
      loading: (text) => { el.classList.add('vx-loading'); el.textContent = text || 'Sending...'; },
      success: (text) => { el.classList.remove('vx-loading'); el.classList.add('vx-success'); el.textContent = text || '✓ Done'; setTimeout(() => { el.classList.remove('vx-success'); el.textContent = original; }, options.resetAfter || 2000); },
      error: (text) => { el.classList.remove('vx-loading'); el.textContent = text || original; },
      reset: () => { el.classList.remove('vx-loading', 'vx-success'); el.textContent = original; },
    };
  }

  // Build a complete form from schema
  build(container, schema, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    el.innerHTML = '';
    const form = document.createElement('form');
    form.setAttribute('novalidate', '');

    schema.forEach(field => {
      const wrap = document.createElement('div');
      wrap.className = 'vx-field';

      const label = document.createElement('label');
      label.className = 'vx-field-label';
      label.textContent = field.label;

      const input = document.createElement(field.type === 'textarea' ? 'textarea' : 'input');
      input.className = 'vx-field-input';
      input.name = field.name;
      input.placeholder = field.placeholder || '';
      if (field.type !== 'textarea') input.type = field.type || 'text';
      if (field.validate) input.dataset.nxValidate = field.validate;

      const err = document.createElement('div');
      err.className = 'vx-field-error';
      err.textContent = field.errorMsg || '';

      const icon = document.createElement('span');
      icon.className = 'vx-field-icon';

      wrap.appendChild(label);
      wrap.appendChild(input);
      wrap.appendChild(icon);
      wrap.appendChild(err);
      if (field.hint) {
        const hint = document.createElement('div');
        hint.className = 'vx-field-hint';
        hint.textContent = field.hint;
        wrap.appendChild(hint);
      }
      form.appendChild(wrap);

      if (field.type === 'password' && field.strength) this.passwordStrength(input);
      if (field.maxChars) this.charCounter(input, { max: field.maxChars });
    });

    if (options.submit) {
      const btn = document.createElement('button');
      btn.type = 'submit';
      btn.className = 'vx-submit-btn';
      btn.textContent = options.submitLabel || 'Submit';
      form.appendChild(btn);
    }

    el.appendChild(form);
    this.enhance(form, options);
    return form;
  }
}

const smartFormEngine = new SmartFormEngine();
