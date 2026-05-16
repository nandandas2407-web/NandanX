/**
 * NandanX — scene3DEngine
 * Full 3D scene: camera, lights, objects, drag/rotate/zoom, 3D UI elements
 * Uses Three.js if available, or canvas 2.5D fallback
 */
class Scene3DEngine {
  constructor() {
    this.initialized = false;
    this.scenes = new Map();
    this.THREE = null;
  }

  init(options = {}) {
    if (this.initialized) return this;
    this.THREE = window.THREE || null;
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-scene3d-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-scene3d-styles';
    s.textContent = `
      .nx-scene3d { position: relative; overflow: hidden; }
      .nx-scene3d canvas { display: block; width: 100%; height: 100%; }
      .nx-3d-card { transform-style: preserve-3d; transition: transform 0.5s ease; }
      .nx-3d-btn { transform-style: preserve-3d; }
      .nx-3d-btn:hover { transform: translateZ(8px); }
    `;
    document.head.appendChild(s);
  }

  // Create a Three.js scene in a container
  create(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;
    const THREE = this.THREE;
    if (!THREE) {
      console.warn('[NandanX Scene3D] Three.js not found. Include Three.js for full 3D.');
      return this._fallbackScene(el, options);
    }

    el.classList.add('nx-scene3d');
    const w = el.offsetWidth || 400, h = el.offsetHeight || 300;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = options.shadows || false;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    if (options.fog) scene.fog = new THREE.FogExp2(options.fogColor || 0x0a0a12, options.fogDensity || 0.05);

    const camera = new THREE.PerspectiveCamera(options.fov || 60, w / h, 0.1, 1000);
    camera.position.set(...(options.cameraPos || [0, 0, 5]));

    // Lights
    const ambientLight = new THREE.AmbientLight(options.ambientColor || 0x404040, options.ambientIntensity || 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(options.lightColor || 0xffffff, options.lightIntensity || 1);
    dirLight.position.set(5, 10, 5);
    if (options.shadows) dirLight.castShadow = true;
    scene.add(dirLight);

    if (options.pointLights) {
      options.pointLights.forEach(cfg => {
        const pl = new THREE.PointLight(cfg.color || 0x00f5ff, cfg.intensity || 1, cfg.distance || 100);
        pl.position.set(...(cfg.position || [0, 0, 0]));
        scene.add(pl);
      });
    }

    // Resize handling
    window.addEventListener('resize', () => {
      const nw = el.offsetWidth, nh = el.offsetHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });

    const sceneObj = {
      renderer, scene, camera, THREE,
      objects: [],
      clock: new THREE.Clock(),
      animFns: [],
      orbitEnabled: false,
    };

    // Orbit controls (manual implementation)
    if (options.orbit) this._addOrbit(sceneObj, renderer.domElement, options.orbit);

    // Render loop
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = sceneObj.clock.getDelta();
      sceneObj.animFns.forEach(fn => fn(delta, sceneObj));
      renderer.render(scene, camera);
    };
    animate();

    this.scenes.set(el, sceneObj);
    return sceneObj;
  }

