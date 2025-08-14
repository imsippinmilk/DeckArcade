import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initVoicePTT, startPushToTalk, setMuted } from 'src/comms/VoicePTT';

describe('VoicePTT moderation', () => {
  let replaceSpy: any;
  let addTrackSpy: any;

  beforeEach(() => {
    replaceSpy = vi.fn();
    addTrackSpy = vi.fn(() => ({ replaceTrack: replaceSpy }));
    const pcMock = {
      addTrack: addTrackSpy,
    } as any;

    (navigator.mediaDevices as any) = {
      getUserMedia: vi.fn().mockResolvedValue({
        getAudioTracks: () => [{ stop: vi.fn() }],
      }),
    };

    initVoicePTT(pcMock as any);
  });

  it('removes track on mute and blocks further sends until unmuted', async () => {
    await startPushToTalk();
    expect(addTrackSpy).toHaveBeenCalledTimes(1);
    setMuted(true);
    expect(replaceSpy).toHaveBeenLastCalledWith(null);
    await startPushToTalk();
    expect(addTrackSpy).toHaveBeenCalledTimes(1);
    setMuted(false);
    await startPushToTalk();
    expect(replaceSpy).toHaveBeenCalledTimes(2);
  });
});
