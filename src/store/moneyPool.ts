/**
 * State representation for a shared chip pool. This is a simple data
 * structure that tracks the number of chips available to a player.
 * Advanced functionality like buy‑ins, rakes and loans will be added
 * later in the development process.
 */
export interface MoneyPool {
  chips: number;
}

export function createInitialMoneyPool(initialChips: number = 1000): MoneyPool {
  return { chips: initialChips };
}