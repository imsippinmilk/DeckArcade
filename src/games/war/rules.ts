import { registerGame as register } from '../../gameAPI';

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
export type Suit = 'S' | 'H' | 'D' | 'C';
export interface Card {
  rank: Rank;
  suit: Suit;
}

export interface GameState {
  deck: Card[];
  p1Card?: Card;
  p2Card?: Card;
  winner?: 'p1' | 'p2' | 'war';
}

export type WarAction = 'draw';

const ranks: Rank[] = [
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

function rankValue(card: Card): number {
  return ranks.indexOf(card.rank);
}

export function createInitialState(): GameState {
  return { deck: shuffle(createDeck()) };
}

export function applyAction(state: GameState, _action: WarAction): GameState {
  state.p1Card = state.deck.pop();
  state.p2Card = state.deck.pop();
  if (state.p1Card && state.p2Card) {
    const v1 = rankValue(state.p1Card);
    const v2 = rankValue(state.p2Card);
    state.winner = v1 > v2 ? 'p1' : v1 < v2 ? 'p2' : 'war';
  }
  return state;
}

export function getPlayerView(state: GameState, _player: string) {
  const { deck, ...rest } = state;
  return { ...rest, deckCount: deck.length } as const;
}

export function getNextActions(state: GameState, _player: string): WarAction[] {
  return state.deck.length >= 2 ? ['draw'] : [];
}

export const rules = {
  validate(state: GameState, action: WarAction): boolean {
    return action === 'draw' && state.deck.length >= 2;
  },
};

export function registerGame(): void {
  register({
    slug: 'war',
    meta: { title: 'War', players: 2 },
    createInitialState: (() => createInitialState()) as any,
    applyAction: ((s: unknown, a: unknown) =>
      applyAction(s as GameState, a as WarAction)) as any,
    getPlayerView: ((s: unknown, p: string) =>
      getPlayerView(s as GameState, p)) as any,
    getNextActions: ((s: unknown, p: string) =>
      getNextActions(s as GameState, p)) as any,
    rules: {
      validate: (s: unknown, a: unknown) =>
        rules.validate(s as GameState, a as WarAction),
    },
  });
}
