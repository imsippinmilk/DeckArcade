import React, { useState } from 'react';
import {
  createInitialState,
  applyAction,
  Action,
  GameState,
  PileRef,
} from './rules';

/** Minimal UI for the Solitaire vertical slice. */
const SolitaireUI: React.FC = () => {
  const [state, setState] = useState<GameState>(() => createInitialState(1));
  const [selection, setSelection] = useState<PileRef | null>(null);

  const dispatch = (action: Action) => {
    setState((s) => ({ ...applyAction({ ...s, history: s.history }, action) }));
  };

  const onStockClick = () => {
    if (state.piles.stock.length) dispatch({ type: 'DRAW_FROM_STOCK' });
    else if (state.piles.waste.length) dispatch({ type: 'REDEPLOY_STOCK' });
  };

  const onCardClick = (pile: PileRef) => {
    if (selection) {
      dispatch({ type: 'MOVE', from: selection, to: pile as any });
      setSelection(null);
    } else {
      setSelection(pile);
    }
  };

  const renderCard = (card: any) =>
    card.faceUp ? `${card.rank}${card.suit}` : 'XX';

  return (
    <div style={{ padding: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button data-testid="stock" onClick={onStockClick}>
          Stock ({state.piles.stock.length})
        </button>
        <div data-testid="waste" onClick={() => onCardClick({ type: 'waste' })}>
          Waste: {state.piles.waste.map(renderCard).join(' ')}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {(['C', 'D', 'H', 'S'] as const).map((suit) => (
            <div
              key={suit}
              data-testid={`foundation-${suit}`}
              onClick={() => onCardClick({ type: 'foundation', suit })}
            >
              {suit}: {state.piles.foundations[suit].map(renderCard).join(' ')}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {state.piles.tableau.map((pile, i) => (
          <div
            key={i}
            data-testid={`tableau-${i}`}
            onClick={() => onCardClick({ type: 'tableau', index: i })}
          >
            {pile.map(renderCard).join(' ')}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button data-testid="undo" onClick={() => dispatch({ type: 'UNDO' })}>
          Undo
        </button>
        <button data-testid="redo" onClick={() => dispatch({ type: 'REDO' })}>
          Redo
        </button>
        <button data-testid="hint" onClick={() => dispatch({ type: 'HINT' })}>
          Hint
        </button>
        <button
          data-testid="autocomplete"
          onClick={() => dispatch({ type: 'AUTOCOMPLETE' })}
        >
          Auto
        </button>
      </div>
      {state.isWon && <div data-testid="win">You won!</div>}
    </div>
  );
};

export default SolitaireUI;
