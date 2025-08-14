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

export interface Card {
  rank: Rank;
  suit: string;
}

export interface Hand {
  cards: Card[];
  bet: number;
  result?: 'blackjack' | 'win' | 'lose' | 'push';
}

export interface BlackjackConfig {
  h17: boolean;
  das: boolean;
  resplitAces: boolean;
  surrender: 'early' | 'late' | 'none';
  payout: '3:2' | '6:5';
  penetration: number;
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

function cardValue(rank: Rank): number {
  if (rank === 'A') return 11;
  if (['K', 'Q', 'J'].includes(rank)) return 10;
  return parseInt(rank, 10);
}

function handValue(cards: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += cardValue(c.rank);
    if (c.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return { total, soft: aces > 0 };
}

function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards).total === 21;
}

function drawCard(state: GameState, target: Card[]): void {
  const card = state.shoe.shift();
  if (card) {
    target.push(card);
    checkPenetration(state);
  }
}

function checkPenetration(state: GameState): void {
  if (state.shoeSize === 0) return;
  const used = state.shoeSize - state.shoe.length;
  if (used / state.shoeSize >= state.config.penetration) {
    if (!state.events.some((e) => e.type === 'reshuffle'))
      state.events.push({ type: 'reshuffle' });
  }
}

export function getNextActions(
  state: GameState,
  stage: 'player' | 'dealer',
): string[] {
  if (stage !== 'player') return [];
  const actions = ['hit', 'stand'];
  const hand = state.hands[state.active];
  if (!hand) return actions;
  if (
    hand.cards.length === 2 &&
    hand.cards[0].rank === hand.cards[1].rank &&
    (hand.cards[0].rank !== 'A' ||
      state.config.resplitAces ||
      state.hands.length === 1)
  ) {
    actions.push('split');
  }
  if (
    hand.cards.length === 2 &&
    (state.hands.length === 1 || state.config.das)
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

function dealerPlay(state: GameState): void {
  while (true) {
    const { total, soft } = handValue(state.dealer);
    if (total < 17 || (total === 17 && soft && state.config.h17)) {
      drawCard(state, state.dealer);
    } else break;
  }
}

function settle(state: GameState): void {
  const dealerVal = handValue(state.dealer).total;
  for (const hand of state.hands) {
    const hv = handValue(hand.cards).total;
    let result: Hand['result'];
    if (isBlackjack(hand.cards) && !isBlackjack(state.dealer))
      result = 'blackjack';
    else if (hv > 21) result = 'lose';
    else if (dealerVal > 21 || hv > dealerVal) result = 'win';
    else if (hv < dealerVal) result = 'lose';
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
      default:
        break;
    }
  }
  state.stage = 'finished';
}

export function applyAction(
  state: GameState,
  action: 'hit' | 'stand' | 'split' | 'surrender',
): void {
  const hand = state.hands[state.active];
  switch (action) {
    case 'hit': {
      drawCard(state, hand.cards);
      if (handValue(hand.cards).total > 21) {
        state.bank -= hand.bet;
        state.stage = 'finished';
      }
      break;
    }
    case 'stand': {
      dealerPlay(state);
      settle(state);
      break;
    }
    case 'split': {
      if (
        hand.cards.length === 2 &&
        hand.cards[0].rank === hand.cards[1].rank
      ) {
        const [c1, c2] = hand.cards;
        const firstDraw = state.shoe.shift();
        const secondDraw = state.shoe.shift();
        const firstHand: Hand = { cards: [c1, secondDraw!], bet: hand.bet };
        const secondHand: Hand = { cards: [c2, firstDraw!], bet: hand.bet };
        state.hands.splice(state.active, 1, firstHand, secondHand);
        checkPenetration(state);
        checkPenetration(state);
      }
      break;
    }
    case 'surrender': {
      state.bank -= hand.bet / 2;
      state.stage = 'finished';
      break;
    }
  }
}

export const payouts = {
  settle(
    results: { result: string; bet: number }[],
    config: BlackjackConfig,
  ): number {
    let total = 0;
    for (const r of results) {
      if (r.result === 'blackjack') {
        total += r.bet * (config.payout === '3:2' ? 1.5 : 1.2);
      } else if (r.result === 'win') {
        total += r.bet;
      }
    }
    return total;
  },
};
