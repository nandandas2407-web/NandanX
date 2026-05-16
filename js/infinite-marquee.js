/**
 * NandanX — infiniteMarqueeEngine
 * Infinite scrolling banners, tickers, logo strips, news feeds
 */
class InfiniteMarqueeEngine {
  constructor() { this.initialized = false; }
  init() { if (this.initialized) return this; this._injectStyles(); this._autoDetect(); this.initialized = true; return this; }
  _injectStyles() {
    if (document.getElementById('nx-imarquee-styles')) return;
    const s = document.createElement('style'); s.id = 'nx-imarquee-styles';
    s.textContent = `
      .nx-imarquee { overflow: hidden; white-space: nowrap; }
      .nx-imarquee-inner { display: inline-flex; align-items: center; gap: var(--nx-marquee-gap, 40px); }
      .nx-imarquee-track { display: inline-flex; align-items: center; gap: var(--nx-marquee-gap, 40px); animation: nx-imarquee-scroll var(--nx-marquee-dur, 20s) linear infinite; white-space: nowrap; }
      .nx-imarquee-track.nx-reverse { animation-direction: reverse; }
      @keyframes nx-imarquee-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      .nx-imarquee:hover .nx-imarquee-track { animation-play-state: paused; }
      .nx-ticker { font-family: monospace; font-size: 13px; }
      .nx-ticker-item { padding: 0 20px; }
      .nx-ticker-sep { color: var(--nx-primary, #00f5ff); }
    `;
    document.head.appendChild(s);
  }
  _autoDetect() {
    document.querySelectorAll('[data-nx-marquee2]').forEach(el => {
      this.create(el, { speed: parseFloat(el.dataset.nxMarquee2) || 30, direction: el.dataset.nxDir || 'left' });
    });
  }
  create(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const speed = options.speed || 30;
    const direction = options.direction || 'left';
    const gap = options.gap || 40;
    el.classList.add('nx-imarquee');
    el.style.setProperty('--nx-marquee-gap', gap + 'px');
    const inner = document.createElement('div');
    inner.className = 'nx-imarquee-inner';
    const content = el.innerHTML;
    const track = document.createElement('div');
    track.className = 'nx-imarquee-track' + (direction === 'right' ? ' nx-reverse' : '');
    track.innerHTML = content + content;
    const trackW = () => track.scrollWidth / 2;
    inner.appendChild(track);
    el.innerHTML = '';
    el.appendChild(inner);
    setTimeout(() => {
      const dur = trackW() / speed;
      track.style.setProperty('--nx-marquee-dur', dur + 's');
      el.style.setProperty('--nx-marquee-dur', dur + 's');
    }, 100);
    return this;
  }
  ticker(container, items, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.classList.add('nx-imarquee', 'nx-ticker');
    const sep = options.separator || ' ◆ ';
    const content = items.map(item => `<span class="nx-ticker-item">${item}</span><span class="nx-ticker-sep">${sep}</span>`).join('');
    return this.create(el, { ...options, speed: options.speed || 60 });
  }
  logoStrip(container, logos, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    el.innerHTML = logos.map(l => `<div style="display:inline-flex;align-items:center;padding:0 24px;opacity:0.5;filter:grayscale(1);transition:opacity 0.2s,filter 0.2s;" onmouseenter="this.style.opacity=1;this.style.filter='none'" onmouseleave="this.style.opacity=0.5;this.style.filter='grayscale(1)'">${l.img ? `<img src="${l.img}" alt="${l.name||''}" style="height:${options.height||32}px;">` : `<span style="font-weight:700;font-size:16px;">${l.name}</span>`}</div>`).join('');
    return this.create(el, options);
  }
}
const infiniteMarqueeEngine = new InfiniteMarqueeEngine();
