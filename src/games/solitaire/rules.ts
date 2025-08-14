import { z } from 'zod';

/** Suit values used in a standard 52 card deck. */
export type Suit = 'C' | 'D' | 'H' | 'S';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

/** Basic card representation used across the solitaire logic. */
export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

/** Seeded pseudo random number generator (LCG). */
export type Seed = number;

function rng(seed: Seed): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Shuffle an array in place using the provided RNG. */
function shuffle<T>(arr: T[], rand: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Generate an ordered deck of 52 cards. */
export function createDeck(): Card[] {
  const suits: Suit[] = ['C', 'D', 'H', 'S'];
  const deck: Card[] = [];
  for (const suit of suits) {
    for (let r = 1 as Rank; r <= 13; r++) {
      deck.push({ suit, rank: r as Rank, faceUp: false });
    }
  }
  return deck;
}

/** Derived settings for a solitaire match. */
export interface Settings {
  drawMode: 'draw-1' | 'draw-3';
  maxRedeals: 0 | 1 | 3 | 'infinite';
  scoring: 'standard' | 'timed' | 'vegas' | 'vegas-cumulative';
  autoplayToFoundation: boolean;
  allowUndo: boolean;
  allowHint: boolean;
  autoCompleteThreshold: 'never' | 'safe' | 'always';
  seedStrategy: 'random' | 'daily' | 'custom';
  customSeed?: string;
  theme?: { deckStyle?: 'classic' | 'modern' };
}

export const defaultSettings: Settings = {
  drawMode: 'draw-3',
  maxRedeals: 3,
  scoring: 'standard',
  autoplayToFoundation: true,
  allowUndo: true,
  allowHint: true,
  autoCompleteThreshold: 'safe',
  seedStrategy: 'random',
};

/** References a pile location in the tableau, foundations or waste. */
export type PileRef =
  | { type: 'tableau'; index: number }
  | { type: 'foundation'; suit: Suit }
  | { type: 'waste' };

/** Collection of piles representing the board layout. */
export interface Piles {
  tableau: Card[][];
  foundations: Record<Suit, Card[]>;
  stock: Card[];
  waste: Card[];
}

export interface TimerState {
  startedAt?: number;
  elapsedMs: number;
}

export interface Snapshot {
  piles: Piles;
  redealsUsed: number;
  score: number;
  timer: TimerState;
  isWon: boolean;
}

export interface GameState extends Snapshot {
  seed: Seed;
  history: { past: Snapshot[]; future: Snapshot[] };
  lastHint?: MoveHint;
  settings?: Settings;
}

export interface MoveHint {
  from: PileRef;
  to: PileRef;
  card: Card;
  rationale: string;
}

/** --------- Helpers --------- */

const redSuits: Suit[] = ['D', 'H'];
function isRed(suit: Suit): boolean {
  return redSuits.includes(suit);
}

/** Create a deep copy snapshot used for history. */
function cloneSnapshot(state: Snapshot): Snapshot {
  return {
    piles: {
      tableau: state.piles.tableau.map((p) => p.map((c) => ({ ...c }))),
      foundations: {
        C: state.piles.foundations.C.map((c) => ({ ...c })),
        D: state.piles.foundations.D.map((c) => ({ ...c })),
        H: state.piles.foundations.H.map((c) => ({ ...c })),
        S: state.piles.foundations.S.map((c) => ({ ...c })),
      },
      stock: state.piles.stock.map((c) => ({ ...c })),
      waste: state.piles.waste.map((c) => ({ ...c })),
    },
    redealsUsed: state.redealsUsed,
    score: state.score,
    timer: { ...state.timer },
    isWon: state.isWon,
  };
}

/** Deal a new game using the provided seed and settings. */
export function createInitialState(
  seed: number,
  settings: Partial<Settings> = {},
): GameState {
  const finalSettings = { ...defaultSettings, ...settings };
  const rand = rng(seed);
  const deck = shuffle(createDeck(), rand);

  const tableau: Card[][] = [[], [], [], [], [], [], []];
  let index = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = deck[index++];
      card.faceUp = row === col;
      tableau[col].push(card);
    }
  }

  const stock = deck.slice(index);
  const foundations: Record<Suit, Card[]> = { C: [], D: [], H: [], S: [] };

  const base: Snapshot = {
    piles: { tableau, foundations, stock, waste: [] },
    redealsUsed: 0,
    score:
      finalSettings.scoring === 'vegas' ||
      finalSettings.scoring === 'vegas-cumulative'
        ? -52
        : 0,
    timer: { elapsedMs: 0 },
    isWon: false,
  };

  const state: GameState = {
    ...base,
    seed,
    history: { past: [], future: [] },
    settings: finalSettings,
  };

  return state;
}

