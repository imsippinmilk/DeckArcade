import { describe, it, expect } from 'vitest';
import { createMoneyPool } from 'src/store/moneyPool';

describe('money pool ledger', () => {
  it('rebuilds balances deterministically from ledger', () => {
    const pool = createMoneyPool();
    pool.buyIn('p1', 100);
    pool.buyIn('p2', 100);
    pool.recordBet('h1', 'p1', 50);
    pool.recordBet('h1', 'p2', 50);
    pool.settle('h1', [
      { playerId: 'p1', result: 'win', amount: 50 },
      { playerId: 'p2', result: 'lose', amount: 50 },
    ]);

    const rebuilt: Record<string, number> = {};
    for (const entry of pool.ledger) {
      rebuilt[entry.playerId] = (rebuilt[entry.playerId] ?? 0) + entry.delta;
    }
    expect(rebuilt).toEqual(pool.balances);
  });

  it('conserves chips on settlement including rake', () => {
    const pool = createMoneyPool();
    pool.buyIn('p1', 100);
    pool.buyIn('p2', 100);
    pool.recordBet('h2', 'p1', 50);
    pool.recordBet('h2', 'p2', 50);
    pool.settle(
      'h2',
      [
        { playerId: 'p1', result: 'win', amount: 50 },
        { playerId: 'p2', result: 'lose', amount: 50 },
      ],
      { rake: { percent: 10 } },
    );

    const handSum = pool.ledger
      .filter((e: any) => e.handId === 'h2')
      .reduce((acc: number, e: any) => acc + e.delta, 0);
    expect(handSum + pool.rake).toBe(0);
  });

  it('disallows negative balances unless loans are allowed', () => {
    const pool = createMoneyPool();
    pool.buyIn('p1', 50);
    expect(() => pool.recordBet('h3', 'p1', 60)).toThrow();

    const loanPool = createMoneyPool({ loansAllowed: true });
    expect(() => loanPool.recordBet('h3', 'p1', 60)).not.toThrow();
    expect(loanPool.balances['p1']).toBe(-60);
  });
});
