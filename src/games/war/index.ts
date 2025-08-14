import { registerGame } from '../../gameAPI';
import { createInitialState, applyAction, getPlayerView } from './rules';

registerGame({
  slug: 'war',
  meta: { name: 'War' },
  createInitialState,
  applyAction,
  getPlayerView,
  getNextActions: () => ['draw'],
  rules: {
    validate: (_state, action) => action === 'draw',
  },
});

export { createInitialState, applyAction, getPlayerView };
