import { describe, it, expect } from 'vitest';
import {
  BlackjackConfig,
  createInitialState,
  applyAction,
  getNextActions,
  payouts,
  type GameState,
  type Card,
} from 'src/games/blackjack/rules';

const card = (rank: Card['rank']): Card => ({ rank, suit: 'S' });

const baseConfig: BlackjackConfig = {
  h17: false,
  das: false,
  resplitAces: false,
  surrender: 'none',
  payout: '3:2',
  penetration: 1,
};

describe('dealer stopping', () => {
  it('hits soft 17 when h17 is true', () => {
    const state = createInitialState({ ...baseConfig, h17: true });
    state.dealer = [card('A'), card('6')];
    state.hands = [{ cards: [card('10'), card('7')], bet: 10 }];
    state.stage = 'player';
    state.active = 0;
    state.shoe = [card('2')];
    state.shoeSize = 1;
    applyAction(state, 'stand');
    expect(state.dealer.length).toBe(3);
  });

  it('stands on soft 17 when h17 is false', () => {
    const state = createInitialState({ ...baseConfig, h17: false });
    state.dealer = [card('A'), card('6')];
    state.hands = [{ cards: [card('10'), card('7')], bet: 10 }];
    state.stage = 'player';
    state.active = 0;
    state.shoe = [card('2')];
    state.shoeSize = 1;
    applyAction(state, 'stand');
    expect(state.dealer.length).toBe(2);
  });
});

describe('double after split', () => {
  it('allows double after split when das is true', () => {
    const config = { ...baseConfig, das: true };
    const state = createInitialState(config);
    state.hands = [{ cards: [card('8'), card('8')], bet: 10 }];
    state.stage = 'player';
    state.active = 0;
    state.shoe = [card('5'), card('5')];
    state.shoeSize = 2;
    applyAction(state, 'split');
    const actions = getNextActions(state, 'player');
    expect(actions).toContain('double');
  });

  it('forbids double after split when das is false', () => {
    const config = { ...baseConfig, das: false };
    const state = createInitialState(config);
    state.hands = [{ cards: [card('8'), card('8')], bet: 10 }];
    state.stage = 'player';
    state.active = 0;
    state.shoe = [card('5'), card('5')];
    state.shoeSize = 2;
    applyAction(state, 'split');
    const actions = getNextActions(state, 'player');
    expect(actions).not.toContain('double');
  });
});

describe('resplit aces', () => {
  it('allows resplitting aces when enabled', () => {
    const config = { ...baseConfig, resplitAces: true };
    const state = createInitialState(config);
    state.hands = [{ cards: [card('A'), card('A')], bet: 10 }];
    state.stage = 'player';
    state.active = 0;
    state.shoe = [card('9'), card('A')];
    state.shoeSize = 2;
    applyAction(state, 'split');
    const actions = getNextActions(state, 'player');
    expect(actions).toContain('split');
  });

  it('disallows resplitting aces when disabled', () => {
    const config = { ...baseConfig, resplitAces: false };
    const state = createInitialState(config);
    state.hands = [{ cards: [card('A'), card('A')], bet: 10 }];
    state.stage = 'player';
    state.active = 0;
    state.shoe = [card('9'), card('A')];
    state.shoeSize = 2;
    applyAction(state, 'split');
    const actions = getNextActions(state, 'player');
    expect(actions).not.toContain('split');
  });
});

describe('surrender semantics', () => {
  it('allows early surrender even against dealer blackjack', () => {
    const config: BlackjackConfig = { ...baseConfig, surrender: 'early' };
    const state = createInitialState(config);
    state.dealer = [card('A'), card('10')];
    state.hands = [{ cards: [card('9'), card('7')], bet: 10 }];
    state.stage = 'player';
    state.active = 0;
    applyAction(state, 'surrender');
    expect(state.bank).toBe(95);
    expect(state.stage).toBe('finished');
  });

  it('forbids surrender when dealer has blackjack and surrender is late', () => {
    const config: BlackjackConfig = { ...baseConfig, surrender: 'late' };
    const state = createInitialState(config);
    state.dealer = [card('A'), card('10')];
    state.hands = [{ cards: [card('9'), card('7')], bet: 10 }];
    state.stage = 'player';
    const actions = getNextActions(state, 'player');
    expect(actions).not.toContain('surrender');
  });

  it('forbids surrender when option is none', () => {
    const config: BlackjackConfig = { ...baseConfig, surrender: 'none' };
    const state = createInitialState(config);
    state.dealer = [card('9'), card('7')];
    state.hands = [{ cards: [card('9'), card('7')], bet: 10 }];
    state.stage = 'player';
    const actions = getNextActions(state, 'player');
    expect(actions).not.toContain('surrender');
  });
});

describe('payouts', () => {
  it('pays 3:2 or 6:5 for blackjack and 0 for pushes', () => {
    expect(
      payouts.settle([{ result: 'blackjack', bet: 10 }], {
        ...baseConfig,
        payout: '3:2',
      }),
    ).toBe(15);
    expect(
      payouts.settle([{ result: 'blackjack', bet: 10 }], {
        ...baseConfig,
        payout: '6:5',
      }),
    ).toBe(12);
    expect(payouts.settle([{ result: 'push', bet: 10 }], baseConfig)).toBe(0);
  });
});

describe('penetration reshuffle', () => {
  it('emits reshuffle when penetration threshold reached', () => {
    const config = { ...baseConfig, penetration: 0.5 };
    const state: GameState = {
      shoe: [card('3'), card('2'), card('4')],
      discard: [],
      dealer: [card('9'), card('7')],
      hands: [{ cards: [card('5'), card('5')], bet: 10 }],
      active: 0,
      config,
      stage: 'player',
      bank: 100,
      events: [],
      shoeSize: 3,
    };
    applyAction(state, 'hit');
    expect(state.events.length).toBe(0);
    applyAction(state, 'hit');
    expect(state.events.find((e) => e.type === 'reshuffle')).toBeTruthy();
  });
});

describe('auto resolve', () => {
  it('resolves automatically on stand', () => {
    const state = createInitialState(baseConfig);
    state.dealer = [card('10'), card('7')];
    state.hands = [{ cards: [card('9'), card('8')], bet: 10 }];
    state.stage = 'player';
    state.active = 0;
    state.shoe = [];
    state.shoeSize = 0;
    applyAction(state, 'stand');
    expect(state.stage).toBe('finished');
  });

  it('resolves automatically on bust', () => {
    const state = createInitialState(baseConfig);
    state.dealer = [card('10'), card('7')];
    state.hands = [{ cards: [card('9'), card('8')], bet: 10 }];
    state.stage = 'player';
    state.active = 0;
    state.shoe = [card('5')];
    state.shoeSize = 1;
    applyAction(state, 'hit');
    expect(state.stage).toBe('finished');
  });
});