  _addOrbit(sceneObj, domEl, options = {}) {
    let isDown = false, px = 0, py = 0;
    let rotX = 0, rotY = 0, zoom = sceneObj.camera.position.z;

    domEl.addEventListener('mousedown', e => { isDown = true; px = e.clientX; py = e.clientY; });
    domEl.addEventListener('mousemove', e => {
      if (!isDown) return;
      rotY += (e.clientX - px) * 0.005;
      rotX += (e.clientY - py) * 0.005;
      px = e.clientX; py = e.clientY;
      sceneObj.camera.position.x = Math.sin(rotY) * zoom;
      sceneObj.camera.position.z = Math.cos(rotY) * zoom;
      sceneObj.camera.position.y = rotX * zoom * 0.5;
      sceneObj.camera.lookAt(0, 0, 0);
    });
    domEl.addEventListener('mouseup', () => { isDown = false; });
    domEl.addEventListener('wheel', e => {
      zoom = Math.max(1, Math.min(20, zoom + e.deltaY * 0.01));
      sceneObj.camera.position.setLength(zoom);
      sceneObj.camera.lookAt(0, 0, 0);
    }, { passive: true });
    // Touch
    let touches = [];
    domEl.addEventListener('touchstart', e => { touches = Array.from(e.touches); });
    domEl.addEventListener('touchmove', e => {
      if (e.touches.length === 1) {
        rotY += (e.touches[0].clientX - touches[0].clientX) * 0.005;
        rotX += (e.touches[0].clientY - touches[0].clientY) * 0.005;
        touches = Array.from(e.touches);
        sceneObj.camera.position.x = Math.sin(rotY) * zoom;
        sceneObj.camera.position.z = Math.cos(rotY) * zoom;
        sceneObj.camera.position.y = rotX * zoom * 0.5;
        sceneObj.camera.lookAt(0, 0, 0);
      } else if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const od = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
        zoom = Math.max(1, Math.min(20, zoom - (d - od) * 0.02));
        sceneObj.camera.position.setLength(zoom);
        sceneObj.camera.lookAt(0, 0, 0);
        touches = Array.from(e.touches);
      }
    }, { passive: true });
  }

  // Add mesh to scene
  addMesh(sceneObj, geometry, material, options = {}) {
    const { THREE, scene } = sceneObj;
    let geo, mat;

    // Geometry presets
    const geos = {
      box: () => new THREE.BoxGeometry(...(geometry.size || [1,1,1])),
      sphere: () => new THREE.SphereGeometry(geometry.radius || 1, 32, 32),
      torus: () => new THREE.TorusGeometry(geometry.radius || 1, geometry.tube || 0.3, 16, 100),
      cylinder: () => new THREE.CylinderGeometry(...(geometry.args || [1,1,2,32])),
      cone: () => new THREE.ConeGeometry(geometry.radius || 1, geometry.height || 2, 32),
      plane: () => new THREE.PlaneGeometry(...(geometry.size || [5,5])),
      torus_knot: () => new THREE.TorusKnotGeometry(geometry.radius || 1, geometry.tube || 0.3),
    };
    geo = typeof geometry === 'string' ? (geos[geometry] || geos.box)() :
          (geometry.type ? (geos[geometry.type] || geos.box)() : geometry);

    // Material presets
    const mats = {
      standard: () => new THREE.MeshStandardMaterial(material),
      phong: () => new THREE.MeshPhongMaterial(material),
      basic: () => new THREE.MeshBasicMaterial(material),
      wireframe: () => new THREE.MeshBasicMaterial({ color: material.color || 0x00f5ff, wireframe: true }),
      glass: () => new THREE.MeshPhysicalMaterial({ color: material.color || 0xffffff, transparent: true, opacity: 0.2, roughness: 0, metalness: 0.8 }),
      neon: () => new THREE.MeshBasicMaterial({ color: material.color || 0x00f5ff }),
    };
    mat = typeof material === 'string' ? (mats[material] || mats.standard)() :
          (material.preset ? (mats[material.preset] || mats.standard)() : new THREE.MeshStandardMaterial(material));

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...(options.position || [0,0,0]));
    mesh.rotation.set(...(options.rotation || [0,0,0]));
    mesh.scale.set(...(options.scale || [1,1,1]));
    if (options.castShadow) mesh.castShadow = true;
    if (options.receiveShadow) mesh.receiveShadow = true;
    scene.add(mesh);
    sceneObj.objects.push(mesh);

    if (options.autoRotate) {
      const speed = options.autoRotate === true ? [0.5, 0.5, 0] : options.autoRotate;
      sceneObj.animFns.push((delta) => {
        mesh.rotation.x += delta * speed[0];
        mesh.rotation.y += delta * speed[1];
        mesh.rotation.z += delta * speed[2];
      });
    }
    return mesh;
  }

  // Particle system in 3D
  particles3D(sceneObj, count, options = {}) {
    const { THREE, scene } = sceneObj;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const spread = options.spread || 10;
    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * spread;
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: options.color || 0x00f5ff,
      size: options.size || 0.05,
      transparent: true,
      opacity: options.opacity || 0.8,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    const rotSpeed = options.rotateSpeed || 0.05;
    sceneObj.animFns.push((delta) => {
      points.rotation.y += delta * rotSpeed;
    });
    return points;
  }

  // 3D floating card with hover interaction
  card3D(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.classList.add('nx-3d-card');
    el.style.transformStyle = 'preserve-3d';
    const depth = options.depth || 20;
    const maxAngle = options.maxAngle || 20;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rx = ((e.clientY - cy) / (rect.height / 2)) * maxAngle;
      const ry = -((e.clientX - cx) / (rect.width / 2)) * maxAngle;
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${depth}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
    });
    return this;
  }

  // 3D button press
  button3D(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    el.style.cssText += 'transform-style:preserve-3d;transition:transform 0.1s ease;';
    el.addEventListener('mousedown', () => {
      el.style.transform = 'translateZ(-4px) translateY(2px)';
    });
    el.addEventListener('mouseup', () => {
      el.style.transform = 'translateZ(0) translateY(0)';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translateZ(0) translateY(0)';
    });
    return this;
  }

  _fallbackScene(el, options) {
    el.style.cssText += 'display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);color:#00f5ff;font-size:12px;font-family:monospace;';
    el.textContent = '3D: Include Three.js for full scene';
    return null;
  }
}

const scene3DEngine = new Scene3DEngine();
