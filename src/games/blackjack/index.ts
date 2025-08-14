import { registerGame, GameRegistration } from '../../gameAPI';

/**
 * Basic skeleton for the blackjack game. The actual logic for
 * blackjack will be implemented in steps according to the product
 * specification. For now we register a simple object so that the
 * game appears in the registry.
 */
const blackjackGame: GameRegistration = {
  slug: 'blackjack',
  meta: {
    title: 'Blackjack',
    players: '1–7'
  },
  createInitialState(seed: number) {
    // TODO: generate a shuffled shoe and initial table state based on seed
    return { seed };
  },
  applyAction(state: unknown, action: unknown) {
    // TODO: update state according to blackjack rules
    return state;
  },
  getPlayerView(state: unknown, playerId: string) {
    // TODO: return the portion of state visible to the specified player
    return state;
  },
  getNextActions(state: unknown, playerId: string) {
    // TODO: compute the list of allowed actions
    return [];
  },
  rules: {
    validate(state: unknown, action: unknown) {
      // TODO: enforce blackjack move legality
      return true;
    }
  },
  explainers: {
    getTips(state: unknown, playerId: string) {
      // TODO: return contextual hints such as when to hit or stand
      return [];
    }
  },
  animations: {},
  payouts: {
    settle(economyState: unknown, tableState: unknown) {
      // TODO: move chips based on results of the hand
      return {};
    }
  }
};

// Register the game so that it can be discovered by the UI.
registerGame(blackjackGame);