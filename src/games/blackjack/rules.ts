import { z } from 'zod';
import { registerGame as register } from '../../gameAPI';

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

export type BlackjackAction =
  | 'hit'
  | 'stand'
  | 'double'
  | 'split'
  | 'surrender';

export const configSchema = z.object({
  h17: z.boolean(),
  das: z.boolean(),
  resplitAces: z.boolean(),
  surrender: z.enum(['none', 'late', 'early']),
  payout: z.enum(['3:2', '6:5']),
  penetration: z.number().min(0).max(1),
  minBet: z.number().optional(),
  maxBet: z.number().optional(),
});

export type BlackjackConfig = z.infer<typeof configSchema>;

export interface Hand {
  cards: Card[];
  bet: number;
  splitAces?: boolean;
  fromSplit?: boolean;
  hasActed?: boolean;
  result?: Outcome['result'];
}

export interface Outcome {
  result: 'win' | 'lose' | 'push' | 'blackjack' | 'surrender';
  bet: number;
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
  shoeSize: number; // original size for penetration tracking
}

function createDeck(): Card[] {
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
  const suits: Suit[] = ['S', 'H', 'D', 'C'];
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

function shuffle(cards: Card[]): Card[] {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function cardValue(card: Card): number {
  switch (card.rank) {
    case 'A':
      return 11;
    case 'K':
    case 'Q':
    case 'J':
    case '10':
      return 10;
    default:
      return parseInt(card.rank, 10);
  }
}

export function getHandValue(hand: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    if (c.rank === 'A') aces++;
    total += cardValue(c);
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return { total, soft: aces > 0 };
}

export function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && getHandValue(hand).total === 21;
}

function dealCard(state: GameState, target: Card[]): void {
  const card = state.shoe.pop();
  if (card) target.push(card);
  checkPenetration(state);
}

function checkPenetration(state: GameState): void {
  const used = state.shoeSize - state.shoe.length;
  if (used / state.shoeSize >= state.config.penetration) {
    state.events.push({ type: 'reshuffle' });
    state.shoe = shuffle(createDeck());
    state.discard = [];
    state.shoeSize = state.shoe.length;
  }
}

export function createInitialState(config: BlackjackConfig): GameState {
  const shoe = shuffle(createDeck());
  const state: GameState = {
    shoe,
    discard: [],
    dealer: [],
    hands: [{ cards: [], bet: config.minBet ?? 10 }],
    active: 0,
    config,
    stage: 'player',
    bank: 100,
    events: [],
    shoeSize: shoe.length,
  };

  // Initial deal
  dealCard(state, state.hands[0].cards);
  dealCard(state, state.dealer);
  dealCard(state, state.hands[0].cards);
  dealCard(state, state.dealer);

  if (config.surrender !== 'early') {
    const dealerBJ = isBlackjack(state.dealer);
    const playerBJ = isBlackjack(state.hands[0].cards);
    if (dealerBJ || playerBJ) {
      const outcome: Outcome = dealerBJ
        ? playerBJ
          ? { result: 'push', bet: state.hands[0].bet }
          : { result: 'lose', bet: state.hands[0].bet }
        : { result: 'blackjack', bet: state.hands[0].bet };
      state.bank += payouts.settle([outcome], config);
      state.hands[0].result = outcome.result;
      state.stage = 'finished';
    }
  }
  return state;
}

function moveToNextHand(state: GameState): void {
  state.active++;
  if (state.active >= state.hands.length) {
    dealerPlay(state);
  }
}

function dealerPlay(state: GameState): void {
  state.stage = 'dealer';
  while (true) {
    const value = getHandValue(state.dealer);
    if (
      value.total < 17 ||
      (value.total === 17 && value.soft && state.config.h17)
    ) {
      dealCard(state, state.dealer);
    } else {
      break;
    }
  }

  const dealerValue = getHandValue(state.dealer).total;
  const dealerBust = dealerValue > 21;
  const outcomes: Outcome[] = [];

  for (const hand of state.hands) {
    if (hand.result) {
      outcomes.push({ result: hand.result, bet: hand.bet });
      continue;
    }
    const playerValue = getHandValue(hand.cards).total;
    if (playerValue > 21) {
      outcomes.push({ result: 'lose', bet: hand.bet });
    } else if (dealerBust) {
      outcomes.push({ result: 'win', bet: hand.bet });
    } else if (isBlackjack(hand.cards) && !isBlackjack(state.dealer)) {
      outcomes.push({ result: 'blackjack', bet: hand.bet });
    } else if (playerValue > dealerValue) {
      outcomes.push({ result: 'win', bet: hand.bet });
    } else if (playerValue < dealerValue) {
      outcomes.push({ result: 'lose', bet: hand.bet });
    } else {
      outcomes.push({ result: 'push', bet: hand.bet });
    }
  }

  state.bank += payouts.settle(outcomes, state.config);
  state.stage = 'finished';
}

export function applyAction(
  state: GameState,
  action: BlackjackAction,
): GameState {
  if (state.stage !== 'player') return state;
  const hand = state.hands[state.active];

  switch (action) {
    case 'hit':
      dealCard(state, hand.cards);
      hand.hasActed = true;
      if (getHandValue(hand.cards).total > 21) {
        hand.result = 'lose';
        state.bank += payouts.settle(
          [{ result: 'lose', bet: hand.bet }],
          state.config,
        );
        moveToNextHand(state);
      }
      break;
    case 'stand':
      hand.hasActed = true;
      moveToNextHand(state);
      break;
    case 'double':
      if (state.bank >= hand.bet) {
        state.bank -= hand.bet;
        hand.bet *= 2;
        dealCard(state, hand.cards);
        hand.hasActed = true;
        if (getHandValue(hand.cards).total > 21) {
          hand.result = 'lose';
          state.bank += payouts.settle(
            [{ result: 'lose', bet: hand.bet }],
            state.config,
          );
        }
        moveToNextHand(state);
      }
      break;
    case 'split':
      if (
        hand.cards.length === 2 &&
        hand.cards[0].rank === hand.cards[1].rank
      ) {
        if (state.bank >= hand.bet) {
          state.bank -= hand.bet;
          const [c1, c2] = hand.cards;
          const newHand1: Hand = {
            cards: [c1],
            bet: hand.bet,
            splitAces: c1.rank === 'A',
            fromSplit: true,
          };
          const newHand2: Hand = {
            cards: [c2],
            bet: hand.bet,
            splitAces: c2.rank === 'A',
            fromSplit: true,
          };
          state.hands[state.active] = newHand1;
          state.hands.splice(state.active + 1, 0, newHand2);
          dealCard(state, newHand1.cards);
          dealCard(state, newHand2.cards);
        }
      }
      break;
    case 'surrender':
      hand.result = 'surrender';
      state.bank += payouts.settle(
        [{ result: 'surrender', bet: hand.bet }],
        state.config,
      );
      state.stage = 'finished';
      break;
  }

  return state;
}

export function getPlayerView(state: GameState, _playerId: string): GameState {
  return state;
}

export function getNextActions(
  state: GameState,
  _playerId: string,
): BlackjackAction[] {
  if (state.stage !== 'player') return [];
  const hand = state.hands[state.active];
  const actions: BlackjackAction[] = ['hit', 'stand'];

  if (hand.cards.length === 2 && state.bank >= hand.bet) {
    if (!hand.splitAces || state.config.resplitAces) {
      if (hand.cards[0].rank === hand.cards[1].rank) {
        actions.push('split');
      }
    }
    if (!hand.hasActed) {
      if (!hand.fromSplit || state.config.das) actions.push('double');
      if (state.config.surrender === 'early') {
        actions.push('surrender');
      } else if (
        state.config.surrender === 'late' &&
        !isBlackjack(state.dealer)
      ) {
        actions.push('surrender');
      }
    }
  }
  return actions;
}

export const rules = {
  validate(_state: GameState, action: unknown): boolean {
    const schema = z.object({
      action: z.enum(['hit', 'stand', 'double', 'split', 'surrender']),
    });
    return schema.safeParse({ action }).success;
  },
};

export const payouts = {
  settle(outcomes: Outcome[], config: BlackjackConfig): number {
    let delta = 0;
    for (const o of outcomes) {
      switch (o.result) {
        case 'win':
          delta += o.bet;
          break;
        case 'lose':
          delta -= o.bet;
          break;
        case 'push':
          break;
        case 'blackjack':
          delta += o.bet * (config.payout === '3:2' ? 1.5 : 1.2);
          break;
        case 'surrender':
          delta -= o.bet / 2;
          break;
      }
    }
    return delta;
  },
};

export function registerGame(): void {
  const defaultConfig: BlackjackConfig = {
    h17: false,
    das: false,
    resplitAces: false,
    surrender: 'none',
    payout: '3:2',
    penetration: 1,
  };
  register({
    slug: 'blackjack',
    meta: { title: 'Blackjack', players: '1' },
    createInitialState: (() => createInitialState(defaultConfig)) as any,
    applyAction: ((state: unknown, action: unknown) =>
      applyAction(state as GameState, action as BlackjackAction)) as any,
    getPlayerView: ((state: unknown, player: string) =>
      getPlayerView(state as GameState, player)) as any,
    getNextActions: ((state: unknown, player: string) =>
      getNextActions(state as GameState, player)) as any,
    rules: {
      validate: (state: unknown, action: unknown) =>
        rules.validate(state as GameState, action),
    },
    payouts: {
      settle: (outcomes: unknown, config: unknown) =>
        payouts.settle(outcomes as Outcome[], config as BlackjackConfig),
    },
  });
}

export function cardToString(card: Card): string {
  return card.rank + card.suit;
}
