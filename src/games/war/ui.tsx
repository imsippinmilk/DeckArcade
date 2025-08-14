import React from 'react';
import { createInitialState, applyAction, getPlayerView } from './rules';

export default function WarGame() {
  const [state, setState] = React.useState(() => createInitialState());
  const view = getPlayerView(state, 'p1');

  const draw = () => {
    applyAction(state, 'draw');
    setState({ ...state });
  };

  return (
    <div>
      <button onClick={draw}>Draw</button>
      {state.lastDraw && (
        <div>
          <div>P1: {state.lastDraw.p1.rank}</div>
          <div>P2: {state.lastDraw.p2.rank}</div>
          <div>Winner: {state.winner}</div>
        </div>
      )}
      <div>Deck remaining: {view.deckCount}</div>
    </div>
  );
}
