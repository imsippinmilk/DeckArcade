// @ts-nocheck
import { describe, expect, it } from 'vitest';
import WebSocket from 'ws';
import { startSignalingServer } from '../src/net/signalingServer.mjs';
import { encodeMsg, parseMsg, hashState } from '../src/net/protocol';

function waitForMessage(ws: WebSocket): Promise<any> {
  return new Promise((resolve) => {
    ws.once('message', (data) => resolve(parseMsg(data.toString())));
  });
}

describe('reconnect', () => {
  it.skip('client auto-reconnects with resume token', async () => {
    const port = 8090;
    const server = startSignalingServer({ port });

    const ws1 = new WebSocket(`ws://localhost:${port}`);
    let msg = await waitForMessage(ws1); // initial HELLO
    const playerId = msg.clientId;
    ws1.send(
      encodeMsg({
        type: 'JOIN',
        roomId: 'room1',
        playerId,
        profile: { name: 'p1' },
      }),
    );
    // consume join broadcast
    do {
      msg = await waitForMessage(ws1);
    } while (msg.type !== 'RESUME_TOKEN');
    const token = msg.resumeToken;
    // send seat and snapshot
    ws1.send(encodeMsg({ type: 'SEAT', playerId, seat: 1 }));
    const state = { hand: [1, 2, 3] };
    const checksum = await hashState(state);
    ws1.send(encodeMsg({ type: 'STATE_SNAPSHOT', seq: 1, state, checksum }));
    await new Promise((r) => setTimeout(r, 50));
    ws1.close();
    await new Promise((r) => ws1.once('close', r));

    // simulate 5s disconnect (shortened for test)
    await new Promise((r) => setTimeout(r, 100));

    const ws2 = new WebSocket(`ws://localhost:${port}`);
    const msgs: any[] = [];
    ws2.on('message', (d) => msgs.push(parseMsg(d.toString())));
    await new Promise((r) => ws2.once('message', () => r(null))); // initial HELLO
    ws2.send(encodeMsg({ type: 'HELLO', resumeToken: token }));
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

    ws2.close();
    await new Promise((r) => ws2.once('close', r));
    await new Promise((r) => server.close(r));
  });
});
