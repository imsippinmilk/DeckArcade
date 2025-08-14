import { moneyActions, moneyPool } from '../../store/moneyPool';
import { economy } from '../../store/economy';

export interface Outcome {
  playerId: string;
  amount: number;
  result: 'win' | 'lose' | 'push';
}

export function placeBet(handId: string, playerId: string, amount: number) {
  economy.ensurePlayer(playerId);
  const balance = moneyPool.getState().balances[playerId] || 0;
  if (balance < amount) {
    throw new Error('insufficient balance');
  }
  moneyActions.transferToPot(playerId, amount, handId);
}

export function settleHand(handId: string, outcomes: Outcome[]) {
  const payouts: Record<string, number> = {};
  for (const o of outcomes) {
    if (o.result === 'win')
      payouts[o.playerId] = (payouts[o.playerId] || 0) + o.amount * 2;
    else if (o.result === 'push')
      payouts[o.playerId] = (payouts[o.playerId] || 0) + o.amount;
  }
  moneyActions.settleWinners(payouts, handId);
}

export function getBalance(playerId: string): number {
  economy.ensurePlayer(playerId);
  return moneyPool.getState().balances[playerId] ?? 0;
}
