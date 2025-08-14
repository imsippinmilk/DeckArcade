import { describe, it, expect } from 'vitest';
import {
  createDeck,
  deal,
  getTrickWinner,
  trickPoints,
  canPlayCard,
  playCard,
  type Card,
  type GameState,
} from 'src/games/sueca/rules';

const card = (rank: Card['rank'], suit: Card['suit']): Card => ({ rank, suit });

describe('sueca deck', () => {
  it('contains 40 cards without 8s, 9s, or 10s', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(40);
    expect(deck.some((c: any) => ['8', '9', '10'].includes(c.rank))).toBe(
      false,
    );
  });
});

describe('deal and trick logic', () => {
  it('deals 10 cards each and sets trump from dealer last card', () => {
    const deck = createDeck();
    const { hands, trump } = deal(deck);
    expect(hands.every((h) => h.length === 10)).toBe(true);
    expect(trump).toBe(hands[3][9].suit);
  });

  it('evaluates trick winner considering trump and rank order', () => {
    const trick = [
      card('K', 'H'),
      card('A', 'H'),
      card('2', 'S'),
      card('7', 'H'),
    ];
    expect(getTrickWinner(trick, 'S')).toBe(2);
    const trick2 = [card('Q', 'D'), card('7', 'D'), card('K', 'C')];
    expect(getTrickWinner(trick2, 'S')).toBe(1);
  });

  it('sums trick points correctly', () => {
    const trick = [card('A', 'S'), card('7', 'H'), card('Q', 'D')];
    expect(trickPoints(trick)).toBe(11 + 10 + 2);
  });
});

describe('play enforcement and scoring', () => {
  it('enforces follow suit and optional must trump', () => {
    const state: GameState = {
      hands: [
        [card('A', 'H')],
        [card('K', 'S'), card('Q', 'H')],
        [card('2', 'D')],
        [card('3', 'C')],
      ],
      trick: [card('A', 'H')],
      leader: 0,
      trump: 'S',
      scores: [0, 0],
      mustTrumpWhenVoid: false,
    };
    expect(canPlayCard(state, 1, card('K', 'S'))).toBe(false);
    expect(canPlayCard(state, 1, card('Q', 'H'))).toBe(true);
    state.mustTrumpWhenVoid = true;
    state.hands[1] = [card('K', 'S'), card('Q', 'C')];
    expect(canPlayCard(state, 1, card('Q', 'C'))).toBe(false);
    expect(canPlayCard(state, 1, card('K', 'S'))).toBe(true);
  });

  it('scores tricks for winning team and rotates leader', () => {
    const state: GameState = {
      hands: [
        [card('A', 'H')],
        [card('7', 'H')],
        [card('2', 'C')],
        [card('3', 'D')],
      ],
      trick: [],
      leader: 0,
      trump: 'S',
      scores: [0, 0],
      mustTrumpWhenVoid: false,
    };
    playCard(state, 0, card('A', 'H'));
    playCard(state, 1, card('7', 'H'));
    playCard(state, 2, card('2', 'C'));
    playCard(state, 3, card('3', 'D'));
    expect(state.scores).toEqual([21, 0]);
    expect(state.leader).toBe(0);
    expect(state.trick.length).toBe(0);
  });
});
