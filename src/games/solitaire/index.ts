import { registerGame, GameRegistration } from '../../gameAPI';
import {
  createInitialState,
  applyAction,
  validateAction,
  getHint,
  GameState,
  Action,
} from './rules';
import UI from './ui';

/** Game registration for Klondike Solitaire. */
const solitaireGame: GameRegistration = {
  slug: 'solitaire',
  meta: { title: 'Solitaire', players: 1 },
  createInitialState(seed: number) {
    return createInitialState(seed) as unknown;
  },
  applyAction(state: unknown, action: unknown) {
    return applyAction(state as GameState, action as Action) as unknown;
  },
  getPlayerView(state: unknown) {
    return state;
  },
  getNextActions(_state: unknown) {
    return [] as unknown[];
  },
  rules: {
    validate(state: unknown, action: unknown) {
      return validateAction(state as GameState, action as Action);
    },
  },
  explainers: {
    getTips(state: unknown) {
      const hint = getHint(state as GameState);
      return hint ? [hint.rationale] : [];
    },
  },
};

registerGame(solitaireGame);

export default solitaireGame;
export { UI as SolitaireUI };
