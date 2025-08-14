export type Rank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K';
import { buildDeck, SUITS } from '../../util/cards';

export type Suit = (typeof SUITS)[number];

export interface Card {
  rank: Rank;
  suit: Suit;
}

export interface Hand {
  cards: Card[];
  bet: number;
  result?: 'blackjack' | 'win' | 'lose' | 'push' | 'surrender';
}

export interface BlackjackConfig {
  h17: boolean;
  das: boolean;
  resplitAces: boolean;
  surrender: 'early' | 'late' | 'none';
  payout: '3:2' | '6:5';
  penetration: number; // 0-1
}

export interface GameState {
  shoe: Card[];
  discard: Card[];
  dealer: Card[];
  hands: Hand[];
  active: number;
  config: BlackjackConfig;
  stage: 'player' | 'dealer' | 'finished';
  bank: number;
  events: { type: string }[];
  shoeSize: number;
  afterSplit?: boolean;
}

export type Action = 'hit' | 'stand' | 'split' | 'surrender';

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

function createDeck(): Card[] {
  return buildDeck(ranks, (rank, suit) => ({ rank, suit }));
}

export function createInitialState(config: BlackjackConfig): GameState {
  return {
    shoe: [],
    discard: [],
    dealer: [],
    hands: [],
    active: 0,
    config,
    stage: 'player',
    bank: 100,
    events: [],
    shoeSize: 0,
  };
}

function value(rank: Rank): number {
  if (rank === 'A') return 11;
  if (['K', 'Q', 'J'].includes(rank)) return 10;
  return parseInt(rank, 10);
}

function handValue(cards: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += value(c.rank);
    if (c.rank === 'A') aces++;
  }
  while (total > 21 && aces) {
    total -= 10;
    aces--;
  }
  return { total, soft: aces > 0 };
}

function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards).total === 21;
}

function dealerShouldHit(dealer: Card[], config: BlackjackConfig): boolean {
  const { total, soft } = handValue(dealer);
  if (total < 17) return true;
  if (total === 17 && soft) return config.h17;
  return false;
}

function checkPenetration(state: GameState) {
  if (!state.shoeSize) return;
  const used = state.shoeSize - state.shoe.length;
  if (used / state.shoeSize >= state.config.penetration) {
    if (!state.events.some((e) => e.type === 'reshuffle'))
      state.events.push({ type: 'reshuffle' });
  }
}

export function getNextActions(state: GameState, _playerId: string): Action[] {
  if (state.stage !== 'player') return [];
  const hand = state.hands[state.active];
  if (!hand) return [];
  const actions: Action[] = ['hit', 'stand'];
  if (
    hand.cards.length === 2 &&
    hand.cards[0].rank === hand.cards[1].rank &&
    (hand.cards[0].rank !== 'A' || state.config.resplitAces)
  ) {
    actions.push('split');
  }
  if (
    hand.cards.length === 2 &&
    (state.hands.length === 1 || (state.config.das && state.afterSplit))
  ) {
    actions.push('double');
  }
  if (state.config.surrender !== 'none') {
    const dealerBJ = isBlackjack(state.dealer);
    if (
      state.config.surrender === 'early' ||
      (state.config.surrender === 'late' && !dealerBJ)
    ) {
      actions.push('surrender');
    }
  }
  return actions;
}

function settle(state: GameState) {
  const dealerTotal = handValue(state.dealer).total;
  for (const hand of state.hands) {
    const hv = handValue(hand.cards).total;
    let result: Hand['result'];
    if (hand.result === 'surrender') result = 'surrender';
    else if (isBlackjack(hand.cards) && !isBlackjack(state.dealer))
      result = 'blackjack';
    else if (hv > 21) result = 'lose';
    else if (dealerTotal > 21 || hv > dealerTotal) result = 'win';
    else if (hv < dealerTotal) result = 'lose';
    else result = 'push';
    hand.result = result;
    switch (result) {
      case 'blackjack':
        state.bank += hand.bet * (state.config.payout === '3:2' ? 1.5 : 1.2);
        break;
      case 'win':
        state.bank += hand.bet;
        break;
      case 'lose':
        state.bank -= hand.bet;
        break;
      case 'surrender':
        state.bank -= hand.bet / 2;
        break;
      default:
        break;
    }
  }
  state.stage = 'finished';
}

export function applyAction(
  state: GameState,
  action: Action,
  _playerId?: string,
): void {
  const hand = state.hands[state.active];
  switch (action) {
    case 'hit': {
      const card = state.shoe.shift();
      if (card) hand.cards.push(card);
      checkPenetration(state);
      if (handValue(hand.cards).total > 21) {
        state.stage = 'finished';
      }
      state.afterSplit = false;
      break;
    }
    case 'stand': {
      state.stage = 'dealer';
      while (dealerShouldHit(state.dealer, state.config)) {
        const card = state.shoe.shift();
        if (!card) break;
        state.dealer.push(card);
        checkPenetration(state);
      }
      settle(state);
      break;
    }
    case 'split': {
      if (hand.cards.length === 2) {
        const [c1, c2] = hand.cards;
        const card1 = state.shoe.shift();
        const card2 = state.shoe.shift();
        const first: Hand = { cards: [c1, card1!], bet: hand.bet };
        const second: Hand = { cards: [c2, card2!], bet: hand.bet };
        state.hands.splice(state.active, 1, first, second);
        state.active = state.active + 1; // focus second hand
        state.afterSplit = true;
        checkPenetration(state);
        checkPenetration(state);
      }
      break;
    }
    case 'surrender': {
      hand.result = 'surrender';
      settle(state);
      break;
    }
  }
}

export const payouts = {
  settle(
    outcomes: { result: string; bet: number }[],
    config: BlackjackConfig,
  ): number {
    let total = 0;
    for (const o of outcomes) {
      if (o.result === 'blackjack')
        total += o.bet * (config.payout === '3:2' ? 1.5 : 1.2);
      else if (o.result === 'win') total += o.bet;
      else if (o.result === 'lose') total -= o.bet;
      else if (o.result === 'surrender') total -= o.bet / 2;
    }
    return total;
  },
};
