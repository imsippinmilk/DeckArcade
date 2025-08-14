/**
 * Push-to-talk voice chat implementation using WebRTC.
 * Captures microphone input with noise filtering and toggles
 * the audio track on key press (Space) or when voice activity
 * is detected as a fallback. Server moderation can mute the
 * local user which removes the track and prevents further
 * sending until unmuted.
 */
let pc: RTCPeerConnection | null = null;
let sender: RTCRtpSender | null = null;
let stream: MediaStream | null = null;
let pressed = false;
let speaking = false;
let muted = false;
let indicator: HTMLElement | null = null;
let analyser: AnalyserNode | null = null;
let dataArray: Float32Array = new Float32Array(0);
let rafId: number | null = null;

export function initVoicePTT(
  connection: RTCPeerConnection,
  indicatorEl?: HTMLElement,
) {
  pc = connection;
  indicator = indicatorEl ?? document.getElementById('pttIndicator');
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

function onKeyDown(e: KeyboardEvent) {
  if (e.code === 'Space') {
    e.preventDefault();
    void startPushToTalk();
  }
}

function onKeyUp(e: KeyboardEvent) {
  if (e.code === 'Space') {
    e.preventDefault();
    stopPushToTalk();
  }
}

async function ensureStream() {
  if (!stream) {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    setupVAD();
  }
}

function enableTrack() {
  if (!stream || !pc || muted) return;
  const track = stream.getAudioTracks()[0];
  if (sender) {
    void sender.replaceTrack(track);
  } else {
    sender = pc.addTrack(track, stream);
  }
  indicator?.classList.add('speaking');
}

function disableTrack() {
  if (sender) void sender.replaceTrack(null);
  indicator?.classList.remove('speaking');
}

export async function startPushToTalk() {
  if (muted) return;
  pressed = true;
  await ensureStream();
  enableTrack();
}

export function stopPushToTalk() {
  pressed = false;
  if (!speaking || muted) {
    disableTrack();
  }
  indicator?.classList.toggle('speaking', pressed || speaking);
}

export function setMuted(value: boolean) {
  muted = value;
  if (muted) {
    disableTrack();
  }
}

function setupVAD() {
  if (!stream || typeof AudioContext === 'undefined') return;
  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  dataArray = new Float32Array(analyser.fftSize);
  source.connect(analyser);
  const threshold = 0.02; // energy threshold

  const update = () => {
    if (!analyser) return;
    analyser.getFloatTimeDomainData(dataArray as any);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i];
      sum += v * v;
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const isSpeaking = rms > threshold;

    if (isSpeaking !== speaking) {
      speaking = isSpeaking;
      if (!pressed && !muted) {
        if (speaking) enableTrack();
        else disableTrack();
      }
      indicator?.classList.toggle('speaking', pressed || speaking);
    }

    rafId = requestAnimationFrame(update);
  };

  update();
}

export function disposeVoicePTT() {
  if (rafId) cancelAnimationFrame(rafId);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  sender = null;
  pc = null;
  indicator?.classList.remove('speaking');
}

// Simple push-to-talk mic capture. Wire to your signaling later.
export class VoicePTT {
  private stream?: MediaStream;

  async press(): Promise<MediaStream | undefined> {
    if (!this.stream)
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return this.stream;
  }

  release() {
    /* mute/stop as needed or push to network */
  }
}
