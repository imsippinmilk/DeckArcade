import { registerGame } from '../../gameAPI';
import { createMoneyPool, type MoneyPool } from '../../store/moneyPool';

export type Suit = 'S' | 'H' | 'D' | 'C';
export type Rank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'T'
  | 'J'
  | 'Q'
  | 'K'
  | 'A';
export type Card = `${Rank}${Suit}`;

export interface PlayerState {
  id: string;
  hole: Card[];
  bet: number;
  chips: number;
  folded: boolean;
  hasActed: boolean;
}

export interface GameState {
  slug: 'poker-holdem';
  deck: Card[];
  community: Card[];
  players: PlayerState[];
  pot: number;
  currentBet: number;
  currentPlayer: number;
  dealer: number;
  stage: 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished';
  winners?: string[];
  pool: MoneyPool;
  handId: string;
}

export type Action =
  | { type: 'bet'; amount: number; playerId: string }
  | { type: 'call'; playerId: string }
  | { type: 'check'; playerId: string }
  | { type: 'fold'; playerId: string };

function createDeck(): Card[] {
  const suits: Suit[] = ['S', 'H', 'D', 'C'];
  const ranks: Rank[] = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'T',
    'J',
    'Q',
    'K',
    'A',
  ];
  const deck: Card[] = [];
  for (const r of ranks) for (const s of suits) deck.push(`${r}${s}` as Card);
  return deck;
}

function rngFromSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++)
    h = Math.imul(31, h) + seed.charCodeAt(i);
  return function () {
    h |= 0;
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rnd: () => number) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function draw(state: GameState): Card {
  const card = state.deck.pop();
  if (!card) throw new Error('deck empty');
  return card;
}

function nextActive(state: GameState): number {
  const n = state.players.length;
  let idx = state.currentPlayer;
  for (let i = 0; i < n; i++) {
    idx = (idx + 1) % n;
    if (!state.players[idx].folded) return idx;
  }
  return idx;
}

function everyoneMatched(state: GameState): boolean {
  return state.players
    .filter((p) => !p.folded)
    .every((p) => p.bet === state.currentBet && p.hasActed);
}

const rankOrder = '23456789TJQKA';
const rankValue: Record<string, number> = {};
for (let i = 0; i < rankOrder.length; i++) rankValue[rankOrder[i]] = i + 2;

function fiveCardCombos(cards: Card[]): Card[][] {
  const res: Card[][] = [];
  for (let a = 0; a < cards.length - 4; a++)
    for (let b = a + 1; b < cards.length - 3; b++)
      for (let c = b + 1; c < cards.length - 2; c++)
        for (let d = c + 1; d < cards.length - 1; d++)
          for (let e = d + 1; e < cards.length; e++)
            res.push([cards[a], cards[b], cards[c], cards[d], cards[e]]);
  return res;
}

function rank5(cards: Card[]): number[] {
  const ranks = cards.map((c) => rankValue[c[0]]).sort((a, b) => b - a);
  const suits = cards.map((c) => c[1]);
  const counts: Record<number, number> = {};
  for (const r of ranks) counts[r] = (counts[r] || 0) + 1;
  const unique = Object.keys(counts)
    .map(Number)
    .sort((a, b) => b - a);
  const countVals = Object.values(counts).sort((a, b) => b - a);
  const isFlush = suits.every((s) => s === suits[0]);
  const distinct = Array.from(new Set(ranks)).sort((a, b) => a - b);
  let isStraight = false;
  let straightHigh = 0;
  if (distinct.length === 5 && distinct[4] - distinct[0] === 4) {
    isStraight = true;
    straightHigh = distinct[4];
  } else if (
    distinct.length === 5 &&
    distinct[0] === 2 &&
    distinct[1] === 3 &&
    distinct[2] === 4 &&
    distinct[3] === 5 &&
    distinct[4] === 14
  ) {
    isStraight = true;
    straightHigh = 5;
  }
  if (isStraight && isFlush) return [8, straightHigh];
  if (countVals[0] === 4) return [7, unique[0], unique[1]];
  if (countVals[0] === 3 && countVals[1] === 2)
    return [6, unique[0], unique[1]];
  if (isFlush) return [5, ...ranks];
  if (isStraight) return [4, straightHigh];
  if (countVals[0] === 3) {
    const triple = unique.find((r) => counts[r] === 3)!;
    const kickers = ranks.filter((r) => r !== triple);
    return [3, triple, ...kickers];
  }
  if (countVals[0] === 2 && countVals[1] === 2) {
    const pairs = unique.filter((r) => counts[r] === 2).sort((a, b) => b - a);
    const kicker = unique.find((r) => counts[r] === 1)!;
    return [2, pairs[0], pairs[1], kicker];
  }
  if (countVals[0] === 2) {
    const pair = unique.find((r) => counts[r] === 2)!;
    const kick = unique.filter((r) => counts[r] === 1).sort((a, b) => b - a);
    return [1, pair, ...kick];
  }
  return [0, ...ranks];
}

