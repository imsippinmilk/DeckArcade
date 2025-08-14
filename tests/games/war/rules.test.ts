import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  applyAction,
  getPlayerView,
  type GameState,
  type Card,
} from 'src/games/war';

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

  it('resolves a basic war when enough cards remain', () => {
    // Deck order is bottom -> top. Popped in reverse when drawing.
    const state: GameState = {
      deck: [
        card('5'), // p2 war card
        card('K'), // p1 war card
        card('4'), // burn for p2
        card('3'), // burn for p1
        card('7'), // p2 initial
        card('7'), // p1 initial
      ],
    };
    applyAction(state, 'draw');
    expect(state.winner).toBe('p1');
    expect(state.lastDraw).toEqual({ p1: card('K'), p2: card('5') });
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
