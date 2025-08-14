import { describe, it, expect } from 'vitest';
import { registerGame, getGame, type GameRegistration } from 'src/gameAPI';

describe('game registry', () => {
  it('registers and retrieves a game', () => {
    const game: GameRegistration = {
      slug: 'test-game',
      meta: {},
      createInitialState: (_seed?: number) => ({}),
      applyAction: (state) => state,
      getPlayerView: (state) => state,
      getNextActions: () => [],
      rules: { validate: () => true },
    };
    registerGame(game);
    expect(getGame('test-game')).toBe(game);
  });

  it('registering same slug overwrites previous game', () => {
    const first: GameRegistration = {
      slug: 'shared-slug',
      meta: { version: 1 },
      createInitialState: (_seed?: number) => ({}),
      applyAction: (state) => state,
      getPlayerView: (state) => state,
      getNextActions: () => [],
      rules: { validate: () => true },
    };
    const second: GameRegistration = {
      ...first,
      meta: { version: 2 },
    };
    registerGame(first);
    registerGame(second);
    expect(getGame('shared-slug')).toBe(second);
  });

  it('getGame returns undefined for unknown slug', () => {
    expect(getGame('missing-slug')).toBeUndefined();
  });
});
