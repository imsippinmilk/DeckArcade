import React from 'react';
import {
  createInitialState,
  applyAction,
  type BlackjackConfig,
  type GameState,
  type Card,
  type Rank,
} from './rules';
import { buildDeck, shuffle } from '../../util/cards';

const ranks: Rank[] = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
];

function createDeck(): Card[] {
  return shuffle(buildDeck(ranks, (rank, suit) => ({ rank, suit })));
}

function handTotal(cards: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.rank === 'A') {
      total += 11;
      aces++;
    } else if (['K', 'Q', 'J'].includes(c.rank)) {
      total += 10;
    } else {
      total += parseInt(c.rank, 10);
    }
  }
  while (total > 21 && aces) {
    total -= 10;
    aces--;
  }
  return total;
}

export default function BlackjackUI() {
  const config: BlackjackConfig = {
    h17: false,
    das: false,
    resplitAces: false,
    surrender: 'none',
    payout: '3:2',
    penetration: 1,
  };
  const [state, setState] = React.useState<GameState>(() =>
    createInitialState(config),
  );

  const deal = () => {
    state.shoe = createDeck();
    state.shoeSize = state.shoe.length;
    state.dealer = [state.shoe.shift()!, state.shoe.shift()!];
    state.hands = [
      { cards: [state.shoe.shift()!, state.shoe.shift()!], bet: 10 },
    ];
    state.stage = 'player';
    state.active = 0;
    state.events = [];
    setState({ ...state });
  };

  const hit = () => {
    applyAction(state, 'hit');
    setState({ ...state });
  };

  const stand = () => {
    applyAction(state, 'stand');
    setState({ ...state });
  };

  const dealerTotal = handTotal(state.dealer);
  const playerCards = state.hands[0]?.cards ?? [];
  const playerTotal = handTotal(playerCards);

  return (
    <div
      className="card"
      style={{
        padding: '1rem',
        background: 'linear-gradient(0deg, var(--surface), var(--surfaceAlt))',
      }}
    >
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.5rem' }}>
        <button onClick={deal}>Deal</button>
        <button onClick={hit}>Hit</button>
        <button onClick={stand}>Stand</button>
      </div>
      <div style={{ display: 'grid', gap: '.25rem' }}>
        <strong>Dealer: {dealerTotal}</strong>
        <strong>You: {playerTotal}</strong>
      </div>
    </div>
  );
}
