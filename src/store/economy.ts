import { createMoneyPool, MoneyPool } from './moneyPool';

export interface Economy {
  sharedPool: MoneyPool;
  initialChipsPerPlayer: number;
  /**
   * Ensure the given player exists in the money pool with an initial balance.
   */
  ensurePlayer(playerId: string): void;
}

/**
 * Global economy state for the application. Currently it only exposes a shared
 * money pool that all games can use for tracking chips. Each new player that
 * interacts with the pool receives a default stack of chips.
 */
export function createEconomy(initialChipsPerPlayer = 1000): Economy {
  const sharedPool = createMoneyPool();
  return {
    sharedPool,
    initialChipsPerPlayer,
    ensurePlayer(playerId: string) {
      if (sharedPool.balances[playerId] === undefined) {
        sharedPool.buyIn(playerId, initialChipsPerPlayer);
      }
    },
  };
}

// Default economy instance used by the app.
export const economy = createEconomy();
