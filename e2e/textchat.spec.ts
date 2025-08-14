// @ts-nocheck
import { test, expect } from '@playwright/test';
import { startSignalingServer } from '../src/net/signalingServer.mjs';
import WebSocket from 'ws';

let server: any;

test.beforeAll(() => {
  server = startSignalingServer({ port: 8080 });
});

test.afterAll(async () => {
  await new Promise((res) => server.close(res));
});

test('rate limit only allows 8 messages', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.waitForFunction(() => (window as any).__chatId);
  for (let i = 0; i < 10; i++) {
    await page.fill('[data-testid="chat-input"]', `m${i}`);
    await page.click('[data-testid="chat-send"]');
  }
  await expect(page.locator('[data-testid="chat-msg"]')).toHaveCount(8);
});

test('mute disables sending with reason', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());

  const pid: string = await page
    .waitForFunction(() => (window as any).__chatId)
    .then((handle) => handle.jsonValue());

  const ws = new WebSocket('ws://localhost:8080');
  ws.on('message', (raw) => {
    const data = JSON.parse(raw.toString());
    if (data.type === 'HELLO') {
      ws.send(JSON.stringify({ type: 'JOIN', roomId: 'test-room' }));
      setTimeout(() => {
        ws.send(
          JSON.stringify({
            type: 'MUTE',
            playerId: pid,
            muted: true,
            reason: 'spamming',
          }),
        );
      }, 1000);
    }
  });
  await new Promise((res) => ws.on('open', res));
  // ensure chat working before mute
  await page.fill('[data-testid="chat-input"]', 'hello');
  await page.click('[data-testid="chat-send"]');
  await expect(page.locator('[data-testid="chat-msg"]')).toHaveCount(1);
  await expect(page.locator('[data-testid="chat-muted"]')).toHaveText(
    /spamming/,
  );
  await expect(page.locator('[data-testid="chat-input"]')).toBeDisabled();
  ws.close();
});
