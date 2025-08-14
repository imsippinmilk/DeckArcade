export interface GameRegistration<State = any, Action = any> {
  slug: string;
  meta: Record<string, unknown>;
  createInitialState: (...args: any[]) => State;
  applyAction: (state: State, action: Action) => State;
  getPlayerView: (state: State, playerId: string) => unknown;
  getNextActions: (state: State, playerId: string) => Action[];
  rules: {
    validate: (state: State, action: Action, playerId?: string) => boolean;
  };
}

const registry: Record<string, GameRegistration> = {};

export function registerGame(game: GameRegistration): void {
  registry[game.slug] = game;
}

export function getGame(slug: string): GameRegistration | undefined {
  return registry[slug];
}

export type { GameRegistration as Game };
