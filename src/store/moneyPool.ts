/**
 * Money pool with ledger and balance tracking.
 * Supports buy-ins, betting and settlement with optional rake.
 */

export interface LedgerEntry {
  handId: string;
  playerId: string;
  delta: number;
  reason: string;
  ts: number;
}

export interface SettlementOutcome {
  playerId: string;
  /** amount originally bet */
  amount: number;
  result: 'win' | 'lose' | 'push';
  reason?: string;
}

export interface MoneyPool {
  ledger: LedgerEntry[];
  balances: Record<string, number>;
  rake: number;
  loansAllowed: boolean;
  buyIn(playerId: string, amount: number): void;
  canBet(playerId: string, amount: number): boolean;
  recordBet(handId: string, playerId: string, amount: number): void;
  settle(
    handId: string,
    outcomes: SettlementOutcome[],
    options?: { rake?: { percent: number } },
  ): { rake: number };
  carryAcrossGames(playerId: string): { balance: number; lastUpdate: number };
  exportCsv(): string;
}

export function createMoneyPool(
  options: { loansAllowed?: boolean } = {},
): MoneyPool {
  const pool: MoneyPool = {
    ledger: [],
    balances: {},
    rake: 0,
    loansAllowed: options.loansAllowed ?? false,
    buyIn(playerId: string, amount: number) {
      const ts = Date.now();
      pool.ledger.push({
        handId: 'buyIn',
        playerId,
        delta: amount,
        reason: 'buyIn',
        ts,
      });
      pool.balances[playerId] = (pool.balances[playerId] ?? 0) + amount;
    },
    canBet(playerId: string, amount: number) {
      if (pool.loansAllowed) return true;
      return (pool.balances[playerId] ?? 0) >= amount;
    },
    recordBet(handId: string, playerId: string, amount: number) {
      if (!pool.canBet(playerId, amount)) {
        throw new Error('insufficient balance');
      }
      const ts = Date.now();
      pool.ledger.push({
        handId,
        playerId,
        delta: -amount,
        reason: 'bet',
        ts,
      });
      pool.balances[playerId] = (pool.balances[playerId] ?? 0) - amount;
    },
    settle(
      handId: string,
      outcomes: SettlementOutcome[],
      options?: { rake?: { percent: number } },
    ) {
      const ts = Date.now();
      const rakePercent = options?.rake?.percent ?? 0;
      let totalRake = 0;
      for (const outcome of outcomes) {
        let payout = 0;
        if (outcome.result === 'win') payout = outcome.amount * 2;
        else if (outcome.result === 'push') payout = outcome.amount;
        if (payout > 0) {
          const rakeAmount = (payout * rakePercent) / 100;
          if (rakeAmount > 0) {
            payout -= rakeAmount;
            totalRake += rakeAmount;
          }
          pool.ledger.push({
            handId,
            playerId: outcome.playerId,
            delta: payout,
            reason: outcome.reason ?? 'settle',
            ts,
          });
          pool.balances[outcome.playerId] =
            (pool.balances[outcome.playerId] ?? 0) + payout;
        }
      }
      pool.rake += totalRake;
      if (!pool.loansAllowed) {
        for (const id of Object.keys(pool.balances)) {
          if (pool.balances[id] < 0) {
            throw new Error('negative balance');
          }
        }
      }
      return { rake: totalRake };
    },
    carryAcrossGames(playerId: string) {
      const balance = pool.balances[playerId] ?? 0;
      let lastUpdate = 0;
      for (let i = pool.ledger.length - 1; i >= 0; i--) {
        const entry = pool.ledger[i];
        if (entry.playerId === playerId) {
          lastUpdate = entry.ts;
          break;
        }
      }
      return { balance, lastUpdate };
    },
    exportCsv() {
      const header = 'handId,playerId,delta,reason,ts';
      const rows = pool.ledger.map(
        (e) => `${e.handId},${e.playerId},${e.delta},${e.reason},${e.ts}`,
      );
      return [header, ...rows].join('\n');
    },
  };
  return pool;
}

/**
 * @deprecated use createMoneyPool instead
 */
export const createInitialMoneyPool = createMoneyPool;
