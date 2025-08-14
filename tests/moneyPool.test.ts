import { beforeEach, describe, expect, it } from 'vitest';
import { moneyPool, moneyActions } from 'src/store/moneyPool';

describe('money pool', () => {
  beforeEach(() => {
    moneyActions.reset();
    moneyPool.setState({ ledger: [] });
  });

  it('handles deposits, withdrawals, transfers, and payouts', () => {
    moneyActions.deposit('p1', 500, 'start');
    moneyActions.withdraw('p1', 200, 'cashout');
    moneyActions.transferToPot('p1', 200, 'bet');
    moneyActions.payout('p1', 150, 'win');

    const s = moneyPool.getState();
    expect(s.balances['p1']).toBe(250);
    expect(s.potCents).toBe(50);
    expect(s.ledger).toHaveLength(4);
    expect(s.ledger.map((l) => l.type)).toEqual([
      'deposit',
      'withdraw',
      'to-pot',
      'payout',
    ]);
  });

  it('settles multiple winners without overdrawing the pot', () => {
    moneyActions.deposit('p1', 1000);
    moneyActions.transferToPot('p1', 1000);

    moneyActions.settleWinners({ p1: 600, p2: 600 });
    const s = moneyPool.getState();
    expect(s.potCents).toBe(0);
    expect(s.balances['p1']).toBe(600);
    expect(s.balances['p2']).toBe(400);
  });

  it('resets state and records a reset transaction', () => {
    moneyActions.deposit('p1', 100);
    moneyActions.reset();
    const s = moneyPool.getState();
    expect(s.potCents).toBe(0);
    expect(s.balances).toEqual({});
    expect(s.ledger[s.ledger.length - 1].type).toBe('reset');
  });
});
