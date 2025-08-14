import React from 'react';
import {
  createInitialState,
  applyAction,
  getNextActions,
  type BlackjackConfig,
} from './rules';

const defaultConfig: BlackjackConfig = {
  h17: false,
  das: false,
  resplitAces: false,
  surrender: 'none',
  payout: '3:2',
  penetration: 1,
};

export function BlackjackUI() {
  const [state, setState] = React.useState(() =>
    createInitialState(defaultConfig),
  );
  const actions = getNextActions(state, 'player');

  const doAction = (action: any) => {
    applyAction(state, action);
    setState({ ...state });
  };

  return (
    <div>
      <div>Dealer: {state.dealer.map((c) => c.rank).join(' ')}</div>
      <div>Player: {state.hands[0].cards.map((c) => c.rank).join(' ')}</div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {actions.includes('hit') && (
          <button onClick={() => doAction('hit')}>Hit</button>
        )}
        {actions.includes('stand') && (
          <button onClick={() => doAction('stand')}>Stand</button>
        )}
      </div>
    </div>
  );
}

export default BlackjackUI;
