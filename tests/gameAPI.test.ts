import { describe, it, expect } from 'vitest';
import {
  registerGame,
  getGame,
  gameAPI,
  type GameMeta,
  type GameRegistration,
} from 'src/gameAPI';

describe('game registry', () => {
  it('registers and retrieves a game', () => {
    const game: GameRegistration = {
      slug: 'test-game',
      meta: {},
      createInitialState: () => ({}),
      applyAction: (state: unknown) => state,
      getPlayerView: (state: unknown) => state,
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
      createInitialState: () => ({}),
      applyAction: (state: unknown) => state,
      getPlayerView: (state: unknown) => state,
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

  it('front-end registry stores and lists games', () => {
    const meta: GameMeta = {
      id: 'frontend-game',
      name: 'Front Test',
      minPlayers: 1,
      maxPlayers: 2,
      createUI: () => null as any,
    };
    gameAPI.registerGame(meta);
    expect(gameAPI.getGame('frontend-game')).toBe(meta);
    expect(gameAPI.listGames()).toContain(meta);
  });
});
