import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  applyAction,
  getPlayerView,
  type GameState,
  type Card,
} from 'src/games/war/rules';

const card = (rank: Card['rank']): Card => ({ rank, suit: 'S' });

describe('war logic', () => {
  it('higher card wins', () => {
    const state: GameState = { deck: [card('5'), card('K')] };
    applyAction(state, 'draw');
    expect(state.winner).toBe('p1');
  });

  it('lower card loses', () => {
    const state: GameState = { deck: [card('K'), card('5')] };
    applyAction(state, 'draw');
    expect(state.winner).toBe('p2');
  });

  it('ties produce war', () => {
    const state: GameState = { deck: [card('7'), card('7')] };
    applyAction(state, 'draw');
    expect(state.winner).toBe('war');
  });
});

describe('player view', () => {
  it('conceals deck order', () => {
    const state = createInitialState();
    const view = getPlayerView(state, 'p1');
    expect((view as any).deck).toBeUndefined();
    expect((view as any).deckCount).toBe(state.deck.length);
  });
});
