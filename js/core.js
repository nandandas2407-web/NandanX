const NandanX = {
  version: '1.0.2',
  author: 'Nandan Das',

  cursor: cursorEngine,
  hover: hoverEngine,
  scroll: scrollEngine,
  magnet: magnetEngine,
  particle: particleEngine,
  thr3d: threeDEngine,
  physics: physicsEngine,
  mood: moodEngine,
  config: NandanXConfig,
  utils: NandanXUtils,
  text: textEngine,
  noise: noiseEngine,
  modal: modalEngine,
  form: formEngine,
  charts: canvasEngine,
  router: routerEngine,
  audio: audioEngine,
  drag: dragEngine,
  media: mediaEngine,
  theme: themeEngine,
  components: componentEngine,
  state: stateEngine,
  timeline: timelineEngine,
  gesture: gestureEngine,
  storage: storageEngine,
  network: networkEngine,
  a11y: accessibilityEngine,
  events: eventBusEngine,
  webgl: webglEngine,
  layout: layoutEngine,
  search: searchEngine,

  // v1.0 New Engines
  smoothScroll: smoothScrollEngine,
  parallax: parallaxEngine,
  svgMorph: svgMorphEngine,
  typography: typographyEngine,
  shader: shaderEngine,
  particles3D: particleSystemEngine,
  physicsWorld: physicsWorldEngine,
  cursorFX: cursorFXEngine,
  glitch: glitchEngine,
  audioViz: audioVisualizerEngine,
  scene3D: scene3DEngine,
  pageTransitions: pageTransitionEngine,
  gradient: gradientEngine,
  webrtc: webrtcEngine,
  liveChat: liveChatEngine,
  sync: syncEngine,
  advancedUI: advancedUIEngine,
  smartForm: smartFormEngine,
  microinteractions: microinteractionEngine,
  builder: builderEngine,
  reveal: revealEngine,
  spring: springEngine,
  videoFilters: videoFiltersEngine,
  infiniteMarquee: infiniteMarqueeEngine,
  holoUI: holographicUIEngine,
  adaptive: adaptiveUIEngine,

  _initialized: false,

  init(options) {
    if (this._initialized) return this;
    const {
      cursor: cursorOpts = {},
      hover: hoverOpts = {},
      scroll: scrollOpts = {},
      magnet: magnetOpts = {},
      particle: particleOpts = false,
      thr3d: thr3dOpts = {},
      physics: physicsOpts = {},
      mood: initialMood = null,
      auto: autoEnhance = true,
      debug: debugMode = false,
      theme: themeOpts = false,
      a11y: a11yOpts = false,
    } = options || {};

    this._debug = debugMode;

    if (!NandanXUtils.isMobile()) cursorEngine.init(cursorOpts);

    hoverEngine.init(hoverOpts);
    scrollEngine.init(scrollOpts);
    magnetEngine.init();
    threeDEngine.init();
    physicsEngine.init();
    moodEngine.init();
    textEngine.init();
    modalEngine.init();
    formEngine.init();
    canvasEngine.init();
    dragEngine.init();
    mediaEngine.init();
    componentEngine.init();
    stateEngine.init();
    timelineEngine.init();
    gestureEngine.init();
    storageEngine.init();
    networkEngine.init();
    eventBusEngine.init();
    webglEngine.init();
    layoutEngine.init();
    searchEngine.init();

    if (themeOpts !== false) {
      themeEngine.init(typeof themeOpts === 'object' ? themeOpts : {});
    }

    if (a11yOpts !== false) {
      accessibilityEngine.init();
    }

    moodEngine.setDependents({ cursor: cursorEngine, particle: particleEngine });

    if (particleOpts !== false) {
      particleEngine.init(typeof particleOpts === 'object' ? particleOpts : {});
      if (typeof particleOpts === 'object' && particleOpts.mode) {
        this._startParticleMode(particleOpts.mode, particleOpts);
      }
    }

    if (autoEnhance) {
      aiEngine.init({
        hover: hoverEngine,
        scroll: scrollEngine,
        thr3d: threeDEngine,
        physics: physicsEngine,
        cursor: cursorEngine,
      });
    }

    if (initialMood) moodEngine.set(initialMood);

    physicsEngine.attachToClicks(document, 'ripple');

    // v1.0 engines
    smoothScrollEngine.init();
    parallaxEngine.init();
    svgMorphEngine.init();
    typographyEngine.init();
    shaderEngine.init();
    particleSystemEngine.init();
    physicsWorldEngine.init();
    cursorFXEngine.init();
    glitchEngine.init();
    audioVisualizerEngine.init();
    scene3DEngine.init();
    pageTransitionEngine.init();
    gradientEngine.init();
    webrtcEngine.init();
    liveChatEngine.init();
    syncEngine.init();
    advancedUIEngine.init();
    smartFormEngine.init();
    microinteractionEngine.init();
    builderEngine.init();
    revealEngine.init();
    springEngine.init();
    videoFiltersEngine.init();
    infiniteMarqueeEngine.init();
    holographicUIEngine.init();
    adaptiveUIEngine.init();

    this._injectRootStyles();

    this._initialized = true;
    this._log('NandanX v1.0.2 initialized — Created by Nandan Das');

    NandanXUtils.emit(document, 'ready', { version: this.version });

    return this;
  },

  _startParticleMode(mode, opts) {
    if (mode === 'ambient') particleEngine.ambient(opts);
    else if (mode === 'constellation') particleEngine.constellation(opts);
    else if (mode === 'fireworks') particleEngine.fireworks();
    else if (mode === 'warp') particleEngine.warpSpeed(opts);
    else if (mode === 'matrix') particleEngine.matrixRain(opts);
    particleEngine.clickExplosion(opts.colors);
  },

  _injectRootStyles() {
    if (document.getElementById('nx-root-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-root-styles';
    s.textContent = `
      :root {
        --nx-primary: #00f5ff;
        --nx-secondary: #ff006e;
        --nx-accent: #7c3aed;
        --nx-bg: #0f0f1a;
        --nx-bg-2: #1a1a2e;
        --nx-text: #e2e8f0;
        --nx-text-muted: rgba(226,232,240,0.5);
        --nx-border: rgba(255,255,255,0.08);
        --nx-surface: rgba(255,255,255,0.04);
        --nx-glow: rgba(0,245,255,0.4);
        --nx-duration: 0.6s;
        --nx-ease: cubic-bezier(0.23, 1, 0.32, 1);
      }
      html { scroll-behavior: smooth; }
      *, *::before, *::after { box-sizing: border-box; }
    `;
    document.head.appendChild(s);
  },

  auto(options) {
    return this.init(Object.assign({
      auto: true,
      particle: { mode: 'ambient', count: 50 },
      theme: {},
    }, options || {}));
  },

  minimal(options) {
    return this.init(Object.assign({
      auto: false,
      particle: false,
    }, options || {}));
  },

  tilt(target, options) { return threeDEngine.tiltCard(target, options); },
  magnetic(target, strength) { return magnetEngine.attract(target, strength); },
  reveal(target, type, options) { return scrollEngine.reveal(target, type, options); },
  glow(target, color) { return hoverEngine.neon(target, color); },
  lift(target) { return hoverEngine.lift(target); },
  glitch(target) { return hoverEngine.glitch(target); },
  ripple(target) { return physicsEngine.attachToClicks(target, 'ripple'); },
  setMood(mood) { return moodEngine.set(mood); },
  float(target) { return magnetEngine.float(target); },
  parallax(target, speed) { return scrollEngine.parallax(target, speed); },
  glass(target) { return threeDEngine.glass(target); },
  holo(target) { return threeDEngine.holographic(target); },
  counter(target, to, options) { return scrollEngine.counter(target, to, options); },
  transition(type) { return aiEngine.pageTransition(type); },
  magneticText(target) { return hoverEngine.magneticText(target); },
  spotlight(target) { return hoverEngine.spotlight(target); },
  shake(target) { return hoverEngine.shake(target); },
  particles(mode, options) { if (!particleEngine.initialized) particleEngine.init(); this._startParticleMode(mode, options || {}); return this; },
  parallax3D(target, depth) { return threeDEngine.parallax3D(target, depth); },
  analyzeUI(container) { return aiEngine.analyzeUI(container); },
  stagger(target, delay) { return scrollEngine.stagger(target, delay); },
  bounce(target) { return magnetEngine.bouncyClick(target); },
  wobble(target) { return magnetEngine.wobble(target); },
  flip(target, trigger) { return threeDEngine.flipCard(target, trigger); },
  shockwave(target) { return physicsEngine.attachToClicks(target, 'shockwave'); },
  explode(target) { return physicsEngine.attachToClicks(target, 'pixels'); },

  typewriter(target, options) { return textEngine.typewriter(target, options); },
  scramble(target, options) { return textEngine.scramble(target, options); },
  gradientText(target, colors) { return textEngine.gradient(target, colors); },
  neonText(target, color) { return textEngine.neon(target, color); },
  wave(target) { return textEngine.wave(target); },

  toast(message, options) { return modalEngine.toast(message, options); },
  confirm(message, options) { return modalEngine.confirm(message, options); },
  modal(options) { return modalEngine.open(options); },
  tooltip(target, message) { return modalEngine.tooltip(target, message); },

  setTheme(name) { return themeEngine.set(name); },
  announce(msg, priority) { return accessibilityEngine.announce(msg, priority); },

  on(event, handler, options) { return eventBusEngine.on(event, handler, options); },
  off(event, handler) { return eventBusEngine.off(event, handler); },
  emit(event, data) { return eventBusEngine.emit(event, data); },

  animate(target, keyframes, options) { return timelineEngine.animate(target, keyframes, options); },
  entrance(target, type, options) { return timelineEngine.entrance(target, type, options); },
  pulse(target, options) { return timelineEngine.pulse(target, options); },

  store(name, state, options) { return stateEngine.createStore(name, state, options); },

  swipeLeft(target, handler) { return gestureEngine.swipeLeft(target, handler); },
  swipeRight(target, handler) { return gestureEngine.swipeRight(target, handler); },

  noiseBackground(container, options) { return noiseEngine.noiseBackground(container, options); },
  gradientMesh(container, options) { return noiseEngine.gradientMesh(container, options); },
  aurora(container, options) { return noiseEngine.aurora(container, options); },

  lineChart(container, data, options) { return canvasEngine.lineChart(container, data, options); },
  barChart(container, data, options) { return canvasEngine.barChart(container, data, options); },
  donutChart(container, data, options) { return canvasEngine.donutChart(container, data, options); },

  masonry(container, options) { return layoutEngine.masonry(container, options); },
  infiniteScroll(container, options) { return layoutEngine.infiniteScroll(container, options); },

  liveSearch(container, options) { return searchEngine.liveSearch(container, options); },
  filterList(container, options) { return searchEngine.filterList(container, options); },

  _log(...args) {
    if (this._debug) console.log('[NandanX]', ...args);
    else console.log('%cNandanX', 'color:#00f5ff;font-weight:bold;font-size:13px;', ...args);
  },

  // v1.0 shorthand methods
  initSmoothScroll(options) { return smoothScrollEngine.init(options); },
  butterSmooth(options) { return smoothScrollEngine.start(options); },
  scrollTo(target, options) { return smoothScrollEngine.scrollTo(target, options); },
  smoothScrollTo(target, options) { return smoothScrollEngine.scrollTo(target, options); },

  parallaxLayer(target, options) { return parallaxEngine.layer(target, options); },
  meshLayers(container, layers) { return parallaxEngine.depthLayers(container, layers); },
  stickyStory(container, steps, options) { return parallaxEngine.stickyStory(container, steps, options); },
  horizontalScroll(container, options) { return parallaxEngine.horizontal(container, options); },
  mouseParallax(container, layers, intensity) { return parallaxEngine.mouseParallax(container, layers, intensity); },
  scrollTimeline(element, keyframes, options) { return parallaxEngine.scrollTimeline(element, keyframes, options); },

  svgDraw(element, options) { return svgMorphEngine.draw(element, options); },
  svgBlob(element, options) { return svgMorphEngine.blob(element, options); },
  svgMorph(element, from, to, options) { return svgMorphEngine.morph(element, from, to, options); },
  clipMorph(element, shapes, options) { return svgMorphEngine.clipMorph(element, shapes, options); },

  splitText(element, options) { return typographyEngine.split(element, options); },
  marqueeText(element, options) { return typographyEngine.marquee(element, options); },
  waveText(element, options) { return typographyEngine.wave(element, options); },
  countUp(element, target, options) { return typographyEngine.countUp(element, target, options); },
  glitchText(element, options) { return typographyEngine.glitch(element, options); },
  highlightText(element, options) { return typographyEngine.highlight(element, options); },
  rotatingText(element, words, options) { return typographyEngine.rotatingText(element, words, options); },

  shaderPlasma(container, options) { return shaderEngine.plasma(container, options); },
  shaderFluid(container, options) { return shaderEngine.fluid(container, options); },
  shaderAurora(container, options) { return shaderEngine.aurora(container, options); },
  shaderWaves(container, options) { return shaderEngine.waves(container, options); },
  shaderHolo(container, options) { return shaderEngine.holographic(container, options); },

  fire(x, y, options) { return particleSystemEngine.fire(x, y, options); },
  snow(options) { return particleSystemEngine.snow(options); },
  confetti(x, y, options) { return particleSystemEngine.confetti(x, y, options); },
  starfield(options) { return particleSystemEngine.starfield(options); },
  smoke(x, y, options) { return particleSystemEngine.smoke(x, y, options); },
  bubbles(container, options) { return particleSystemEngine.bubbles(container, options); },
  clickConfetti(target, options) { return particleSystemEngine.clickConfetti(target, options); },

  physicsBody(element, options) { return physicsWorldEngine.createBody(element, options); },
  physicsSpring(a, b, options) { return physicsWorldEngine.spring(a, b, options); },
  physicsExplosion(x, y, r, f, options) { return physicsWorldEngine.explosion(x, y, r, f, options); },
  cloth(container, options) { return physicsWorldEngine.cloth(container, options); },

  cursorTrail(options) { return cursorFXEngine.trail(options); },
  cursorSpotlight(options) { return cursorFXEngine.spotlight(options); },
  cursorBlob(options) { return cursorFXEngine.blob(options); },
  cursorDotRing(options) { return cursorFXEngine.dotRing(options); },
  cursorEmoji(char, options) { return cursorFXEngine.emoji(char, options); },
  cursorReactive(selector, options) { return cursorFXEngine.reactive(selector, options); },

  glitchEffect(element, options) { return glitchEngine.text(element, options); },
  vhsEffect(element, options) { return glitchEngine.vhs(element, options); },
  scanlines(element) { return glitchEngine.scanlines(element); },
  digitalNoise(container, options) { return glitchEngine.noise(container, options); },
  pixelCorrupt(element, options) { return glitchEngine.pixelCorrupt(element, options); },

  audioVizBars(container, options) { return audioVisualizerEngine.bars(container, options); },
  audioVizWave(container, options) { return audioVisualizerEngine.waveform(container, options); },
  audioVizRadial(container, options) { return audioVisualizerEngine.radial(container, options); },
  audioReactive(selector, options) { return audioVisualizerEngine.reactive(selector, options); },

  scene3d(container, options) { return scene3DEngine.create(container, options); },
  card3D(element, options) { return scene3DEngine.card3D(element, options); },
  button3D(element, options) { return scene3DEngine.button3D(element, options); },

  fadeTransition(options) { return pageTransitionEngine.fade(options); },
  curtainTransition(options) { return pageTransitionEngine.curtain(options); },
  blockWipeTransition(options) { return pageTransitionEngine.blockWipe(options); },
  startLoader() { return pageTransitionEngine.startLoader(); },

  meshGradient(container, colors, options) { return gradientEngine.meshGradient(container, colors, options); },
  animatedGradient(element, colors, options) { return gradientEngine.animated(element, colors, options); },
  glassEffect(element, options) { return gradientEngine.glass(element, options); },
  neumorphism(element, options) { return gradientEngine.neumorphism(element, options); },
  autoDarkMode(options) { return gradientEngine.autoDarkMode(options); },
  generateTheme(color) { return gradientEngine.generateTheme(color); },
  gradientBg(element, colors, options) { return gradientEngine.animated(element, colors, options); },
  mouseGradient(element, colors, options) { return gradientEngine.mouseGradient(element, colors, options); },

  buildChat(container, options) { return liveChatEngine.build(container, options); },
  syncStore(name, state, options) { return syncEngine.createStore(name, state, options); },

  carousel3D(container, options) { return advancedUIEngine.carousel3D(container, options); },
  physicsSlider(container, options) { return advancedUIEngine.slider(container, options); },
  virtualScroll(container, items, renderFn, options) { return advancedUIEngine.virtualScroll(container, items, renderFn, options); },
  advDropdown(trigger, options) { return advancedUIEngine.dropdown(trigger, options); },
  animatedTabs(container, options) { return advancedUIEngine.tabs(container, options); },
  accordion(container, options) { return advancedUIEngine.accordion(container, options); },
  starRating(container, options) { return advancedUIEngine.rating(container, options); },

  smartForm(form, options) { return smartFormEngine.enhance(form, options); },
  floatLabel(container) { return smartFormEngine.floatLabel(container); },
  passwordStrength(input) { return smartFormEngine.passwordStrength(input); },

  magneticEl(target, options) { return microinteractionEngine.magnetic(target, typeof options === 'number' ? { strength: options } : (options || {})); },
  pressRipple(element) { return microinteractionEngine.pressRipple(element); },
  tiltCard(element, options) { return microinteractionEngine.tilt(element, options); },
  borderGlow(element) { return microinteractionEngine.borderGlow(element); },
  jelly(element) { return microinteractionEngine.jelly(element); },

  dragBuilder(container, options) { return builderEngine.create(container, options); },

  scrollReveal(selector, options) { return revealEngine.reveal(selector, options); },
  progressBar(selector, value, options) { return revealEngine.progressBar(selector, value, options); },

  springAnimate(element, property, to, options) { return springEngine.animate(element, property, to, options); },
  springFollow(element, options) { return springEngine.follow(element, options); },

  videoFilter(element, filter) { return videoFiltersEngine.applyCSS(element, filter); },
  infiniteMarquee(container, options) { return infiniteMarqueeEngine.create(container, options); },
  logoStrip(container, logos, options) { return infiniteMarqueeEngine.logoStrip(container, logos, options); },

  holoCard(element, options) { return holographicUIEngine.card(element, options); },
  holoFoil(element) { return holographicUIEngine.foilText(element); },
  neonBorder(element) { return holographicUIEngine.neonBorder(element); },
  holoBadge(element) { return holographicUIEngine.badge(element); },
  holoPanel(element) { return holographicUIEngine.panel(element); },

  autoEnhance(container, options) { return adaptiveUIEngine.enhance(container, options); },
  stickyNav(selector, options) { return adaptiveUIEngine.stickyNav(selector, options); },
  lazySection(selector) { return adaptiveUIEngine.lazySection(selector); },

  isReady() { return this._initialized; },

  features() {
    return [
      'magnetic-cursor', 'glow-cursor', 'trail-cursor', 'context-aware-cursor', 'cursor-particles', 'click-burst', 'cursor-label',
      'lift-hover', 'neon-hover', 'glitch-hover', 'spotlight-hover', 'liquid-hover', 'tilt-hover', 'magnetic-text', 'border-trace', 'float-hover', 'shake-hover', 'morph-hover', 'skew-hover', 'color-shift',
      'fade-up', 'fade-down', 'fade-left', 'fade-right', 'zoom-in', 'zoom-out', 'flip-x', 'flip-y', 'blur-reveal', 'skew-reveal', 'clip-reveal', 'text-reveal', 'cinematic', 'stagger', 'parallax', 'horizontal-scroll', 'counter-animation', 'scroll-progress', 'depth-scroll',
      'ripple', 'shockwave', 'pixel-explosion', 'ink-spread', 'energy-pulse', 'water-ripple', 'lightning',
      'ambient-particles', 'constellation', 'click-explosion', 'fireworks', 'matrix-rain', 'warp-speed',
      'tilt-card', 'flip-card', 'holographic', 'glass-morphism', 'parallax-3d', 'depth-scene', '3d-text', 'isometric', 'prism', 'depth-card',
      'magnetic-attract', 'magnetic-repel', 'gravity', 'elastic-drag', 'orbital-motion', 'wobble', 'float-physics', 'snap-grid', 'bouncy-click',
      'auto-detect-buttons', 'auto-detect-cards', 'auto-detect-sections', 'auto-detect-headings', 'ui-analyzer', 'page-transitions', 'accessibility-fix',
      'mood-soft', 'mood-hyper', 'mood-calm', 'mood-aggressive', 'mood-broken', 'mood-romantic', 'mood-transition', 'mood-cycle', 'custom-mood',
      'typewriter', 'scramble', 'gradient-text', 'neon-text', 'glitch-text', 'wave-text', 'reveal-chars', 'reveal-words', 'blur-text', 'highlight', 'flip-counter', 'multi-type',
      'noise-background', 'gradient-mesh', 'aurora', 'dots-bg', 'grid-bg', 'scanlines',
      'modal', 'drawer', 'toast', 'tooltip', 'confirm',
      'form-validation', 'float-label', 'toggle', 'checkbox', 'progress-ring', 'range-input', 'custom-select',
      'line-chart', 'bar-chart', 'donut-chart', 'area-chart', 'sparkline', 'gauge',
      'hash-router', 'history-router', 'page-transition-router', 'breadcrumb', 'nav-links',
      'click-sound', 'hover-sound', 'success-sound', 'error-sound', 'notification-sound',
      'draggable', 'dropzone', 'sortable', 'resizable', 'free-canvas',
      'lazy-load', 'image-zoom', 'image-parallax', 'skeleton', 'image-tilt', 'video-player', 'blur-load',
      'dark-theme', 'light-theme', 'neon-theme', 'ocean-theme', 'sunset-theme', 'forest-theme', 'midnight-theme', 'theme-switcher', 'color-picker',
      'accordion', 'tabs', 'carousel', 'stepper', 'badge', 'alert', 'chip', 'divider',
      'reactive-store', 'state-history', 'state-undo', 'two-way-binding', 'computed',
      'tween', 'timeline', 'entrance', 'exit', 'loop', 'stagger-enter', 'scroll-entrance',
      'swipe-left', 'swipe-right', 'swipe-up', 'swipe-down', 'tap', 'double-tap', 'long-press', 'pinch', 'rotate', 'keyboard-shortcut',
      'local-storage', 'session-storage', 'cookie', 'indexeddb', 'memory-store',
      'fetch-get', 'fetch-post', 'upload', 'download', 'polling', 'sse', 'graphql',
      'screen-reader-announce', 'focus-trap', 'roving-tabindex', 'skip-link', 'a11y-audit', 'aria-labels', 'a11y-toolbar',
      'event-bus', 'reactive-proxy', 'watch', 'computed-reactive', 'event-channel', 'keyboard-shortcuts',
      'webgl-gradient', 'webgl-ripple', 'plasma', 'metaballs',
      'masonry', 'grid', 'equal-heights', 'sticky-header', 'scroll-snap', 'infinite-scroll', 'virtual-list', 'split-pane',
      'live-search', 'full-text-search', 'fuzzy-search', 'filter-list', 'highlight-text',
      // v1.0
      'butter-smooth-scroll','virtual-scroll','scroll-snap-sections','scroll-momentum','scroll-to',
      'parallax-layers','depth-layers','sticky-story','horizontal-scroll-section','mouse-parallax','scroll-timeline',
      'svg-draw','svg-blob','svg-morph','clip-path-morph','shape-transition',
      'text-split-chars','text-split-words','text-wave','text-count-up','text-glitch','text-highlight','text-rotating',
      'shader-plasma','shader-fluid','shader-aurora','shader-waves','shader-holographic','custom-glsl',
      'fire-particles','snow-particles','confetti-particles','starfield','smoke-particles','bubble-particles',
      'physics-bodies','physics-spring','physics-rope','cloth-simulation','explosion',
      'cursor-trail','cursor-rainbow','cursor-spotlight','cursor-blob','cursor-dot-ring','cursor-emoji','cursor-ink',
      'glitch-css','rgb-split','vhs-effect','digital-noise','pixel-corrupt','tv-static','hologram-overlay',
      'audio-bars','audio-waveform','audio-radial','audio-spectrum','beat-detection','audio-reactive',
      '3d-scene','3d-orbit','3d-particles','3d-card','3d-button',
      'fade-transition','curtain-transition','split-curtain','block-wipe','zoom-transition','loader-bar',
      'mesh-gradient','animated-gradient','glassmorphism','neumorphism','auto-dark-mode','theme-generator','mouse-gradient',
      'webrtc-video-call','screen-share','webrtc-data',
      'live-chat-ui','typing-indicator','message-reactions','websocket','sse',
      'offline-store','multiplayer-cursor','presence-avatars','realtime-sync',
      '3d-carousel','physics-slider','virtual-list-10k','searchable-dropdown','animated-tabs','accordion','star-rating',
      'smart-validation','float-label','password-strength','char-counter','form-builder',
      'magnetic-element','press-ripple','btn-3d','fill-swipe','border-glow-spin','wiggle','jelly','heartbeat','pulse-ring',
      'drag-drop-builder','resize-handles','snap-grid','canvas-export',
      'scroll-reveal','stagger-reveal','clip-reveal','progress-bar-reveal',
      'spring-physics','spring-follow','elastic-ui',
      'video-filter-css','video-filter-canvas',
      'infinite-marquee','news-ticker','logo-strip',
      'holo-card','foil-text','neon-border-spin','scanline-ui','holo-badge',
      'auto-enhance','sticky-nav-smart','lazy-section',
    ];
  },
};

if (typeof window !== 'undefined') {
  window.NandanX = NandanX;
  window.NX = NandanX;
}


// ─────────────────────────────────────────────────────────────────────────────
// NandanX — Drop-in global alias  (jQuery / GSAP style)
// Usage: <script src="nandanx.js"></script>  →  NandanX.cursor() / NandanX.toast() etc.
// ─────────────────────────────────────────────────────────────────────────────
(function (root) {
  'use strict';

  var _NX = root.NandanX;
  if (!_NX) return; // guard

  // ── Auto-init on first meaningful call so user never has to call .init() ──
  function _autoInit() {
    if (!_NX._initialized) _NX.minimal(); // lightweight boot: no particles, no auto-scan
  }

  var NandanX = {

    version: '1.0.2',
    _nx: _NX,

    // ── Boot helpers ─────────────────────────────────────────────────────────
    init: function (opts) { return _NX.init(opts); },
    auto: function (opts) { return _NX.auto(opts); },
    minimal: function (opts) { return _NX.minimal(opts); },

    // ── Cursor ───────────────────────────────────────────────────────────────
    cursor: function (opts) {
      _autoInit();
      return _NX.cursor.init ? _NX.cursor.init(opts || {}) : _NX.cursor;
    },
    cursorTrail:    function (o)    { _autoInit(); return _NX.cursorTrail(o); },
    cursorSpotlight:function (o)    { _autoInit(); return _NX.cursorSpotlight(o); },
    cursorBlob:     function (o)    { _autoInit(); return _NX.cursorBlob(o); },
    cursorDotRing:  function (o)    { _autoInit(); return _NX.cursorDotRing(o); },
    cursorEmoji:    function (c, o) { _autoInit(); return _NX.cursorEmoji(c, o); },

    // ── Toast / Modal / Dialog ────────────────────────────────────────────────
    toast:   function (msg, o) { _autoInit(); return _NX.toast(msg, o); },
    modal:   function (o)      { _autoInit(); return _NX.modal(o); },
    confirm: function (msg, o) { _autoInit(); return _NX.confirm(msg, o); },
    tooltip: function (el, msg){ _autoInit(); return _NX.tooltip(el, msg); },

    // ── Glitch & Visual FX ───────────────────────────────────────────────────
    glitch:       function (el, o) { _autoInit(); return _NX.glitch(el, o); },
    glitchText:   function (el, o) { _autoInit(); return _NX.glitchText(el, o); },
    glitchEffect: function (el, o) { _autoInit(); return _NX.glitchEffect(el, o); },
    vhs:          function (el, o) { _autoInit(); return _NX.vhsEffect(el, o); },
    scanlines:    function (el)    { _autoInit(); return _NX.scanlines(el); },
    digitalNoise: function (el, o) { _autoInit(); return _NX.digitalNoise(el, o); },
    pixelCorrupt: function (el, o) { _autoInit(); return _NX.pixelCorrupt(el, o); },

    // ── Hover effects ────────────────────────────────────────────────────────
    glow:     function (el, c) { _autoInit(); return _NX.glow(el, c); },
    lift:     function (el)    { _autoInit(); return _NX.lift(el); },
    magnetic: function (el, s) { _autoInit(); return _NX.magnetic(el, s); },
    spotlight:function (el)    { _autoInit(); return _NX.spotlight(el); },
    shake:    function (el)    { _autoInit(); return _NX.shake(el); },
    tilt:     function (el, o) { _autoInit(); return _NX.tilt(el, o); },
    wobble:   function (el)    { _autoInit(); return _NX.wobble(el); },
    bounce:   function (el)    { _autoInit(); return _NX.bounce(el); },
    float:    function (el)    { _autoInit(); return _NX.float(el); },
    ripple:   function (el)    { _autoInit(); return _NX.ripple(el); },
    shockwave:function (el)    { _autoInit(); return _NX.shockwave(el); },
    flip:     function (el, t) { _autoInit(); return _NX.flip(el, t); },
    holo:     function (el)    { _autoInit(); return _NX.holo(el); },
    glass:    function (el)    { _autoInit(); return _NX.glass(el); },

    // ── Text ─────────────────────────────────────────────────────────────────
    typewriter:   function (el, o)    { _autoInit(); return _NX.typewriter(el, o); },
    scramble:     function (el, o)    { _autoInit(); return _NX.scramble(el, o); },
    gradientText: function (el, c)    { _autoInit(); return _NX.gradientText(el, c); },
    neonText:     function (el, c)    { _autoInit(); return _NX.neonText(el, c); },
    wave:         function (el)       { _autoInit(); return _NX.wave(el); },
    splitText:    function (el, o)    { _autoInit(); return _NX.splitText(el, o); },
    waveText:     function (el, o)    { _autoInit(); return _NX.waveText(el, o); },
    countUp:      function (el, n, o) { _autoInit(); return _NX.countUp(el, n, o); },
    rotatingText: function (el, w, o) { _autoInit(); return _NX.rotatingText(el, w, o); },
    highlightText:function (el, o)    { _autoInit(); return _NX.highlightText(el, o); },
    marqueeText:  function (el, o)    { _autoInit(); return _NX.marqueeText(el, o); },

    // ── Scroll ───────────────────────────────────────────────────────────────
    reveal:       function (el, t, o) { _autoInit(); return _NX.reveal(el, t, o); },
    parallax:     function (el, s)    { _autoInit(); return _NX.parallax(el, s); },
    stagger:      function (el, d)    { _autoInit(); return _NX.stagger(el, d); },
    counter:      function (el, n, o) { _autoInit(); return _NX.counter(el, n, o); },
    scrollTo:     function (el, o)    { _autoInit(); return _NX.scrollTo(el, o); },
    butterSmooth: function (o)        { _autoInit(); return _NX.butterSmooth(o); },
    horizontalScroll: function (el, o){ _autoInit(); return _NX.horizontalScroll(el, o); },
    stickyStory:  function (c, s, o)  { _autoInit(); return _NX.stickyStory(c, s, o); },
    mouseParallax:function (c, l, i)  { _autoInit(); return _NX.mouseParallax(c, l, i); },
    scrollTimeline:function (el, k, o){ _autoInit(); return _NX.scrollTimeline(el, k, o); },

    // ── Particles ────────────────────────────────────────────────────────────
    particles:   function (mode, o)  { _autoInit(); return _NX.particles(mode, o); },
    fire:        function (x, y, o)  { _autoInit(); return _NX.fire(x, y, o); },
    snow:        function (o)        { _autoInit(); return _NX.snow(o); },
    confetti:    function (x, y, o)  { _autoInit(); return _NX.confetti(x, y, o); },
    starfield:   function (o)        { _autoInit(); return _NX.starfield(o); },
    smoke:       function (x, y, o)  { _autoInit(); return _NX.smoke(x, y, o); },
    bubbles:     function (c, o)     { _autoInit(); return _NX.bubbles(c, o); },
    clickConfetti:function (el, o)   { _autoInit(); return _NX.clickConfetti(el, o); },

    // ── Shader / WebGL backgrounds ───────────────────────────────────────────
    shaderPlasma: function (c, o) { _autoInit(); return _NX.shaderPlasma(c, o); },
    shaderFluid:  function (c, o) { _autoInit(); return _NX.shaderFluid(c, o); },
    shaderAurora: function (c, o) { _autoInit(); return _NX.shaderAurora(c, o); },
    shaderWaves:  function (c, o) { _autoInit(); return _NX.shaderWaves(c, o); },
    shaderHolo:   function (c, o) { _autoInit(); return _NX.shaderHolo(c, o); },
    aurora:       function (c, o) { _autoInit(); return _NX.aurora(c, o); },
    noiseBackground:  function (c, o)    { _autoInit(); return _NX.noiseBackground(c, o); },
    gradientMesh: function (c, o)        { _autoInit(); return _NX.gradientMesh(c, o); },
    meshGradient: function (c, cl, o)    { _autoInit(); return _NX.meshGradient(c, cl, o); },
    animatedGradient: function (el, cl, o){ _autoInit(); return _NX.animatedGradient(el, cl, o); },
    mouseGradient:function (el, cl, o)   { _autoInit(); return _NX.mouseGradient(el, cl, o); },

    // ── SVG ──────────────────────────────────────────────────────────────────
    svgDraw:  function (el, o)       { _autoInit(); return _NX.svgDraw(el, o); },
    svgBlob:  function (el, o)       { _autoInit(); return _NX.svgBlob(el, o); },
    svgMorph: function (el, f, t, o) { _autoInit(); return _NX.svgMorph(el, f, t, o); },
    clipMorph:function (el, s, o)    { _autoInit(); return _NX.clipMorph(el, s, o); },

    // ── Animation ────────────────────────────────────────────────────────────
    animate:   function (el, k, o)  { _autoInit(); return _NX.animate(el, k, o); },
    entrance:  function (el, t, o)  { _autoInit(); return _NX.entrance(el, t, o); },
    pulse:     function (el, o)     { _autoInit(); return _NX.pulse(el, o); },
    springAnimate: function (el, p, v, o){ _autoInit(); return _NX.springAnimate(el, p, v, o); },
    springFollow:  function (el, o)     { _autoInit(); return _NX.springFollow(el, o); },
    tween:    function (el, o)      { _autoInit(); return _NX.timeline ? _NX.timeline.tween(el, o) : null; },

    // ── 3D ───────────────────────────────────────────────────────────────────
    scene3d:    function (c, o)  { _autoInit(); return _NX.scene3d(c, o); },
    card3D:     function (el, o) { _autoInit(); return _NX.card3D(el, o); },
    button3D:   function (el, o) { _autoInit(); return _NX.button3D(el, o); },
    parallax3D: function (el, d) { _autoInit(); return _NX.parallax3D(el, d); },
    holoCard:   function (el, o) { _autoInit(); return _NX.holoCard(el, o); },
    holoFoil:   function (el)    { _autoInit(); return _NX.holoFoil(el); },
    neonBorder: function (el)    { _autoInit(); return _NX.neonBorder(el); },

    // ── Physics ──────────────────────────────────────────────────────────────
    physicsBody:     function (el, o)        { _autoInit(); return _NX.physicsBody(el, o); },
    physicsSpring:   function (a, b, o)      { _autoInit(); return _NX.physicsSpring(a, b, o); },
    physicsExplosion:function (x, y, r, f, o){ _autoInit(); return _NX.physicsExplosion(x, y, r, f, o); },
    cloth:           function (c, o)         { _autoInit(); return _NX.cloth(c, o); },
    explode:         function (el)           { _autoInit(); return _NX.explode(el); },

    // ── Charts ───────────────────────────────────────────────────────────────
    lineChart:   function (c, d, o) { _autoInit(); return _NX.lineChart(c, d, o); },
    barChart:    function (c, d, o) { _autoInit(); return _NX.barChart(c, d, o); },
    donutChart:  function (c, d, o) { _autoInit(); return _NX.donutChart(c, d, o); },

    // ── UI Components ────────────────────────────────────────────────────────
    accordion:    function (c, o)     { _autoInit(); return _NX.accordion(c, o); },
    carousel3D:   function (c, o)     { _autoInit(); return _NX.carousel3D(c, o); },
    animatedTabs: function (c, o)     { _autoInit(); return _NX.animatedTabs(c, o); },
    starRating:   function (c, o)     { _autoInit(); return _NX.starRating(c, o); },
    advDropdown:  function (el, o)    { _autoInit(); return _NX.advDropdown(el, o); },
    infiniteMarquee: function (c, o)  { _autoInit(); return _NX.infiniteMarquee(c, o); },
    logoStrip:    function (c, l, o)  { _autoInit(); return _NX.logoStrip(c, l, o); },
    masonry:      function (c, o)     { _autoInit(); return _NX.masonry(c, o); },
    infiniteScroll:function (c, o)    { _autoInit(); return _NX.infiniteScroll(c, o); },

    // ── Gestures ─────────────────────────────────────────────────────────────
    swipeLeft:  function (el, fn) { _autoInit(); return _NX.swipeLeft(el, fn); },
    swipeRight: function (el, fn) { _autoInit(); return _NX.swipeRight(el, fn); },

    // ── Forms ────────────────────────────────────────────────────────────────
    smartForm: function (form, o) { _autoInit(); return _NX.smartForm(form, o); },

    // ── Theme & Mood ─────────────────────────────────────────────────────────
    setTheme: function (name) { _autoInit(); return _NX.setTheme(name); },
    setMood:  function (mood) { _autoInit(); return _NX.setMood(mood); },
    generateTheme: function (c) { _autoInit(); return _NX.generateTheme(c); },
    autoDarkMode:  function (o) { _autoInit(); return _NX.autoDarkMode(o); },
    glassEffect:   function (el, o) { _autoInit(); return _NX.glassEffect(el, o); },
    neumorphism:   function (el, o) { _autoInit(); return _NX.neumorphism(el, o); },

    // ── Page Transitions ─────────────────────────────────────────────────────
    fadeTransition:    function (o) { _autoInit(); return _NX.fadeTransition(o); },
    curtainTransition: function (o) { _autoInit(); return _NX.curtainTransition(o); },
    blockWipe:         function (o) { _autoInit(); return _NX.blockWipeTransition(o); },
    startLoader:       function ()  { _autoInit(); return _NX.startLoader(); },
    transition:        function (t) { _autoInit(); return _NX.transition(t); },

    // ── Audio Visualizer ─────────────────────────────────────────────────────
    audioVizBars:  function (c, o) { _autoInit(); return _NX.audioVizBars(c, o); },
    audioVizWave:  function (c, o) { _autoInit(); return _NX.audioVizWave(c, o); },
    audioVizRadial:function (c, o) { _autoInit(); return _NX.audioVizRadial(c, o); },
    audioReactive: function (s, o) { _autoInit(); return _NX.audioReactive(s, o); },

    // ── Accessibility ────────────────────────────────────────────────────────
    announce: function (msg, p) { _autoInit(); return _NX.announce(msg, p); },

    // ── Search ───────────────────────────────────────────────────────────────
    liveSearch:  function (c, o) { _autoInit(); return _NX.liveSearch(c, o); },
    filterList:  function (c, o) { _autoInit(); return _NX.filterList(c, o); },

    // ── Events ───────────────────────────────────────────────────────────────
    on:   function (ev, fn, o) { _autoInit(); return _NX.on(ev, fn, o); },
    off:  function (ev, fn)    { _autoInit(); return _NX.off(ev, fn); },
    emit: function (ev, d)     { _autoInit(); return _NX.emit(ev, d); },

    // ── State ────────────────────────────────────────────────────────────────
    store: function (name, state, o) { _autoInit(); return _NX.store(name, state, o); },

    // ── Drag & Build ─────────────────────────────────────────────────────────
    dragBuilder: function (c, o) { _autoInit(); return _NX.dragBuilder ? _NX.dragBuilder(c, o) : null; },

    // ── Microinteractions ────────────────────────────────────────────────────
    magneticEl:  function (el, o) { _autoInit(); return _NX.magneticEl ? _NX.magneticEl(el, o) : null; },
    pressRipple: function (el)    { _autoInit(); return _NX.pressRipple ? _NX.pressRipple(el) : null; },
    tiltCard:    function (el, o) { _autoInit(); return _NX.tiltCard ? _NX.tiltCard(el, o) : null; },
    borderGlow:  function (el)    { _autoInit(); return _NX.borderGlow ? _NX.borderGlow(el) : null; },
    jelly:       function (el)    { _autoInit(); return _NX.jelly ? _NX.jelly(el) : null; },

    // ── Reveal ───────────────────────────────────────────────────────────────
    scrollReveal: function (sel, o)       { _autoInit(); return _NX.scrollReveal ? _NX.scrollReveal(sel, o) : null; },
    progressBar:  function (sel, v, o)    { _autoInit(); return _NX.progressBar ? _NX.progressBar(sel, v, o) : null; },

    // ── Utility ──────────────────────────────────────────────────────────────
    features: function () { return _NX.features(); },
    isReady:  function () { return _NX.isReady(); },
    utils: _NX.utils,
    config: _NX.config,
  };

  // Expose globally
  root.NandanX = NandanX;
  root.NX = NandanX; // two-letter shorthand

})(typeof window !== 'undefined' ? window : this);