/** Action schema and TypeScript type. */
export const ActionSchema = z.union([
  z.object({
    type: z.literal('DEAL_NEW'),
    seedStrategy: z.enum(['random', 'daily', 'custom']),
    customSeed: z.string().optional(),
  }),
  z.object({ type: z.literal('DRAW_FROM_STOCK') }),
  z.object({ type: z.literal('REDEPLOY_STOCK') }),
  z.object({
    type: z.literal('MOVE'),
    from: z.object({
      type: z.enum(['tableau', 'foundation', 'waste']),
      index: z.number().optional(),
      suit: z.enum(['C', 'D', 'H', 'S']).optional(),
    }),
    to: z.object({
      type: z.enum(['tableau', 'foundation']),
      index: z.number().optional(),
      suit: z.enum(['C', 'D', 'H', 'S']).optional(),
    }),
    count: z.number().optional(),
  }),
  z.object({
    type: z.literal('FLIP_TABLEAU_TOP'),
    pileIndex: z.number(),
  }),
  z.object({ type: z.literal('UNDO') }),
  z.object({ type: z.literal('REDO') }),
  z.object({ type: z.literal('HINT') }),
  z.object({ type: z.literal('AUTOCOMPLETE') }),
  z.object({
    type: z.literal('TOGGLE_TIMER'),
    command: z.enum(['start', 'stop', 'reset']),
  }),
]);
export type Action = z.infer<typeof ActionSchema>;

/** Determine if a sequence of cards forms a valid descending alternating run. */
function isValidRun(cards: Card[]): boolean {
  for (let i = 0; i < cards.length - 1; i++) {
    const a = cards[i];
    const b = cards[i + 1];
    if (a.rank !== b.rank + 1) return false;
    if (isRed(a.suit) === isRed(b.suit)) return false;
  }
  return true;
}

/** Check if moving `cards` onto target tableau pile is legal. */
function canPlaceOnTableau(cards: Card[], dest: Card[]): boolean {
  const first = cards[0];
  if (dest.length === 0) {
    return first.rank === 13; // King
  }
  const top = dest[dest.length - 1];
  return top.rank === first.rank + 1 && isRed(top.suit) !== isRed(first.suit);
}

/** Check if card can be placed on foundation pile. */
function canPlaceOnFoundation(card: Card, dest: Card[]): boolean {
  if (dest.length === 0) return card.rank === 1;
  const top = dest[dest.length - 1];
  return top.suit === card.suit && top.rank + 1 === card.rank;
}

/** Core move application used by both MOVE and AUTOCOMPLETE. */
function moveCards(
  state: GameState,
  from: PileRef,
  to: PileRef,
  count = 1,
): void {
  const srcPile = resolvePile(state.piles, from);
  const dstPile = resolvePile(state.piles, to);
  const moving = srcPile.splice(srcPile.length - count, count);
  dstPile.push(...moving);
}

/** Resolve a pile reference to its actual card array. */
function resolvePile(piles: Piles, ref: PileRef): Card[] {
  switch (ref.type) {
    case 'tableau':
      return piles.tableau[ref.index];
    case 'foundation':
      return piles.foundations[ref.suit];
    case 'waste':
      return piles.waste;
  }
}

