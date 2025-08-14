import type { JSX } from 'react';

// Existing game registration used by rules engine and tests
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

// Registry backing the rules engine. Kept for backward compatibility with
// existing tests and modules that rely on slug-based lookups.
const rulesRegistry = new Map<string, GameRegistration>();

export function registerGame(game: GameRegistration): void {
  rulesRegistry.set(game.slug, game);
}

export function getGame(slug: string): GameRegistration | undefined {
  return rulesRegistry.get(slug);
}

export type Game = GameRegistration;

// ---------------------------------------------------------------------------
// Minimal front-end game contract and registry. Games may opt in to this API
// to describe their UI and lobby characteristics without pulling in rules
// logic. This mirrors the snippet provided in the task instructions.

export type GameId = string;

export type FrontAPI = {
  animations: typeof import('./animations');
  send: (event: string, payload?: any) => void; // to engine / network
  requestState: () => any; // pull latest game state
};

export type GameMeta = {
  id: GameId;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  icon?: string;
  createUI: (api: FrontAPI) => JSX.Element;
};

type GameRegistry = Map<GameId, GameMeta>;
const registry: GameRegistry = new Map();

export const gameAPI = {
  registerGame(meta: GameMeta) {
    registry.set(meta.id, meta);
  },
  listGames() {
    return Array.from(registry.values());
  },
  getGame(id: GameId) {
    return registry.get(id);
  },
};
