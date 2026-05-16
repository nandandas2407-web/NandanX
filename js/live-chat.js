/**
 * NandanX — liveChatEngine
 * Live chat UI, typing indicators, reactions, message effects
 */
class LiveChatEngine {
  constructor() {
    this.initialized = false;
    this.chats = new Map();
    this.ws = null;
    this.sse = null;
  }

  init(options = {}) {
    if (this.initialized) return this;
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-chat-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-chat-styles';
    s.textContent = `
      .nx-chat { display: flex; flex-direction: column; height: 100%; background: var(--nx-bg, #0a0a12); border-radius: 16px; overflow: hidden; border: 1px solid var(--nx-border, rgba(255,255,255,0.08)); font-family: inherit; }
      .nx-chat-header { padding: 16px 20px; border-bottom: 1px solid var(--nx-border, rgba(255,255,255,0.08)); display: flex; align-items: center; gap: 12px; }
      .nx-chat-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--nx-primary, #00f5ff); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: #000; flex-shrink: 0; }
      .nx-chat-title { font-weight: 600; font-size: 15px; color: var(--nx-text, #e2e8f0); }
      .nx-chat-subtitle { font-size: 12px; color: var(--nx-text-muted, rgba(226,232,240,0.5)); }
      .nx-chat-status { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; margin-left: auto; box-shadow: 0 0 6px #22c55e; }
      .nx-chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 8px; scroll-behavior: smooth; }
      .nx-chat-messages::-webkit-scrollbar { width: 4px; }
      .nx-chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      .nx-msg { display: flex; gap: 8px; align-items: flex-end; max-width: 80%; animation: nx-msg-in 0.2s ease; }
      @keyframes nx-msg-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .nx-msg-out { align-self: flex-end; flex-direction: row-reverse; }
      .nx-msg-in { align-self: flex-start; }
      .nx-bubble { padding: 10px 14px; border-radius: 18px; font-size: 14px; line-height: 1.5; word-break: break-word; }
      .nx-msg-in .nx-bubble { background: var(--nx-surface, rgba(255,255,255,0.07)); color: var(--nx-text, #e2e8f0); border-bottom-left-radius: 4px; }
      .nx-msg-out .nx-bubble { background: var(--nx-primary, #00f5ff); color: #000; border-bottom-right-radius: 4px; font-weight: 500; }
      .nx-msg-time { font-size: 10px; color: var(--nx-text-muted, rgba(226,232,240,0.4)); padding: 0 4px; white-space: nowrap; }
      .nx-msg-avatar { width: 24px; height: 24px; border-radius: 50%; background: var(--nx-accent, #7c3aed); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; }
      .nx-typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px; background: var(--nx-surface, rgba(255,255,255,0.07)); border-radius: 18px; border-bottom-left-radius: 4px; }
      .nx-typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--nx-text-muted, rgba(226,232,240,0.5)); animation: nx-typing-bounce 1.2s ease infinite; }
      .nx-typing span:nth-child(2) { animation-delay: 0.2s; }
      .nx-typing span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes nx-typing-bounce { 0%,80%,100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-5px); opacity: 1; } }
      .nx-chat-input-area { padding: 12px 16px; border-top: 1px solid var(--nx-border, rgba(255,255,255,0.08)); display: flex; gap: 10px; align-items: flex-end; }
      .nx-chat-input { flex: 1; background: var(--nx-surface, rgba(255,255,255,0.05)); border: 1px solid var(--nx-border, rgba(255,255,255,0.08)); border-radius: 20px; padding: 10px 16px; font-size: 14px; color: var(--nx-text, #e2e8f0); resize: none; outline: none; font-family: inherit; line-height: 1.4; max-height: 120px; overflow-y: auto; transition: border-color 0.2s; }
      .nx-chat-input:focus { border-color: var(--nx-primary, #00f5ff); }
      .nx-chat-input::placeholder { color: var(--nx-text-muted, rgba(226,232,240,0.4)); }
      .nx-send-btn { width: 40px; height: 40px; border-radius: 50%; background: var(--nx-primary, #00f5ff); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .nx-send-btn:hover { transform: scale(1.08); box-shadow: 0 0 16px var(--nx-glow, rgba(0,245,255,0.4)); }
      .nx-reaction-bar { display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap; }
      .nx-reaction { padding: 2px 8px; border-radius: 12px; background: var(--nx-surface, rgba(255,255,255,0.07)); border: 1px solid var(--nx-border, rgba(255,255,255,0.08)); font-size: 13px; cursor: pointer; transition: transform 0.15s ease; }
      .nx-reaction:hover { transform: scale(1.15); }
      .nx-msg-status { font-size: 10px; color: var(--nx-primary, #00f5ff); }
      .nx-unread-badge { background: var(--nx-secondary, #ff006e); color: #fff; border-radius: 20px; padding: 2px 8px; font-size: 11px; font-weight: 700; }
    `;
    document.head.appendChild(s);
  }

