import { getGame } from './index';

export function enforceRules(
  state: { slug?: string } | undefined,
  action: unknown,
  playerId?: string,
): boolean {
  if (!state?.slug) return false;
  const game = getGame(state.slug);
  if (!game) return false;
  return !!game.rules.validate(state as any, action as any, playerId);
}
