import React, { useReducer } from 'react';
import {
  BlackjackAction,
  BlackjackConfig,
  createInitialState,
  applyAction,
  getPlayerView,
  getNextActions,
  cardToString,
} from './rules';

const defaultConfig: BlackjackConfig = {
  h17: false,
  das: true,
  resplitAces: false,
  surrender: 'late',
  payout: '3:2',
  penetration: 0.75,
};

function reducer(state: any, action: BlackjackAction) {
  return { ...applyAction(state, action) };
}

const BlackjackUI: React.FC = () => {
  const [state, dispatch] = useReducer(
    reducer,
    createInitialState(defaultConfig),
  );
  const view = getPlayerView(state, 'player');
  const actions = getNextActions(state, 'player');
  const hand = view.hands[view.active]?.cards ?? [];

  return (
    <div style={{ color: '#fff' }}>
      <div>Dealer: {view.dealer.map(cardToString).join(' ')}</div>
      <div>Player: {hand.map(cardToString).join(' ')}</div>
      <div>
        Bank: {view.bank} Bet: {view.hands[view.active]?.bet ?? 0}
      </div>
      <div>
        {actions.map((a) => (
          <button
            key={a}
            onClick={() => dispatch(a)}
            style={{ marginRight: 8 }}
          >
            {a}
          </button>
        ))}
      </div>
      <ul>
        {view.events.map((e: any, i: number) => (
          <li key={i}>{e.type}</li>
        ))}
      </ul>
    </div>
  );
};

export default BlackjackUI;
