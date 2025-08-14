import React, { useEffect, useRef, useState } from 'react';
import { Filter } from 'bad-words';
import { Msg } from '../net/protocol';
import { sessionStore } from '../store/session';
import { setupPeerConnection } from '../net/webrtc';
import { initVoicePTT, disposeVoicePTT, setMuted } from './VoicePTT';

const EMOTES: Record<string, string> = { ':smile:': '🙂' };
const ROOM_ID = 'test-room';
const MAX_HISTORY = 100;

function applyEmotes(text: string): string {
  return Object.entries(EMOTES).reduce(
    (acc, [code, emoji]) => acc.split(code).join(emoji),
    text,
  );
}

const TextChat: React.FC = () => {
  const [messages, setMessages] = useState<{ message: string; ts: number }[]>(
    [],
  );
  const [draft, setDraft] = useState('');
  const [mutedReason, setMutedReason] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const rateRef = useRef<number[]>([]);
  const filterRef = useRef(new Filter());
  const playerIdRef = useRef('');
  const listRef = useRef<HTMLDivElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem(`chat:${ROOM_ID}`);
    if (raw) {
      try {
        setMessages(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }

    const pc = setupPeerConnection();
    if (pc) {
      pcRef.current = pc;
      pc.ontrack = (ev) => {
        const audio = new Audio();
        audio.srcObject = ev.streams[0];
        void audio.play().catch(() => undefined);
      };
      initVoicePTT(pc, indicatorRef.current || undefined);
    }

    const ws = new WebSocket('ws://localhost:8080');
    wsRef.current = ws;
    ws.onmessage = async (ev) => {
      const msg: Msg = JSON.parse(ev.data);
      switch (msg.type) {
        case 'HELLO':
          if (!msg.clientId) break;
          playerIdRef.current = msg.clientId;
          (window as any).__chatId = msg.clientId;
          const joinMsg = sessionStore.join(ROOM_ID, msg.clientId);
          ws.send(joinMsg);
          break;
        case 'JOIN':
          if (msg.playerId && msg.playerId !== playerIdRef.current) {
            await sendOffer();
          }
          break;
        case 'RTC_OFFER':
          if (pcRef.current) {
            await pcRef.current.setRemoteDescription({
              type: 'offer',
              sdp: msg.sdp,
            });
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);
            await waitForIce(pcRef.current);
            ws.send(
              JSON.stringify({
                type: 'RTC_ANSWER',
                from: playerIdRef.current,
                sdp: pcRef.current.localDescription?.sdp,
              }),
            );
          }
          break;
        case 'RTC_ANSWER':
          if (pcRef.current) {
            await pcRef.current.setRemoteDescription({
              type: 'answer',
              sdp: msg.sdp,
            });
          }
          break;
        case 'CHAT':
          addMessage({
            message: applyEmotes(msg.message),
            ts: msg.ts || Date.now(),
          });
          break;
        case 'MUTE':
          if (msg.playerId === playerIdRef.current) {
            sessionStore.state.muted = msg.muted;
            sessionStore.state.muteReason = msg.reason;
            setMuted(msg.muted);
            setMutedReason(msg.muted ? msg.reason || 'You are muted' : null);
          }
          break;
        default:
          break;
      }
    };

    async function sendOffer() {
      if (!pcRef.current) return;
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      await waitForIce(pcRef.current);
      ws.send(
        JSON.stringify({
          type: 'RTC_OFFER',
          from: playerIdRef.current,
          sdp: pcRef.current.localDescription?.sdp,
        }),
      );
    }

    function waitForIce(pc: RTCPeerConnection): Promise<void> {
      return new Promise((resolve) => {
        if (pc.iceGatheringState === 'complete') resolve();
        else {
          pc.addEventListener('icegatheringstatechange', () => {
            if (pc.iceGatheringState === 'complete') resolve();
          });
        }
      });
    }

    return () => {
      const leaveMsg = sessionStore.leave();
      if (leaveMsg) ws.send(leaveMsg);
      disposeVoicePTT();
      pcRef.current?.close();
      ws.close();
    };
  }, []);

  function addMessage(entry: { message: string; ts: number }) {
    setMessages((prev) => {
      const next = [...prev, entry].slice(-MAX_HISTORY);
      localStorage.setItem(`chat:${ROOM_ID}`, JSON.stringify(next));
      setTimeout(() => {
        listRef.current?.scrollTo(0, listRef.current.scrollHeight);
      }, 0);
      return next;
    });
  }

  const sendMessage = () => {
    if (!draft.trim() || mutedReason) return;
    const now = Date.now();
    const recent = rateRef.current.filter((t) => now - t < 10_000);
    if (recent.length >= 8) return;
    recent.push(now);
    rateRef.current = recent;

    let text = filterRef.current.clean(draft.trim());
    text = applyEmotes(text);
    wsRef.current?.send(JSON.stringify({ type: 'CHAT', message: text }));
    setDraft('');
  };

  return (
    <div style={{ borderTop: '1px solid #2a2f33', padding: '0.5rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}
      >
        <div
          id="pttIndicator"
          ref={indicatorRef}
          style={{
            width: '1rem',
            height: '1rem',
            borderRadius: '50%',
            background: '#555',
            transition: 'background 0.2s',
            marginRight: '0.5rem',
          }}
        ></div>
        <span style={{ fontSize: '0.75rem' }}>Hold Space to talk</span>
      </div>
      <div
        ref={listRef}
        style={{
          maxHeight: '10rem',
          overflowY: 'auto',
          marginBottom: '0.5rem',
        }}
      >
        {messages.map((m, idx) => (
          <div
            data-testid="chat-msg"
            key={idx}
            style={{ marginBottom: '0.25rem' }}
          >
            {m.message}
          </div>
        ))}
      </div>
      {mutedReason && (
        <div
          data-testid="chat-muted"
          style={{ color: '#f66', marginBottom: '0.5rem' }}
        >
          Muted: {mutedReason}
        </div>
      )}
      <div style={{ display: 'flex' }}>
        <input
          data-testid="chat-input"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          style={{ flex: 1, marginRight: '0.5rem' }}
          disabled={!!mutedReason}
        />
        <button
          data-testid="chat-send"
          onClick={sendMessage}
          disabled={!!mutedReason}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default TextChat;
