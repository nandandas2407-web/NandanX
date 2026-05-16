/**
 * NandanX.js - Creative Extras Module
 * Created by Nandan Das
 * Version 2.0.0
 *
 * Extra creative engines:
 *  - TextScramble   : hacker-style text scramble reveal
 *  - Confetti       : celebratory confetti cannon
 *  - SoundReactive  : visual elements react to mic input
 *  - MorphText      : smooth SVG text morphing between words
 *  - Spotlight      : theatrical beam spotlight
 *  - DNA            : animated DNA helix canvas
 *  - Typewriter     : cinematic multi-stage typewriter
 *  - Noise          : animated Perlin-noise background
 *  - Trail          : rainbow svg-path cursor trail
 *  - Counter3D      : 3D flip counter (like airport boards)
 */

var NandanXExtras = (function () {

  // ─────────────────────────────────────────────────────────────────
  // TEXT SCRAMBLE
  // ─────────────────────────────────────────────────────────────────
  function TextScramble(el) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.chars = '!<>-_\\/[]{}—=+*^?#@$%&ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    this.resolve = null;
    this.frameRequest = null;
    this.frame = 0;
    this.queue = [];
  }

  TextScramble.prototype.setText = function (newText) {
    var self = this;
    var oldText = this.el ? this.el.innerText : '';
    var length = Math.max(oldText.length, newText.length);
    var promise = new Promise(function (res) { self.resolve = res; });
    self.queue = [];
    for (var i = 0; i < length; i++) {
      var from = oldText[i] || '';
      var to = newText[i] || '';
      var start = Math.floor(Math.random() * 20);
      var end = start + Math.floor(Math.random() * 20);
      self.queue.push({ from: from, to: to, start: start, end: end, char: '' });
    }
    cancelAnimationFrame(self.frameRequest);
    self.frame = 0;
    self.update();
    return promise;
  };

  TextScramble.prototype.update = function () {
    var self = this;
    var output = '';
    var complete = 0;
    for (var i = 0, n = self.queue.length; i < n; i++) {
      var item = self.queue[i];
      if (self.frame >= item.end) {
        complete++;
        output += item.to;
      } else if (self.frame >= item.start) {
        if (!item.char || Math.random() < 0.28) {
          item.char = self.chars[Math.floor(Math.random() * self.chars.length)];
        }
        output += '<span style="color:var(--nx-primary,#00f5ff);opacity:0.6">' + item.char + '</span>';
      } else {
        output += item.from;
      }
    }
    if (self.el) self.el.innerHTML = output;
    if (complete === self.queue.length) {
      self.resolve && self.resolve();
    } else {
      self.frameRequest = requestAnimationFrame(function () { self.frame++; self.update(); });
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // CONFETTI CANNON
  // ─────────────────────────────────────────────────────────────────
  var confettiCanvas = null;
  var confettiCtx = null;
  var confettiPieces = [];
  var confettiRAF = null;

  function _initConfettiCanvas() {
    if (confettiCanvas) return;
    confettiCanvas = document.createElement('canvas');
    confettiCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99997;';
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    document.body.appendChild(confettiCanvas);
    confettiCtx = confettiCanvas.getContext('2d');
    window.addEventListener('resize', function () {
      if (confettiCanvas) {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
      }
    });
  }

  function _spawnConfetti(x, y, count, colors) {
    colors = colors || ['#00f5ff','#ff006e','#7c3aed','#ffd700','#00ff88','#ff4500','#fff'];
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 4 + Math.random() * 10;
      confettiPieces.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1) * 0.8,
        vy: -(5 + Math.random() * 12),
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        gravity: 0.3 + Math.random() * 0.2,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }
  }

  function _runConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces = confettiPieces.filter(function (p) { return p.alpha > 0.01; });
    confettiPieces.forEach(function (p) {
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      if (p.y > confettiCanvas.height + 20) { p.alpha = 0; return; }
      p.alpha -= 0.006;
      confettiCtx.save();
      confettiCtx.globalAlpha = Math.max(0, p.alpha);
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rot * Math.PI) / 180);
      confettiCtx.fillStyle = p.color;
      if (p.shape === 'rect') {
        confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        confettiCtx.fill();
      }
      confettiCtx.restore();
    });
    if (confettiPieces.length > 0) {
      confettiRAF = requestAnimationFrame(_runConfetti);
    } else {
      cancelAnimationFrame(confettiRAF);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 3D FLIP COUNTER (Airport Board Style)
  // ─────────────────────────────────────────────────────────────────
  function FlipCounter(el, options) {
    options = options || {};
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.chars = '0123456789';
    this.delay = options.delay || 80;
    this.color = options.color || 'var(--nx-primary,#00f5ff)';
    this._injectCSS();
  }

  FlipCounter.prototype._injectCSS = function () {
    if (document.getElementById('nx-flip-counter-css')) return;
    var style = document.createElement('style');
    style.id = 'nx-flip-counter-css';
    style.textContent = [
      '.nx-fc-wrap{display:inline-flex;gap:4px;}',
      '.nx-fc-digit{position:relative;width:36px;height:54px;perspective:120px;cursor:default;}',
      '.nx-fc-card{position:absolute;inset:0;background:#111;border:1px solid rgba(255,255,255,0.08);',
      'border-radius:6px;display:flex;align-items:center;justify-content:center;',
      'font-family:\'Space Mono\',monospace;font-size:28px;font-weight:700;',
      'backface-visibility:hidden;transition:transform 0.22s cubic-bezier(0.23,1,0.32,1);}',
      '.nx-fc-digit.flipping .nx-fc-card{animation:nx-flip-card 0.22s ease forwards;}',
      '@keyframes nx-flip-card{0%{transform:rotateX(0)}50%{transform:rotateX(-90deg)}100%{transform:rotateX(0)}}',
    ].join('');
    document.head.appendChild(style);
  };

  FlipCounter.prototype.set = function (target, from) {
    var self = this;
    if (!self.el) return;
    target = parseInt(target, 10);
    from = parseInt(from || 0, 10);
    var targetStr = String(target).padStart(String(from).length || String(target).length, '0');
    var fromStr = String(from).padStart(targetStr.length, '0');

    // Build digit elements
    if (!self._built || self._digits !== targetStr.length) {
      self.el.innerHTML = '<div class="nx-fc-wrap"></div>';
      var wrap = self.el.querySelector('.nx-fc-wrap');
      self._digitEls = [];
      for (var i = 0; i < targetStr.length; i++) {
        var d = document.createElement('div');
        d.className = 'nx-fc-digit';
        var card = document.createElement('div');
        card.className = 'nx-fc-card';
        card.style.color = self.color;
        card.textContent = fromStr[i] || '0';
        d.appendChild(card);
        wrap.appendChild(d);
        self._digitEls.push(d);
      }
      self._built = true;
      self._digits = targetStr.length;
    }

    // Animate each digit
    for (var i = 0; i < targetStr.length; i++) {
      (function(idx) {
        var fromDigit = parseInt(fromStr[idx] || '0', 10);
        var toDigit = parseInt(targetStr[idx], 10);
        if (fromDigit === toDigit) return;
        var steps = Math.abs(toDigit - fromDigit);
        var dir = toDigit > fromDigit ? 1 : -1;
        var current = fromDigit;
        var interval = setInterval(function () {
          current += dir;
          if (!self._digitEls[idx]) { clearInterval(interval); return; }
          var card = self._digitEls[idx].querySelector('.nx-fc-card');
          if (card) card.textContent = current;
          self._digitEls[idx].classList.remove('flipping');
          void self._digitEls[idx].offsetWidth;
          self._digitEls[idx].classList.add('flipping');
          setTimeout(function() {
            if (self._digitEls[idx]) self._digitEls[idx].classList.remove('flipping');
          }, 250);
          if (current === toDigit) clearInterval(interval);
        }, self.delay * (idx + 1) * 0.5 + self.delay);
      })(i);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // CINEMATIC TYPEWRITER
  // ─────────────────────────────────────────────────────────────────
  function Typewriter(el, options) {
    options = options || {};
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.speed = options.speed || 60;
    this.deleteSpeed = options.deleteSpeed || 30;
    this.pauseAfter = options.pauseAfter || 1400;
    this.loop = options.loop !== false;
    this.cursor = options.cursor !== false;
    this._queue = [];
    this._running = false;
    if (this.cursor && this.el) {
      this.el.style.borderRight = '2px solid var(--nx-primary,#00f5ff)';
      this.el.style.animation = 'nx-blink 0.8s step-end infinite';
      var s = document.createElement('style');
      s.textContent = '@keyframes nx-blink{0%,100%{border-color:var(--nx-primary,#00f5ff)}50%{border-color:transparent}}';
      document.head.appendChild(s);
    }
  }

  Typewriter.prototype.type = function (text, speed) {
    var self = this;
    self._queue.push({ type: 'type', text: text, speed: speed || self.speed });
    return self;
  };

  Typewriter.prototype.delete = function (count, speed) {
    var self = this;
    self._queue.push({ type: 'delete', count: count || 'all', speed: speed || self.deleteSpeed });
    return self;
  };

  Typewriter.prototype.pause = function (ms) {
    this._queue.push({ type: 'pause', ms: ms || this.pauseAfter });
    return this;
  };

  Typewriter.prototype.call = function (fn) {
    this._queue.push({ type: 'call', fn: fn });
    return this;
  };

  Typewriter.prototype.start = function () {
    var self = this;
    if (self._running) return self;
    self._running = true;
    var originalQueue = self._queue.slice();

    function runStep() {
      if (self._queue.length === 0) {
        if (self.loop) {
          self._queue = originalQueue.slice();
          runStep();
        } else {
          self._running = false;
        }
        return;
      }
      var step = self._queue.shift();
      if (step.type === 'type') {
        var i = 0;
        var interval = setInterval(function () {
          if (!self.el) { clearInterval(interval); return; }
          self.el.textContent += step.text[i++];
          if (i >= step.text.length) { clearInterval(interval); runStep(); }
        }, step.speed);
      } else if (step.type === 'delete') {
        var count = step.count === 'all' ? (self.el ? self.el.textContent.length : 0) : step.count;
        var del = setInterval(function () {
          if (!self.el) { clearInterval(del); return; }
          self.el.textContent = self.el.textContent.slice(0, -1);
          count--;
          if (count <= 0) { clearInterval(del); runStep(); }
        }, step.speed);
      } else if (step.type === 'pause') {
        setTimeout(runStep, step.ms);
      } else if (step.type === 'call') {
        step.fn();
        runStep();
      }
    }
    runStep();
    return self;
  };

  // ─────────────────────────────────────────────────────────────────
  // NOISE BACKGROUND (animated gradient mesh)
  // ─────────────────────────────────────────────────────────────────
  function NoiseBackground(el, options) {
    options = options || {};
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.speed = options.speed || 0.003;
    this.colors = options.colors || ['#050507','#0a0a1a','#050520','#0a051a'];
    this._t = 0;
    this._raf = null;
    this._points = [];
    this._init();
  }

  NoiseBackground.prototype._init = function () {
    var self = this;
    if (!self.el) return;
    self.el.style.position = 'relative';
    self.el.style.overflow = 'hidden';

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    self.el.insertBefore(canvas, self.el.firstChild);
    self._canvas = canvas;
    self._ctx = canvas.getContext('2d');
    self._resize();
    window.addEventListener('resize', function () { self._resize(); });
    self._animate();
  };

  NoiseBackground.prototype._resize = function () {
    var r = this.el.getBoundingClientRect();
    this._canvas.width = r.width;
    this._canvas.height = r.height;
    this._w = r.width;
    this._h = r.height;
  };

  NoiseBackground.prototype._sin = function (val) { return (Math.sin(val) + 1) / 2; };

  NoiseBackground.prototype._animate = function () {
    var self = this;
    self._t += self.speed;
    var ctx = self._ctx;
    var w = self._w;
    var h = self._h;
    if (!ctx || !w) { self._raf = requestAnimationFrame(function () { self._animate(); }); return; }
    ctx.clearRect(0, 0, w, h);

    // Animated gradient blobs
    var blobs = [
      { x: self._sin(self._t * 1.1) * w, y: self._sin(self._t * 0.9) * h, r: w * 0.6, c: 'rgba(0,245,255,0.04)' },
      { x: self._sin(self._t * 0.7 + 2) * w, y: self._sin(self._t * 1.3 + 1) * h, r: w * 0.5, c: 'rgba(255,0,110,0.03)' },
      { x: self._sin(self._t * 1.5 + 4) * w, y: self._sin(self._t * 0.6 + 3) * h, r: w * 0.45, c: 'rgba(124,58,237,0.04)' },
    ];
    blobs.forEach(function (b) {
      var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, b.c);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });

    self._raf = requestAnimationFrame(function () { self._animate(); });
  };

  NoiseBackground.prototype.stop = function () {
    cancelAnimationFrame(this._raf);
  };

  // ─────────────────────────────────────────────────────────────────
  // RAINBOW CURSOR TRAIL (SVG path)
  // ─────────────────────────────────────────────────────────────────
  function RainbowTrail(options) {
    options = options || {};
    this.length = options.length || 24;
    this.width = options.width || 4;
    this._points = [];
    this._svg = null;
    this._path = null;
    this._mouse = { x: 0, y: 0 };
    this._raf = null;
    this._hue = 0;
    this._init();
  }

  RainbowTrail.prototype._init = function () {
    var self = this;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99996;overflow:visible;';
    document.body.appendChild(svg);
    self._svg = svg;

    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    var grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    grad.id = 'nx-trail-grad';
    grad.setAttribute('gradientUnits', 'userSpaceOnUse');
    self._gradStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    self._gradStop1.setAttribute('offset', '0%');
    self._gradStop1.setAttribute('stop-color', '#00f5ff');
    self._gradStop1.setAttribute('stop-opacity', '0');
    self._gradStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    self._gradStop2.setAttribute('offset', '100%');
    self._gradStop2.setAttribute('stop-color', '#00f5ff');
    self._gradStop2.setAttribute('stop-opacity', '0.8');
    grad.appendChild(self._gradStop1);
    grad.appendChild(self._gradStop2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'url(#nx-trail-grad)');
    path.setAttribute('stroke-width', String(self.width));
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    self._path = path;
    self._grad = grad;

    document.addEventListener('mousemove', function (e) {
      self._mouse.x = e.clientX;
      self._mouse.y = e.clientY;
    });

    self._animate();
  };

  RainbowTrail.prototype._animate = function () {
    var self = this;
    self._hue = (self._hue + 2) % 360;
    self._points.push({ x: self._mouse.x, y: self._mouse.y });
    if (self._points.length > self.length) self._points.shift();

    var color = 'hsl(' + self._hue + ',100%,60%)';
    self._gradStop2.setAttribute('stop-color', color);
    self._grad.setAttribute('x1', String(self._points[0] ? self._points[0].x : 0));
    self._grad.setAttribute('y1', String(self._points[0] ? self._points[0].y : 0));
    var last = self._points[self._points.length - 1];
    self._grad.setAttribute('x2', String(last ? last.x : 0));
    self._grad.setAttribute('y2', String(last ? last.y : 0));

    if (self._points.length > 1) {
      var d = 'M ' + self._points[0].x + ' ' + self._points[0].y;
      for (var i = 1; i < self._points.length; i++) {
        var p0 = self._points[i - 1];
        var p1 = self._points[i];
        var mx = (p0.x + p1.x) / 2;
        var my = (p0.y + p1.y) / 2;
        d += ' Q ' + p0.x + ' ' + p0.y + ' ' + mx + ' ' + my;
      }
      self._path.setAttribute('d', d);
    }

    self._raf = requestAnimationFrame(function () { self._animate(); });
  };

  RainbowTrail.prototype.destroy = function () {
    cancelAnimationFrame(this._raf);
    if (this._svg && this._svg.parentNode) this._svg.parentNode.removeChild(this._svg);
  };

  // ─────────────────────────────────────────────────────────────────
  // DNA HELIX CANVAS
  // ─────────────────────────────────────────────────────────────────
  function DNAHelix(canvas, options) {
    options = options || {};
    this.canvas = typeof canvas === 'string' ? document.querySelector(canvas) : canvas;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.speed = options.speed || 0.02;
    this.colors = options.colors || ['#00f5ff', '#ff006e', '#7c3aed', '#00ff88'];
    this._t = 0;
    this._raf = null;
    if (this.canvas) this._animate();
  }

  DNAHelix.prototype._animate = function () {
    var self = this;
    if (!self.ctx) return;
    var ctx = self.ctx;
    var w = self.canvas.width;
    var h = self.canvas.height;
    self._t += self.speed;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(5,5,7,0.15)';
    ctx.fillRect(0, 0, w, h);

    var segments = 40;
    var cx = w / 2;
    var radius = w * 0.3;
    var twist = self._t;

    for (var i = 0; i < segments; i++) {
      var t = (i / segments) * Math.PI * 4 + twist;
      var y = (i / segments) * h;
      var x1 = cx + Math.cos(t) * radius;
      var x2 = cx + Math.cos(t + Math.PI) * radius;
      var z1 = Math.sin(t);
      var z2 = Math.sin(t + Math.PI);
      var size1 = 3 + z1 * 3;
      var size2 = 3 + z2 * 3;
      var alpha1 = 0.3 + (z1 + 1) * 0.35;
      var alpha2 = 0.3 + (z2 + 1) * 0.35;

      // Backbone strands
      if (i > 0) {
        var tp = ((i - 1) / segments) * Math.PI * 4 + twist;
        var yp = ((i - 1) / segments) * h;
        var px1 = cx + Math.cos(tp) * radius;
        var px2 = cx + Math.cos(tp + Math.PI) * radius;
        ctx.beginPath();
        ctx.moveTo(px1, yp);
        ctx.lineTo(x1, y);
        ctx.strokeStyle = 'rgba(0,245,255,' + alpha1 * 0.7 + ')';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px2, yp);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = 'rgba(255,0,110,' + alpha2 * 0.7 + ')';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Base pairs (rungs) every 4 segments
      if (i % 4 === 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        var g = ctx.createLinearGradient(x1, y, x2, y);
        g.addColorStop(0, 'rgba(0,245,255,0.6)');
        g.addColorStop(0.5, 'rgba(255,255,255,0.3)');
        g.addColorStop(1, 'rgba(255,0,110,0.6)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Nucleotide dots
      var col1 = self.colors[i % self.colors.length];
      var col2 = self.colors[(i + 2) % self.colors.length];
      ctx.beginPath();
      ctx.arc(x1, y, Math.max(0.5, size1), 0, Math.PI * 2);
      ctx.fillStyle = col1.replace(')', ',' + alpha1 + ')').replace('rgb', 'rgba').replace('#', 'rgba(').replace(/([0-9a-fA-F]{2})/g, function (m) { return parseInt(m, 16) + ','; }).replace(/,$/, ',1)') || col1;
      // simpler color with opacity
      ctx.globalAlpha = alpha1;
      ctx.fillStyle = col1;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x2, y, Math.max(0.5, size2), 0, Math.PI * 2);
      ctx.globalAlpha = alpha2;
      ctx.fillStyle = col2;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    self._raf = requestAnimationFrame(function () { self._animate(); });
  };

  DNAHelix.prototype.stop = function () {
    cancelAnimationFrame(this._raf);
  };

  // ─────────────────────────────────────────────────────────────────
  // MAGNETIC WORDS (words attract/repel cursor)
  // ─────────────────────────────────────────────────────────────────
  function MagneticWords(el, options) {
    options = options || {};
    var self = this;
    self.el = typeof el === 'string' ? document.querySelector(el) : el;
    self.strength = options.strength || 0.3;
    self.radius = options.radius || 100;
    self.mode = options.mode || 'attract'; // attract | repel
    self._spans = [];
    self._mouse = { x: -9999, y: -9999 };
    self._raf = null;
    if (!self.el) return;
    self._build();
    self._listen();
    self._loop();
  }

  MagneticWords.prototype._build = function () {
    var self = this;
    var words = self.el.textContent.trim().split(/\s+/);
    self.el.textContent = '';
    self.el.style.display = 'flex';
    self.el.style.flexWrap = 'wrap';
    self.el.style.gap = '8px';
    words.forEach(function (word) {
      var span = document.createElement('span');
      span.textContent = word;
      span.style.cssText = 'display:inline-block;transition:transform 0.1s,color 0.3s;cursor:default;';
      self.el.appendChild(span);
      self._spans.push(span);
    });
  };

  MagneticWords.prototype._listen = function () {
    var self = this;
    document.addEventListener('mousemove', function (e) {
      self._mouse.x = e.clientX;
      self._mouse.y = e.clientY;
    });
  };

  MagneticWords.prototype._loop = function () {
    var self = this;
    self._spans.forEach(function (span) {
      var r = span.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var dx = self._mouse.x - cx;
      var dy = self._mouse.y - cy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < self.radius) {
        var force = (self.radius - dist) / self.radius;
        var dir = self.mode === 'repel' ? -1 : 1;
        var tx = dx * force * self.strength * dir;
        var ty = dy * force * self.strength * dir;
        span.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
        span.style.color = 'hsl(' + (dist * 1.5) + ',100%,70%)';
      } else {
        span.style.transform = 'translate(0,0)';
        span.style.color = '';
      }
    });
    self._raf = requestAnimationFrame(function () { self._loop(); });
  };

  // ─────────────────────────────────────────────────────────────────
  // SPOTLIGHT BEAM
  // ─────────────────────────────────────────────────────────────────
  function SpotlightBeam(el, options) {
    options = options || {};
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.size = options.size || 300;
    this.color = options.color || 'rgba(0,245,255,0.08)';
    this.blur = options.blur || 60;
    if (!this.el) return;
    this.el.style.position = 'relative';
    this.el.style.overflow = 'hidden';
    var self = this;
    this.el.addEventListener('mousemove', function (e) {
      var r = self.el.getBoundingClientRect();
      var x = e.clientX - r.left;
      var y = e.clientY - r.top;
      self.el.style.backgroundImage = [
        'radial-gradient(circle ' + self.size + 'px at ' + x + 'px ' + y + 'px, ' + self.color + ', transparent)'
      ].join('');
    });
    this.el.addEventListener('mouseleave', function () {
      self.el.style.backgroundImage = '';
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────
  return {
    // Text scramble
    scramble: function (el, text) {
      var s = new TextScramble(el);
      return s.setText(text || (typeof el === 'string' ? document.querySelector(el) : el).textContent);
    },
    TextScramble: TextScramble,

    // Confetti
    confetti: function (x, y, count, colors) {
      _initConfettiCanvas();
      if (x === undefined) { x = window.innerWidth / 2; y = window.innerHeight / 3; }
      _spawnConfetti(x, y, count || 120, colors);
      cancelAnimationFrame(confettiRAF);
      _runConfetti();
    },

    // Flip counter
    flipCounter: function (el, target, from, options) {
      var fc = new FlipCounter(el, options || {});
      fc.set(target, from || 0);
      return fc;
    },
    FlipCounter: FlipCounter,

    // Typewriter
    typewriter: function (el, options) {
      return new Typewriter(el, options);
    },
    Typewriter: Typewriter,

    // Noise background
    noise: function (el, options) {
      return new NoiseBackground(el, options);
    },
    NoiseBackground: NoiseBackground,

    // Rainbow trail
    rainbowTrail: function (options) {
      return new RainbowTrail(options);
    },
    RainbowTrail: RainbowTrail,

    // DNA helix
    dna: function (canvas, options) {
      return new DNAHelix(canvas, options);
    },
    DNAHelix: DNAHelix,

    // Magnetic words
    magneticWords: function (el, options) {
      return new MagneticWords(el, options);
    },
    MagneticWords: MagneticWords,

    // Spotlight
    spotlight: function (el, options) {
      return new SpotlightBeam(el, options);
    },
    SpotlightBeam: SpotlightBeam,

    // Auto scramble cycle through words
    scrambleCycle: function (el, words, interval) {
      var s = new TextScramble(el);
      var i = 0;
      interval = interval || 2500;
      function next() {
        s.setText(words[i]).then(function () {
          setTimeout(next, interval);
        });
        i = (i + 1) % words.length;
      }
      next();
      return { stop: function () { s.resolve = null; } };
    },
  };
})();

if (typeof window !== 'undefined') window.NandanXExtras = NandanXExtras;
