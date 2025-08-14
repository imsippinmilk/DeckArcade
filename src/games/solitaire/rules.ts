export type Suit = 'C' | 'D' | 'H' | 'S';

export interface Card {
  rank: number; // 1-13
  suit: Suit;
  faceUp: boolean;
}

export interface Piles {
  stock: Card[];
  waste: Card[];
  tableau: Card[][]; // 7 piles
  foundations: Record<Suit, Card[]>;
}

interface GameStateSnapshot {
  piles: Piles;
  redealsUsed: number;
  score: number;
  isWon: boolean;
}

export interface GameState {
  piles: Piles;
  drawMode: 'draw-1' | 'draw-3';
  maxRedeals: number;
  redealsUsed: number;
  score: number;
  history: GameStateSnapshot[];
  future: GameStateSnapshot[];
  isWon: boolean;
}

function cloneState(state: GameState): GameStateSnapshot {
  return JSON.parse(
    JSON.stringify({
      piles: state.piles,
      redealsUsed: state.redealsUsed,
      score: state.score,
      isWon: state.isWon,
    }),
  );
}

function restoreState(target: GameState, snap: GameStateSnapshot): void {
  target.piles = snap.piles;
  target.redealsUsed = snap.redealsUsed;
  target.score = snap.score;
  target.isWon = snap.isWon;
}

function seededRng(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createDeck(): Card[] {
  const suits: Suit[] = ['C', 'D', 'H', 'S'];
  const deck: Card[] = [];
  for (const suit of suits) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ rank, suit, faceUp: false });
    }
  }
  return deck;
}

export function createInitialState(
  seed = Date.now(),
  opts: { drawMode?: 'draw-1' | 'draw-3'; maxRedeals?: number } = {},
): GameState {
  const rng = seededRng(seed);
  const deck = createDeck();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j <= i; j++) {
      const card = deck.pop()!;
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
    drawMode: opts.drawMode ?? 'draw-1',
    maxRedeals: opts.maxRedeals ?? Infinity,
    redealsUsed: 0,
    score: 0,
    history: [],
    future: [],
    isWon: false,
  };
}

function color(suit: Suit): 'red' | 'black' {
  return suit === 'C' || suit === 'S' ? 'black' : 'red';
}

export type Action =
  | {
      type: 'MOVE';
      from: { type: 'tableau'; index: number } | { type: 'waste' };
      to:
        | { type: 'tableau'; index: number }
        | { type: 'foundation'; suit: Suit };
    }
  | { type: 'REDEPLOY_STOCK' }
  | { type: 'FLIP_TABLEAU_TOP'; pileIndex: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'DRAW_STOCK' };

export function validateAction(state: GameState, action: Action): boolean {
  switch (action.type) {
    case 'MOVE': {
      if (action.from.type === 'tableau' && action.to.type === 'tableau') {
        const fromPile = state.piles.tableau[action.from.index];
        const toPile = state.piles.tableau[action.to.index];
        if (!fromPile.length) return false;
        const card = fromPile[fromPile.length - 1];
        const target = toPile[toPile.length - 1];
        if (!card.faceUp) return false;
        if (!target) return card.rank === 13;
        return (
          target.rank === card.rank + 1 &&
          color(target.suit) !== color(card.suit)
        );
      }
      if (action.from.type === 'waste' && action.to.type === 'foundation') {
        const card = state.piles.waste[state.piles.waste.length - 1];
        const foundation = state.piles.foundations[action.to.suit];
        return (
          !!card &&
          card.suit === action.to.suit &&
          card.rank === foundation.length + 1
        );
      }
      return false;
    }
    case 'REDEPLOY_STOCK':
      return (
        state.piles.stock.length === 0 &&
        state.piles.waste.length > 0 &&
        state.redealsUsed < state.maxRedeals
      );
    case 'FLIP_TABLEAU_TOP': {
      const pile = state.piles.tableau[action.pileIndex];
      const card = pile[pile.length - 1];
      return !!card && !card.faceUp;
    }
    case 'UNDO':
      return state.history.length > 0;
    case 'REDO':
      return state.future.length > 0;
    case 'DRAW_STOCK':
      return (
        state.piles.stock.length > 0 ||
        (state.piles.waste.length > 0 && state.redealsUsed < state.maxRedeals)
      );
    default:
      return false;
  }
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

export function applyAction(state: GameState, action: Action): void {
  switch (action.type) {
    case 'UNDO': {
      const snap = state.history.pop();
      if (snap) {
        state.future.push(cloneState(state));
        restoreState(state, snap);
      }
      return;
    }
    case 'REDO': {
      const snap = state.future.pop();
      if (snap) {
        state.history.push(cloneState(state));
        restoreState(state, snap);
      }
      return;
    }
  }

  state.history.push(cloneState(state));
  state.future = [];

  switch (action.type) {
    case 'MOVE': {
      if (action.from.type === 'tableau' && action.to.type === 'tableau') {
        const fromPile = state.piles.tableau[action.from.index];
        const toPile = state.piles.tableau[action.to.index];
        const card = fromPile.pop()!;
        toPile.push(card);
      } else if (
        action.from.type === 'waste' &&
        action.to.type === 'foundation'
      ) {
        const card = state.piles.waste.pop()!;
        state.piles.foundations[action.to.suit].push(card);
        state.score += 10;
      }
      break;
    }
    case 'REDEPLOY_STOCK': {
      state.piles.stock = state.piles.waste
        .reverse()
        .map((c) => ({ ...c, faceUp: false }));
      state.piles.waste = [];
      state.redealsUsed += 1;
      break;
    }
    case 'FLIP_TABLEAU_TOP': {
      const pile = state.piles.tableau[action.pileIndex];
      const card = pile[pile.length - 1];
      if (card && !card.faceUp) {
        card.faceUp = true;
        state.score += 5;
      }
      break;
    }
    case 'DRAW_STOCK': {
      if (state.piles.stock.length === 0) {
        state.piles.stock = state.piles.waste
          .reverse()
          .map((c) => ({ ...c, faceUp: false }));
        state.piles.waste = [];
        state.redealsUsed += 1;
        break;
      }
      const count = state.drawMode === 'draw-3' ? 3 : 1;
      for (let i = 0; i < count && state.piles.stock.length; i++) {
        const card = state.piles.stock.pop()!;
        card.faceUp = true;
        state.piles.waste.push(card);
      }
      break;
    }
  }
  checkWin(state);
}

export function getHint(state: GameState): { from: any; to: any } | undefined {
  const card = state.piles.waste[state.piles.waste.length - 1];
  if (card) {
    const foundation = state.piles.foundations[card.suit];
    if (card.rank === foundation.length + 1) {
      return {
        from: { type: 'waste' },
        to: { type: 'foundation', suit: card.suit },
      };
    }
  }
  return undefined;
}

export function getNextActions(state: GameState): Action[] {
  const actions: Action[] = [];
  if (validateAction(state, { type: 'DRAW_STOCK' }))
    actions.push({ type: 'DRAW_STOCK' });
  return actions;
}
