import { getGame } from './index';

/**
 * Centralised rules enforcement. Looks up the registered game by slug and
 * delegates validation to the game's own rule set. The state object is
 * expected to contain a `slug` property identifying the game. If the game is
 * unknown or throws during validation the action is rejected.
 */
export function enforceRules(state: unknown, action: unknown): boolean {
  if (!state || typeof state !== 'object') return false;
  const slug = (state as { slug?: unknown }).slug;
  if (typeof slug !== 'string') return false;
  const game = getGame(slug);
  if (!game || !game.rules || typeof game.rules.validate !== 'function') {
    return false;
  }
  try {
    return !!game.rules.validate(state, action);
  } catch {
    return false;
  }
}