/**
 * NandanX — videoFiltersEngine
 * Real-time canvas video filters: grayscale, sepia, blur, neon, invert, pixelate, VHS
 */
class VideoFiltersEngine {
  constructor() { this.initialized = false; this.filters = new Map(); }
  init(options = {}) { if (this.initialized) return this; this.initialized = true; return this; }
  apply(videoEl, canvasEl, filterFn, options = {}) {
    const video = typeof videoEl === 'string' ? document.querySelector(videoEl) : videoEl;
    const canvas = typeof canvasEl === 'string' ? document.querySelector(canvasEl) : canvasEl;
    if (!video || !canvas) return this;
    const ctx = canvas.getContext('2d');
    const draw = () => {
      canvas.width = video.videoWidth || canvas.offsetWidth;
      canvas.height = video.videoHeight || canvas.offsetHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      if (filterFn) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        filterFn(imageData.data, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);
      }
      requestAnimationFrame(draw);
    };
    video.addEventListener('play', draw);
    return this;
  }
  grayscale(d) { for (let i = 0; i < d.length; i += 4) { const g = 0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; d[i]=d[i+1]=d[i+2]=g; } }
  sepia(d) { for (let i = 0; i < d.length; i += 4) { const r=d[i],g=d[i+1],b=d[i+2]; d[i]=Math.min(255,r*0.393+g*0.769+b*0.189); d[i+1]=Math.min(255,r*0.349+g*0.686+b*0.168); d[i+2]=Math.min(255,r*0.272+g*0.534+b*0.131); } }
  invert(d) { for (let i = 0; i < d.length; i += 4) { d[i]=255-d[i]; d[i+1]=255-d[i+1]; d[i+2]=255-d[i+2]; } }
  neon(d) { for (let i = 0; i < d.length; i += 4) { d[i]=d[i]>100?255:0; d[i+1]=d[i+1]>100?255:0; d[i+2]=d[i+2]>100?255:0; } }
  pixelate(d, w, h, size=8) { for(let y=0;y<h;y+=size)for(let x=0;x<w;x+=size){const idx=(y*w+x)*4;const r=d[idx],g=d[idx+1],b=d[idx+2];for(let dy=0;dy<size&&y+dy<h;dy++)for(let dx=0;dx<size&&x+dx<w;dx++){const ni=((y+dy)*w+(x+dx))*4;d[ni]=r;d[ni+1]=g;d[ni+2]=b;}} }
  applyCSS(element, filter) { const el = typeof element === 'string' ? document.querySelector(element) : element; if (el) el.style.filter = filter; return this; }
  blur(el, px=5) { return this.applyCSS(el, `blur(${px}px)`); }
  vintage(el) { return this.applyCSS(el, 'sepia(0.5) contrast(1.2) brightness(0.9) saturate(0.8)'); }
  cyberpunk(el) { return this.applyCSS(el, 'hue-rotate(180deg) saturate(2) contrast(1.3)'); }
  horror(el) { return this.applyCSS(el, 'grayscale(0.8) contrast(1.5) brightness(0.7) sepia(0.3)'); }
  warmth(el) { return this.applyCSS(el, 'sepia(0.3) saturate(1.4) brightness(1.05)'); }
  cool(el) { return this.applyCSS(el, 'hue-rotate(30deg) saturate(1.2) brightness(0.95)'); }
  reset(el) { return this.applyCSS(el, 'none'); }
}
const videoFiltersEngine = new VideoFiltersEngine();
