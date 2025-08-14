import { getGame } from './index';
import {
  createInitialState,
  applyAction,
  type GameState,
  type BlackjackConfig,
  type Card,
  type Rank,
} from '../games/blackjack/rules';
import { buildDeck, shuffle } from '../util/cards';

// ---------------------------------------------------------------------------
// Blackjack facade
// ---------------------------------------------------------------------------

function cardValue(rank: Rank): number {
  if (rank === 'A') return 11;
  if (['K', 'Q', 'J'].includes(rank)) return 10;
  return parseInt(rank, 10);
}

function handTotal(cards: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += cardValue(c.rank);
    if (c.rank === 'A') aces++;
  }
  while (total > 21 && aces) {
    total -= 10;
    aces--;
  }
  return total;
}

const ranks: Rank[] = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
];

function freshShoe(): Card[] {
  return shuffle(buildDeck(ranks, (rank, suit) => ({ rank, suit })));
}

const defaultConfig: BlackjackConfig = {
  h17: false,
  das: false,
  resplitAces: false,
  surrender: 'none',
  payout: '3:2',
  penetration: 1,
};

let bjState: GameState = createInitialState(defaultConfig);

export type BJAction =
  | 'deal'
  | 'hit'
  | 'stand'
  | 'double'
  | 'split'
  | 'surrender';

export const blackjackRules = {
  deal(config: Partial<BlackjackConfig> = {}): void {
    const cfg = { ...defaultConfig, ...config };
    bjState = createInitialState(cfg);
    bjState.shoe = freshShoe();
    bjState.shoeSize = bjState.shoe.length;
    const playerCards = [bjState.shoe.shift()!, bjState.shoe.shift()!];
    const dealerCards = [bjState.shoe.shift()!, bjState.shoe.shift()!];
    bjState.hands = [{ cards: playerCards, bet: 0 }];
    bjState.dealer = dealerCards;
    bjState.active = 0;
    bjState.stage = 'player';
  },
  act(action: BJAction): void {
    if (action === 'deal') {
      this.deal();
      return;
    }
    applyAction(bjState, action as Exclude<BJAction, 'deal'>);
  },
  state(): {
    player: { total: number; cards: Card[] };
    dealer: { total: number; cards: Card[] };
  } {
    const hand = bjState.hands[0] ?? { cards: [], bet: 0 };
    return {
      player: { total: handTotal(hand.cards), cards: hand.cards },
      dealer: { total: handTotal(bjState.dealer), cards: bjState.dealer },
    };
  },
};

export function enforceRules(
  state: { slug?: string } | undefined,
  action: unknown,
  playerId?: string,
): boolean {
  if (!state?.slug) return false;
  const game = getGame(state.slug);
  if (!game || typeof game.rules?.validate !== 'function') return false;
  try {
    return !!game.rules.validate(state as any, action as any, playerId);
  } catch {
    return false;
  }
}
