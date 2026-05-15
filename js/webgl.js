class WebGLEngine {
  constructor() {
    this.initialized = false;
    this._programs = new Map();
  }

  init() {
    if (this.initialized) return this;
    this.initialized = true;
    return this;
  }

  _createCanvas(container, options) {
    const opts = Object.assign({ width: null, height: null, alpha: true }, options || {});
    const el = typeof container === 'string' ? document.querySelector(container) : container || document.body;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    el.style.position = el.style.position || 'relative';
    el.insertBefore(canvas, el.firstChild);
    canvas.width = opts.width || el.offsetWidth || window.innerWidth;
    canvas.height = opts.height || el.offsetHeight || window.innerHeight;
    window.addEventListener('resize', VeloxUtils.debounce(() => {
      canvas.width = el.offsetWidth || window.innerWidth;
      canvas.height = el.offsetHeight || window.innerHeight;
    }, 200));
    return canvas;
  }

  _compileShader(gl, type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[VeloxUI WebGL] Shader error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  _createProgram(gl, vertSrc, fragSrc) {
    const vert = this._compileShader(gl, gl.VERTEX_SHADER, vertSrc);
    const frag = this._compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
    if (!vert || !frag) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[VeloxUI WebGL] Program error:', gl.getProgramInfoLog(prog));
      return null;
    }
    gl.deleteShader(vert);
    gl.deleteShader(frag);
    return prog;
  }

  _quad(gl) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    return buf;
  }

  gradient(container, options) {
    const opts = Object.assign({
      colors: ['#00f5ff', '#7c3aed', '#ff006e'],
      speed: 0.5, grain: 0.03, animate: true,
    }, options || {});
    const canvas = this._createCanvas(container);
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return this._fallbackGradient(canvas, opts);

    const vertSrc = `attribute vec2 pos; void main(){gl_Position=vec4(pos,0,1);}`;
    const hexToVec3 = h => {
      const r = VeloxUtils.hexToRgb(h) || { r: 0, g: 0, b: 0 };
      return [r.r/255, r.g/255, r.b/255];
    };
    const c = opts.colors.map(hexToVec3);
    const fragSrc = `
      precision mediump float;
      uniform vec2 res; uniform float time; uniform float grain;
      uniform vec3 c0, c1, c2;
      float rand(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      void main(){
        vec2 uv=gl_FragCoord.xy/res;
        float t=time*0.3;
        float a=sin(uv.x*2.0+t)*0.5+0.5;
        float b=cos(uv.y*1.5+t*0.7)*0.5+0.5;
        vec3 col=mix(mix(c0,c1,a),c2,b);
        col+=grain*(rand(uv+t)-0.5);
        gl_FragColor=vec4(col,1.0);
      }
    `;
    const prog = this._createProgram(gl, vertSrc, fragSrc);
    if (!prog) return this;
    const buf = this._quad(gl);
    const posLoc = gl.getAttribLocation(prog, 'pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(prog);
    const uRes = gl.getUniformLocation(prog, 'res');
    const uTime = gl.getUniformLocation(prog, 'time');
    const uGrain = gl.getUniformLocation(prog, 'grain');
    ['c0','c1','c2'].forEach((n, i) => {
      const u = gl.getUniformLocation(prog, n);
      const color = c[i] || c[c.length - 1];
      gl.uniform3fv(u, new Float32Array(color));
    });
    gl.uniform1f(uGrain, opts.grain);
    let t = 0;
    const draw = () => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (opts.animate) { t += opts.speed * 0.016; requestAnimationFrame(draw); }
    };
    draw();
    return this;
  }

  _fallbackGradient(canvas, opts) {
    const ctx = canvas.getContext('2d');
    const draw = () => {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      opts.colors.forEach((c, i) => grad.addColorStop(i / (opts.colors.length - 1), c));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    draw();
    return this;
  }

  rippleEffect(container, options) {
    const opts = Object.assign({ color: [0, 245, 255], intensity: 0.4, speed: 1 }, options || {});
    const canvas = this._createCanvas(container, { alpha: true });
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return this;
    const vertSrc = `attribute vec2 pos; void main(){gl_Position=vec4(pos,0,1);}`;
    const fragSrc = `
      precision mediump float;
      uniform vec2 res, mouse; uniform float time, intensity;
      uniform vec3 color;
      void main(){
        vec2 uv=gl_FragCoord.xy/res;
        vec2 m=mouse/res; m.y=1.0-m.y;
        float d=distance(uv,m);
        float r=sin(d*40.0-time*3.0)*0.5+0.5;
        float mask=smoothstep(0.5,0.0,d);
        float alpha=r*mask*intensity;
        gl_FragColor=vec4(color/255.0,alpha);
      }
    `;
    const prog = this._createProgram(gl, vertSrc, fragSrc);
    if (!prog) return this;
    this._quad(gl);
    const posLoc = gl.getAttribLocation(prog, 'pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    const uRes = gl.getUniformLocation(prog, 'res');
    const uMouse = gl.getUniformLocation(prog, 'mouse');
    const uTime = gl.getUniformLocation(prog, 'time');
    const uIntensity = gl.getUniformLocation(prog, 'intensity');
    const uColor = gl.getUniformLocation(prog, 'color');
    gl.uniform3fv(uColor, new Float32Array(opts.color));
    gl.uniform1f(uIntensity, opts.intensity);
    let mouse = { x: 0, y: 0 }, t = 0;
    document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    const draw = () => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      t += 0.016 * opts.speed;
      requestAnimationFrame(draw);
    };
    draw();
    return this;
  }

  plasma(container, options) {
    const opts = Object.assign({ speed: 1, scale: 3, palette: 0 }, options || {});
    const canvas = this._createCanvas(container);
    const ctx = canvas.getContext('2d');
    let t = 0;
    const W = () => canvas.width, H = () => canvas.height;
    const palettes = [
      (v) => `hsl(${v * 360},80%,50%)`,
      (v) => `hsl(${180 + v * 120},90%,55%)`,
      (v) => `hsl(${v * 60},100%,50%)`,
    ];
    const pal = palettes[opts.palette % palettes.length];
    const draw = () => {
      const w = W(), h = H();
      const imageData = ctx.createImageData(w >> 1, h >> 1);
      const d = imageData.data;
      for (let y = 0; y < h >> 1; y++) {
        for (let x = 0; x < w >> 1; x++) {
          const nx = x / (w >> 1) * opts.scale, ny = y / (h >> 1) * opts.scale;
          const v = (Math.sin(nx + t) + Math.sin(ny + t) + Math.sin((nx + ny) / 2 + t) + Math.sin(Math.sqrt(nx*nx + ny*ny) + t)) / 4;
          const n = (v + 1) / 2;
          const rgb = VeloxUtils.hexToRgb(pal(n).startsWith('hsl') ? '#00f5ff' : pal(n)) || { r: Math.round(n*255), g: Math.round((1-n)*200), b: 255 };
          const pi = (y * (w >> 1) + x) * 4;
          d[pi] = Math.round(Math.abs(Math.sin((n + t) * Math.PI)) * 255);
          d[pi+1] = Math.round(Math.abs(Math.sin((n * 2 + t * 0.7) * Math.PI)) * 200);
          d[pi+2] = Math.round(Math.abs(Math.cos((n * 3 + t * 0.5) * Math.PI)) * 255);
          d[pi+3] = 200;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      ctx.drawImage(canvas, 0, 0, w >> 1, h >> 1, 0, 0, w, h);
      t += 0.015 * opts.speed;
      requestAnimationFrame(draw);
    };
    draw();
    return this;
  }

  metaballs(container, options) {
    const opts = Object.assign({ count: 5, speed: 0.5, color: '#00f5ff', threshold: 1.0 }, options || {});
    const canvas = this._createCanvas(container);
    const ctx = canvas.getContext('2d');
    const W = () => canvas.width, H = () => canvas.height;
    const balls = Array.from({ length: opts.count }, () => ({
      x: Math.random() * W(), y: Math.random() * H(),
      vx: VeloxUtils.randomBetween(-1, 1) * opts.speed,
      vy: VeloxUtils.randomBetween(-1, 1) * opts.speed,
      r: VeloxUtils.randomBetween(60, 120),
    }));
    const rgb = VeloxUtils.hexToRgb(opts.color) || { r: 0, g: 245, b: 255 };
    const draw = () => {
      const w = W(), h = H();
      const step = 6;
      ctx.clearRect(0, 0, w, h);
      balls.forEach(b => {
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0 || b.x > w) b.vx *= -1;
        if (b.y < 0 || b.y > h) b.vy *= -1;
      });
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          let sum = 0;
          balls.forEach(b => {
            const dx = x - b.x, dy = y - b.y;
            sum += b.r * b.r / (dx*dx + dy*dy);
          });
          if (sum >= opts.threshold) {
            const alpha = VeloxUtils.clamp((sum - opts.threshold) * 3, 0, 1);
            ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha * 0.8})`;
            ctx.fillRect(x, y, step, step);
          }
        }
      }
      requestAnimationFrame(draw);
    };
    draw();
    return this;
  }
}

var webglEngine = new WebGLEngine();
if (typeof window !== 'undefined') window.VeloxWebGL = webglEngine;
