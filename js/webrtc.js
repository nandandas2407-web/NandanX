/**
 * NandanX — webrtcEngine
 * WebRTC peer-to-peer video calls, screen share, signaling helpers
 */
class WebRTCEngine {
  constructor() {
    this.initialized = false;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.signalingChannel = null;
    this.onRemoteStream = null;
    this.onConnectionState = null;
    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ];
  }

  init(options = {}) {
    if (this.initialized) return this;
    if (options.iceServers) this.iceServers = options.iceServers;
    this._injectStyles();
    this.initialized = true;
    return this;
  }

  _injectStyles() {
    if (document.getElementById('nx-webrtc-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-webrtc-styles';
    s.textContent = `
      .nx-video-container { position: relative; background: #000; border-radius: 12px; overflow: hidden; }
      .nx-video-container video { width: 100%; height: 100%; object-fit: cover; display: block; }
      .nx-video-local { position: absolute; bottom: 12px; right: 12px; width: 140px; height: 90px; border-radius: 8px; overflow: hidden; border: 2px solid rgba(255,255,255,0.2); z-index: 10; }
      .nx-video-controls { position: absolute; bottom: 0; left: 0; right: 0; padding: 16px; display: flex; gap: 12px; justify-content: center; background: linear-gradient(transparent, rgba(0,0,0,0.6)); z-index: 20; }
      .nx-ctrl-btn { width: 44px; height: 44px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: transform 0.15s ease, opacity 0.15s ease; background: rgba(255,255,255,0.15); color: #fff; backdrop-filter: blur(8px); }
      .nx-ctrl-btn:hover { transform: scale(1.1); }
      .nx-ctrl-btn.nx-off { background: #ef4444; }
      .nx-connection-status { position: absolute; top: 12px; left: 12px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; font-family: monospace; z-index: 20; }
      .nx-status-connecting { background: rgba(234,179,8,0.3); color: #eab308; border: 1px solid rgba(234,179,8,0.4); }
      .nx-status-connected { background: rgba(34,197,94,0.2); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }
      .nx-status-disconnected { background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
    `;
    document.head.appendChild(s);
  }

  async getUserMedia(options = {}) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: options.video !== false ? (options.videoOptions || { width: 1280, height: 720 }) : false,
        audio: options.audio !== false,
      });
      return this.localStream;
    } catch (e) {
      console.warn('[NandanX WebRTC] getUserMedia failed:', e);
      throw e;
    }
  }

  async getScreenShare(options = {}) {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: options.audio || false });
      return screen;
    } catch (e) {
      console.warn('[NandanX WebRTC] Screen share failed:', e);
      throw e;
    }
  }

  createPeerConnection(options = {}) {
    this.peerConnection = new RTCPeerConnection({ iceServers: this.iceServers });

    this.peerConnection.onicecandidate = (e) => {
      if (e.candidate && options.onIceCandidate) options.onIceCandidate(e.candidate);
    };

    this.peerConnection.ontrack = (e) => {
      this.remoteStream = e.streams[0];
      if (this.onRemoteStream) this.onRemoteStream(this.remoteStream);
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.onConnectionState) this.onConnectionState(this.peerConnection.connectionState);
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream));
    }

    return this.peerConnection;
  }

  async createOffer() {
    if (!this.peerConnection) this.createPeerConnection();
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(offer) {
    if (!this.peerConnection) this.createPeerConnection();
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async setRemoteAnswer(answer) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async addIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) { /* ignore */ }
  }

  // Full video call UI builder
  async buildCallUI(container, options = {}) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return;
    el.classList.add('nx-video-container');

    const remoteVideo = document.createElement('video');
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideo.id = 'nx-remote-video';
    el.appendChild(remoteVideo);

    const localWrap = document.createElement('div');
    localWrap.className = 'nx-video-local';
    const localVideo = document.createElement('video');
    localVideo.autoplay = true;
    localVideo.playsInline = true;
    localVideo.muted = true;
    localVideo.id = 'nx-local-video';
    localWrap.appendChild(localVideo);
    el.appendChild(localWrap);

    const statusBadge = document.createElement('div');
    statusBadge.className = 'nx-connection-status nx-status-connecting';
    statusBadge.textContent = '● Connecting...';
    el.appendChild(statusBadge);

    const controls = document.createElement('div');
    controls.className = 'nx-video-controls';

    let micOn = true, camOn = true;

    const micBtn = this._ctrlBtn('🎤', () => {
      micOn = !micOn;
      if (this.localStream) this.localStream.getAudioTracks().forEach(t => t.enabled = micOn);
      micBtn.classList.toggle('nx-off', !micOn);
      micBtn.textContent = micOn ? '🎤' : '🔇';
    });

    const camBtn = this._ctrlBtn('📷', () => {
      camOn = !camOn;
      if (this.localStream) this.localStream.getVideoTracks().forEach(t => t.enabled = camOn);
      camBtn.classList.toggle('nx-off', !camOn);
      camBtn.textContent = camOn ? '📷' : '🚫';
    });

    const hangupBtn = this._ctrlBtn('📵', () => { this.hangup(); if (options.onHangup) options.onHangup(); });
    hangupBtn.classList.add('nx-off');

    controls.appendChild(micBtn);
    controls.appendChild(camBtn);
    if (options.screenShare !== false) {
      const screenBtn = this._ctrlBtn('🖥️', async () => {
        try {
          const screen = await this.getScreenShare();
          const videoTrack = screen.getVideoTracks()[0];
          const sender = this.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
          localVideo.srcObject = screen;
          videoTrack.onended = () => {
            const origTrack = this.localStream?.getVideoTracks()[0];
            if (sender && origTrack) sender.replaceTrack(origTrack);
            localVideo.srcObject = this.localStream;
          };
        } catch(e) {}
      });
      controls.appendChild(screenBtn);
    }
    controls.appendChild(hangupBtn);
    el.appendChild(controls);

    try {
      const stream = await this.getUserMedia(options);
      localVideo.srcObject = stream;
    } catch (e) {
      statusBadge.textContent = '● No Camera/Mic';
      statusBadge.className = 'nx-connection-status nx-status-disconnected';
    }

    this.onRemoteStream = (stream) => {
      remoteVideo.srcObject = stream;
      statusBadge.textContent = '● Connected';
      statusBadge.className = 'nx-connection-status nx-status-connected';
    };

    this.onConnectionState = (state) => {
      if (state === 'connected') {
        statusBadge.textContent = '● Connected';
        statusBadge.className = 'nx-connection-status nx-status-connected';
      } else if (state === 'disconnected' || state === 'failed') {
        statusBadge.textContent = '● Disconnected';
        statusBadge.className = 'nx-connection-status nx-status-disconnected';
      }
    };

    return { localVideo, remoteVideo, controls };
  }

  _ctrlBtn(icon, onClick) {
    const btn = document.createElement('button');
    btn.className = 'nx-ctrl-btn';
    btn.textContent = icon;
    btn.addEventListener('click', onClick);
    return btn;
  }

  hangup() {
    if (this.localStream) { this.localStream.getTracks().forEach(t => t.stop()); this.localStream = null; }
    if (this.peerConnection) { this.peerConnection.close(); this.peerConnection = null; }
  }

  // Simple data channel
  createDataChannel(label, options = {}) {
    if (!this.peerConnection) this.createPeerConnection();
    return this.peerConnection.createDataChannel(label, options);
  }
}

const webrtcEngine = new WebRTCEngine();