  // Build full chat UI
  build(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;

    el.innerHTML = '';
    el.classList.add('nx-chat');

    // Header
    const header = document.createElement('div');
    header.className = 'nx-chat-header';
    const avatar = document.createElement('div');
    avatar.className = 'nx-chat-avatar';
    avatar.textContent = (options.name || 'Support')[0].toUpperCase();
    if (options.avatarColor) avatar.style.background = options.avatarColor;
    const info = document.createElement('div');
    info.innerHTML = `<div class="nx-chat-title">${options.name || 'Support'}</div><div class="nx-chat-subtitle" id="nx-chat-sub">${options.subtitle || 'Online'}</div>`;
    const status = document.createElement('div');
    status.className = 'nx-chat-status';
    header.appendChild(avatar);
    header.appendChild(info);
    header.appendChild(status);
    el.appendChild(header);

    // Messages
    const messagesEl = document.createElement('div');
    messagesEl.className = 'nx-chat-messages';
    el.appendChild(messagesEl);

    // Input area
    const inputArea = document.createElement('div');
    inputArea.className = 'nx-chat-input-area';
    const input = document.createElement('textarea');
    input.className = 'nx-chat-input';
    input.placeholder = options.placeholder || 'Type a message...';
    input.rows = 1;
    const sendBtn = document.createElement('button');
    sendBtn.className = 'nx-send-btn';
    sendBtn.innerHTML = '➤';
    inputArea.appendChild(input);
    inputArea.appendChild(sendBtn);
    el.appendChild(inputArea);

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    let typingTimeout = null;
    let typingEl = null;

    const sendMessage = () => {
      const text = input.value.trim();
      if (!text) return;
      this.addMessage(messagesEl, { text, type: 'out', time: this._time() });
      input.value = '';
      input.style.height = 'auto';
      if (options.onSend) options.onSend(text);
      // Auto-reply simulation
      if (options.autoReply) {
        this.showTyping(messagesEl);
        setTimeout(() => {
          this.hideTyping(messagesEl);
          const reply = typeof options.autoReply === 'function' ? options.autoReply(text) : options.autoReply;
          this.addMessage(messagesEl, { text: reply, type: 'in', name: options.name, time: this._time() });
        }, options.replyDelay || 1500);
      }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });

    // Typing indicator trigger
    input.addEventListener('input', () => {
      clearTimeout(typingTimeout);
      if (options.onTyping) options.onTyping(true);
      typingTimeout = setTimeout(() => { if (options.onTyping) options.onTyping(false); }, 1000);
    });

    // Load initial messages
    if (options.messages) {
      options.messages.forEach(msg => this.addMessage(messagesEl, msg));
    }

    const chat = { el, messagesEl, input, sendBtn, status };
    this.chats.set(el, chat);
    return chat;
  }

  addMessage(messagesEl, msg) {
    const wrap = document.createElement('div');
    wrap.className = `nx-msg nx-msg-${msg.type || 'in'}`;

    if (msg.type === 'in') {
      const av = document.createElement('div');
      av.className = 'nx-msg-avatar';
      av.textContent = (msg.name || 'S')[0].toUpperCase();
      wrap.appendChild(av);
    }

    const col = document.createElement('div');
    const bubble = document.createElement('div');
    bubble.className = 'nx-bubble';
    bubble.textContent = msg.text;

    const meta = document.createElement('div');
    meta.style.cssText = 'display:flex;gap:6px;align-items:center;';
    const time = document.createElement('span');
    time.className = 'nx-msg-time';
    time.textContent = msg.time || this._time();
    meta.appendChild(time);

    if (msg.type === 'out') {
      const tick = document.createElement('span');
      tick.className = 'nx-msg-status';
      tick.textContent = msg.read ? '✓✓' : '✓';
      meta.appendChild(tick);
    }

    col.appendChild(bubble);
    col.appendChild(meta);

    if (msg.reactions) {
      const reactionBar = document.createElement('div');
      reactionBar.className = 'nx-reaction-bar';
      msg.reactions.forEach(r => {
        const btn = document.createElement('div');
        btn.className = 'nx-reaction';
        btn.textContent = `${r.emoji} ${r.count || 1}`;
        btn.addEventListener('click', () => {
          const count = parseInt(btn.textContent.split(' ')[1] || 1);
          btn.textContent = `${r.emoji} ${count + 1}`;
          btn.style.background = 'rgba(0,245,255,0.1)';
        });
        reactionBar.appendChild(btn);
      });
      col.appendChild(reactionBar);
    }

    wrap.appendChild(col);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrap;
  }

  showTyping(messagesEl) {
    const wrap = document.createElement('div');
    wrap.className = 'nx-msg nx-msg-in nx-typing-wrap';
    const typing = document.createElement('div');
    typing.className = 'nx-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    wrap.appendChild(typing);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrap;
  }

  hideTyping(messagesEl) {
    messagesEl.querySelector('.nx-typing-wrap')?.remove();
  }

  // Connect to WebSocket
  connectWS(url, options = {}) {
    this.ws = new WebSocket(url);
    this.ws.onopen = () => { if (options.onOpen) options.onOpen(); };
    this.ws.onmessage = (e) => { const data = JSON.parse(e.data); if (options.onMessage) options.onMessage(data); };
    this.ws.onclose = () => { if (options.onClose) options.onClose(); };
    this.ws.onerror = (e) => { if (options.onError) options.onError(e); };
    return this.ws;
  }

  sendWS(data) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(data));
    return this;
  }

  // SSE for one-way streaming messages
  connectSSE(url, options = {}) {
    this.sse = new EventSource(url);
    this.sse.onmessage = (e) => { if (options.onMessage) options.onMessage(JSON.parse(e.data)); };
    this.sse.onerror = () => { if (options.onError) options.onError(); };
    return this.sse;
  }

  _time() {
    const d = new Date();
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  }
}

const liveChatEngine = new LiveChatEngine();
