import React, { useState } from 'react';
import { session, sessionActions } from '../store/session';

export const LobbyJoin: React.FC = () => {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🂡');
  const s = session.getState();
  return (
    <main className="container" style={{ display: 'grid', gap: '1rem' }}>
      <div className="card" style={{ padding: '1rem' }}>
        <h2>Join a Lobby</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sessionActions.joinLobby(
              pin.trim().toUpperCase(),
              name.trim(),
              emoji,
            );
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '.75rem',
              maxWidth: 560,
            }}
          >
            <label>
              PIN
              <br />
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="e.g., J9K3Q2"
              />
            </label>
            <label>
              Name
              <br />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Jason"
              />
            </label>
          </div>
          <div style={{ marginTop: '.75rem' }}>
            <button
              type="submit"
              style={{
                minHeight: 44,
                borderRadius: 12,
                padding: '0 1rem',
                background: 'var(--accentPrimary)',
                border: 0,
              }}
            >
              Join
            </button>
          </div>
        </form>
      </div>
      {s.lobby.pin && (
        <div className="card" style={{ padding: '1rem' }}>
          <strong>Lobby: {s.lobby.pin}</strong>
          <div style={{ display: 'grid', gap: '.25rem', marginTop: '.5rem' }}>
            {Object.values(s.lobby.peers).map((p) => (
              <div key={p.id}>
                {p.emoji || '🙂'} {p.name}
                {p.isHost ? ' (Host)' : ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};
