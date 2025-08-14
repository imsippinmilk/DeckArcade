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
}