/** Validate an action based on current state. */
export function validateAction(state: GameState, action: Action): boolean {
  const parsed = ActionSchema.safeParse(action);
  if (!parsed.success) return false;
  const act = parsed.data;

  switch (act.type) {
    case 'DRAW_FROM_STOCK':
      return state.piles.stock.length > 0;
    case 'REDEPLOY_STOCK': {
      const max = state.settings?.maxRedeals ?? 0;
      const allowed = max === 'infinite' || state.redealsUsed < max;
      return (
        state.piles.stock.length === 0 &&
        state.piles.waste.length > 0 &&
        allowed
      );
    }
    case 'MOVE': {
      const src = resolvePile(state.piles, act.from as PileRef);
      const dst = resolvePile(state.piles, act.to as PileRef);
      if (src === dst) return false;
      const count = act.count ?? 1;
      if (src.length < count) return false;
      const moving = src.slice(src.length - count);
      if (act.from.type === 'tableau') {
        if (!moving[0].faceUp) return false;
        if (!isValidRun(moving)) return false;
      } else {
        if (!moving[moving.length - 1].faceUp) return false;
        if (moving.length !== 1) return false;
      }
      if (act.to.type === 'foundation') {
        return moving.length === 1 && canPlaceOnFoundation(moving[0], dst);
      } else {
        return canPlaceOnTableau(moving, dst);
      }
    }
    case 'FLIP_TABLEAU_TOP': {
      const pile = state.piles.tableau[act.pileIndex];
      return pile.length > 0 && !pile[pile.length - 1].faceUp;
    }
    case 'UNDO':
      return state.history.past.length > 0;
    case 'REDO':
      return state.history.future.length > 0;
    case 'AUTOCOMPLETE':
      return getAutoMoves(state).length > 0;
    case 'HINT':
      return getHint(state) !== null;
    case 'TOGGLE_TIMER':
    case 'DEAL_NEW':
      return true;
  }
}

/** Apply scoring deltas for moving card to foundation, flipping etc. */
function applyScore(state: GameState, delta: number): void {
  state.score += delta;
}

/** Flip top card of tableau pile and award points if needed. */
function flipTop(state: GameState, pileIndex: number): void {
  const pile = state.piles.tableau[pileIndex];
  const card = pile[pile.length - 1];
  card.faceUp = true;
  if (
    state.settings?.scoring === 'standard' ||
    state.settings?.scoring === 'timed'
  ) {
    applyScore(state, 5);
  }
}

/** Attempt to move card(s) according to MOVE action. */
function handleMove(
  state: GameState,
  act: Extract<Action, { type: 'MOVE' }>,
): void {
  moveCards(state, act.from as PileRef, act.to as PileRef, act.count ?? 1);
  if (act.to.type === 'foundation') {
    if (
      state.settings?.scoring === 'vegas' ||
      state.settings?.scoring === 'vegas-cumulative'
    ) {
      applyScore(state, 5);
    } else {
      applyScore(state, 10);
    }
  } else if (act.from.type === 'foundation') {
    applyScore(state, -15);
  }
}

/** Get all immediate safe moves for autoplay. */
function getAutoMoves(state: GameState): Array<{ from: PileRef; to: PileRef }> {
  const moves: Array<{ from: PileRef; to: PileRef }> = [];
  const { piles } = state;
  if (piles.waste.length) {
    const card = piles.waste[piles.waste.length - 1];
    const dest = piles.foundations[card.suit];
    if (canPlaceOnFoundation(card, dest)) {
      moves.push({
        from: { type: 'waste' },
        to: { type: 'foundation', suit: card.suit },
      });
    }
  }
  piles.tableau.forEach((pile, i) => {
    if (pile.length === 0) return;
    const card = pile[pile.length - 1];
    if (
      card.faceUp &&
      canPlaceOnFoundation(card, piles.foundations[card.suit])
    ) {
      moves.push({
        from: { type: 'tableau', index: i },
        to: { type: 'foundation', suit: card.suit },
      });
    }
  });
  return moves;
}

