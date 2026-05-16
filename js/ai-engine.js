class AIEngine {
  constructor() {
    this.initialized = false;
    this.modules = {};
    this.enhanced = new WeakSet();
  }

  init(modules) {
    if (this.initialized) return this;
    this.modules = modules || {};
    this._scanDOM();
    this._startObserver();
    this.initialized = true;
    return this;
  }

  _scanDOM() {
    NandanXUtils.qsa('button, [role="button"], .btn, input[type="submit"], input[type="button"]').forEach(el => this._enhanceButton(el));
    NandanXUtils.qsa('.card, [class*="card"], article, .product, .item').forEach(el => this._enhanceCard(el));
    NandanXUtils.qsa('h1, h2, h3').forEach(el => this._enhanceHeading(el));
    NandanXUtils.qsa('img').forEach(el => this._enhanceImage(el));
    NandanXUtils.qsa('section, main, .section, [class*="section"]').forEach(el => this._enhanceSection(el));
  }

  _enhanceButton(el) {
    if (this.enhanced.has(el)) return;
    this.enhanced.add(el);
    const text = el.textContent.toLowerCase();
    const isPrimary = /submit|send|buy|start|get|join|sign|create|launch|try/i.test(text);
    const isDanger = /delete|remove|cancel|destroy|clear/i.test(text);
    if (this.modules.hover) {
      this.modules.hover.lift(el);
      if (isPrimary) this.modules.hover.neon(el, '#00f5ff');
      if (isDanger) this.modules.hover.neon(el, '#ff4444');
      this.modules.hover.bouncyClick && this.modules.hover.bouncyClick(el);
    }
    if (this.modules.physics) this.modules.physics.attachToClicks(el, 'ripple');
  }

  _enhanceCard(el) {
    if (this.enhanced.has(el)) return;
    this.enhanced.add(el);
    if (this.modules.thr3d) this.modules.thr3d.tiltCard(el, { maxAngle: 8, glare: true });
    if (this.modules.hover) this.modules.hover.float(el);
  }

  _enhanceHeading(el) {
    if (this.enhanced.has(el)) return;
    this.enhanced.add(el);
    if (this.modules.scroll) {
      el.classList.add('nx-fade-up');
      scrollEngine.observer && scrollEngine.observer.observe(el);
    }
  }

  _enhanceImage(el) {
    if (this.enhanced.has(el)) return;
    this.enhanced.add(el);
    el.style.transition = 'transform 0.4s ease, filter 0.4s ease';
    el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.04)'; el.style.filter = 'brightness(1.1)'; });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; el.style.filter = ''; });
  }

  _enhanceSection(el) {
    if (this.enhanced.has(el)) return;
    this.enhanced.add(el);
    const children = [...el.children].filter(c => !c.matches('h1,h2,h3,h4,script,style'));
    children.forEach((child, i) => {
      if (!child.classList.contains('nx-fade-up')) {
        child.classList.add('nx-fade-up');
        child.dataset.nxDelay = i * 70;
        if (scrollEngine.observer) scrollEngine.observer.observe(child);
      }
    });
  }

  _startObserver() {
    const obs = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (node.matches('button,[role="button"],.btn')) this._enhanceButton(node);
          if (node.matches('.card,article')) this._enhanceCard(node);
          if (node.matches('h1,h2,h3')) this._enhanceHeading(node);
          if (node.matches('img')) this._enhanceImage(node);
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  analyzeUI(container) {
    const root = container ? (typeof container === 'string' ? NandanXUtils.qs(container) : container) : document.body;
    const issues = [];
    const suggestions = [];
    let score = 100;

    NandanXUtils.qsa('img', root).forEach(img => {
      if (!img.alt) { issues.push({ el: img, type: 'missing-alt', msg: 'Image missing alt text' }); score -= 3; }
    });

    NandanXUtils.qsa('a', root).forEach(a => {
      if (!a.textContent.trim() && !a.getAttribute('aria-label')) {
        issues.push({ el: a, type: 'empty-link', msg: 'Link has no accessible text' }); score -= 4;
      }
    });

    NandanXUtils.qsa('input, textarea, select', root).forEach(input => {
      const id = input.id;
      if (!id || !NandanXUtils.qs(`label[for="${id}"]`)) {
        issues.push({ el: input, type: 'missing-label', msg: 'Form field missing associated label' }); score -= 5;
      }
    });

    NandanXUtils.qsa('p, li, span', root).forEach(el => {
      const cs = window.getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      if (fs < 12) { suggestions.push({ el, msg: 'Font size may be too small for readability' }); score -= 1; }
    });

    if (suggestions.length === 0) suggestions.push({ msg: 'Layout and typography look good.' });

    return { score: Math.max(0, score), issues, suggestions, grade: score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : 'D' };
  }

  pageTransition(type) {
    const overlay = NandanXUtils.create('div', {}, {
      position: 'fixed', inset: '0', zIndex: '999995',
      background: 'linear-gradient(135deg,#00f5ff,#7c3aed)',
      transform: 'scaleX(0)', transformOrigin: 'left',
      pointerEvents: 'none',
    });
    document.body.appendChild(overlay);

    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript')) return;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        overlay.style.transition = 'transform 0.4s cubic-bezier(0.23,1,0.32,1)';
        overlay.style.transform = 'scaleX(1)';
        setTimeout(() => { window.location.href = href; }, 420);
      });
    });

    window.addEventListener('pageshow', () => {
      overlay.style.transformOrigin = 'right';
      overlay.style.transition = 'transform 0.4s cubic-bezier(0.23,1,0.32,1)';
      overlay.style.transform = 'scaleX(0)';
    });

    return this;
  }

  auto() { this._scanDOM(); return this; }

  report() {
    const result = this.analyzeUI();
    console.group('%cNandanX UI Report', 'color:#00f5ff;font-weight:bold;font-size:14px');
    console.log('Score:', result.score + '/100 (' + result.grade + ')');
    console.log('Issues:', result.issues.length);
    result.issues.forEach(i => console.warn(i.msg, i.el));
    console.log('Suggestions:', result.suggestions.length);
    result.suggestions.forEach(s => console.info(s.msg));
    console.groupEnd();
    return result;
  }
}

var aiEngine = new AIEngine();
if (typeof window !== 'undefined') window.NandanXAI = aiEngine;
