// @ts-nocheck
import { describe, it, expect } from 'vitest';
import NodeWebSocket from 'ws';
import SignalingClient from 'src/net/signaling';
import { startSignalingServer } from '../src/net/signalingServer.mjs';
import { encodeMsg, hashState } from '../src/net/protocol';

// The signalling client relies on the global WebSocket constructor. In the
// Node-based test environment we polyfill it with the `ws` package.
(globalThis as any).WebSocket = NodeWebSocket as any;

describe('reconnect', () => {
  it('client auto-reconnects with resume token', async () => {
    const port = 8090;
    const server = startSignalingServer({ port });

    const client = new SignalingClient(`ws://localhost:${port}`);
    const msgs: any[] = [];
    client.onMessage((m) => msgs.push(m));
    await client.connect();
    await client.joinRoom({ roomId: 'room1', profile: { name: 'p1' } });
    // ensure the server has processed the join before sending further messages
    await new Promise((r) => setTimeout(r, 20));
    const playerId = client.clientId!;

    // send seat selection and game state snapshot
    (client as any).ws.send(encodeMsg({ type: 'SEAT', playerId, seat: 1 }));
    const state = { hand: [1, 2, 3] };
    const checksum = await hashState(state);
    (client as any).ws.send(
      encodeMsg({ type: 'STATE_SNAPSHOT', seq: 1, state, checksum }),
    );

    await new Promise((r) => setTimeout(r, 50));

    // simulate a network drop
    (client as any).ws.close();

    // allow time for the client to reconnect
    await new Promise((r) => setTimeout(r, 200));

    const hello2 = msgs.find(
      (m) => m.type === 'HELLO' && m.clientId === playerId,
    );
    const seatMsg = msgs.find((m) => m.type === 'SEAT');
    const snapMsg = msgs.find((m) => m.type === 'STATE_SNAPSHOT');

    expect(hello2).toBeTruthy();
    expect(seatMsg).toBeTruthy();
    expect(seatMsg!.seat).toBe(1);
    expect(snapMsg).toBeTruthy();
    expect(snapMsg!.state).toEqual(state);

    client.close();
    await new Promise((r) => server.close(r));
  });
});

