import crypto from 'node:crypto';
import type { ZodSchema } from 'zod';

/** Generic action dispatched by players */
export interface Action {
  type: string;
  playerId: string;
  [key: string]: unknown;
}

/** Events emitted by the reducer to describe state transitions */
export interface DomainEvent {
  type: string;
  playerId?: string;
  payload?: unknown;
}

/** Audit entry capturing the action history */
export interface AuditEntry {
  action: Action;
  ts: number;
  playerId: string;
}

/** Game state managed by the reducer */
export interface State {
  currentPlayer: string;
  players: Record<string, { concealed?: unknown }>; // concealed info hidden from others
  auditTrail: AuditEntry[];
  rngSeed: number;
  availableActions: string[];
  blacklist: { playerId: string; actionType: string }[];
  timers: Record<string, number>; // expiresAt per player (epoch ms)
}

/** Context supplied to the reducer for deterministic behaviour */
export interface ReducerContext {
  seed: number;
  now?: number;
  durationMs?: number; // turn duration for timer updates
  rules: { validate: ZodSchema<Action> };
}

const DEFAULT_DURATION = 30000; // 30s

function deriveSeed(seed: number, n: number): number {
  const hash = crypto
    .createHash('sha256')
    .update(`${seed}:${n}`)
    .digest('hex')
    .slice(0, 8);
  return Number.parseInt(hash, 16);
}

function hashState(state: State): string {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(state))
    .digest('hex');
}

/**
 * Apply a player action to the game state. Validation is performed using the
 * provided Zod schema. Audit trails, RNG seeds and timers are managed here.
 */
export function applyAction(
  state: State,
  action: Action,
  ctx: ReducerContext,
):
  | { ok: true; state: State; events: DomainEvent[]; checksum: string }
  | { ok: false; error: unknown } {
  const now = ctx.now ?? Date.now();
  const duration = ctx.durationMs ?? DEFAULT_DURATION;

  // Check blacklist
  const isBlocked = state.blacklist.some(
    (b) => b.playerId === action.playerId && b.actionType === action.type,
  );
  if (isBlocked) {
    return { ok: false, error: new Error('ACTION_BLACKLISTED') };
  }

  // Validate against schema
  const validation = ctx.rules.validate.safeParse(action);
  if (!validation.success) {
    return { ok: false, error: validation.error };
  }

  const events: DomainEvent[] = [];

  // Enforce timers
  for (const [pid, expires] of Object.entries(state.timers)) {
    if (expires !== undefined && now > expires) {
      events.push({ type: 'TIMEOUT', playerId: pid });
      state = {
        ...state,
        timers: { ...state.timers, [pid]: now + duration },
      };
    }
  }

  // Update timer for acting player
  state = {
    ...state,
    timers: { ...state.timers, [action.playerId]: now + duration },
  };

  // Derive deterministic RNG seed for this event
  const newSeed = deriveSeed(ctx.seed, state.auditTrail.length + 1);

  const nextState: State = {
    ...state,
    rngSeed: newSeed,
    auditTrail: [
      ...state.auditTrail,
      { action, ts: now, playerId: action.playerId },
    ],
  };

  events.push({
    type: action.type,
    playerId: action.playerId,
    payload: action,
  });

  const checksum = hashState(nextState);
  return { ok: true, state: nextState, events, checksum };
}

/**
 * Present a view of the state to a player, hiding concealed information for
 * other players.
 */
export function getPlayerView(state: State, playerId: string): State {
  const players: Record<string, { concealed?: unknown }> = {};
  for (const [pid, data] of Object.entries(state.players)) {
    players[pid] = { ...data };
    if (pid !== playerId) {
      delete players[pid].concealed;
    }
  }
  return { ...state, players };
}

/**
 * Enumerate legal actions for the current player, filtering any blacklisted
 * moves.
 */
export function getNextActions(state: State): string[] {
  const key = (actionType: string) => `${state.currentPlayer}:${actionType}`;
  const blacklistSet = new Set(
    state.blacklist.map((b) => `${b.playerId}:${b.actionType}`),
  );
  return state.availableActions.filter((a) => !blacklistSet.has(key(a)));
}

export { hashState };
