import React, { useEffect, useRef, useState } from 'react';
import { Filter } from 'bad-words';
import { Msg } from '../net/protocol';
import { sessionStore } from '../store/session';

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

  useEffect(() => {
    const raw = localStorage.getItem(`chat:${ROOM_ID}`);
    if (raw) {
      try {
        setMessages(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }

    const ws = new WebSocket('ws://localhost:8080');
    wsRef.current = ws;
    ws.onmessage = (ev) => {
      const msg: Msg = JSON.parse(ev.data);
      switch (msg.type) {
        case 'HELLO':
          if (!msg.clientId) break;
          playerIdRef.current = msg.clientId;
          (window as any).__chatId = msg.clientId;
          const joinMsg = sessionStore.join(ROOM_ID, msg.clientId);
          ws.send(joinMsg);
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
            setMutedReason(msg.muted ? msg.reason || 'You are muted' : null);
          }
          break;
        default:
          break;
      }
    };

    return () => {
      const leaveMsg = sessionStore.leave();
      if (leaveMsg) ws.send(leaveMsg);
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
