// Shared pot + balances, integer cents. Safe arithmetic, with ledger.
import { createStore } from './createStore';

export type TxType =
  | 'deposit'
  | 'withdraw'
  | 'to-pot'
  | 'payout'
  | 'settle'
  | 'reset';
export type Tx = {
  id: string;
  type: TxType;
  userId?: string;
  amountCents: number;
  ts: number;
  note?: string;
};

export type MoneyState = {
  potCents: number;
  balances: Record<string, number>; // userId -> cents
  ledger: Tx[];
};

function id() {
  return `tx_${Math.random().toString(36).slice(2, 10)}`;
}
const clamp = (n: number) => Math.max(0, Math.floor(n));

export const moneyPool = createStore<MoneyState>(() => ({
  potCents: 0,
  balances: {},
  ledger: [],
}));

function push(tx: Tx) {
  const s = moneyPool.getState();
  moneyPool.setState({ ledger: [...s.ledger, tx] });
}

export const moneyActions = {
  ensureUser(userId: string) {
    const s = moneyPool.getState();
    if (!(userId in s.balances))
      moneyPool.setState({ balances: { ...s.balances, [userId]: 0 } });
  },
  deposit(userId: string, amountCents: number, note?: string) {
    amountCents = clamp(amountCents);
    moneyActions.ensureUser(userId);
    const s = moneyPool.getState();
    moneyPool.setState({
      balances: { ...s.balances, [userId]: s.balances[userId] + amountCents },
    });
    push({
      id: id(),
      type: 'deposit',
      userId,
      amountCents,
      ts: Date.now(),
      note,
    });
  },
  withdraw(userId: string, amountCents: number, note?: string) {
    amountCents = clamp(amountCents);
    moneyActions.ensureUser(userId);
    const s = moneyPool.getState();
    const avail = Math.max(0, s.balances[userId] - amountCents);
    moneyPool.setState({ balances: { ...s.balances, [userId]: avail } });
    push({
      id: id(),
      type: 'withdraw',
      userId,
      amountCents,
      ts: Date.now(),
      note,
    });
  },
  transferToPot(userId: string, amountCents: number, note?: string) {
    amountCents = clamp(amountCents);
    moneyActions.ensureUser(userId);
    const s = moneyPool.getState();
    const can = Math.min(s.balances[userId], amountCents);
    moneyPool.setState({
      potCents: s.potCents + can,
      balances: { ...s.balances, [userId]: s.balances[userId] - can },
    });
    push({
      id: id(),
      type: 'to-pot',
      userId,
      amountCents: can,
      ts: Date.now(),
      note,
    });
  },
  payout(userId: string, amountCents: number, note?: string) {
    amountCents = clamp(amountCents);
    const s = moneyPool.getState();
    const pay = Math.min(s.potCents, amountCents);
    moneyPool.setState({
      potCents: s.potCents - pay,
      balances: { ...s.balances, [userId]: (s.balances[userId] || 0) + pay },
    });
    push({
      id: id(),
      type: 'payout',
      userId,
      amountCents: pay,
      ts: Date.now(),
      note,
    });
  },
  settleWinners(payouts: Record<string, number>, note?: string) {
    // payouts in cents; sum must be <= pot
    const s = moneyPool.getState();
    const total = Object.values(payouts).reduce((a, b) => a + clamp(b), 0);
    const pay = Math.min(total, s.potCents);
    let remaining = pay;
    const balances = { ...s.balances };
    for (const [uid, cents] of Object.entries(payouts)) {
      const amt = Math.min(clamp(cents), remaining);
      balances[uid] = (balances[uid] || 0) + amt;
      remaining -= amt;
    }
    moneyPool.setState({ potCents: s.potCents - pay, balances });
    push({ id: id(), type: 'settle', amountCents: pay, ts: Date.now(), note });
  },
  reset() {
    moneyPool.setState({ potCents: 0, balances: {}, ledger: [] });
    push({ id: id(), type: 'reset', amountCents: 0, ts: Date.now() });
  },
};

export interface LedgerEntry {
  handId: string;
  playerId: string;
  delta: number;
  reason: string;
  ts: number;
}

export interface MoneyPool {
  ledger: LedgerEntry[];
  balances: Record<string, number>;
  buyIn(playerId: string, amount: number): void;
  recordBet(handId: string, playerId: string, amount: number): void;
}

export function createMoneyPool(): MoneyPool {
  const pool: MoneyPool = {
    ledger: [],
    balances: {},
    buyIn(playerId: string, amount: number) {
      pool.ledger.push({
        handId: 'buyIn',
        playerId,
        delta: amount,
        reason: 'buyIn',
        ts: Date.now(),
      });
      pool.balances[playerId] = (pool.balances[playerId] || 0) + amount;
    },
    recordBet(handId: string, playerId: string, amount: number) {
      pool.ledger.push({
        handId,
        playerId,
        delta: -amount,
        reason: 'bet',
        ts: Date.now(),
      });
      pool.balances[playerId] = (pool.balances[playerId] || 0) - amount;
    },
  };
  return pool;
}
