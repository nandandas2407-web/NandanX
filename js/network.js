class NetworkEngine {
  constructor() {
    this.initialized = false;
    this._interceptors = { request: [], response: [] };
    this._cache = new Map();
    this._pending = new Map();
    this._baseURL = '';
    this._defaultHeaders = { 'Content-Type': 'application/json' };
    this._timeout = 10000;
    this._retries = 0;
  }

  init(options) {
    if (this.initialized) return this;
    const opts = Object.assign({ baseURL: '', timeout: 10000, retries: 0 }, options || {});
    this._baseURL = opts.baseURL;
    this._timeout = opts.timeout;
    this._retries = opts.retries;
    this.initialized = true;
    return this;
  }

  setBaseURL(url) { this._baseURL = url; return this; }
  setHeader(key, value) { this._defaultHeaders[key] = value; return this; }
  setAuth(token, type) { this._defaultHeaders['Authorization'] = `${type || 'Bearer'} ${token}`; return this; }
  setTimeout(ms) { this._timeout = ms; return this; }

  interceptRequest(fn) { this._interceptors.request.push(fn); return this; }
  interceptResponse(fn) { this._interceptors.response.push(fn); return this; }

  async _request(method, url, body, options) {
    const opts = Object.assign({ headers: {}, cache: false, cacheTime: 60000, signal: null, timeout: this._timeout, retries: this._retries }, options || {});
    const fullURL = url.startsWith('http') ? url : this._baseURL + url;
    const cacheKey = method + ':' + fullURL + (body ? ':' + JSON.stringify(body) : '');

    if (opts.cache && method === 'GET' && this._cache.has(cacheKey)) {
      const cached = this._cache.get(cacheKey);
      if (Date.now() - cached.time < opts.cacheTime) return cached.data;
    }

    if (method === 'GET' && this._pending.has(cacheKey)) return this._pending.get(cacheKey);

    let config = {
      method,
      headers: Object.assign({}, this._defaultHeaders, opts.headers),
    };
    if (body) config.body = typeof body === 'string' ? body : JSON.stringify(body);

    for (const interceptor of this._interceptors.request) {
      const result = await interceptor({ url: fullURL, config, options: opts });
      if (result) { config = result.config || config; }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), opts.timeout);
    if (opts.signal) opts.signal.addEventListener('abort', () => controller.abort());
    config.signal = controller.signal;

    const attempt = async (retriesLeft) => {
      try {
        const response = await fetch(fullURL, config);
        clearTimeout(timeoutId);

        let data;
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) data = await response.json();
        else if (ct.includes('text/')) data = await response.text();
        else data = await response.blob();

        const result = { ok: response.ok, status: response.status, statusText: response.statusText, data, headers: response.headers, url: fullURL };

        for (const interceptor of this._interceptors.response) {
          const r = await interceptor(result);
          if (r) Object.assign(result, r);
        }

        if (!response.ok) throw Object.assign(new Error(`HTTP ${response.status}: ${response.statusText}`), result);

        if (opts.cache && method === 'GET') this._cache.set(cacheKey, { data: result, time: Date.now() });
        this._pending.delete(cacheKey);
        VeloxUtils.emit(document, 'vx:fetch:success', { url: fullURL, status: response.status });
        return result;
      } catch (err) {
        clearTimeout(timeoutId);
        if (retriesLeft > 0 && !err.name === 'AbortError') {
          await new Promise(r => setTimeout(r, 1000));
          return attempt(retriesLeft - 1);
        }
        VeloxUtils.emit(document, 'vx:fetch:error', { url: fullURL, error: err });
        throw err;
      }
    };

    const promise = attempt(opts.retries);
    if (method === 'GET') this._pending.set(cacheKey, promise);
    return promise;
  }

  get(url, options) { return this._request('GET', url, null, options); }
  post(url, body, options) { return this._request('POST', url, body, options); }
  put(url, body, options) { return this._request('PUT', url, body, options); }
  patch(url, body, options) { return this._request('PATCH', url, body, options); }
  delete(url, options) { return this._request('DELETE', url, null, options); }

  async upload(url, file, options) {
    const opts = Object.assign({ field: 'file', onProgress: null, extraFields: {} }, options || {});
    const formData = new FormData();
    formData.append(opts.field, file);
    Object.entries(opts.extraFields).forEach(([k, v]) => formData.append(k, v));
    const headers = Object.assign({}, this._defaultHeaders);
    delete headers['Content-Type'];
    const xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
      xhr.open('POST', this._baseURL + url);
      Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
      if (opts.onProgress) xhr.upload.addEventListener('progress', e => opts.onProgress(e.loaded / e.total * 100));
      xhr.onload = () => {
        try { resolve({ status: xhr.status, data: JSON.parse(xhr.responseText) }); }
        catch { resolve({ status: xhr.status, data: xhr.responseText }); }
      };
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(formData);
    });
  }

  async download(url, filename) {
    const res = await this._request('GET', url, null, { headers: { 'Content-Type': 'application/octet-stream' } });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(res.data);
    a.download = filename || url.split('/').pop();
    a.click();
    URL.revokeObjectURL(a.href);
    return this;
  }

  poll(url, options) {
    const opts = Object.assign({ interval: 5000, until: null, onData: null, onError: null }, options || {});
    let active = true;
    const run = async () => {
      while (active) {
        try {
          const result = await this.get(url, options);
          if (opts.onData) opts.onData(result);
          if (opts.until && opts.until(result)) { active = false; break; }
        } catch (err) { if (opts.onError) opts.onError(err); }
        await new Promise(r => setTimeout(r, opts.interval));
      }
    };
    run();
    return { stop: () => { active = false; } };
  }

  sse(url, handlers) {
    const es = new EventSource(this._baseURL + url);
    if (handlers.message) es.onmessage = e => handlers.message(e.data, e);
    if (handlers.error) es.onerror = handlers.error;
    if (handlers.open) es.onopen = handlers.open;
    Object.entries(handlers).forEach(([event, fn]) => {
      if (!['message', 'error', 'open'].includes(event)) es.addEventListener(event, e => fn(e.data, e));
    });
    return { close: () => es.close(), source: es };
  }

  graphql(url, query, variables) {
    return this.post(url, { query, variables: variables || {} });
  }

  clearCache(pattern) {
    if (!pattern) { this._cache.clear(); return this; }
    const re = new RegExp(pattern);
    for (const key of this._cache.keys()) if (re.test(key)) this._cache.delete(key);
    return this;
  }
}

var networkEngine = new NetworkEngine();
if (typeof window !== 'undefined') window.VeloxNetwork = networkEngine;
