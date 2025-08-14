/**
 * WebRTC utilities. Provides a thin wrapper around {@link RTCPeerConnection}
 * that initialises a connection with sensible defaults and basic recovery for
 * failed connections. When run in a non‑browser environment where WebRTC is not
 * available the function returns `null`.
 */
export function setupPeerConnection(
  config: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  },
): RTCPeerConnection | null {
  if (typeof RTCPeerConnection === 'undefined') return null;
  const pc = new RTCPeerConnection(config);
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'failed') pc.restartIce();
  };
  return pc;
}