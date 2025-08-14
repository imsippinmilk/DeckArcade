export interface GameRegistration {
  slug: string;
  meta: Record<string, unknown>;
  createInitialState: (...args: any[]) => unknown;
  applyAction: (state: any, action: any) => any;
  getPlayerView: (state: any, playerId?: string) => any;
  getNextActions: (state: any, stage?: string) => string[];
  rules: {
    validate: (state: any, action: any) => boolean;
  };
}

const registry = new Map<string, GameRegistration>();

export function registerGame(game: GameRegistration): void {
  registry.set(game.slug, game);
}

export function getGame(slug: string): GameRegistration | undefined {
  return registry.get(slug);
}
