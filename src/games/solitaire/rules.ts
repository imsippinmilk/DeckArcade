export type Suit = 'C' | 'D' | 'H' | 'S';
export interface Card {
  rank: number;
  suit: Suit;
  faceUp: boolean;
}

export interface GameState {
  piles: {
    stock: Card[];
    waste: Card[];
    tableau: Card[][];
    foundations: Record<Suit, Card[]>;
  };
  score: number;
  redealsUsed: number;
  maxRedeals: number;
  prev?: GameState;
  next?: GameState;
  isWon: boolean;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(seed: number): Card[] {
  const rng = mulberry32(seed);
  const suits: Suit[] = ['C', 'D', 'H', 'S'];
  const deck: Card[] = [];
  for (let r = 1; r <= 13; r++) {
    for (const s of suits) deck.push({ rank: r, suit: s, faceUp: false });
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function createInitialState(
  seed: number,
  opts: { drawMode?: string; maxRedeals?: number } = {},
): GameState {
  const deck = shuffle(seed);
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j <= i; j++) {
      const card = deck.shift()!;
      card.faceUp = j === i;
      tableau[i].push(card);
    }
  }
  return {
    piles: {
      stock: deck,
      waste: [],
      tableau,
      foundations: { C: [], D: [], H: [], S: [] },
    },
    score: 0,
    redealsUsed: 0,
    maxRedeals: opts.maxRedeals ?? Infinity,
    isWon: false,
  };
}

function clone(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state));
}

function color(suit: Suit) {
  return suit === 'C' || suit === 'S' ? 'black' : 'red';
}

export function validateAction(state: GameState, action: any): boolean {
  if (
    action.type === 'MOVE' &&
    action.from.type === 'tableau' &&
    action.to.type === 'tableau'
  ) {
    const fromPile = state.piles.tableau[action.from.index];
    const toPile = state.piles.tableau[action.to.index];
    if (!fromPile.length) return false;
    const card = fromPile[fromPile.length - 1];
    const target = toPile[toPile.length - 1];
    if (!target) return false;
    const allowed =
      target.rank === card.rank + 1 && color(target.suit) !== color(card.suit);
    return allowed;
  }
  if (action.type === 'REDEPLOY_STOCK') {
    return (
      state.piles.stock.length === 0 &&
      state.piles.waste.length > 0 &&
      state.redealsUsed < state.maxRedeals
    );
  }
  return true;
}

function checkWin(state: GameState) {
  const f = state.piles.foundations;
  if (
    f.C.length === 13 &&
    f.D.length === 13 &&
    f.H.length === 13 &&
    f.S.length === 13
  ) {
    state.isWon = true;
  }
}

export function applyAction(state: GameState, action: any): void {
  if (action.type === 'UNDO') {
    if (state.prev) {
      state.next = clone(state);
      Object.assign(state, state.prev);
    }
    return;
  }
  if (action.type === 'REDO') {
    if (state.next) {
      state.prev = clone(state);
      Object.assign(state, state.next);
    }
    return;
  }

  state.prev = clone(state);
  state.next = undefined;

  if (action.type === 'MOVE') {
    if (action.from.type === 'waste' && action.to.type === 'foundation') {
      const card = state.piles.waste.pop();
      if (card) {
        state.piles.foundations[action.to.suit as Suit].push(card);
        state.score += 10;
      }
    } else if (action.from.type === 'tableau' && action.to.type === 'tableau') {
      const card = state.piles.tableau[action.from.index].pop();
      if (card) state.piles.tableau[action.to.index].push(card);
    }
  } else if (action.type === 'FLIP_TABLEAU_TOP') {
    const pile = state.piles.tableau[action.pileIndex];
    const card = pile[pile.length - 1];
    if (card && !card.faceUp) {
      card.faceUp = true;
      state.score += 5;
    }
  } else if (action.type === 'REDEPLOY_STOCK') {
    state.piles.stock = state.piles.waste.reverse();
    state.piles.waste = [];
    state.redealsUsed += 1;
  }

  checkWin(state);
}

export function getHint(state: GameState) {
  const wasteTop = state.piles.waste[state.piles.waste.length - 1];
  if (wasteTop) {
    const foundation = state.piles.foundations[wasteTop.suit];
    const needed = foundation.length + 1;
    if (wasteTop.rank === needed) {
      return {
        from: { type: 'waste' },
        to: { type: 'foundation', suit: wasteTop.suit },
      } as const;
    }
  }
  return null;
}
