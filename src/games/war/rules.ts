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
export interface Card {
  rank: Rank;
  suit: string;
}
export interface GameState {
  deck: Card[];

  | 'A'
  | 'K'
  | 'Q'
  | 'J'
  | '10'
  | '9'
  | '8'
  | '7'
  | '6'
  | '5'
  | '4'
  | '3'
  | '2';
export type Suit = 'C' | 'D' | 'H' | 'S';
export interface Card {
  rank: Rank;
  suit: Suit;
}

export interface GameState {
  deck: Card[];
  warPile?: Card[];
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


export function createInitialState(): GameState {
  const suits = ['S', 'H', 'D', 'C'];
  const deck: Card[] = [];
  for (const r of rankOrder) {
    for (const s of suits) deck.push({ rank: r, suit: s });
  }
  return { deck };
}

export function applyAction(state: GameState, action: 'draw') {
  if (action !== 'draw' || state.deck.length < 2) return;
  const p1 = state.deck.pop()!;
  const p2 = state.deck.pop()!;
  const diff = rankOrder.indexOf(p1.rank) - rankOrder.indexOf(p2.rank);
  if (diff > 0) state.winner = 'p1';
  else if (diff < 0) state.winner = 'p2';
  else state.winner = 'war';
}

export function getPlayerView(state: GameState, _player: 'p1' | 'p2') {
  return {
    ...state,
    deck: undefined,
    deckCount: state.deck.length,
  } as Partial<GameState> & { deckCount: number };

export function createDeck(): Card[] {
  const suits: Suit[] = ['C', 'D', 'H', 'S'];
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of rankOrder) deck.push({ rank, suit });
  }
  return deck;
}

export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createInitialState(): GameState {
  return { deck: shuffle(createDeck()) };
}

function value(rank: Rank): number {
  return rankOrder.indexOf(rank);
}

export function applyAction(state: GameState, action: 'draw'): void {
  if (action !== 'draw') return;
  if (state.winner === 'war') {
    // Resolve ongoing war
    // burn 3 cards each if possible
    const warPile = state.warPile ?? [];
    const burnCount = Math.min(3, Math.floor(state.deck.length / 2));
    for (let i = 0; i < burnCount; i++) {
      warPile.push(state.deck.pop()!); // p1 burn
      warPile.push(state.deck.pop()!); // p2 burn
    }
    if (state.deck.length < 2) {
      state.warPile = warPile;
      return;
    }
    const p1 = state.deck.pop()!;
    const p2 = state.deck.pop()!;
    warPile.push(p1, p2);
    state.lastDraw = { p1, p2 };
    const v1 = value(p1.rank);
    const v2 = value(p2.rank);
    if (v1 > v2) state.winner = 'p1';
    else if (v2 > v1) state.winner = 'p2';
    else {
      state.winner = 'war';
      state.warPile = warPile;
    }
    if (state.winner !== 'war') {
      state.warPile = undefined;
    }
    return;
  }
  if (state.deck.length < 2) return;
  const p1 = state.deck.pop()!;
  const p2 = state.deck.pop()!;
  state.lastDraw = { p1, p2 };
  const v1 = value(p1.rank);
  const v2 = value(p2.rank);
  if (v1 > v2) state.winner = 'p1';
  else if (v2 > v1) state.winner = 'p2';
  else {
    state.winner = 'war';
    state.warPile = [p1, p2];
  }
}

export function getPlayerView(
  state: GameState,
  _playerId: string,
): Omit<GameState, 'deck'> & { deckCount: number } {
  const { deck, ...rest } = state;
  return { ...rest, deckCount: deck.length };
}
