// @ts-ignore: node:test types are not available in this environment
import { test } from 'node:test';
// @ts-ignore: node:assert types are not available in this environment
import assert from 'node:assert/strict';

import { registerGame, getGame, GameRegistration } from '../src/gameAPI/index.js';

test('registers and retrieves a game', () => {
  const game: GameRegistration = {
    slug: 'test-game',
    meta: {},
    createInitialState: () => ({}),
    applyAction: (state) => state,
    getPlayerView: (state) => state,
    getNextActions: () => [],
    rules: { validate: () => true },
  };
  registerGame(game);
  assert.equal(getGame('test-game'), game);
});

test('registering same slug overwrites previous game', () => {
  const first: GameRegistration = {
    slug: 'shared-slug',
    meta: { version: 1 },
    createInitialState: () => ({}),
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
  assert.equal(getGame('shared-slug'), second);
});

test('getGame returns undefined for unknown slug', () => {
  assert.equal(getGame('missing-slug'), undefined);
});
