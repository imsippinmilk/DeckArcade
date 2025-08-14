import { getGame } from './index.js';

export function enforceRules(state: any, action: any): boolean {
  const slug = (state as any).slug;
  if (!slug) return false;
  const game = getGame(slug);
  if (!game) return false;
  return !!game.rules?.validate(state, action);
}
