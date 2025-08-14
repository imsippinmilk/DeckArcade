import { describe, it, expect, beforeAll } from 'vitest';
import { registerGame } from 'src/gameAPI';
import { enforceRules } from 'src/gameAPI/rulesEngine';
import type { GameRegistration } from 'src/gameAPI';

describe('rulesEngine', () => {
  const slug = 'rules-test';
  beforeAll(() => {
    const game: GameRegistration = {
      slug,
      meta: {},
      createInitialState: () => ({}),
      applyAction: (s: unknown) => s,
      getPlayerView: (s: unknown) => s,
      getNextActions: () => [],
      rules: {
        validate: (_state: unknown, action: unknown) => action === 'ok',
      },
    };
    registerGame(game);
  });

  it('delegates to game rules', () => {
    const state = { slug };
    expect(enforceRules(state, 'ok')).toBe(true);
    expect(enforceRules(state, 'bad')).toBe(false);
  });

  it('returns false for unknown game', () => {
    const state = { slug: 'missing-game' };
    expect(enforceRules(state, 'ok')).toBe(false);
  });

  it('returns false when state lacks slug', () => {
    expect(enforceRules({}, 'ok')).toBe(false);
  });
});
