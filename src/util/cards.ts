export const SUITS = ['C', 'D', 'H', 'S'] as const;
export type Suit = (typeof SUITS)[number];

export function buildDeck<R, C>(
  ranks: readonly R[],
  factory: (rank: R, suit: Suit) => C,
): C[] {
  const deck: C[] = [];
  for (const suit of SUITS) {
    for (const rank of ranks) {
      deck.push(factory(rank, suit));
    }
  }
  return deck;
}

export function shuffle<T>(arr: T[], rnd: () => number = Math.random): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
