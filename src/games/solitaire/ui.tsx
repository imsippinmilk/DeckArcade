import React from 'react';
import {
  createInitialState,
  applyAction,
  validateAction,
  getHint,
  type Action,
} from './rules';

export default function SolitaireGame() {
  const [state, setState] = React.useState(() => createInitialState());

  const dispatch = (action: Action) => {
    if (validateAction(state, action)) {
      applyAction(state, action);
      setState({ ...state });
    }
  };

  const draw = () => dispatch({ type: 'DRAW_STOCK' });

  const hint = () => {
    const h = getHint(state);
    if (h) dispatch({ type: 'MOVE', from: h.from, to: h.to } as any);
  };

  return (
    <div>
      <button onClick={draw}>Draw</button>
      <button onClick={hint}>Hint</button>
      <div>Score: {state.score}</div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {state.piles.tableau.map((pile, i) => (
          <div key={i}>
            {pile.map((c) => (c.faceUp ? c.rank : 'X')).join(' ')}
          </div>
        ))}
      </div>
    </div>
  );
}
