/**
 * NandanX — shaderEngine
 * WebGL shader-based backgrounds: plasma, aurora, fluid, waves, holographic
 */
class ShaderEngine {
  constructor() {
    this.initialized = false;
    this.canvases = [];
  }

  init(options = {}) {
    if (this.initialized) return this;
    this.initialized = true;
    return this;
  }

  _createCanvas(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;`;
    if (options.blend) canvas.style.mixBlendMode = options.blend;
    el.style.position = el.style.position || 'relative';
    el.insertBefore(canvas, el.firstChild);
    canvas.width = el.offsetWidth || window.innerWidth;
    canvas.height = el.offsetHeight || window.innerHeight;
    window.addEventListener('resize', () => {
      canvas.width = el.offsetWidth || window.innerWidth;
      canvas.height = el.offsetHeight || window.innerHeight;
    });
    return canvas;
  }

  _initGL(canvas) {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;
    return gl;
  }

  _compile(gl, vertSrc, fragSrc) {
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('[NandanX Shader]', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const prog = gl.createProgram();
    const vert = compile(gl.VERTEX_SHADER, vertSrc);
    const frag = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vert || !frag) return null;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    return prog;
  }

  _baseSetup(gl, prog) {
    const verts = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  }

  _baseVert() {
    return `attribute vec2 a_position; void main() { gl_Position = vec4(a_position, 0, 1); }`;
  }

  // Plasma / lava lamp effect
  plasma(container, options = {}) {
    const canvas = this._createCanvas(container, options);
    if (!canvas) return this;
    const gl = this._initGL(canvas);
    if (!gl) return this._fallback2D(canvas, 'plasma', options);

    const frag = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float v = 0.0;
        v += sin(uv.x * 8.0 + u_time) * 0.5;
        v += sin(uv.y * 6.0 + u_time * 0.7) * 0.5;
        v += sin((uv.x + uv.y) * 5.0 + u_time * 0.5) * 0.5;
        v += sin(sqrt(pow(uv.x - 0.5, 2.0) + pow(uv.y - 0.5, 2.0)) * 12.0 + u_time) * 0.5;
        v = (sin(v) + 1.0) * 0.5;
        vec3 col = mix(u_color1, u_color2, v);
        gl_FragColor = vec4(col, 0.9);
      }
    `;
    const prog = this._compile(gl, this._baseVert(), frag);
    if (!prog) return this;
    gl.useProgram(prog);
    this._baseSetup(gl, prog);

    const c1 = options.color1 || [0, 0.96, 1];
    const c2 = options.color2 || [0.49, 0.23, 0.93];
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uC1 = gl.getUniformLocation(prog, 'u_color1');
    const uC2 = gl.getUniformLocation(prog, 'u_color2');
    gl.uniform3fv(uC1, c1);
    gl.uniform3fv(uC2, c2);
    const speed = options.speed || 0.8;

    const loop = (t) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, t * 0.001 * speed);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }

  // Fluid / ink diffusion
  fluid(container, options = {}) {
    const canvas = this._createCanvas(container, options);
    if (!canvas) return this;
    const gl = this._initGL(canvas);
    if (!gl) return this._fallback2D(canvas, 'fluid', options);

    const frag = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform vec2 u_mouse;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        vec2 m = u_mouse / u_res;
        float d = distance(uv, m);
        float wave = sin(d * 20.0 - u_time * 3.0) * exp(-d * 5.0);
        vec2 distort = uv + wave * 0.05 * normalize(uv - m);
        float r = sin(distort.x * 5.0 + u_time) * 0.5 + 0.5;
        float g = sin(distort.y * 5.0 + u_time * 0.7 + 2.0) * 0.5 + 0.5;
        float b = sin((distort.x + distort.y) * 5.0 + u_time * 0.5 + 4.0) * 0.5 + 0.5;
        gl_FragColor = vec4(r * 0.1, g * 0.2, b * 0.8, 0.85);
      }
    `;
    const prog = this._compile(gl, this._baseVert(), frag);
    if (!prog) return this;
    gl.useProgram(prog);
    this._baseSetup(gl, prog);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    let mx = canvas.width / 2, my = canvas.height / 2;
    canvas.parentElement.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left; my = canvas.height - (e.clientY - r.top);
    });

    const loop = (t) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }

  // Aurora borealis shader
  aurora(container, options = {}) {
    const canvas = this._createCanvas(container, options);
    if (!canvas) return this;
    const gl = this._initGL(canvas);
    if (!gl) return this;

    const frag = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        float a = hash(i), b = hash(i + vec2(1,0)), c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float t = u_time * 0.3;
        float n = noise(uv * vec2(3.0, 1.0) + vec2(t, 0.0));
        n += 0.5 * noise(uv * vec2(6.0, 2.0) + vec2(t * 1.3, 0.0));
        float band = smoothstep(0.2, 0.8, uv.y) * (1.0 - smoothstep(0.6, 1.0, uv.y));
        float aurora = smoothstep(0.4, 0.6, n) * band;
        vec3 col1 = vec3(0.0, 0.9, 0.6);
        vec3 col2 = vec3(0.3, 0.1, 0.8);
        vec3 col3 = vec3(0.0, 0.6, 1.0);
        float t2 = sin(uv.x * 3.0 + t) * 0.5 + 0.5;
        vec3 auroraColor = mix(mix(col1, col2, t2), col3, aurora * 0.5);
        gl_FragColor = vec4(auroraColor * aurora, aurora * 0.8);
      }
    `;
    const prog = this._compile(gl, this._baseVert(), frag);
    if (!prog) return this;
    gl.useProgram(prog);
    this._baseSetup(gl, prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');

    const loop = (t) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }

  // Wave distortion background
  waves(container, options = {}) {
    const canvas = this._createCanvas(container, options);
    if (!canvas) return this;
    const gl = this._initGL(canvas);
    if (!gl) return this;

    const frag = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform vec3 u_color;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float wave = 0.0;
        for(int i = 1; i <= 5; i++) {
          float fi = float(i);
          wave += sin(uv.x * fi * 4.0 + u_time * fi * 0.4) * (0.3 / fi);
        }
        float y = uv.y + wave * 0.15;
        float band1 = smoothstep(0.45, 0.55, y);
        float band2 = smoothstep(0.55, 0.65, y);
        vec3 col = mix(u_color * 0.2, u_color, 1.0 - band1);
        col = mix(col, u_color * 0.5, band2);
        gl_FragColor = vec4(col, 0.7);
      }
    `;
    const prog = this._compile(gl, this._baseVert(), frag);
    if (!prog) return this;
    gl.useProgram(prog);
    this._baseSetup(gl, prog);

    const c = options.color || [0, 0.96, 1];
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uColor = gl.getUniformLocation(prog, 'u_color');
    gl.uniform3fv(uColor, c);

    const loop = (t) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }

  // Holographic iridescent shader
  holographic(container, options = {}) {
    const canvas = this._createCanvas(container, options);
    if (!canvas) return this;
    const gl = this._initGL(canvas);
    if (!gl) return this;

    const frag = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform vec2 u_mouse;
      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        vec2 m = u_mouse / u_res;
        vec2 d = uv - m;
        float angle = atan(d.y, d.x);
        float dist = length(d);
        float holo = sin(angle * 5.0 + u_time * 2.0) * 0.5 + 0.5;
        holo *= sin(dist * 20.0 - u_time) * 0.5 + 0.5;
        float r = sin(holo * 6.28 + 0.0) * 0.5 + 0.5;
        float g = sin(holo * 6.28 + 2.09) * 0.5 + 0.5;
        float b = sin(holo * 6.28 + 4.19) * 0.5 + 0.5;
        gl_FragColor = vec4(r, g, b, holo * 0.6);
      }
    `;
    const prog = this._compile(gl, this._baseVert(), frag);
    if (!prog) return this;
    gl.useProgram(prog);
    this._baseSetup(gl, prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    let mx = canvas.width / 2, my = canvas.height / 2;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = window.innerHeight - e.clientY; });

    const loop = (t) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }

  _fallback2D(canvas, type, options) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const colors = options.colors || ['#00f5ff', '#7c3aed', '#ff006e'];
    let t = 0;
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, w, h);
      colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      t += 0.01;
      requestAnimationFrame(loop);
    };
    loop();
    return this;
  }

  // Custom shader from string
  custom(container, fragShader, uniforms = {}, options = {}) {
    const canvas = this._createCanvas(container, options);
    if (!canvas) return this;
    const gl = this._initGL(canvas);
    if (!gl) return this;
    const prog = this._compile(gl, this._baseVert(), fragShader);
    if (!prog) return this;
    gl.useProgram(prog);
    this._baseSetup(gl, prog);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    let mx = 0.5, my = 0.5;
    document.addEventListener('mousemove', e => { mx = e.clientX / window.innerWidth; my = 1 - e.clientY / window.innerHeight; });

    const loop = (t) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mx * canvas.width, my * canvas.height);
      Object.keys(uniforms).forEach(k => {
        const u = gl.getUniformLocation(prog, k);
        const v = uniforms[k];
        if (Array.isArray(v)) gl[`uniform${v.length}fv`](u, v);
        else gl.uniform1f(u, v);
      });
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return this;
  }
}

const shaderEngine = new ShaderEngine();
