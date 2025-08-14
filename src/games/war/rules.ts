export type Rank =
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
  | 'K'
  | 'A';
export type Suit = 'C' | 'D' | 'H' | 'S';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export interface GameState {
  deck: Card[];
  lastDraw?: { p1: Card; p2: Card };
  winner?: 'p1' | 'p2' | 'war';
}

const rankOrder: Rank[] = [
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
  'A',
];

function createDeck(): Card[] {
  const suits: Suit[] = ['C', 'D', 'H', 'S'];
  const deck: Card[] = [];
  for (const r of rankOrder)
    for (const s of suits) deck.push({ rank: r, suit: s });
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createInitialState(): GameState {
  return { deck: shuffle(createDeck()) };
}

export type Action = 'draw';

function value(rank: Rank): number {
  return rankOrder.indexOf(rank);
}

export function applyAction(state: GameState, action: Action): void {
  if (action !== 'draw' || state.deck.length < 2) return;
  const p1 = state.deck.pop()!;
  const p2 = state.deck.pop()!;
  state.lastDraw = { p1, p2 };
  const v1 = value(p1.rank);
  const v2 = value(p2.rank);
  if (v1 > v2) state.winner = 'p1';
  else if (v2 > v1) state.winner = 'p2';
  else state.winner = 'war';
}

export function getPlayerView(
  state: GameState,
  _playerId: string,
): Omit<GameState, 'deck'> & { deckCount: number } {
  const { deck, ...rest } = state;
  return { ...rest, deckCount: deck.length };
}

export function getNextActions(state: GameState): Action[] {
  return state.deck.length >= 2 ? ['draw'] : [];
}

export function validateAction(state: GameState, action: Action): boolean {
  return action === 'draw' && state.deck.length >= 2;
}
