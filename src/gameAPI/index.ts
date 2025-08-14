export interface GameRegistration {
  slug: string;
  meta: Record<string, unknown>;
  createInitialState: (...args: any[]) => unknown;
  applyAction: (state: any, action: any) => any;
  getPlayerView: (state: any, playerId?: string) => any;
  getNextActions: (state: any, stage?: string) => string[];
  rules: {
    validate: (state: any, action: any) => boolean;
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
