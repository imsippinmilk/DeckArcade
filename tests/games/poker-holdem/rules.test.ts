import { describe, it, expect } from 'vitest';
import pokerHoldem from 'src/games/poker-holdem';

describe('poker hold\u2019em rules', () => {
  it('creates initial state with two cards per player', () => {
    const state = pokerHoldem.createInitialState('seed', ['p1', 'p2', 'p3']);
    expect(state.players.every((p) => p.hole.length === 2)).toBe(true);
    expect(state.deck.length).toBe(52 - 6);
    expect(state.stage).toBe('pre-flop');
  });

  it('advances to flop after all players check', () => {
    const state = pokerHoldem.createInitialState('seed');
    pokerHoldem.applyAction(state, { type: 'check', playerId: 'p1' });
    pokerHoldem.applyAction(state, { type: 'check', playerId: 'p2' });
    expect(state.stage).toBe('flop');
    expect(state.community).toHaveLength(3);
  });

  it('hides opponents\u2019 hole cards in player view', () => {
    const state = pokerHoldem.createInitialState('seed', ['a', 'b']);
    const view = pokerHoldem.getPlayerView(state, 'a');
    expect(view.players.find((p) => p.id === 'b')!.hole.length).toBe(0);
    expect(view.players.find((p) => p.id === 'a')!.hole.length).toBe(2);
  });
});
