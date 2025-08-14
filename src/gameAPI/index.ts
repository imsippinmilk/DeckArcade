export interface GameRegistration<
  State = any,
  Action = any,
  PlayerId = string,
> {
  slug: string;
  meta: Record<string, any>;
  createInitialState: (...args: any[]) => State;
  applyAction: (state: State, action: Action, playerId?: PlayerId) => void;
  getPlayerView: (state: State, playerId: PlayerId) => unknown;
  getNextActions: (state: State, playerId: PlayerId) => Action[];
  rules: {
    validate: (state: State, action: Action, playerId?: PlayerId) => boolean;
  };
}

const registry = new Map<string, GameRegistration>();

export function registerGame(game: GameRegistration): void {
  registry.set(game.slug, game);
}

export function getGame(slug: string): GameRegistration | undefined {
  return registry.get(slug);
}

export function listGames(): GameRegistration[] {
  return Array.from(registry.values());
}

export const gameAPI = {
  registerGame,
  getGame,
  listGames,
};

export type Game = GameRegistration;
