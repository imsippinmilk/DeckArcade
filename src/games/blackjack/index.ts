import { registerGame } from '../../gameAPI';
import {
  createInitialState,
  applyAction,
  getPlayerView,
  getNextActions,
  validateAction,
} from './rules';

registerGame({
  slug: 'blackjack',
  meta: { name: 'Blackjack' },
  createInitialState,
  applyAction,
  getPlayerView,
  getNextActions,
  rules: {
    validate: validateAction,
  },
});

export {
  createInitialState,
  applyAction,
  getPlayerView,
  getNextActions,
  validateAction,
} from './rules';
export type { Hand, GameState, BlackjackConfig } from './rules';
export { placeBet, settleHand, getBalance } from './betting';
