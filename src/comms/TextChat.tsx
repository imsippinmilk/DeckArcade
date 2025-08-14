import React, { useState } from 'react';
type Message = { id: string; user: string; text: string; ts: number };
export const TextChat: React.FC<{
  onSend?: (text: string) => void;
  messages?: Message[];
}> = ({ onSend, messages = [] }) => {
  const [draft, setDraft] = useState('');
  return (
    <div
      className="card"
      style={{ padding: '.5rem', display: 'grid', gap: '.5rem' }}
    >
      <div
        style={{
          maxHeight: 220,
          overflow: 'auto',
          display: 'grid',
          gap: '.25rem',
        }}
      >
        {messages.map((m) => (
          <div key={m.id}>
            <strong>{m.user}:</strong> {m.text}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          onSend?.(draft.trim());
          setDraft('');
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message…"
          style={{
            width: '100%',
            height: 42,
            borderRadius: 12,
            border: '1px solid var(--surfaceAlt)',
            background: 'var(--surfaceAlt)',
            color: 'var(--text)',
            padding: '0 .75rem',
          }}
        />
      </form>
    </div>
  );
};
