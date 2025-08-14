import { describe, it, expect } from 'vitest';
import { setupPeerConnection } from 'src/net/webrtc';

describe('setupPeerConnection', () => {
  it('creates a peer connection with default ICE servers', () => {
    class MockRTCPeerConnection {
      public config: RTCConfiguration;
      public connectionState: RTCPeerConnectionState = 'new';
      public restarted = false;
      onconnectionstatechange: (() => void) | null = null;
      constructor(config: RTCConfiguration) {
        this.config = config;
      }
      restartIce() {
        this.restarted = true;
      }
    }
    const original = (globalThis as any).RTCPeerConnection;
    (globalThis as any).RTCPeerConnection = MockRTCPeerConnection as any;

    const pc = setupPeerConnection();
    expect(pc).toBeInstanceOf(MockRTCPeerConnection);
    expect((pc as any).config.iceServers?.[0].urls).toBe(
      'stun:stun.l.google.com:19302',
    );
    (pc as any).connectionState = 'failed';
    (pc as any).onconnectionstatechange?.();
    expect((pc as any).restarted).toBe(true);

    (globalThis as any).RTCPeerConnection = original;
  });

  it('returns null when WebRTC is unavailable', () => {
    const original = (globalThis as any).RTCPeerConnection;
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (globalThis as any).RTCPeerConnection;
    expect(setupPeerConnection()).toBeNull();
    (globalThis as any).RTCPeerConnection = original;
  });
});
