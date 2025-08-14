import { test, expect } from '@playwright/test';

test('send and receive audio via push-to-talk', async ({ page, context }) => {
  await context.grantPermissions(['microphone'], {
    origin: 'http://localhost:5173',
  });
  const page2 = await context.newPage();
  await Promise.all([page.goto('/'), page2.goto('/')]);

  await page2.evaluate(() => {
    const pc = new RTCPeerConnection();
    (window as any).pc = pc;
    (window as any).received = false;
    pc.ontrack = () => {
      (window as any).received = true;
    };
  });

  await page.evaluate(async () => {
    const pc = new RTCPeerConnection();
    (window as any).pc = pc;
    const path = '/src/comms/VoicePTT.ts';
    const mod = await import(path);
    mod.initVoicePTT(pc);
  });

  const offer = await page.evaluate(async () => {
    const pc: RTCPeerConnection = (window as any).pc;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await new Promise((r) => {
      if (pc.iceGatheringState === 'complete') {
        r(null);
      } else {
        pc.addEventListener('icegatheringstatechange', () => {
          if (pc.iceGatheringState === 'complete') r(null);
        });
      }
    });
    return pc.localDescription?.sdp;
  });

  const answer = await page2.evaluate(async (offerSdp) => {
    const pc: RTCPeerConnection = (window as any).pc;
    await pc.setRemoteDescription({ type: 'offer', sdp: offerSdp });
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await new Promise((r) => {
      if (pc.iceGatheringState === 'complete') {
        r(null);
      } else {
        pc.addEventListener('icegatheringstatechange', () => {
          if (pc.iceGatheringState === 'complete') r(null);
        });
      }
    });
    return pc.localDescription?.sdp;
  }, offer);

  await page.evaluate(async (answerSdp) => {
    const pc: RTCPeerConnection = (window as any).pc;
    await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
  }, answer);

  await page.keyboard.down(' ');
  await expect
    .poll(async () => {
      return await page2.evaluate(() => (window as any).received);
    })
    .toBe(true);
  await page.keyboard.up(' ');
});
