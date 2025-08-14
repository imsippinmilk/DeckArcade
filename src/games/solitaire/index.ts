import { registerGame } from '../../gameAPI';
import {
  createInitialState,
  validateAction,
  applyAction,
  getHint,
} from './rules';

registerGame({
  slug: 'solitaire-klondike',
  meta: { name: 'Solitaire' },
  createInitialState,
  applyAction: (state, action) => applyAction(state as any, action as any),
  getPlayerView: (state) => state,
  getNextActions: () => [],
  rules: {
    validate: (state, action) => validateAction(state as any, action as any),
  },
});

export { createInitialState, validateAction, applyAction, getHint };
