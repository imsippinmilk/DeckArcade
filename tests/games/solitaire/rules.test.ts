import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  validateAction,
  applyAction,
  getHint,
  Card,
  GameState,
} from '../../../src/games/solitaire/rules';

function makeCard(
  rank: number,
  suit: 'C' | 'D' | 'H' | 'S',
  faceUp = true,
): Card {
  return { rank: rank as any, suit, faceUp };
}

describe('solitaire rules', () => {
  it('deterministic deal', () => {
    const a = createInitialState(123, { drawMode: 'draw-3' });
    const b = createInitialState(123, { drawMode: 'draw-3' });
    expect(a.piles).toEqual(b.piles);
  });

  it('rejects illegal move', () => {
    const state = createInitialState(1);
    state.piles.tableau[0] = [makeCard(5, 'C')];
    state.piles.tableau[1] = [makeCard(6, 'C')];
    const action = {
      type: 'MOVE',
      from: { type: 'tableau', index: 0 },
      to: { type: 'tableau', index: 1 },
    } as const;
    expect(validateAction(state, action)).toBe(false);
  });

  it('allows legal move and updates piles', () => {
    const state = createInitialState(1);
    state.piles.tableau[0] = [makeCard(6, 'D')];
    state.piles.tableau[1] = [makeCard(7, 'C')];
    const action = {
      type: 'MOVE',
      from: { type: 'tableau', index: 0 },
      to: { type: 'tableau', index: 1 },
    } as const;
    expect(validateAction(state, action)).toBe(true);
    applyAction(state, action);
    expect(state.piles.tableau[1].map((c) => c.rank)).toEqual([7, 6]);
  });

  it('scores foundation moves and flips', () => {
    const state = createInitialState(1);
    state.piles.waste = [makeCard(1, 'S')];
    applyAction(state, {
      type: 'MOVE',
      from: { type: 'waste' },
      to: { type: 'foundation', suit: 'S' },
    });
    expect(state.score).toBe(10);
    state.piles.tableau[0] = [makeCard(5, 'H', false)];
    applyAction(state, { type: 'FLIP_TABLEAU_TOP', pileIndex: 0 });
    expect(state.score).toBe(15);
  });

  it('redeals are capped', () => {
    const state = createInitialState(1, { maxRedeals: 1 });
    state.piles.stock = [];
    state.piles.waste = [makeCard(2, 'H')];
    expect(validateAction(state, { type: 'REDEPLOY_STOCK' })).toBe(true);
    applyAction(state, { type: 'REDEPLOY_STOCK' });
    expect(state.redealsUsed).toBe(1);
    state.piles.stock = [];
    state.piles.waste = [makeCard(3, 'H')];
    expect(validateAction(state, { type: 'REDEPLOY_STOCK' })).toBe(false);
  });

  it('undo and redo restore state', () => {
    const state = createInitialState(1);
    state.piles.waste = [makeCard(1, 'C')];
    applyAction(state, {
      type: 'MOVE',
      from: { type: 'waste' },
      to: { type: 'foundation', suit: 'C' },
    });
    applyAction(state, { type: 'UNDO' });
    expect(state.piles.waste.length).toBe(1);
    expect(state.piles.foundations.C.length).toBe(0);
    applyAction(state, { type: 'REDO' });
    expect(state.piles.waste.length).toBe(0);
    expect(state.piles.foundations.C.length).toBe(1);
  });

  it('win detection triggers', () => {
    const state = createInitialState(1);
    state.piles.foundations = {
      C: Array.from({ length: 13 }, (_, i) => makeCard(i + 1, 'C')),
      D: Array.from({ length: 13 }, (_, i) => makeCard(i + 1, 'D')),
      H: Array.from({ length: 13 }, (_, i) => makeCard(i + 1, 'H')),
      S: Array.from({ length: 12 }, (_, i) => makeCard(i + 1, 'S')),
    } as any;
    state.piles.waste = [makeCard(13, 'S')];
    applyAction(state, {
      type: 'MOVE',
      from: { type: 'waste' },
      to: { type: 'foundation', suit: 'S' },
    });
    expect(state.isWon).toBe(true);
  });

  it('hint returns legal move', () => {
    const state = createInitialState(1);
    state.piles.waste = [makeCard(1, 'H')];
    const hint = getHint(state)!;
    expect(
      validateAction(state, {
        type: 'MOVE',
        from: hint.from as any,
        to: hint.to as any,
      }),
    ).toBe(true);
  });
});
