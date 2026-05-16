/**
 * NandanX — adaptiveUIEngine
 * Smart adaptive UI: component auto-enhancer, layout intelligence, viewport-aware behaviors
 */
class AdaptiveUIEngine {
  constructor() { this.initialized = false; }
  init(options = {}) { if (this.initialized) return this; this._injectStyles(); this.initialized = true; if (options.auto) this.enhance(document.body); return this; }
  _injectStyles() {
    if (document.getElementById('nx-adaptive-styles')) return;
    const s = document.createElement('style'); s.id = 'nx-adaptive-styles';
    s.textContent = `
      .nx-auto-enhanced { transition: all 0.2s ease; }
      @media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      .nx-responsive-text { font-size: clamp(14px, 2vw, 18px); }
      .nx-responsive-h1 { font-size: clamp(28px, 6vw, 72px); line-height: 1.1; }
      .nx-responsive-h2 { font-size: clamp(22px, 4vw, 48px); line-height: 1.2; }
      .nx-sticky-smart { position: sticky; top: 0; z-index: 100; transition: box-shadow 0.3s ease, background 0.3s ease; }
      .nx-sticky-smart.nx-scrolled { box-shadow: 0 4px 20px rgba(0,0,0,0.3); background: rgba(10,10,18,0.95); backdrop-filter: blur(12px); }
      .nx-lazy-section { opacity: 0; transition: opacity 0.6s ease; }
      .nx-lazy-section.nx-loaded { opacity: 1; }
    `;
    document.head.appendChild(s);
  }
  enhance(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    // Auto-enhance buttons
    el.querySelectorAll('button:not(.nx-enhanced), [role="button"]:not(.nx-enhanced)').forEach(btn => {
      btn.classList.add('nx-enhanced');
      btn.style.transition = btn.style.transition || 'transform 0.15s ease, opacity 0.15s ease';
      btn.addEventListener('mouseenter', () => { btn.style.transform = 'translateY(-1px)'; });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
      btn.addEventListener('mousedown', () => { btn.style.transform = 'translateY(1px) scale(0.98)'; });
      btn.addEventListener('mouseup', () => { btn.style.transform = ''; });
    });
    // Auto-enhance images with lazy loading
    el.querySelectorAll('img:not(.nx-enhanced)').forEach(img => {
      img.classList.add('nx-enhanced');
      img.loading = 'lazy';
      img.style.transition = 'opacity 0.4s ease';
      if (!img.complete) { img.style.opacity = '0'; img.addEventListener('load', () => { img.style.opacity = '1'; }); }
    });
    // Auto sticky nav
    el.querySelectorAll('nav:not(.nx-enhanced), header:not(.nx-enhanced)').forEach(nav => {
      nav.classList.add('nx-enhanced', 'nx-sticky-smart');
      window.addEventListener('scroll', () => nav.classList.toggle('nx-scrolled', window.scrollY > 20), { passive: true });
    });
    // Responsive text
    el.querySelectorAll('h1:not(.nx-enhanced)').forEach(h => { h.classList.add('nx-enhanced', 'nx-responsive-h1'); });
    el.querySelectorAll('h2:not(.nx-enhanced)').forEach(h => { h.classList.add('nx-enhanced', 'nx-responsive-h2'); });
    return this;
  }
  responsiveMotion(options = {}) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { document.body.classList.add('nx-reduced-motion'); }
    return { reduced: prefersReduced };
  }
  stickyNav(selector, options = {}) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return this;
    el.classList.add('nx-sticky-smart');
    const threshold = options.threshold || 20;
    window.addEventListener('scroll', () => el.classList.toggle('nx-scrolled', window.scrollY > threshold), { passive: true });
    return this;
  }
  lazySection(selector) {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('nx-lazy-section');
      const obs = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { el.classList.add('nx-loaded'); obs.disconnect(); } }, { threshold: 0.1 });
      obs.observe(el);
    });
    return this;
  }
}
const adaptiveUIEngine = new AdaptiveUIEngine();
