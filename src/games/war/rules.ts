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
import { SUITS, buildDeck, shuffle } from '../../util/cards';

export type Suit = (typeof SUITS)[number];

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
  return buildDeck(rankOrder, (rank, suit) => ({ rank, suit }));
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
