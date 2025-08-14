/**
 * Generic game registration and lookup. Each game module should
 * implement the GameRegistration interface and call registerGame()
 * during its initialisation to make itself available in the catalog.
 */
export type GameRegistration = {
  slug: string;
  meta: Record<string, unknown>;
  createInitialState: (seed?: number) => unknown;
  applyAction: (state: unknown, action: unknown) => unknown;
  getPlayerView: (state: unknown, playerId: string) => unknown;
  getNextActions: (state: unknown, playerId: string) => unknown;
  rules: { validate: (state: unknown, action: unknown) => boolean };
  explainers?: { getTips: (state: unknown, playerId: string) => unknown };
  animations?: Record<string, unknown>;
  payouts?: { settle: (economyState: unknown, tableState: unknown) => unknown };
};

const registry: Record<string, GameRegistration> = {};

/**
 * Register a game with the global registry. Future calls to getGame()
 * will return whatever was passed here. If a game is registered
 * twice the latter registration will overwrite the former.
 */
export function registerGame(game: GameRegistration): void {
  registry[game.slug] = game;
}

/**
 * Retrieve a previously registered game. Returns undefined if the
 * slug has not been registered yet.
 */
export function getGame(slug: string): GameRegistration | undefined {
  return registry[slug];
}
