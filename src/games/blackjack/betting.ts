import type { SettlementOutcome } from '../../store/moneyPool';
import { economy } from '../../store/economy';

/**
 * Deduct chips from a player's balance when they place a bet. This simply
 * proxies to the shared money pool after ensuring the player has a starting
 * balance.
 */
export function placeBet(handId: string, playerId: string, amount: number) {
  economy.ensurePlayer(playerId);
  if (!economy.sharedPool.canBet(playerId, amount)) {
    throw new Error('insufficient balance');
  }
  economy.sharedPool.recordBet(handId, playerId, amount);
}

/**
 * Settle a blackjack hand and update player balances in the shared pool. The
 * outcomes array mirrors the API used by `MoneyPool.settle`.
 */
export function settleHand(handId: string, outcomes: SettlementOutcome[]) {
  economy.sharedPool.settle(handId, outcomes);
}

/**
 * Convenience accessor for displaying a player's current chip balance.
 */
export function getBalance(playerId: string): number {
  economy.ensurePlayer(playerId);
  return economy.sharedPool.balances[playerId] ?? 0;
}