function compareRank(a: number[], b: number[]): number {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const diff = (a[i] || 0) - (b[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function evaluateHand(cards: Card[]): number[] {
  let best: number[] | null = null;
  for (const combo of fiveCardCombos(cards)) {
    const rank = rank5(combo);
    if (!best || compareRank(rank, best) > 0) best = rank;
  }
  return best!;
}

function settlePot(state: GameState) {
  const active = state.players.filter((p) => !p.folded);
  const ranked = active.map((p) => ({
    id: p.id,
    rank: evaluateHand([...p.hole, ...state.community]),
  }));
  ranked.sort((a, b) => compareRank(b.rank, a.rank));
  const best = ranked[0].rank;
  const winners = ranked
    .filter((r) => compareRank(r.rank, best) === 0)
    .map((r) => r.id);
  const share = Math.floor(state.pot / winners.length);
  for (const id of winners) {
    const player = state.players.find((p) => p.id === id)!;
    player.chips += share;
    state.pool.ledger.push({
      handId: state.handId,
      playerId: id,
      delta: share,
      reason: 'payout',
      ts: Date.now(),
    });
    state.pool.balances[id] = (state.pool.balances[id] || 0) + share;
  }
  state.winners = winners;
  state.pot = 0;
}

function advance(state: GameState) {
  if (state.stage === 'finished') return;
  const active = state.players.filter((p) => !p.folded);
  if (active.length === 1) {
    const winner = active[0];
    winner.chips += state.pot;
    state.pool.ledger.push({
      handId: state.handId,
      playerId: winner.id,
      delta: state.pot,
      reason: 'payout',
      ts: Date.now(),
    });
    state.pool.balances[winner.id] =
      (state.pool.balances[winner.id] || 0) + state.pot;
    state.winners = [winner.id];
    state.pot = 0;
    state.stage = 'finished';
    return;
  }
  if (!everyoneMatched(state)) return;
  for (const p of state.players) {
    p.bet = 0;
    p.hasActed = false;
  }
  state.currentBet = 0;
  state.currentPlayer = (state.dealer + 1) % state.players.length;
  while (state.players[state.currentPlayer].folded) {
    state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
  }
  switch (state.stage) {
    case 'pre-flop':
      state.community.push(draw(state), draw(state), draw(state));
      state.stage = 'flop';
      break;
    case 'flop':
      state.community.push(draw(state));
      state.stage = 'turn';
      break;
    case 'turn':
      state.community.push(draw(state));
      state.stage = 'river';
      break;
    case 'river':
      state.stage = 'showdown';
      settlePot(state);
      state.stage = 'finished';
      break;
  }
}

function applyAction(state: GameState, action: Action): GameState {
  const player = state.players.find((p) => p.id === action.playerId);
  if (!player || state.stage === 'finished') return state;
  if (state.players[state.currentPlayer].id !== action.playerId) return state;
  switch (action.type) {
    case 'fold':
      player.folded = true;
      player.hasActed = true;
      break;
    case 'check':
      player.hasActed = true;
      break;
    case 'call': {
      const diff = state.currentBet - player.bet;
      state.pool.recordBet(state.handId, player.id, diff);
      state.pot += diff;
      player.bet += diff;
      player.chips = state.pool.balances[player.id];
      player.hasActed = true;
      break;
    }
    case 'bet': {
      const diff = action.amount - player.bet;
      state.pool.recordBet(state.handId, player.id, diff);
      state.pot += diff;
      player.bet = action.amount;
      player.chips = state.pool.balances[player.id];
      state.currentBet = action.amount;
      player.hasActed = true;
      break;
    }
  }
  state.currentPlayer = nextActive(state);
  advance(state);
  return state;
}

function getPlayerView(state: GameState, playerId: string) {
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? p : { ...p, hole: [] as Card[] },
    ),
  } as GameState;
}

function getNextActions(state: GameState, playerId: string): Action[] {
  const idx = state.players[state.currentPlayer];
  if (!idx || idx.id !== playerId) return [];
  const player = idx;
  const callAmt = state.currentBet - player.bet;
  const actions: Action[] = [{ type: 'fold', playerId }];
  if (callAmt === 0) {
    actions.push({ type: 'check', playerId });
    actions.push({ type: 'bet', amount: state.currentBet + 1, playerId });
  } else {
    actions.push({ type: 'call', playerId });
    actions.push({
      type: 'bet',
      amount: state.currentBet + callAmt + 1,
      playerId,
    });
  }
  return actions;
}

function validate(state: GameState, action: Action): boolean {
  const player = state.players.find((p) => p.id === action.playerId);
  if (!player || state.stage === 'finished') return false;
  if (state.players[state.currentPlayer].id !== action.playerId) return false;
  const callAmt = state.currentBet - player.bet;
  switch (action.type) {
    case 'fold':
      return true;
    case 'check':
      return callAmt === 0;
    case 'call':
      return callAmt > 0 && player.chips >= callAmt;
    case 'bet':
      return (
        action.amount > state.currentBet &&
        player.chips >= action.amount - player.bet
      );
  }
  return false;
}

function createInitialState(
  seed = Date.now().toString(),
  playerIds: string[] = ['p1', 'p2'],
): GameState {
  const rnd = rngFromSeed(seed);
  const deck = createDeck();
  shuffle(deck, rnd);
  const pool = createMoneyPool();
  const players: PlayerState[] = playerIds.map((id) => {
    pool.buyIn(id, 1000);
    return {
      id,
      hole: [deck.pop()!, deck.pop()!],
      bet: 0,
      chips: pool.balances[id],
      folded: false,
      hasActed: false,
    };
  });
  const state: GameState = {
    slug: 'poker-holdem',
    deck,
    community: [],
    players,
    pot: 0,
    currentBet: 0,
    currentPlayer: 0,
    dealer: 0,
    stage: 'pre-flop',
    pool,
    handId: 'hand-1',
  };
  return state;
}

const pokerHoldem = {
  slug: 'poker-holdem',
  meta: { name: 'Texas Hold\u2019em' },
  createInitialState,
  applyAction,
  getPlayerView,
  getNextActions,
  rules: { validate },
};

registerGame(pokerHoldem);

export default pokerHoldem;
