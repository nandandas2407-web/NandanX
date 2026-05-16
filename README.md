<!-- BANNER -->
<div align="center">

```
███╗   ██╗ █████╗ ███╗   ██╗██████╗  █████╗ ███╗   ██╗██╗  ██╗
████╗  ██║██╔══██╗████╗  ██║██╔══██╗██╔══██╗████╗  ██║╚██╗██╔╝
██╔██╗ ██║███████║██╔██╗ ██║██║  ██║███████║██╔██╗ ██║ ╚███╔╝ 
██║╚██╗██║██╔══██║██║╚██╗██║██║  ██║██╔══██║██║╚██╗██║ ██╔██╗ 
██║ ╚████║██║  ██║██║ ╚████║██████╔╝██║  ██║██║ ╚████║██╔╝ ██╗
╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝
```

### **The Everything Frontend Library**
*60+ engines · 250+ effects · Zero dependencies · One file*

[![npm version](https://img.shields.io/npm/v/nandanx?color=7c3aed&style=for-the-badge&logo=npm)](https://www.npmjs.com/package/nandanx)
[![license](https://img.shields.io/npm/l/nandanx?color=9333ea&style=for-the-badge)](./LICENSE)
[![bundle](https://img.shields.io/badge/bundle-single%20file-a855f7?style=for-the-badge)](./nandanx.js)
[![zero deps](https://img.shields.io/badge/dependencies-zero-c084fc?style=for-the-badge)](./package.json)
[![GitHub](https://img.shields.io/badge/GitHub-nandandas2407--web-6d28d9?style=for-the-badge&logo=github)](https://github.com/nandandas2407-web)

> **Drop it in. One line. Everything comes alive.**

**by [Nandan Das](https://github.com/nandandas2407-web)**

</div>

---

## What is NandanX?

**NandanX** is a zero-dependency, single-file creative UI animation library. Magnetic cursors, physics simulations, WebGL shaders, particle systems, scroll reveals, smart forms, accessibility tools, real-time sync — all in one drop-in `nandanx.js`.

No build tools. No config. No framework required. Just drop it in and call one line.

---

## Installation

```bash
# npm
npm install nandanx

# yarn
yarn add nandanx

# pnpm
pnpm add nandanx
```

**CDN**
```html
<script src="https://unpkg.com/nandanx/nandanx.js"></script>
```

**Local**
```html
<script src="nandanx.js"></script>
```

---

## Quick Start

```html
<script src="nandanx.js"></script>
<script>
  NandanX.auto();   // All 60+ engines. 250+ effects. One line.
</script>
```

**Or pick your init mode:**

```js
NandanX.auto()      // Full auto — cursor + particles + AI enhance + theme
NandanX.minimal()   // Bare minimum — cursor + hover + scroll only
NandanX.init({      // Full manual control
  cursor:   { type: 'dot-ring' },
  particle: { mode: 'ambient' },
  theme:    { default: 'dark' },
  a11y:     true
})
```

---

## Table of Contents

- [Core Modes](#core-modes)
- [Cursor Engine](#cursor-engine)
- [Hover Engine](#hover-engine)
- [Scroll Engine](#scroll-engine)
- [Particle Engine](#particle-engine)
- [Physics Engine](#physics-engine)
- [Text Engine](#text-engine)
- [3D Engine](#3d-engine)
- [Mood System](#mood-system)
- [Modal & Toast Engine](#modal--toast-engine)
- [Theme Engine](#theme-engine)
- [Charts Engine](#charts-engine)
- [State Engine](#state-engine)
- [Gesture Engine](#gesture-engine)
- [Typography Engine](#typography-engine)
- [Shader Engine](#shader-engine)
- [Particle Systems Engine](#particle-systems-engine)
- [Physics World Engine](#physics-world-engine)
- [Cursor FX Engine](#cursor-fx-engine)
- [Glitch Engine](#glitch-engine)
- [Audio Visualizer Engine](#audio-visualizer-engine)
- [3D Scene Engine](#3d-scene-engine)
- [Page Transitions Engine](#page-transitions-engine)
- [Gradient Engine](#gradient-engine)
- [Smooth Scroll Engine](#smooth-scroll-engine)
- [Parallax Engine](#parallax-engine)
- [SVG Morph Engine](#svg-morph-engine)
- [Spring Engine](#spring-engine)
- [Reveal Engine](#reveal-engine)
- [Advanced UI Engine](#advanced-ui-engine)
- [Smart Form Engine](#smart-form-engine)
- [Microinteractions Engine](#microinteractions-engine)
- [Holographic UI Engine](#holographic-ui-engine)
- [Adaptive UI Engine](#adaptive-ui-engine)
- [Infinite Marquee Engine](#infinite-marquee-engine)
- [WebGL Engine](#webgl-engine)
- [Network Engine](#network-engine)
- [Storage Engine](#storage-engine)
- [Event Bus Engine](#event-bus-engine)
- [Audio Engine](#audio-engine)
- [Drag Engine](#drag-engine)
- [Media Engine](#media-engine)
- [Noise Engine](#noise-engine)
- [WebRTC Engine](#webrtc-engine)
- [Live Chat Engine](#live-chat-engine)
- [Sync Engine](#sync-engine)
- [Layout Engine](#layout-engine)
- [Search Engine](#search-engine)
- [Router Engine](#router-engine)
- [Accessibility Engine](#accessibility-engine)
- [Config](#config)
- [Data Attributes](#data-attributes)
- [Browser Support](#browser-support)
- [License](#license)

---

## Core Modes

```js
NandanX.auto(options)     // Init everything with sensible defaults
NandanX.minimal(options)  // Init with no particles, no auto-detect
NandanX.init(options)     // Full manual init — you control everything
```

---

## Cursor Engine

```js
NandanX.cursor.init(options)

NandanX.cursorTrail(options)           // Rainbow particle trail
NandanX.cursorSpotlight(options)       // Spotlight effect
NandanX.cursorBlob(options)            // Organic blob cursor
NandanX.cursorDotRing(options)         // Dot + ring cursor
NandanX.cursorEmoji('🔥', options)     // Emoji cursor
NandanX.cursorReactive('.btn', opts)   // Cursor reacts to elements
```

---

## Hover Engine

```js
NandanX.lift(target)               // Float up + shadow on hover
NandanX.glow(target, '#9333ea')    // Neon glow on hover
NandanX.glitch(target)             // RGB glitch on hover
NandanX.spotlight(target)          // Spotlight follows mouse
NandanX.shake(target)              // Shake on hover
NandanX.float(target)              // Float up gently
NandanX.magneticText(target)       // Letters move with cursor

NandanX.hover.lift('.btn')
NandanX.hover.neon('.card')
NandanX.hover.glitch('h1')
NandanX.hover.shake('.btn')
NandanX.hover.morph('.avatar')
NandanX.hover.skew('.btn')
NandanX.hover.spotlight('#hero')
NandanX.hover.liquid('.btn')
NandanX.hover.tilt('.card', { maxAngle: 20, glare: true })
NandanX.hover.magneticText('h1')
NandanX.hover.borderTrace('.btn')
NandanX.hover.underline('a')
NandanX.hover.colorShift('.btn', '#9333ea22')
```

---

## Scroll Engine

```js
NandanX.reveal(target, type, options)
NandanX.parallax(target, speed)       // Parallax element (speed 0–1)
NandanX.counter(target, to, opts)     // Animated number counter
NandanX.stagger(target, delay)        // Stagger child elements
```

---

## Particle Engine

```js
NandanX.particles('ambient',       { count: 60 })
NandanX.particles('constellation', { count: 80, lineColor: '#9333ea' })
NandanX.particles('fireworks')
NandanX.particles('warp',          { speed: 2 })
NandanX.particles('matrix',        { color: '#a855f7' })

NandanX.ripple(target)     // Water ripple on click
NandanX.shockwave(target)  // Shockwave on click
NandanX.explode(target)    // Pixel explosion on click
NandanX.fire(x, y)         // Fire burst at coordinates
NandanX.snow()             // Snow particles
NandanX.confetti(x, y)     // Confetti burst
```

---

## Physics Engine

```js
NandanX.physicsWorld(options)           // Start physics simulation
NandanX.addPhysicsBody(target, opts)    // Add element to physics world
NandanX.shake(amplitude, duration)      // Shake the world
```

---

## Text Engine

```js
NandanX.typewriter(target, { speed: 60, loop: false, cursor: true })
NandanX.scramble(target,   { chars: 'ABCDEF0123456789' })
NandanX.gradientText(target, ['#9333ea', '#7c3aed', '#a855f7'])
NandanX.neonText(target, '#9333ea')
NandanX.wave(target)
```

---

## 3D Engine

```js
NandanX.tilt(target, { maxAngle: 15, glare: true, scale: 1.05 })
NandanX.flip(target, 'click')     // Flip card on click
NandanX.glass(target)             // Glassmorphism
NandanX.holo(target)              // Holographic sheen
NandanX.parallax3D(target, depth) // 3D depth parallax
```

---

## Mood System

```js
NandanX.setMood('soft')        // Soft pastels, gentle easing
NandanX.setMood('hyper')       // Neon, fast, explosive
NandanX.setMood('calm')        // Blue tones, slow transitions
NandanX.setMood('aggressive')  // Red, fast, intense
NandanX.setMood('broken')      // Glitch / matrix aesthetic
NandanX.setMood('romantic')    // Pinks, hearts, slow blur
```

---

## Modal & Toast Engine

```js
NandanX.toast('Saved!',         { type: 'success' })
NandanX.toast('Deleted',        { type: 'error', duration: 3000 })
NandanX.toast('Heads up',       { type: 'warning' })
NandanX.toast('FYI',            { type: 'info' })
NandanX.modal({ title: 'Hello', content: 'World', size: 'md' })
NandanX.confirm('Are you sure?', { onConfirm: () => {} })
NandanX.tooltip(target, 'Tooltip text')
```

---

## Theme Engine

```js
NandanX.setTheme('dark')       // dark · light · neon · ocean
NandanX.setTheme('light')      // sunset · forest · midnight
NandanX.setTheme('neon')
NandanX.setTheme('ocean')
NandanX.autoDarkMode()
NandanX.generateTheme('#7c3aed')       // Generate full theme from one color
NandanX.mouseGradient('#el', colors)   // Gradient follows mouse
```

---

## Charts Engine

```js
NandanX.lineChart('#chart', data, { grid: true, smooth: true })
NandanX.barChart('#chart',  data, { radius: 4 })
NandanX.donutChart('#chart', data, { cutout: 0.6 })
```

---

## State Engine

```js
const store = NandanX.store('app', { count: 0, user: null })

store.set('count', 1)
store.get('count')           // → 1
store.subscribe('count', (val) => console.log(val))
store.reset()
```

---

## Gesture Engine

```js
NandanX.swipeLeft(target,  () => console.log('swiped left'))
NandanX.swipeRight(target, handler)
NandanX.gesture.tap(target, handler)
NandanX.gesture.longPress(target, handler)
NandanX.gesture.pinch(target, ({ scale }) => console.log(scale))
NandanX.gesture.keyboard('ctrl+k', handler)
```

---

## Typography Engine

```js
NandanX.splitText(el, { type: 'chars' })         // Split into chars/words
NandanX.marqueeText(el, { speed: 40 })            // Scrolling marquee
NandanX.waveText(el, { amplitude: 12 })           // Wave animation
NandanX.countUp(el, 9847, { suffix: '+' })        // Number count-up
NandanX.glitchText(el, { continuous: false })     // Glitch animation
```

---

## Shader Engine

```js
NandanX.shaderPlasma('#hero')
NandanX.shaderWave('#section')
NandanX.shaderNoise('#bg')
NandanX.shaderVortex('#el')
```

---

## Particle Systems Engine

```js
NandanX.scanlines(el)
NandanX.digitalNoise('#bg')
NandanX.pixelCorrupt(el, { blockSize: 8 })
```

---

## Physics World Engine

```js
NandanX.physicsWorld({ gravity: 0.5 })
NandanX.addPhysicsBody('#el', { restitution: 0.8 })
```

---

## Cursor FX Engine

```js
NandanX.cursorFX.trail()
NandanX.cursorFX.magnetic('.btn', { strength: 0.4 })
NandanX.cursorFX.spotlight('#hero')
NandanX.cursorFX.blob()
```

---

## Glitch Engine

```js
NandanX.glitchText(el, { continuous: false })
NandanX.glitchImage(el)
NandanX.glitchIn(el)
NandanX.glitchLoop(el, { interval: 3000 })
```

---

## Audio Visualizer Engine

```js
NandanX.audioVizBars('#canvas',   { audioSrc: '#audio-el', barCount: 64 })
NandanX.audioVizWave('#canvas',   { audioSrc: '#audio-el' })
NandanX.audioVizRadial('#canvas', { audioSrc: '#audio-el' })
NandanX.audioReactive('.el',      { audioSrc: '#audio-el' })
```

---

## 3D Scene Engine

```js
NandanX.scene3d('#container', { camera: { z: 5 }, background: '#000' })
NandanX.card3D('#card',  { depth: 20, shine: true })
NandanX.button3D('#btn', { depth: 4 })
```

---

## Page Transitions Engine

```js
NandanX.fadeTransition({ duration: 400 })
NandanX.curtainTransition({ color: '#0f0f1a' })
NandanX.blockWipeTransition({ rows: 5, cols: 8 })
NandanX.startLoader()
```

---

## Gradient Engine

```js
NandanX.meshGradient('#bg', ['#9333ea', '#7c3aed', '#a855f7'])
NandanX.animatedGradient('#el', ['#9333ea', '#c084fc'], { speed: 4 })
NandanX.glassEffect('#card',   { blur: 12, opacity: 0.1 })
NandanX.neumorphism('#card',   { distance: 10, intensity: 0.2 })
NandanX.gradientMesh('#bg',    { colors: ['#9333ea', '#7c3aed', '#6d28d9'] })
NandanX.aurora('#bg',          { intensity: 0.5 })
```

---

## Smooth Scroll Engine

```js
NandanX.butterSmooth({ ease: 0.08 })
NandanX.scrollTo('#section', { offset: -60 })
NandanX.initSmoothScroll(options)
```

---

## Parallax Engine

```js
NandanX.parallaxLayer('#hero', { speed: 0.5, direction: 'y' })
NandanX.meshLayers('#container', layers)
NandanX.stickyStory('#section', keyframes)
NandanX.horizontalScroll('#track')
NandanX.mouseParallax('#scene', '.layer', 20)
NandanX.scrollTimeline(el, keyframes, options)
```

---

## SVG Morph Engine

```js
NandanX.svgDraw('#path',  { duration: 1500, easing: 'ease-in-out' })
NandanX.svgBlob('#shape', { speed: 2, complexity: 5 })
NandanX.svgMorph('#shape', fromPath, toPath, { duration: 800 })
NandanX.clipMorph('#el', ['circle(50%)', 'polygon(...)'], { interval: 2000 })
```

---

## Spring Engine

```js
NandanX.springAnimate('#el', 'translateX', 200, { stiffness: 0.12, damping: 0.7 })
NandanX.springFollow('#el', { strength: 0.1, friction: 0.85 })
```

---

## Reveal Engine

```js
NandanX.scrollReveal('.section', { type: 'fade-up', stagger: 100 })
NandanX.progressBar('#bar', 75,  { color: '#9333ea', animated: true })
NandanX.entrance('#hero', 'fade-up', { delay: 200 })
```

---

## Advanced UI Engine

```js
NandanX.carousel3D('#container',  { autoplay: 3000, perspective: 1000 })
NandanX.physicsSlider('#container', { friction: 0.92 })
NandanX.virtualScroll('#list', items, (item) => `<div>${item.name}</div>`, { itemHeight: 48 })
NandanX.animatedTabs('#tabs',    { indicator: 'slide' })
NandanX.accordion('#accordion',  { multiple: false })
NandanX.starRating('#rating',    { max: 5, value: 3 })
```

---

## Smart Form Engine

```js
NandanX.smartForm('#my-form', {
  rules:    { email: 'required|email', password: 'required|min:8' },
  onSubmit: (data) => console.log(data)
})
NandanX.floatLabel('#form')
NandanX.passwordStrength('#password-input')
```

---

## Microinteractions Engine

```js
NandanX.magneticEl('#btn',  { strength: 0.4 })
NandanX.pressRipple('#btn')
NandanX.tiltCard('#card',   { maxAngle: 12 })
NandanX.borderGlow('#card')
NandanX.jelly('#btn')

NandanX.microinteractions.pulseRing('.el')
NandanX.microinteractions.pressRipple('button')
NandanX.microinteractions.jelly('.card')
NandanX.microinteractions.heartbeat('.icon')
NandanX.microinteractions.shimmer('.btn')
NandanX.microinteractions.button3D('button')
NandanX.microinteractions.fillSwipe('button', '#9333ea')
NandanX.microinteractions.wiggle('.icon')
```

---

## Holographic UI Engine

```js
NandanX.holoCard('#card',   { intensity: 0.8 })
NandanX.holoFoil('#heading')
NandanX.neonBorder('#panel')
NandanX.holoBadge('#badge')
NandanX.holoPanel('#panel')
```

---

## Adaptive UI Engine

```js
NandanX.autoEnhance('#app',  { buttons: true, cards: true, sections: true })
NandanX.stickyNav('nav',     { offset: 0, className: 'scrolled' })
NandanX.lazySection('.section')
```

---

## Infinite Marquee Engine

```js
NandanX.infiniteMarquee('#marquee', { speed: 40, gap: 32 })
NandanX.logoStrip('#logos', [
  { src: 'logo1.svg', alt: 'Brand 1' },
  { src: 'logo2.svg', alt: 'Brand 2' }
])
```

---

## WebGL Engine

```js
NandanX.webgl.gradient('#canvas', { colors: ['#9333ea', '#7c3aed'] })
NandanX.webgl.ripple('#canvas')
NandanX.webgl.plasma('#canvas',   { speed: 1.0 })
NandanX.webgl.metaballs('#canvas')
```

---

## Network Engine

```js
const res = await NandanX.network.get('/api/data')
const res = await NandanX.network.post('/api/submit', { body: data })
NandanX.network.sse('/events',      (data) => console.log(data))
NandanX.network.poll('/api/status', { interval: 5000, onData: handler })
```

---

## Storage Engine

```js
NandanX.storage.set('key', value)
NandanX.storage.get('key')
NandanX.storage.remove('key')
NandanX.storage.setWithExpiry('key', value, ttlMs)
NandanX.storage.cookie.set('name', 'value', { days: 7 })
```

---

## Event Bus Engine

```js
NandanX.on('app:ready',  handler)
NandanX.off('app:ready', handler)
NandanX.emit('app:ready', { user: 'Alice' })

const state = NandanX.events.reactive({ count: 0 })
NandanX.events.watch(state, 'count', (newVal) => console.log(newVal))
```

---

## Audio Engine

```js
NandanX.audio.click()
NandanX.audio.hover()
NandanX.audio.success()
NandanX.audio.error()
NandanX.audio.notification()
```

---

## Drag Engine

```js
NandanX.drag.draggable('#el',    { bounds: 'parent' })
NandanX.drag.sortable('#list',   { onSort: (order) => console.log(order) })
NandanX.drag.resizable('#panel', { handles: ['se', 'sw'] })
NandanX.drag.dropzone('#zone',   { onDrop: (files) => console.log(files) })
```

---

## Media Engine

```js
NandanX.animate('#el', [
  { transform: 'translateY(0)' },
  { transform: 'translateY(-20px)' }
], { duration: 600, easing: 'ease-out' })
NandanX.pulse('#btn', { scale: 1.05, duration: 800 })
```

---

## Noise Engine

```js
NandanX.noiseBackground('#bg', { speed: 0.002, opacity: 0.06 })
```

---

## WebRTC Engine

```js
NandanX.webrtc.startVideo('#video-el')
NandanX.webrtc.stopVideo()
NandanX.webrtc.shareScreen('#video-el')
```

---

## Live Chat Engine

```js
NandanX.buildChat('#chat', {
  name:      'Support',
  onMessage: (msg) => console.log(msg)
})
```

---

## Sync Engine

```js
NandanX.sync.connect('wss://your-server.com')
NandanX.sync.send('event-name', payload)
NandanX.sync.on('event-name', handler)
```

---

## Layout Engine

```js
NandanX.masonry('#grid', { columns: 3, gap: 16 })
NandanX.gridMatch('#grid')
NandanX.stickyColumns('#layout', { offset: 80 })
```

---

## Search Engine

```js
NandanX.search.init('#input', items, {
  keys:     ['title', 'description'],
  onResult: (results) => renderList(results)
})
NandanX.search.highlight('#results', query)
```

---

## Router Engine

```js
NandanX.router.init({
  '/':      () => renderHome(),
  '/about': () => renderAbout(),
  '/work':  () => renderWork()
})
NandanX.router.go('/about')
NandanX.router.back()
```

---

## Accessibility Engine

```js
NandanX.a11y.init()                  // Auto-enhance for screen readers
NandanX.a11y.focusTrap('#modal')     // Trap focus inside element
NandanX.a11y.announce('Saved!')      // ARIA live region announcement
NandanX.a11y.skipLink('#main')       // Skip-to-main-content link
```

---

## Config

Tweak global defaults before calling `NandanX.init()`:

```js
NandanX.config.set({
  theme:         'dark',
  reducedMotion: false,
  debug:         false,
  cursor: {
    type:  'dot-ring',
    color: '#9333ea',
    size:  12
  },
  particle: {
    mode:  'ambient',
    count: 60
  }
})
```

---

## Data Attributes

Apply effects with pure HTML — no JS required:

```html
<!-- Hover effects -->
<button data-nx-hover="lift">Lift</button>
<button data-nx-hover="glow">Glow</button>
<button data-nx-hover="glitch">Glitch</button>
<button data-nx-hover="tilt">Tilt</button>

<!-- Scroll reveal -->
<section data-nx-reveal="fade-up">...</section>
<section data-nx-reveal="slide-left" data-nx-delay="200">...</section>

<!-- Particles -->
<div data-nx-particles="ambient"></div>
<div data-nx-particles="constellation"></div>

<!-- Cursors -->
<div data-nx-cursor="spotlight"></div>
<div data-nx-cursor="blob"></div>

<!-- Modals -->
<button data-nx-modal="my-modal">Open</button>
<div id="my-modal" data-nx-modal-content>...</div>
```

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 90+     |
| Firefox | 88+     |
| Safari  | 14+     |
| Edge    | 90+     |

---

## File Structure

```
nandanx-v1.0.0/
├── nandanx.js          ← Full bundle (drop this in)
├── package.json
├── LICENSE
├── README.md
└── js/                 ← Individual engine modules
    ├── config.js
    ├── core.js
    ├── cursor.js
    ├── hover.js
    ├── scroll.js
    ├── particle.js
    ├── physics.js
    ├── text.js
    ├── modal.js
    ├── theme.js
    ├── charts.js
    ├── state.js
    ├── gesture.js
    └── ...50+ more engines
```

---

## License

MIT © 2026 [Nandan Das](https://github.com/nandandas2407-web)

---

<div align="center">

**Built with obsession by [Nandan Das](https://github.com/nandandas2407-web)**

[![GitHub](https://img.shields.io/badge/GitHub-nandandas2407--web-7c3aed?style=for-the-badge&logo=github)](https://github.com/nandandas2407-web)
[![npm](https://img.shields.io/badge/npm-nandanx-9333ea?style=for-the-badge&logo=npm)](https://npmjs.com/package/nandanx)

</div>
