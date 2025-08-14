import { registerGame } from '../../gameAPI';
import {
  createInitialState,
  validateAction,
  applyAction,
  getHint,
  getNextActions,
} from './rules';

registerGame({
  slug: 'solitaire-klondike',
  meta: { name: 'Solitaire' },
  createInitialState,
  applyAction: (state, action) => applyAction(state as any, action as any),
  getPlayerView: (state) => state,
  getNextActions: (state) => getNextActions(state as any),
  rules: {
    validate: (state, action) => validateAction(state as any, action as any),
  },
});

export {
  createInitialState,
  validateAction,
  applyAction,
  getHint,
  getNextActions,
};
