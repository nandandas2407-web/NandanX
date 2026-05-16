/**
 * NandanX.js — Creative Extras v2 
 * Created by Nandan Das
 * NEW features: Aurora, StarField, PixelReveal, SoundWave, 
 * NeonText, CardStack, GlitchImage, MagicCursor, ParticleText, HeatMap
 */

var NXCreative = (function () {

  // ─────────────────────────────────────────────────────────────────
  // AURORA BACKGROUND — Northern lights animated gradient
  // ─────────────────────────────────────────────────────────────────
  function aurora(target) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    el.style.position = el.style.position || 'relative';
    el.insertBefore(canvas, el.firstChild);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var t = 0;
    var blobs = [
      { x: 0.2, y: 0.3, r: 0.4, color: [0, 255, 200], speed: 0.0008 },
      { x: 0.7, y: 0.2, r: 0.5, color: [100, 0, 255], speed: 0.0006 },
      { x: 0.5, y: 0.7, r: 0.45, color: [0, 150, 255], speed: 0.001 },
      { x: 0.1, y: 0.8, r: 0.35, color: [255, 0, 150], speed: 0.0007 },
    ];
    function resize() { canvas.width = el.offsetWidth; canvas.height = el.offsetHeight; }
    resize();
    window.addEventListener('resize', resize);
    function draw() {
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      blobs.forEach(function (b, i) {
        var x = (b.x + Math.sin(t * b.speed * 1000 + i) * 0.15) * w;
        var y = (b.y + Math.cos(t * b.speed * 1000 + i * 1.3) * 0.15) * h;
        var r = b.r * Math.max(w, h);
        var grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgba(' + b.color.join(',') + ',0.25)');
        grad.addColorStop(1, 'rgba(' + b.color.join(',') + ',0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });
      t++;
      requestAnimationFrame(draw);
    }
    draw();
    return { canvas: canvas };
  }

  // ─────────────────────────────────────────────────────────────────
  // PIXEL REVEAL — Image/element reveals in pixel blocks
  // ─────────────────────────────────────────────────────────────────
  function pixelReveal(target, options) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var opts = options || {};
    var cols = opts.cols || 20;
    var delay = opts.delay || 0;
    var duration = opts.duration || 800;
    var color = opts.color || '#0f0f1a';
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:grid;pointer-events:none;z-index:10;';
    var rows = Math.ceil(el.offsetHeight / (el.offsetWidth / cols));
    wrapper.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';
    wrapper.style.gridTemplateRows = 'repeat(' + rows + ',1fr)';
    el.style.position = el.style.position || 'relative';
    var cells = [];
    for (var i = 0; i < cols * rows; i++) {
      var cell = document.createElement('div');
      cell.style.cssText = 'background:' + color + ';transition:opacity ' + (duration / 1000) + 's ease;';
      wrapper.appendChild(cell);
      cells.push(cell);
    }
    el.appendChild(wrapper);
    setTimeout(function () {
      cells.forEach(function (cell, i) {
        setTimeout(function () {
          cell.style.opacity = '0';
        }, Math.random() * duration);
      });
      setTimeout(function () { wrapper.remove(); }, delay + duration + 200);
    }, delay);
    return { reveal: function () { el.appendChild(wrapper); } };
  }

  // ─────────────────────────────────────────────────────────────────
  // SOUND WAVE — Animated sound wave bars (visual, no audio needed)
  // ─────────────────────────────────────────────────────────────────
  function soundWave(target, options) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var opts = options || {};
    var bars = opts.bars || 32;
    var color = opts.color || '#00f5ff';
    var height = opts.height || '60px';
    var active = true;
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.gap = '3px';
    el.style.height = height;
    var barEls = [];
    for (var i = 0; i < bars; i++) {
      var bar = document.createElement('div');
      bar.style.cssText = 'flex:1;background:' + color + ';border-radius:2px;transition:height 0.1s ease;min-height:3px;';
      el.appendChild(bar);
      barEls.push(bar);
    }
    var offsets = barEls.map(function (_, i) { return Math.random() * Math.PI * 2; });
    var t = 0;
    function animate() {
      if (!active) return;
      var elH = el.offsetHeight || 60;
      barEls.forEach(function (bar, i) {
        var h = (Math.sin(t * 0.05 + offsets[i]) * 0.4 + 0.5) * elH;
        bar.style.height = Math.max(3, h) + 'px';
      });
      t++;
      requestAnimationFrame(animate);
    }
    animate();
    return {
      stop: function () { active = false; barEls.forEach(function (b) { b.style.height = '3px'; }); },
      start: function () { active = true; animate(); },
      setColor: function (c) { barEls.forEach(function (b) { b.style.background = c; }); }
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // NEON TEXT — Animated neon sign flicker effect
  // ─────────────────────────────────────────────────────────────────
  function neonText(target, options) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var opts = options || {};
    var color = opts.color || '#00f5ff';
    var flickerChance = opts.flickerChance || 0.02;
    var rgb = color;
    el.style.color = color;
    el.style.textShadow = '0 0 7px ' + color + ', 0 0 10px ' + color + ', 0 0 21px ' + color + ', 0 0 42px ' + color;
    el.style.transition = 'text-shadow 0.08s, opacity 0.08s';
    function flicker() {
      if (Math.random() < flickerChance) {
        el.style.opacity = '0.3';
        el.style.textShadow = 'none';
        setTimeout(function () {
          el.style.opacity = '1';
          el.style.textShadow = '0 0 7px ' + color + ', 0 0 10px ' + color + ', 0 0 21px ' + color + ', 0 0 42px ' + color;
        }, 80 + Math.random() * 120);
      }
      requestAnimationFrame(flicker);
    }
    flicker();
    return { setColor: function (c) { color = c; } };
  }

  // ─────────────────────────────────────────────────────────────────
  // CARD STACK — Stacked cards that fan out on hover
  // ─────────────────────────────────────────────────────────────────
  function cardStack(target, options) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var opts = options || {};
    var spread = opts.spread || 15;
    var cards = el.querySelectorAll('[data-card]');
    if (!cards.length) return;
    el.style.position = 'relative';
    cards.forEach(function (card, i) {
      card.style.cssText += ';position:absolute;top:0;left:0;width:100%;height:100%;transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);transform-origin:bottom center;';
      card.style.transform = 'rotate(' + (i * 3 - cards.length * 1.5) + 'deg) translateY(' + (i * 2) + 'px)';
    });
    el.addEventListener('mouseenter', function () {
      cards.forEach(function (card, i) {
        var angle = (i / (cards.length - 1) - 0.5) * spread * 2;
        card.style.transform = 'rotate(' + angle + 'deg) translateY(-20px)';
      });
    });
    el.addEventListener('mouseleave', function () {
      cards.forEach(function (card, i) {
        card.style.transform = 'rotate(' + (i * 3 - cards.length * 1.5) + 'deg) translateY(' + (i * 2) + 'px)';
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // GLITCH IMAGE — CSS glitch effect on images
  // ─────────────────────────────────────────────────────────────────
  function glitchImage(target) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    if (!document.getElementById('nx-glitch-img-styles')) {
      var s = document.createElement('style');
      s.id = 'nx-glitch-img-styles';
      s.textContent = `
        .nx-glitch-img { position:relative; overflow:hidden; }
        .nx-glitch-img::before, .nx-glitch-img::after {
          content:''; position:absolute; top:0; left:0; width:100%; height:100%;
          background:inherit; background-size:cover; background-position:center;
        }
        .nx-glitch-img:hover::before {
          animation: nxGlitchA 0.4s steps(2) infinite;
          mix-blend-mode: screen; background-color: rgba(255,0,100,0.3);
        }
        .nx-glitch-img:hover::after {
          animation: nxGlitchB 0.4s steps(2) infinite;
          mix-blend-mode: screen; background-color: rgba(0,255,255,0.3);
        }
        @keyframes nxGlitchA {
          0%{clip-path:inset(10% 0 80% 0);transform:translate(-5px,0)}
          50%{clip-path:inset(60% 0 20% 0);transform:translate(5px,0)}
          100%{clip-path:inset(40% 0 50% 0);transform:translate(-3px,0)}
        }
        @keyframes nxGlitchB {
          0%{clip-path:inset(80% 0 5% 0);transform:translate(5px,0)}
          50%{clip-path:inset(20% 0 60% 0);transform:translate(-5px,0)}
          100%{clip-path:inset(50% 0 30% 0);transform:translate(3px,0)}
        }
      `;
      document.head.appendChild(s);
    }
    el.classList.add('nx-glitch-img');
    if (el.tagName === 'IMG') {
      var src = el.src;
      el.style.backgroundImage = 'url(' + src + ')';
      el.style.backgroundSize = 'cover';
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // PARTICLE TEXT — Text that explodes into particles on click
  // ─────────────────────────────────────────────────────────────────
  function particleText(target, options) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var opts = options || {};
    var particleCount = opts.particles || 60;
    var colors = opts.colors || ['#00f5ff', '#ff006e', '#7c3aed', '#ffd700'];
    el.style.cursor = 'pointer';
    el.style.userSelect = 'none';
    el.addEventListener('click', function (e) {
      var rect = el.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      for (var i = 0; i < particleCount; i++) {
        var p = document.createElement('div');
        var angle = (Math.random() * Math.PI * 2);
        var speed = 3 + Math.random() * 8;
        var vx = Math.cos(angle) * speed;
        var vy = Math.sin(angle) * speed;
        var size = 4 + Math.random() * 8;
        var color = colors[Math.floor(Math.random() * colors.length)];
        var shape = Math.random() > 0.5 ? '50%' : '0';
        p.style.cssText = 'position:fixed;width:' + size + 'px;height:' + size + 'px;background:' + color + ';border-radius:' + shape + ';left:' + cx + 'px;top:' + cy + 'px;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);';
        document.body.appendChild(p);
        var startTime = null;
        var lifetime = 600 + Math.random() * 400;
        (function (particle, dvx, dvy, life) {
          function step(ts) {
            if (!startTime) startTime = ts;
            var prog = (ts - startTime) / life;
            if (prog >= 1) { particle.remove(); return; }
            var x = parseFloat(particle.style.left) + dvx * (1 - prog);
            var y = parseFloat(particle.style.top) + dvy * (1 - prog) + prog * prog * 200;
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = 1 - prog;
            particle.style.transform = 'translate(-50%,-50%) rotate(' + (prog * 360) + 'deg)';
            requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        })(p, vx, vy, lifetime);
      }
      // Bounce the text
      el.style.transition = 'transform 0.1s';
      el.style.transform = 'scale(0.9)';
      setTimeout(function () { el.style.transform = 'scale(1.1)'; }, 100);
      setTimeout(function () { el.style.transform = 'scale(1)'; }, 200);
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // HEAT MAP CURSOR — Leave a heat trail as cursor moves
  // ─────────────────────────────────────────────────────────────────
  function heatMapCursor(target) {
    var el = typeof target === 'string' ? document.querySelector(target) : (target || document.body);
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9998;opacity:0.6;mix-blend-mode:screen;';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', function () {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    var points = [];
    document.addEventListener('mousemove', function (e) {
      points.push({ x: e.clientX, y: e.clientY, t: Date.now(), life: 1 });
      if (points.length > 200) points.shift();
    });
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var now = Date.now();
      points.forEach(function (p) {
        var age = (now - p.t) / 2000;
        if (age > 1) return;
        var alpha = (1 - age) * 0.3;
        var r = (1 - age) * 30 + 5;
        var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        grad.addColorStop(0, 'rgba(255,' + Math.floor((1 - age) * 100) + ',0,' + alpha + ')');
        grad.addColorStop(0.5, 'rgba(255,200,0,' + alpha * 0.5 + ')');
        grad.addColorStop(1, 'rgba(0,100,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
    return { canvas: canvas, destroy: function () { canvas.remove(); } };
  }

  // ─────────────────────────────────────────────────────────────────
  // SPOTLIGHT BEAM — Theatrical spotlight following cursor
  // ─────────────────────────────────────────────────────────────────
  function spotlight(target, options) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var opts = options || {};
    var size = opts.size || 300;
    var color = opts.color || 'rgba(255,255,200,0.15)';
    el.style.position = el.style.position || 'relative';
    el.style.overflow = 'hidden';
    var light = document.createElement('div');
    light.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:radial-gradient(circle,' + color + ' 0%,transparent 70%);pointer-events:none;transform:translate(-50%,-50%);transition:left 0.1s,top 0.1s;left:-200px;top:-200px;z-index:5;';
    el.appendChild(light);
    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      light.style.left = (e.clientX - rect.left) + 'px';
      light.style.top = (e.clientY - rect.top) + 'px';
    });
    el.addEventListener('mouseleave', function () { light.style.left = '-200px'; light.style.top = '-200px'; });
    return { light: light };
  }

  // ─────────────────────────────────────────────────────────────────
  // TYPING RAIN — Matrix-like text rain but with custom characters
  // ─────────────────────────────────────────────────────────────────
  function typingRain(target, options) {
    var canvas = document.createElement('canvas');
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var opts = options || {};
    var chars = opts.chars || 'NANDANXABCDEF0123456789@#$%';
    var color = opts.color || '#00f5ff';
    var speed = opts.speed || 1;
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0.4;';
    el.style.position = el.style.position || 'relative';
    el.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    function resize() { canvas.width = el.offsetWidth; canvas.height = el.offsetHeight; }
    resize();
    var cols = Math.floor(canvas.width / 16);
    var drops = Array(cols).fill(1);
    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.font = '14px monospace';
      drops.forEach(function (y, i) {
        var ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * 16, y * 16);
        if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += speed;
      });
    }
    var iv = setInterval(draw, 50);
    return { stop: function () { clearInterval(iv); }, canvas: canvas };
  }

  // ─────────────────────────────────────────────────────────────────
  // MAGNETIC MENU — Menu items repel each other on hover
  // ─────────────────────────────────────────────────────────────────
  function magneticMenu(target) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var items = el.querySelectorAll('li, a, [data-menu-item]');
    items.forEach(function (item) {
      item.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), color 0.3s';
      item.style.display = 'inline-block';
      item.addEventListener('mousemove', function (e) {
        var rect = item.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) / rect.width * 20;
        var dy = (e.clientY - cy) / rect.height * 20;
        item.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.1)';
        item.style.color = '#00f5ff';
      });
      item.addEventListener('mouseleave', function () {
        item.style.transform = 'translate(0,0) scale(1)';
        item.style.color = '';
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // SCROLL FIRE — Elements ignite as you scroll past them
  // ─────────────────────────────────────────────────────────────────
  function scrollFire(target, options) {
    var els = typeof target === 'string' ? document.querySelectorAll(target) : [target];
    var opts = options || {};
    var effect = opts.effect || 'glow';
    if (!document.getElementById('nx-scroll-fire-styles')) {
      var s = document.createElement('style');
      s.id = 'nx-scroll-fire-styles';
      s.textContent = `
        .nx-fire-glow { transition: box-shadow 0.6s, border-color 0.6s; }
        .nx-fire-glow.nx-fired { box-shadow: 0 0 30px #ff006e, 0 0 60px #ff006e44; border-color: #ff006e !important; }
        .nx-fire-scale { transition: transform 0.6s cubic-bezier(0.34,1.56,0.64,1); }
        .nx-fire-scale.nx-fired { transform: scale(1.05); }
        .nx-fire-color { transition: background 0.6s, color 0.6s; }
        .nx-fire-color.nx-fired { background: linear-gradient(135deg,#00f5ff22,#ff006e22); }
      `;
      document.head.appendChild(s);
    }
    els.forEach(function (el) {
      el.classList.add('nx-fire-' + effect);
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { el.classList.add('nx-fired'); }
          else { el.classList.remove('nx-fired'); }
        });
      }, { threshold: 0.3 });
      obs.observe(el);
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // WOBBLE BUTTON — Jelly physics on button press
  // ─────────────────────────────────────────────────────────────────
  function wobbleButton(target) {
    var els = typeof target === 'string' ? document.querySelectorAll(target) : [target];
    if (!document.getElementById('nx-wobble-btn-styles')) {
      var s = document.createElement('style');
      s.id = 'nx-wobble-btn-styles';
      s.textContent = '@keyframes nxWobbleBtn{0%{transform:scale(1)}15%{transform:scale(0.92,1.08)}30%{transform:scale(1.1,0.92)}45%{transform:scale(0.96,1.04)}60%{transform:scale(1.04,0.98)}75%{transform:scale(0.99,1.01)}100%{transform:scale(1)}}';
      document.head.appendChild(s);
    }
    els.forEach(function (el) {
      el.addEventListener('click', function () {
        el.style.animation = 'none';
        el.offsetHeight; // reflow
        el.style.animation = 'nxWobbleBtn 0.6s cubic-bezier(0.36,0.07,0.19,0.97)';
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────
  return {
    aurora: aurora,
    pixelReveal: pixelReveal,
    soundWave: soundWave,
    neonText: neonText,
    cardStack: cardStack,
    glitchImage: glitchImage,
    particleText: particleText,
    heatMapCursor: heatMapCursor,
    spotlight: spotlight,
    typingRain: typingRain,
    magneticMenu: magneticMenu,
    scrollFire: scrollFire,
    wobbleButton: wobbleButton,
  };
})();

if (typeof window !== 'undefined') {
  window.NXCreative = NXCreative;
}
