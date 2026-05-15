/**
 * VeloxUI — audioVisualizerEngine
 * Audio-reactive visualizations: bars, waveform, radial, particles, spectrum
 */
class AudioVisualizerEngine {
  constructor() {
    this.initialized = false;
    this.audioCtx = null;
    this.analyser = null;
    this.source = null;
    this.dataArray = null;
    this.bufferLength = 0;
    this.stream = null;
    this.visualizers = new Map();
  }

  init(options = {}) {
    if (this.initialized) return this;
    this.initialized = true;
    return this;
  }

  _ensureAudioContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
    }
    return this;
  }

  // Connect to audio element
  connectElement(audioElement, options = {}) {
    this._ensureAudioContext();
    const el = typeof audioElement === 'string' ? document.querySelector(audioElement) : audioElement;
    if (!el) return this;
    if (this.source) this.source.disconnect();
    this.source = this.audioCtx.createMediaElementSource(el);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);
    el.addEventListener('play', () => {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    });
    return this;
  }

  // Connect to microphone
  async connectMic(options = {}) {
    this._ensureAudioContext();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      if (this.source) this.source.disconnect();
      this.source = this.audioCtx.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);
      // Do NOT connect to destination (avoid feedback)
      if (options.onReady) options.onReady();
    } catch (e) {
      console.warn('[VeloxUI AudioViz] Mic access denied:', e);
    }
    return this;
  }

  _getFrequencyData() {
    if (!this.analyser) return new Uint8Array(128);
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  _getTimeDomainData() {
    if (!this.analyser) return new Uint8Array(128);
    const d = new Uint8Array(this.bufferLength);
    this.analyser.getByteTimeDomainData(d);
    return d;
  }

  // Bar visualizer
  bars(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block;';
    el.style.position = el.style.position || 'relative';
    el.appendChild(canvas);

    const resize = () => { canvas.width = el.offsetWidth; canvas.height = el.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const ctx = canvas.getContext('2d');

    const color1 = options.color1 || '#00f5ff';
    const color2 = options.color2 || '#ff006e';
    const barCount = options.barCount || 64;
    const rounded = options.rounded !== false;
    const mirror = options.mirror || false;

    const draw = () => {
      const data = this._getFrequencyData();
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const step = Math.floor(data.length / barCount);
      const barW = w / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const val = data[i * step] / 255;
        const barH = val * (mirror ? h / 2 : h);
        const x = i * (barW + 2);
        const y = mirror ? h / 2 - barH / 2 : h - barH;

        const grad = ctx.createLinearGradient(x, y, x, y + barH);
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        ctx.fillStyle = grad;

        if (rounded) {
          const r = Math.min(barW / 2, 4);
          ctx.beginPath();
          ctx.roundRect(x, y, barW, barH, r);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, barW, barH);
        }
      }
      requestAnimationFrame(draw);
    };
    draw();
    return { canvas, stop: () => {} };
  }

  // Waveform visualizer
  waveform(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block;';
    el.appendChild(canvas);
    const resize = () => { canvas.width = el.offsetWidth; canvas.height = el.offsetHeight; };
    resize();
    const ctx = canvas.getContext('2d');
    const color = options.color || '#00f5ff';
    const lineWidth = options.lineWidth || 2;

    const draw = () => {
      const data = this._getTimeDomainData();
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = color;
      ctx.shadowBlur = options.glow ? 10 : 0;

      const sliceW = w / data.length;
      let x = 0;
      data.forEach((v, i) => {
        const y = (v / 128) * h / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceW;
      });
      ctx.stroke();
      requestAnimationFrame(draw);
    };
    draw();
    return { canvas };
  }

  // Radial / circular visualizer
  radial(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block;';
    el.appendChild(canvas);
    const resize = () => { canvas.width = el.offsetWidth; canvas.height = el.offsetHeight; };
    resize();
    const ctx = canvas.getContext('2d');
    const color = options.color || '#00f5ff';
    const bars = options.bars || 80;
    const innerR = options.innerRadius || 60;
    const rotate = options.rotate || 0;

    const draw = () => {
      const data = this._getFrequencyData();
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      const step = Math.floor(data.length / bars);
      const angle = (Math.PI * 2) / bars;

      for (let i = 0; i < bars; i++) {
        const val = data[i * step] / 255;
        const len = val * (options.maxLength || 80);
        const a = angle * i + rotate;

        const x1 = cx + Math.cos(a) * innerR;
        const y1 = cy + Math.sin(a) * innerR;
        const x2 = cx + Math.cos(a) * (innerR + len);
        const y2 = cy + Math.sin(a) * (innerR + len);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `hsl(${(i / bars) * 360}, 100%, 60%)`;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.stroke();
      }
      requestAnimationFrame(draw);
    };
    draw();
    return { canvas };
  }

  // Spectrum analyzer with gradient fill
  spectrum(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return this;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block;';
    el.appendChild(canvas);
    const resize = () => { canvas.width = el.offsetWidth; canvas.height = el.offsetHeight; };
    resize();
    const ctx = canvas.getContext('2d');
    const prevData = new Float32Array(64);
    const smooth = options.smooth || 0.8;

    const draw = () => {
      const data = this._getFrequencyData();
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const barCount = 64;
      const step = Math.floor(data.length / barCount);
      const barW = w / barCount;

      for (let i = 0; i < barCount; i++) {
        const raw = data[i * step] / 255;
        prevData[i] = prevData[i] * smooth + raw * (1 - smooth);
        const barH = prevData[i] * h;

        const grad = ctx.createLinearGradient(0, h, 0, h - barH);
        grad.addColorStop(0, '#00f5ff');
        grad.addColorStop(0.5, '#7c3aed');
        grad.addColorStop(1, '#ff006e');

        ctx.fillStyle = grad;
        ctx.fillRect(i * barW, h - barH, barW - 1, barH);
      }
      requestAnimationFrame(draw);
    };
    draw();
    return { canvas };
  }

  // Beat detection
  detectBeat(callback, options = {}) {
    this._ensureAudioContext();
    const threshold = options.threshold || 180;
    const cooldown = options.cooldown || 300;
    let lastBeat = 0;

    const check = () => {
      const data = this._getFrequencyData();
      // Look at bass frequencies (first ~10 bins)
      let bass = 0;
      for (let i = 0; i < 10; i++) bass += data[i];
      bass /= 10;

      const now = Date.now();
      if (bass > threshold && now - lastBeat > cooldown) {
        lastBeat = now;
        callback(bass / 255);
      }
      requestAnimationFrame(check);
    };
    check();
    return this;
  }

  // Reactive element — scale/glow elements to beat
  reactive(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return this;

    this.detectBeat((strength) => {
      elements.forEach(el => {
        const scale = 1 + strength * (options.scale || 0.15);
        el.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
        el.style.transform = `scale(${scale})`;
        el.style.boxShadow = `0 0 ${strength * 40}px ${options.color || '#00f5ff'}`;
        setTimeout(() => {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = '';
        }, 150);
      });
    }, options);
    return this;
  }

  resume() {
    if (this.audioCtx?.state === 'suspended') this.audioCtx.resume();
    return this;
  }

  suspend() {
    if (this.audioCtx?.state === 'running') this.audioCtx.suspend();
    return this;
  }
}

const audioVisualizerEngine = new AudioVisualizerEngine();
