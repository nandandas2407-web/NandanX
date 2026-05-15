/**
 * VeloxUI — holographicUIEngine
 * Holographic cards, neon borders, iridescent effects, scanline overlays
 */
class HolographicUIEngine {
  constructor() { this.initialized = false; }
  init() { if (this.initialized) return this; this._injectStyles(); this._autoDetect(); this.initialized = true; return this; }
  _injectStyles() {
    if (document.getElementById('vx-holo-ui-styles')) return;
    const s = document.createElement('style'); s.id = 'vx-holo-ui-styles';
    s.textContent = `
      .vx-holo-card { position: relative; border-radius: 16px; overflow: hidden; transform-style: preserve-3d; transition: transform 0.1s ease; }
      .vx-holo-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,245,255,0.1) 0%, rgba(124,58,237,0.1) 50%, rgba(255,0,110,0.1) 100%); opacity: 0; transition: opacity 0.3s; pointer-events: none; z-index: 2; mix-blend-mode: screen; }
      .vx-holo-card:hover::before { opacity: 1; }
      .vx-holo-foil { background: linear-gradient(45deg, #ff006e, #00f5ff, #00ff88, #7c3aed, #ff006e); background-size: 400% 400%; animation: vx-foil 4s ease infinite; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
      @keyframes vx-foil { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
      .vx-neon-border { position: relative; border-radius: inherit; }
      .vx-neon-border::before { content: ''; position: absolute; inset: -1px; border-radius: inherit; padding: 1px; background: linear-gradient(var(--vx-neon-angle, 45deg), #00f5ff, #7c3aed, #ff006e); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; animation: vx-neon-rotate 3s linear infinite; }
      @property --vx-neon-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
      @keyframes vx-neon-rotate { to { --vx-neon-angle: 360deg; } }
      .vx-scanline-overlay { position: relative; overflow: hidden; }
      .vx-scanline-overlay::after { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,245,255,0.03) 3px, rgba(0,245,255,0.03) 4px); pointer-events: none; z-index: 5; animation: vx-scan-move 8s linear infinite; }
      @keyframes vx-scan-move { from { background-position: 0 0; } to { background-position: 0 100%; } }
      .vx-holo-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; font-family: monospace; letter-spacing: 0.08em; background: rgba(0,245,255,0.1); border: 1px solid rgba(0,245,255,0.3); color: #00f5ff; text-shadow: 0 0 8px #00f5ff; box-shadow: 0 0 12px rgba(0,245,255,0.2); }
      .vx-holo-panel { background: rgba(0,245,255,0.03); border: 1px solid rgba(0,245,255,0.12); border-radius: 12px; position: relative; overflow: hidden; }
      .vx-holo-panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, #00f5ff, transparent); }
    `;
    document.head.appendChild(s);
  }
  _autoDetect() {
    document.querySelectorAll('[data-vx-holo]').forEach(el => this[el.dataset.nxHolo]?.(el));
  }
  card(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.classList.add('vx-holo-card');
    const maxAngle = options.maxAngle || 20;
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const ry = (x - 0.5) * maxAngle;
      const rx = (0.5 - y) * maxAngle;
      el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      el.style.setProperty('--x', x * 100 + '%');
      el.style.setProperty('--y', y * 100 + '%');
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    return this;
  }
  foilText(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) el.classList.add('vx-holo-foil');
    return this;
  }
  neonBorder(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) el.classList.add('vx-neon-border');
    return this;
  }
  scanlines(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) el.classList.add('vx-scanline-overlay');
    return this;
  }
  badge(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) el.classList.add('vx-holo-badge');
    return this;
  }
  panel(element) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) el.classList.add('vx-holo-panel');
    return this;
  }
}
const holographicUIEngine = new HolographicUIEngine();
