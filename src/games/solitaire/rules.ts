export type Suit = 'C' | 'D' | 'H' | 'S';
export interface Card {

  rank: number;

  rank: number; // 1-13

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
  seed: number,
  opts: { drawMode?: string; maxRedeals?: number } = {},
): GameState {
  const deck = shuffle(seed);
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j <= i; j++) {
      const card = deck.shift()!;
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
