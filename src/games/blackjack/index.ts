import { registerGame } from '../../gameAPI';
import {
  createInitialState,
  applyAction,
  getNextActions,
  Hand,
  GameState,
  BlackjackConfig,
} from './rules';

registerGame({
  slug: 'blackjack',
  meta: { name: 'Blackjack' },
  createInitialState: (config: BlackjackConfig) => createInitialState(config),
  applyAction: (state, action) =>
    applyAction(state as GameState, action as any),
  getPlayerView: (state) => state,
  getNextActions: (state) => getNextActions(state as GameState, ''),
  rules: {
    validate: (state, action) =>
      getNextActions(state as GameState, '').includes(action as any),
  },
});

export {
  createInitialState,
  applyAction,
  getNextActions,
  Hand,
  GameState,
  BlackjackConfig,
} from './rules';
export { placeBet, settleHand, getBalance } from './betting';
