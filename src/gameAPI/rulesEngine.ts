

export function enforceRules(state: any, action: any): boolean {
  const slug = (state as any).slug;
  if (!slug) return false;
  const game = getGame(slug);
  if (!game) return false;
  return !!game.rules?.validate(state, action);

import { getGame } from './index';

export function enforceRules(
  state: any,
  action: any,
  playerId?: string,
): boolean {
  if (!state || typeof state.slug !== 'string') return false;
  const game = getGame(state.slug);
  if (!game) return false;
  try {
    return game.rules.validate(state, action, playerId);
  } catch {
    return false;
  }

}
