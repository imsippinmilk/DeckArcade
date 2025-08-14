/**
 * Detailed blackjack rule definitions. This file will ultimately
 * contain functions to evaluate hands, determine winning conditions
 * and compute payouts. For now it exports stubs to allow module
 * references without throwing errors.
 */

export type BlackjackAction = 'hit' | 'stand' | 'double' | 'split' | 'surrender';

export function isActionValid(/* state: unknown, action: BlackjackAction */): boolean {
  // TODO: enforce blackjack rules such as limits on splitting and surrender
  return true;
}

export function getHandValue(/* hand: Card[] */): number {
  // TODO: compute the numeric value of a blackjack hand
  return 0;
}