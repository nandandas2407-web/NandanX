var VeloxConfig = {
  version: '1.0.0',
  author: 'Nandan Das',

  defaults: {
    duration: 600,
    easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
    easingBounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    easingElastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    color: {
      primary: '#00f5ff',
      secondary: '#ff006e',
      accent: '#7c3aed',
      glow: 'rgba(0,245,255,0.4)',
    }
  },

  moods: {
    soft: {
      speed: 0.6, intensity: 0.4, particleCount: 20, glowStrength: 0.3,
      colors: ['#ffd6e7', '#c3aed6', '#a8d8ea'],
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      cursorStyle: 'soft', blur: 8,
    },
    hyper: {
      speed: 2.5, intensity: 1.0, particleCount: 120, glowStrength: 1.0,
      colors: ['#00f5ff', '#ff006e', '#ffe600', '#00ff88'],
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      cursorStyle: 'hyper', blur: 0,
    },
    calm: {
      speed: 0.4, intensity: 0.2, particleCount: 10, glowStrength: 0.15,
      colors: ['#e0f2fe', '#bae6fd', '#7dd3fc'],
      easing: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
      cursorStyle: 'calm', blur: 4,
    },
    aggressive: {
      speed: 3.0, intensity: 1.5, particleCount: 200, glowStrength: 2.0,
      colors: ['#ff0000', '#ff4500', '#ff8c00'],
      easing: 'cubic-bezier(0.6, -0.28, 0.74, 0.05)',
      cursorStyle: 'aggressive', blur: 0,
    },
    broken: {
      speed: 1.8, intensity: 1.2, particleCount: 80, glowStrength: 0.8,
      colors: ['#00ff00', '#ff00ff', '#ffff00'],
      easing: 'steps(4)', cursorStyle: 'glitch', blur: 0, glitch: true,
    },
    romantic: {
      speed: 0.5, intensity: 0.6, particleCount: 40, glowStrength: 0.7,
      colors: ['#ff69b4', '#ff1493', '#ffc0cb', '#ffb6c1'],
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      cursorStyle: 'heart', blur: 6,
    },
  },

  particles: {
    ambient: { count: 60, speed: 0.3, size: [1, 3], opacity: [0.2, 0.6] },
    cursor: { count: 20, speed: 0.8, size: [2, 5], lifetime: 800 },
    explosion: { count: 40, speed: 4.0, size: [3, 8], lifetime: 600 },
    stars: { count: 150, speed: 0.1, size: [1, 2], opacity: [0.3, 1.0] },
  },

  physics: {
    gravity: 0.4, friction: 0.95, bounce: 0.7,
    magnetStrength: 0.25, elasticity: 0.15, airResistance: 0.99,
  },

  scroll: {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
    staggerDelay: 80,
  },

  tilt: {
    maxAngle: 15, perspective: 1000, scale: 1.05,
    speed: 300, glare: true, glareOpacity: 0.3,
  },

  emotion: {
    wpm: { slow: 20, normal: 40, fast: 80 },
    pauses: { short: 500, medium: 1500, long: 3000 },
    backspaceWeight: 2.5, burstThreshold: 5,
  },
};

if (typeof window !== 'undefined') window.VeloxConfig = VeloxConfig;
