import { registerGame } from '../../gameAPI';
import {
  createInitialState,
  applyAction,
  getPlayerView,
  getNextActions,
  validateAction,
} from './rules';

registerGame({
  slug: 'war',
  meta: { name: 'War' },
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
};
export type { Card, GameState } from './rules';
