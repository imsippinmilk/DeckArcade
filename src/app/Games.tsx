import React from 'react';
import { gameAPI } from '../gameAPI';

// Import game modules so they register themselves
import '../games/blackjack';
import '../games/solitaire';
import '../games/war';
import '../games/poker-holdem';

// Import UIs
import { BlackjackUI } from '../games/blackjack/ui';
import SolitaireUI from '../games/solitaire/ui';
import WarUI from '../games/war/ui';

const uiMap: Record<string, React.FC> = {
  blackjack: BlackjackUI,
  'solitaire-klondike': SolitaireUI,
  war: WarUI,
};

export const Games: React.FC = () => {
  const list = gameAPI.listGames();
  return (
    <main className="container" style={{ display: 'grid', gap: '1rem' }}>
      <h2>Games</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {list.map((g) => {
          const UI = uiMap[g.slug];
          return (
            <div key={g.slug} className="card" style={{ padding: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>{g.meta.name || g.slug}</h3>
              {UI ? <UI /> : <p>Coming soon</p>}
            </div>
          );
        })}
      </div>
    </main>
  );
};


export function Games() {
  const games = ['blackjack', 'poker-holdem', 'solitaire', 'sueca', 'war'];
  return (
    <div className="container">
      <h2>Games</h2>
      <ul>
        {games.map((g) => (
          <li key={g}>{g}</li>
        ))}
      </ul>
    </div>
  );
}

