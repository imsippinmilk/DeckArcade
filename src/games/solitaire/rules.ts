export type Suit = 'C' | 'D' | 'H' | 'S';
export interface Card {
  rank: number; // 1-13
  suit: Suit;
  faceUp: boolean;
}

export interface Piles {
  stock: Card[];
  waste: Card[];
  foundations: Record<Suit, Card[]>;
  tableau: Card[][]; // 7 piles
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
  slug?: string;
}

interface GameStateSnapshot {
  piles: Piles;
  redealsUsed: number;
  score: number;
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
    for (let rank = 1; rank <= 13; rank++)
      deck.push({ rank, suit, faceUp: false });
  }
  return deck;
}

export function createInitialState(
  seed = Date.now(),
  options: { drawMode?: 'draw-1' | 'draw-3'; maxRedeals?: number } = {},
): GameState {
  const rng = seededRng(seed);
  const deck = createDeck();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);
  let index = 0;
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j <= i; j++) {
      const card = deck[index++];
      card.faceUp = j === i;
      tableau[i].push(card);
    }
  }
  const stock = deck.slice(index);
  const waste: Card[] = [];
  const foundations: Record<Suit, Card[]> = { C: [], D: [], H: [], S: [] };
  return {
    piles: { stock, waste, foundations, tableau },
    drawMode: options.drawMode ?? 'draw-1',
    maxRedeals: options.maxRedeals ?? Infinity,
    redealsUsed: 0,
    score: 0,
    history: [],
    future: [],
    isWon: false,
    slug: 'solitaire-klondike',
  };
}

function color(suit: Suit): 'red' | 'black' {
  return suit === 'C' || suit === 'S' ? 'black' : 'red';
}

export type Action =
  | { type: 'MOVE'; from: any; to: any }
  | { type: 'REDEPLOY_STOCK' }
  | { type: 'FLIP_TABLEAU_TOP'; pileIndex: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'DRAW_STOCK' };

export function validateAction(state: GameState, action: Action): boolean {
  switch (action.type) {
    case 'MOVE': {
      const { from, to } = action;
      if (from.type === 'tableau' && to.type === 'tableau') {
        const src = state.piles.tableau[from.index];
        const dst = state.piles.tableau[to.index];
        const card = src[src.length - 1];
        if (!card || !card.faceUp) return false;
        const top = dst[dst.length - 1];
        if (!top) return card.rank === 13; // king on empty
        return (
          color(card.suit) !== color(top.suit) && card.rank === top.rank - 1
        );
      } else if (from.type === 'waste' && to.type === 'foundation') {
        const card = state.piles.waste[state.piles.waste.length - 1];
        if (!card) return false;
        if (card.suit !== to.suit) return false;
        const foundation = state.piles.foundations[to.suit];
        return card.rank === foundation.length + 1;
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
      if (!pile.length) return false;
      const card = pile[pile.length - 1];
      return !card.faceUp;
    }
    case 'UNDO':
      return state.history.length > 0;
    case 'REDO':
      return state.future.length > 0;
    case 'DRAW_STOCK':
      return state.piles.stock.length > 0;
    default:
      return false;
  }
}

function checkWin(state: GameState): void {
  const f = state.piles.foundations;
  state.isWon =
    f.C.length === 13 &&
    f.D.length === 13 &&
    f.H.length === 13 &&
    f.S.length === 13;
}

export function applyAction(state: GameState, action: Action): void {
  if (action.type !== 'UNDO' && action.type !== 'REDO') {
    state.history.push(cloneState(state));
    state.future = [];
  }
  switch (action.type) {
    case 'MOVE': {
      const { from, to } = action;
      if (from.type === 'tableau' && to.type === 'tableau') {
        const card = state.piles.tableau[from.index].pop()!;
        state.piles.tableau[to.index].push(card);
      } else if (from.type === 'waste' && to.type === 'foundation') {
        const card = state.piles.waste.pop()!;
        state.piles.foundations[to.suit].push(card);
        state.score += 10;
        checkWin(state);
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
    case 'UNDO': {
      const snap = state.history.pop();
      if (snap) {
        state.future.push(cloneState(state));
        restoreState(state, snap);
      }
      break;
    }
    case 'REDO': {
      const snap = state.future.pop();
      if (snap) {
        state.history.push(cloneState(state));
        restoreState(state, snap);
      }
      break;
    }
    case 'DRAW_STOCK': {
      const count = state.drawMode === 'draw-3' ? 3 : 1;
      for (let i = 0; i < count && state.piles.stock.length; i++) {
        const card = state.piles.stock.pop()!;
        card.faceUp = true;
        state.piles.waste.push(card);
      }
      break;
    }
  }
}

export function getHint(state: GameState): { from: any; to: any } | undefined {
  const wasteCard = state.piles.waste[state.piles.waste.length - 1];
  if (wasteCard) {
    const foundation = state.piles.foundations[wasteCard.suit];
    if (wasteCard.rank === foundation.length + 1) {
      return {
        from: { type: 'waste' },
        to: { type: 'foundation', suit: wasteCard.suit },
      };
    }
  }
  return undefined;
}
