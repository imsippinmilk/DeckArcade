import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  applyAction,
  getPlayerView,
  getNextActions,
  type State,
  type Action,
} from 'src/gameAPI/reducer';

const actionSchema = z.object({
  type: z.enum(['DEAL', 'BET', 'WIN', 'SHUFFLE']),
  playerId: z.enum(['p1', 'p2']),
  amount: z.number().optional(),
});

function createState(): State {
  return {
    currentPlayer: 'p1',
    players: {
      p1: { concealed: { card: 'AH' } },
      p2: { concealed: { card: 'KC' } },
    },
    auditTrail: [],
    rngSeed: 0,
    availableActions: ['DEAL', 'BET', 'WIN', 'SHUFFLE'],
    blacklist: [],
    timers: { p1: 0, p2: 0 },
  };
}

describe('reducer core', () => {
  const ctx = { seed: 1, now: 0, rules: { validate: actionSchema } };

  it('fuzz: random actions keep state valid', () => {
    let state = createState();
    for (let i = 0; i < 50; i++) {
      const action: Action = {
        type: actionSchema.shape.type.options[
          Math.floor(Math.random() * actionSchema.shape.type.options.length)
        ],
        playerId: Math.random() > 0.5 ? 'p1' : 'p2',
      };
      const res = applyAction(state, action, ctx);
      expect(res.ok).toBe(true);
      if (res.ok) state = res.state;
    }
    // Ensure concealed info is hidden from other players
    const view = getPlayerView(state, 'p1');
    expect(view.players.p2.concealed).toBeUndefined();
  });

  it('snapshot: canonical sequence is stable', () => {
    let state = createState();
    const sequence: Action[] = [
      { type: 'DEAL', playerId: 'p1' },
      { type: 'BET', playerId: 'p2', amount: 5 },
      { type: 'WIN', playerId: 'p1' },
    ];
    const events: unknown[] = [];
    for (const action of sequence) {
      const res = applyAction(state, action, ctx);
      if (!res.ok) throw res.error;
      events.push(res.events);
      state = res.state;
    }
    expect({ state, events }).toMatchSnapshot();
  });

  it('schema: invalid actions return ok:false', () => {
    const state = createState();
    const res = applyAction(
      state,
      { type: 'UNKNOWN', playerId: 'p1' } as Action,
      ctx,
    );
    expect(res.ok).toBe(false);
  });

  it('getNextActions respects blacklist', () => {
    const state = {
      ...createState(),
      blacklist: [{ playerId: 'p1', actionType: 'BET' }],
    };
    const actions = getNextActions(state);
    expect(actions).not.toContain('BET');
  });
});
