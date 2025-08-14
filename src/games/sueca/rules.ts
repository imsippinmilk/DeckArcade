export type Suit = 'C' | 'D' | 'H' | 'S';
export type Rank = 'A' | '7' | 'K' | 'J' | 'Q' | '6' | '5' | '4' | '3' | '2';
export interface Card {
  suit: Suit;
  rank: Rank;
}

const ORDER: Rank[] = ['A', '7', 'K', 'J', 'Q', '6', '5', '4', '3', '2'];
const POINTS: Record<Rank, number> = {
  A: 11,
  '7': 10,
  K: 4,
  J: 3,
  Q: 2,
  '6': 0,
  '5': 0,
  '4': 0,
  '3': 0,
  '2': 0,
};

export const createDeck = (): Card[] => {
  const suits: Suit[] = ['C', 'D', 'H', 'S'];
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ORDER) {
      deck.push({ suit, rank });
    }
  }
  return deck;
};

export interface DealResult {
  hands: Card[][];
  trump: Suit;
}

export const deal = (deck: Card[]): DealResult => {
  if (deck.length !== 40) throw new Error('deck must have 40 cards');
  const hands: Card[][] = [[], [], [], []];
  for (let i = 0; i < deck.length; i++) {
    hands[i % 4].push(deck[i]);
  }
  const trump = hands[3][hands[3].length - 1].suit;
  return { hands, trump };
};

const orderIndex = (rank: Rank): number => ORDER.indexOf(rank);

export const getCardPoints = (card: Card): number => POINTS[card.rank];

export const compareCards = (
  a: Card,
  b: Card,
  lead: Suit,
  trump: Suit,
): number => {
  if (a.suit === b.suit) {
    return orderIndex(b.rank) - orderIndex(a.rank);
  }
  if (a.suit === trump && b.suit !== trump) return 1;
  if (b.suit === trump && a.suit !== trump) return -1;
  if (a.suit === lead && b.suit !== lead) return 1;
  if (b.suit === lead && a.suit !== lead) return -1;
  return 0;
};

export const getTrickWinner = (trick: Card[], trump: Suit): number => {
  const lead = trick[0].suit;
  let winner = 0;
  for (let i = 1; i < trick.length; i++) {
    if (compareCards(trick[i], trick[winner], lead, trump) > 0) {
      winner = i;
    }
  }
  return winner;
};

export const trickPoints = (trick: Card[]): number =>
  trick.reduce((sum, c) => sum + getCardPoints(c), 0);

export interface GameState {
  hands: Card[][];
  trick: Card[];
  leader: number;
  trump: Suit;
  scores: [number, number];
  mustTrumpWhenVoid: boolean;
}

export const createInitialState = (
  deck: Card[] = createDeck(),
  opts: { dealer?: number; mustTrumpWhenVoid?: boolean } = {},
): GameState => {
  const dealer = opts.dealer ?? 3;
  const { hands, trump } = deal(deck);
  return {
    hands,
    trick: [],
    leader: (dealer + 1) % 4,
    trump,
    scores: [0, 0],
    mustTrumpWhenVoid: opts.mustTrumpWhenVoid ?? false,
  };
};

export const currentPlayer = (state: GameState): number =>
  (state.leader + state.trick.length) % 4;

export const canPlayCard = (
  state: GameState,
  player: number,
  card: Card,
): boolean => {
  if (currentPlayer(state) !== player) return false;
  const hand = state.hands[player];
  const idx = hand.findIndex(
    (c) => c.suit === card.suit && c.rank === card.rank,
  );
  if (idx === -1) return false;
  if (state.trick.length === 0) return true;
  const lead = state.trick[0].suit;
  const hasLead = hand.some((c) => c.suit === lead);
  if (hasLead && card.suit !== lead) return false;
  if (!hasLead && state.mustTrumpWhenVoid) {
    const hasTrump = hand.some((c) => c.suit === state.trump);
    if (hasTrump && card.suit !== state.trump) return false;
  }
  return true;
};

export const playCard = (
  state: GameState,
  player: number,
  card: Card,
): void => {
  if (!canPlayCard(state, player, card)) throw new Error('illegal play');
  const hand = state.hands[player];
  const idx = hand.findIndex(
    (c) => c.suit === card.suit && c.rank === card.rank,
  );
  hand.splice(idx, 1);
  state.trick.push(card);
  if (state.trick.length === 4) {
    const relWinner = getTrickWinner(state.trick, state.trump);
    const winner = (state.leader + relWinner) % 4;
    const points = trickPoints(state.trick);
    if (winner % 2 === 0) state.scores[0] += points;
    else state.scores[1] += points;
    state.trick = [];
    state.leader = winner;
  }
};

export const isHandOver = (state: GameState): boolean =>
  state.hands[0].length === 0 && state.trick.length === 0;
