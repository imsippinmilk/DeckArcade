import React, { useState } from 'react';

/**
 * Very simple text chat component. It collects user input and displays
 * messages in a list. It doesn't yet implement networking or
 * moderation rules; those features will be layered on top of this
 * skeleton once the multiplayer core is built.
 */
const TextChat: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [draft, setDraft] = useState('');

  const sendMessage = () => {
    if (draft.trim() === '') return;
    setMessages((prev) => [...prev, draft.trim()]);
    setDraft('');
  };

  return (
    <div style={{ borderTop: '1px solid #2a2f33', padding: '0.5rem' }}>
      <div
        style={{
          maxHeight: '10rem',
          overflowY: 'auto',
          marginBottom: '0.5rem'
        }}
      >
        {messages.map((m, idx) => (
          <div key={idx} style={{ marginBottom: '0.25rem' }}>
            {m}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex' }}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          style={{ flex: 1, marginRight: '0.5rem' }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default TextChat;