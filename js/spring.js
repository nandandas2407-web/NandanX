/**
 * VeloxUI — springEngine
 * Spring/inertia physics for UI animations
 */
class SpringEngine {
  constructor() { this.initialized = false; this.springs = new Map(); }
  init() { if (this.initialized) return this; this.initialized = true; return this; }
  create(options = {}) {
    const stiffness = options.stiffness || 180;
    const damping = options.damping || 22;
    const mass = options.mass || 1;
    let value = options.value || 0;
    let velocity = 0;
    let target = value;
    let subscribers = [];
    let rafId = null;
    const step = () => {
      const springForce = -stiffness * (value - target);
      const dampingForce = -damping * velocity;
      const acceleration = (springForce + dampingForce) / mass;
      velocity += acceleration * 0.016;
      value += velocity * 0.016;
      subscribers.forEach(fn => fn(value));
      const settled = Math.abs(value - target) < 0.001 && Math.abs(velocity) < 0.001;
      if (!settled) rafId = requestAnimationFrame(step);
      else { value = target; velocity = 0; subscribers.forEach(fn => fn(value)); }
    };
    return {
      get: () => value,
      set: (v) => { target = v; cancelAnimationFrame(rafId); rafId = requestAnimationFrame(step); },
      subscribe: (fn) => { subscribers.push(fn); return () => { subscribers = subscribers.filter(s => s !== fn); }; },
      bind: (el, prop) => {
        return { get: () => value, set: (v) => { target = v; cancelAnimationFrame(rafId); rafId = requestAnimationFrame(step); subscribers.push(val => { if(el && prop) el.style[prop] = typeof val === 'number' && prop !== 'opacity' ? val + 'px' : val; }); } };
      },
    };
  }
  // Animate element property with spring physics
  animate(element, property, to, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const spring = this.create(options);
    const unsub = spring.subscribe(val => {
      if (property === 'translateX') el.style.transform = `translateX(${val}px)`;
      else if (property === 'translateY') el.style.transform = `translateY(${val}px)`;
      else if (property === 'scale') el.style.transform = `scale(${val})`;
      else el.style[property] = val + (options.unit || 'px');
    });
    spring.set(to);
    return { spring, stop: unsub };
  }
  // Elastic follow (element follows mouse with spring)
  follow(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return this;
    const sx = this.create({ stiffness: options.stiffness || 100, damping: options.damping || 15 });
    const sy = this.create({ stiffness: options.stiffness || 100, damping: options.damping || 15 });
    sx.subscribe(x => { el.style.transform = `translate(${x}px, ${parseFloat(el.style.transform.match(/translate\(.*?,\s*(.*?)px\)/)?.[1] || 0)}px)`; });
    sy.subscribe(y => { el.style.transform = `translate(${parseFloat(el.style.transform.match(/translate\((.*?)px/)?.[1] || 0)}px, ${y}px)`; });
    document.addEventListener('mousemove', e => { sx.set(e.clientX - window.innerWidth / 2); sy.set(e.clientY - window.innerHeight / 2); });
    return this;
  }
}
const springEngine = new SpringEngine();