/** Compute hint move using a simple priority heuristic. */
export function getHint(state: GameState): MoveHint | null {
  const moves = getAutoMoves(state);
  if (moves.length) {
    const move = moves[0];
    const card = resolvePile(state.piles, move.from).slice(-1)[0];
    return { ...move, card, rationale: 'Move to foundation' };
  }
  const { piles } = state;
  if (piles.waste.length) {
    const card = piles.waste[piles.waste.length - 1];
    for (let i = 0; i < 7; i++) {
      if (canPlaceOnTableau([card], piles.tableau[i])) {
        return {
          from: { type: 'waste' },
          to: { type: 'tableau', index: i },
          card,
          rationale: 'Use waste card',
        };
      }
    }
  }
  for (let i = 0; i < 7; i++) {
    const pile = piles.tableau[i];
    for (let j = 0; j < pile.length; j++) {
      if (!pile[j].faceUp) continue;
      const run = pile.slice(j);
      if (!isValidRun(run)) continue;
      for (let k = 0; k < 7; k++) {
        if (k === i) continue;
        if (canPlaceOnTableau(run, piles.tableau[k])) {
          return {
            from: { type: 'tableau', index: i },
            to: { type: 'tableau', index: k },
            card: run[0],
            rationale: 'Expose tableau card',
          };
        }
      }
    }
  }
  return null;
}

/** Autocomplete helper repeatedly moves safe cards to foundations. */
function autocomplete(state: GameState): void {
  let moved = true;
  while (moved) {
    moved = false;
    const moves = getAutoMoves(state);
    if (moves.length) {
      handleMove(state, {
        type: 'MOVE',
        from: moves[0].from,
        to: moves[0].to,
      } as any);
      moved = true;
    }
  }
}

/** Apply an action to state producing a new state instance (mutable). */
export function applyAction(state: GameState, action: Action): GameState {
  if (!validateAction(state, action)) return state;

  if (action.type === 'UNDO') {
    const prev = state.history.past.pop();
    if (prev) {
      state.history.future.unshift(cloneSnapshot(state));
      Object.assign(state, prev);
    }
    return state;
  }
  if (action.type === 'REDO') {
    const next = state.history.future.shift();
    if (next) {
      state.history.past.push(cloneSnapshot(state));
      Object.assign(state, next);
    }
    return state;
  }

  state.history.past.push(cloneSnapshot(state));
  state.history.future = [];

  switch (action.type) {
    case 'DRAW_FROM_STOCK': {
      const drawCount = state.settings?.drawMode === 'draw-1' ? 1 : 3;
      const moved = state.piles.stock.splice(-drawCount);
      moved.forEach((c) => (c.faceUp = true));
      state.piles.waste.push(...moved);
      break;
    }
    case 'REDEPLOY_STOCK': {
      state.redealsUsed += 1;
      state.piles.stock = state.piles.waste
        .map((c) => ({ ...c, faceUp: false }))
        .reverse();
      state.piles.waste = [];
      break;
    }
    case 'MOVE':
      handleMove(state, action);
      break;
    case 'FLIP_TABLEAU_TOP':
      flipTop(state, action.pileIndex);
      break;
    case 'HINT':
      state.lastHint = getHint(state) ?? undefined;
      break;
    case 'AUTOCOMPLETE':
      autocomplete(state);
      break;
    case 'TOGGLE_TIMER': {
      if (action.command === 'start') {
        state.timer.startedAt = Date.now();
      } else if (action.command === 'stop') {
        if (state.timer.startedAt) {
          state.timer.elapsedMs += Date.now() - state.timer.startedAt;
          delete state.timer.startedAt;
        }
      } else {
        state.timer = { elapsedMs: 0 };
      }
      break;
    }
    case 'DEAL_NEW': {
      const newState = createInitialState(Date.now(), state.settings);
      Object.assign(state, newState);
      return state;
    }
  }

  if (
    state.piles.foundations.C.length === 13 &&
    state.piles.foundations.D.length === 13 &&
    state.piles.foundations.H.length === 13 &&
    state.piles.foundations.S.length === 13
  ) {
    state.isWon = true;
  }

  return state;
}
