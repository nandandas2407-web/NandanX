const VeloxUI = {
  version: '4.0.0',
  author: 'Nandan Das',

  cursor: cursorEngine,
  hover: hoverEngine,
  scroll: scrollEngine,
  magnet: magnetEngine,
  particle: particleEngine,
  thr3d: threeDEngine,
  physics: physicsEngine,
  mood: moodEngine,
  config: VeloxConfig,
  utils: VeloxUtils,
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

  // v4.0 New Engines
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

    if (!VeloxUtils.isMobile()) cursorEngine.init(cursorOpts);

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

    // v4.0 engines
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
    this._log('VeloxUI v4.0.0 initialized — Created by Nandan Das');

    VeloxUtils.emit(document, 'ready', { version: this.version });

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
    if (document.getElementById('vx-root-styles')) return;
    const s = document.createElement('style');
    s.id = 'vx-root-styles';
    s.textContent = `
      :root {
        --vx-primary: #00f5ff;
        --vx-secondary: #ff006e;
        --vx-accent: #7c3aed;
        --vx-bg: #0f0f1a;
        --vx-bg-2: #1a1a2e;
        --vx-text: #e2e8f0;
        --vx-text-muted: rgba(226,232,240,0.5);
        --vx-border: rgba(255,255,255,0.08);
        --vx-surface: rgba(255,255,255,0.04);
        --vx-glow: rgba(0,245,255,0.4);
        --vx-duration: 0.6s;
        --vx-ease: cubic-bezier(0.23, 1, 0.32, 1);
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
    if (this._debug) console.log('[VeloxUI]', ...args);
    else console.log('%cVeloxUI', 'color:#00f5ff;font-weight:bold;font-size:13px;', ...args);
  },

  // v4.0 shorthand methods
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
      // v4.0
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
  window.VeloxUI = VeloxUI;
  window.VX = VeloxUI;
}
