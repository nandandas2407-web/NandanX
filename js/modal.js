class ModalEngine {
  constructor() {
    this.stack = [];
    this.initialized = false;
    this._backdropEl = null;
  }

  init() {
    if (this.initialized) return this;
    this._injectStyles();
    this._autoDetect();
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.closeTop(); });
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-modal-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-modal-styles';
    s.textContent = `
      .nx-backdrop {
        position:fixed;inset:0;z-index:100000;
        background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);
        opacity:0;transition:opacity 0.3s ease;pointer-events:none;
      }
      .nx-backdrop.nx-active { opacity:1;pointer-events:all; }
      .nx-modal {
        position:fixed;z-index:100001;
        background:var(--nx-bg,#0f0f1a);border:1px solid rgba(0,245,255,0.2);
        border-radius:16px;padding:32px;
        box-shadow:0 0 60px rgba(0,245,255,0.1),0 20px 60px rgba(0,0,0,0.5);
        opacity:0;transform:translateY(20px) scale(0.97);
        transition:opacity 0.35s ease,transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
        pointer-events:none;max-width:90vw;max-height:90vh;overflow-y:auto;
        color:var(--nx-text,#e2e8f0);
      }
      .nx-modal.nx-center { top:50%;left:50%;transform:translate(-50%,-50%) scale(0.97); }
      .nx-modal.nx-active { opacity:1;pointer-events:all; }
      .nx-modal.nx-center.nx-active { transform:translate(-50%,-50%) scale(1); }
      .nx-modal-close {
        position:absolute;top:16px;right:16px;
        width:28px;height:28px;border-radius:50%;border:none;
        background:rgba(255,255,255,0.08);color:var(--nx-text,#e2e8f0);
        cursor:pointer;display:flex;align-items:center;justify-content:center;
        font-size:16px;transition:background 0.2s;
      }
      .nx-modal-close:hover { background:rgba(255,0,110,0.3); }
      .nx-drawer {
        position:fixed;z-index:100001;
        background:var(--nx-bg,#0f0f1a);border:1px solid rgba(0,245,255,0.15);
        box-shadow:0 0 40px rgba(0,245,255,0.08);
        opacity:0;transition:opacity 0.35s ease,transform 0.35s cubic-bezier(0.23,1,0.32,1);
        pointer-events:none;overflow-y:auto;padding:24px;
        color:var(--nx-text,#e2e8f0);
      }
      .nx-drawer.nx-right  { top:0;right:0;height:100%;width:min(400px,90vw);transform:translateX(100%); }
      .nx-drawer.nx-left   { top:0;left:0;height:100%;width:min(400px,90vw);transform:translateX(-100%); }
      .nx-drawer.nx-bottom { bottom:0;left:0;right:0;max-height:80vh;transform:translateY(100%);border-radius:20px 20px 0 0; }
      .nx-drawer.nx-top    { top:0;left:0;right:0;max-height:80vh;transform:translateY(-100%);border-radius:0 0 20px 20px; }
      .nx-drawer.nx-active { opacity:1;pointer-events:all;transform:none; }
      .nx-toast-container { position:fixed;z-index:200000;display:flex;flex-direction:column;gap:8px;pointer-events:none; }
      .nx-toast-container.nx-top-right    { top:20px;right:20px;align-items:flex-end; }
      .nx-toast-container.nx-top-left     { top:20px;left:20px;align-items:flex-start; }
      .nx-toast-container.nx-bottom-right { bottom:20px;right:20px;align-items:flex-end; }
      .nx-toast-container.nx-bottom-left  { bottom:20px;left:20px;align-items:flex-start; }
      .nx-toast-container.nx-top-center   { top:20px;left:50%;transform:translateX(-50%);align-items:center; }
      .nx-toast {
        pointer-events:all;min-width:240px;max-width:380px;padding:12px 16px;border-radius:10px;
        background:var(--nx-bg,#0f0f1a);border:1px solid rgba(255,255,255,0.1);
        color:var(--nx-text,#e2e8f0);font-size:14px;
        box-shadow:0 8px 30px rgba(0,0,0,0.4);
        display:flex;align-items:center;gap:10px;
        opacity:0;transform:translateY(-10px) scale(0.95);
        transition:opacity 0.3s ease,transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
      }
      .nx-toast.nx-active { opacity:1;transform:none; }
      .nx-toast.nx-success { border-color:rgba(0,255,136,0.4); }
      .nx-toast.nx-error   { border-color:rgba(255,0,110,0.4); }
      .nx-toast.nx-warning { border-color:rgba(255,230,0,0.4); }
      .nx-toast.nx-info    { border-color:rgba(0,245,255,0.4); }
      .nx-toast-icon { font-size:18px;flex-shrink:0; }
      .nx-toast-body { flex:1; }
      .nx-toast-title { font-weight:700;font-size:13px;margin-bottom:2px; }
      .nx-toast-msg { opacity:0.8;font-size:12px;line-height:1.4; }
      .nx-toast-progress {
        position:absolute;bottom:0;left:0;height:2px;
        background:var(--nx-primary,#00f5ff);border-radius:0 0 10px 10px;
        transition:width linear;
      }
      .nx-tooltip {
        position:absolute;z-index:300000;
        background:rgba(15,15,26,0.95);border:1px solid rgba(0,245,255,0.25);
        color:var(--nx-text,#e2e8f0);font-size:12px;border-radius:6px;
        padding:6px 10px;pointer-events:none;white-space:nowrap;
        opacity:0;transform:translateY(4px);
        transition:opacity 0.2s ease,transform 0.2s ease;
        box-shadow:0 4px 20px rgba(0,0,0,0.4);
      }
      .nx-tooltip.nx-active { opacity:1;transform:translateY(0); }
      .nx-confirm-overlay {
        position:fixed;inset:0;z-index:200001;display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);
        opacity:0;pointer-events:none;transition:opacity 0.25s ease;
      }
      .nx-confirm-overlay.nx-active { opacity:1;pointer-events:all; }
      .nx-confirm-box {
        background:var(--nx-bg,#0f0f1a);border:1px solid rgba(0,245,255,0.25);
        border-radius:16px;padding:32px;min-width:300px;max-width:440px;
        text-align:center;box-shadow:0 0 60px rgba(0,245,255,0.1);
        color:var(--nx-text,#e2e8f0);
        transform:scale(0.9);transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
      }
      .nx-confirm-overlay.nx-active .nx-confirm-box { transform:scale(1); }
      .nx-confirm-title { font-size:20px;font-weight:700;margin-bottom:10px; }
      .nx-confirm-msg { opacity:0.7;font-size:14px;line-height:1.6;margin-bottom:24px; }
      .nx-confirm-actions { display:flex;gap:12px;justify-content:center; }
      .nx-confirm-btn {
        padding:10px 24px;border-radius:8px;border:none;cursor:pointer;
        font-size:14px;font-weight:600;transition:opacity 0.2s,transform 0.2s;
      }
      .nx-confirm-btn:hover { opacity:0.85;transform:scale(1.03); }
      .nx-confirm-ok  { background:var(--nx-primary,#00f5ff);color:#000; }
      .nx-confirm-cancel { background:rgba(255,255,255,0.1);color:var(--nx-text,#e2e8f0); }
    `;
    document.head.appendChild(s);
  }

  _getBackdrop() {
    if (!this._backdropEl) {
      this._backdropEl = document.createElement('div');
      this._backdropEl.className = 'nx-backdrop';
      document.body.appendChild(this._backdropEl);
      this._backdropEl.addEventListener('click', () => this.closeTop());
    }
    return this._backdropEl;
  }

  open(options) {
    const opts = Object.assign({
      content: '', title: '', width: 'auto', position: 'center',
      closeButton: true, backdrop: true, onClose: null
    }, options || {});
    const modal = document.createElement('div');
    modal.className = 'nx-modal nx-center';
    if (opts.width !== 'auto') modal.style.width = opts.width;
    let html = '';
    if (opts.closeButton) html += `<button class="nx-modal-close">✕</button>`;
    if (opts.title) html += `<h3 style="margin:0 0 16px;font-size:20px;font-weight:700">${opts.title}</h3>`;
    html += opts.content;
    modal.innerHTML = html;
    document.body.appendChild(modal);
    if (opts.backdrop) {
      const bd = this._getBackdrop();
      bd.classList.add('nx-active');
    }
    requestAnimationFrame(() => modal.classList.add('nx-active'));
    this.stack.push({ modal, opts });
    modal.querySelector('.nx-modal-close')?.addEventListener('click', () => this.close(modal));
    return modal;
  }

  close(modal) {
    const m = modal || (this.stack.length && this.stack[this.stack.length - 1].modal);
    if (!m) return this;
    m.classList.remove('nx-active');
    setTimeout(() => m.remove(), 350);
    this.stack = this.stack.filter(s => s.modal !== m);
    if (this.stack.length === 0 && this._backdropEl) this._backdropEl.classList.remove('nx-active');
    return this;
  }

  closeTop() {
    if (this.stack.length) this.close(this.stack[this.stack.length - 1].modal);
    return this;
  }

  drawer(options) {
    const opts = Object.assign({ content: '', position: 'right', closeButton: true, backdrop: true }, options || {});
    const drawer = document.createElement('div');
    drawer.className = `nx-drawer nx-${opts.position}`;
    let html = '';
    if (opts.closeButton) html += `<button class="nx-modal-close" style="position:absolute;top:16px;right:16px">✕</button>`;
    if (opts.title) html += `<h3 style="margin:0 0 20px;font-size:18px;font-weight:700">${opts.title}</h3>`;
    html += opts.content;
    drawer.innerHTML = html;
    document.body.appendChild(drawer);
    if (opts.backdrop) this._getBackdrop().classList.add('nx-active');
    requestAnimationFrame(() => drawer.classList.add('nx-active'));
    this.stack.push({ modal: drawer, opts });
    drawer.querySelector('.nx-modal-close')?.addEventListener('click', () => this.close(drawer));
    return drawer;
  }

  toast(message, options) {
    const opts = Object.assign({
      type: 'info', title: '', duration: 3500, position: 'top-right',
      icon: null
    }, options || {});
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    let container = document.querySelector(`.nx-toast-container.nx-${opts.position}`);
    if (!container) {
      container = document.createElement('div');
      container.className = `nx-toast-container nx-${opts.position}`;
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `nx-toast nx-${opts.type}`;
    toast.style.position = 'relative';
    toast.innerHTML = `
      <span class="nx-toast-icon">${opts.icon || icons[opts.type]}</span>
      <div class="nx-toast-body">
        ${opts.title ? `<div class="nx-toast-title">${opts.title}</div>` : ''}
        <div class="nx-toast-msg">${message}</div>
      </div>
      <div class="nx-toast-progress" style="width:100%"></div>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('nx-active'));
    const progress = toast.querySelector('.nx-toast-progress');
    if (progress) {
      progress.style.transition = `width ${opts.duration}ms linear`;
      setTimeout(() => { progress.style.width = '0%'; }, 50);
    }
    const remove = () => {
      toast.classList.remove('nx-active');
      setTimeout(() => toast.remove(), 300);
    };
    const timer = setTimeout(remove, opts.duration);
    toast.addEventListener('click', () => { clearTimeout(timer); remove(); });
    return toast;
  }

  tooltip(target, message, options) {
    const opts = Object.assign({ placement: 'top', offset: 8 }, options || {});
    const tip = document.createElement('div');
    tip.className = 'nx-tooltip';
    tip.textContent = message;
    document.body.appendChild(tip);
    NandanXUtils.parseSelector(target).forEach(el => {
      el.addEventListener('mouseenter', () => {
        const r = el.getBoundingClientRect();
        tip.style.left = (r.left + r.width / 2 - tip.offsetWidth / 2) + 'px';
        tip.style.top = opts.placement === 'top'
          ? (r.top - tip.offsetHeight - opts.offset) + 'px'
          : (r.bottom + opts.offset) + 'px';
        tip.classList.add('nx-active');
      });
      el.addEventListener('mouseleave', () => tip.classList.remove('nx-active'));
    });
    return this;
  }

  confirm(message, options) {
    return new Promise(resolve => {
      const opts = Object.assign({ title: 'Confirm', okText: 'Confirm', cancelText: 'Cancel' }, options || {});
      const overlay = document.createElement('div');
      overlay.className = 'nx-confirm-overlay';
      overlay.innerHTML = `
        <div class="nx-confirm-box">
          <div class="nx-confirm-title">${opts.title}</div>
          <div class="nx-confirm-msg">${message}</div>
          <div class="nx-confirm-actions">
            <button class="nx-confirm-btn nx-confirm-cancel">${opts.cancelText}</button>
            <button class="nx-confirm-btn nx-confirm-ok">${opts.okText}</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('nx-active'));
      const close = val => {
        overlay.classList.remove('nx-active');
        setTimeout(() => overlay.remove(), 300);
        resolve(val);
      };
      overlay.querySelector('.nx-confirm-ok').addEventListener('click', () => close(true));
      overlay.querySelector('.nx-confirm-cancel').addEventListener('click', () => close(false));
      overlay.addEventListener('keydown', e => { if (e.key === 'Enter') close(true); if (e.key === 'Escape') close(false); });
      overlay.focus();
    });
  }

  _autoDetect() {
    const run = () => {
      NandanXUtils.qsa('[data-nx-modal]').forEach(trigger => {
        if (trigger.dataset.nxModalDone) return;
        trigger.dataset.nxModalDone = '1';
        trigger.addEventListener('click', () => {
          const targetSel = trigger.dataset.nxModal;
          const targetEl = document.querySelector(targetSel);
          if (targetEl) this.open({ content: targetEl.innerHTML, title: targetEl.dataset.nxTitle || '' });
        });
      });
      NandanXUtils.qsa('[data-nx-tooltip]').forEach(el => {
        if (el.dataset.nxTooltipDone) return;
        el.dataset.nxTooltipDone = '1';
        this.tooltip(el, el.dataset.nxTooltip);
      });
    };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
  }
}

var modalEngine = new ModalEngine();
if (typeof window !== 'undefined') window.NandanXModal = modalEngine;
