/**
 * Centralised rules enforcement. This module can be extended to
 * automatically reject illegal actions, resolve dealer behaviour and
 * produce audit trails. For now it simply returns true for any
 * attempted action.
 */
export function enforceRules(state: unknown, action: unknown): boolean {
  // TODO: validate action based on current state
  return true;
}