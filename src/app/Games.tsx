import React from 'react';

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
