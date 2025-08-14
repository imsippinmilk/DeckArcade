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
export type Suit = 'S' | 'H' | 'D' | 'C';
export interface Card {
  rank: Rank;
  suit: Suit;
}

export interface Hand {
  cards: Card[];
  bet: number;
}

export interface BlackjackConfig {
  h17: boolean;
  das: boolean;
  resplitAces: boolean;
  surrender: 'none' | 'early' | 'late';
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
  afterSplit?: boolean;
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

function handValue(cards: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.rank === 'A') {
      aces++;
      total += 11;
    } else if (['K', 'Q', 'J'].includes(c.rank) || c.rank === '10') {
      total += 10;
    } else {
      total += Number(c.rank);
    }
  }
  while (total > 21 && aces) {
    total -= 10;
    aces--;
  }
  return { total, soft: aces > 0 };
}

function dealerShouldHit(dealer: Card[], config: BlackjackConfig): boolean {
  const { total, soft } = handValue(dealer);
  if (total < 17) return true;
  if (total === 17 && soft) return config.h17;
  return false;
}

function checkPenetration(state: GameState) {
  if (
    state.shoeSize &&
    state.shoe.length / state.shoeSize <= 1 - state.config.penetration
  ) {
    state.events.push({ type: 'reshuffle' });
  }
}

export function applyAction(
  state: GameState,
  action: 'hit' | 'stand' | 'split' | 'surrender',
) {
  const hand = state.hands[state.active];
  switch (action) {
    case 'hit': {
      const card = state.shoe.shift();
      if (card) hand.cards.push(card);
      const { total } = handValue(hand.cards);
      checkPenetration(state);
      if (total > 21) state.stage = 'finished';
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
      state.stage = 'finished';
      break;
    }
    case 'split': {
      if (hand.cards.length === 2) {
        const second = { cards: [hand.cards.pop()!], bet: hand.bet };
        const first = { cards: [hand.cards.pop()!], bet: hand.bet };
        const card1 = state.shoe.shift();
        const card2 = state.shoe.shift();
        if (card1) first.cards.push(card1);
        if (card2) second.cards.push(card2);
        state.hands.splice(state.active, 1, first, second);
        state.active = state.active + 1;
        state.afterSplit = true;
      }
      break;
    }
    case 'surrender': {
      const loss = hand.bet / 2;
      state.bank -= loss;
      state.stage = 'finished';
      break;
    }
  }
}

export function getNextActions(
  state: GameState,
  stage: 'player' | 'dealer',
): string[] {
  if (stage !== 'player') return [];
  const actions = ['hit', 'stand'];
  const hand = state.hands[state.active];
  if (hand.cards.length === 2) {
    if (state.afterSplit && state.config.das) actions.push('double');
    if (hand.cards[0].rank === hand.cards[1].rank) {
      if (hand.cards[0].rank === 'A') {
        if (state.config.resplitAces) actions.push('split');
      } else {
        actions.push('split');
      }
    }
    if (state.config.surrender !== 'none') {
      const dealerBJ =
        state.dealer.length === 2 && handValue(state.dealer).total === 21;
      if (state.config.surrender === 'early' || !dealerBJ)
        actions.push('surrender');
    }
  }
  return actions;
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
      else if (o.result === 'push') total += 0;
      else if (o.result === 'surrender') total -= o.bet / 2;
      else total -= o.bet;
    }
    return total;
  },
};
