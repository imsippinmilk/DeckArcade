import type { JSX } from 'react';

// ---------------------------------------------------------------------------
// Rules engine registry used by tests and game logic

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

const rulesRegistry = new Map<string, GameRegistration>();

export function registerGame(game: GameRegistration): void {
  rulesRegistry.set(game.slug, game);
}

export function getGame(slug: string): GameRegistration | undefined {
  return rulesRegistry.get(slug);
}

export function listGames(): GameRegistration[] {
  return Array.from(rulesRegistry.values());
}

export type Game = GameRegistration;

// ---------------------------------------------------------------------------
// Minimal front-end game contract and registry

export type GameId = string;

export type FrontAPI = {
  animations: typeof import('./animations');
  send: (event: string, payload?: any) => void;
  requestState: () => any;
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
const uiRegistry: GameRegistry = new Map();

export const gameAPI = {
  registerGame(meta: GameMeta) {
    uiRegistry.set(meta.id, meta);
  },
  listGames() {
    return Array.from(uiRegistry.values());
  },
  getGame(id: GameId) {
    return uiRegistry.get(id);
  },
};
