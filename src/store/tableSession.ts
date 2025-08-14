import { encodeMsg, Msg } from '../net/protocol';

export interface SessionState {
  roomId?: string;
  playerId?: string;
  seat?: number;
  muted?: boolean;
  muteReason?: string;
  isPrivate?: boolean;
  /** Whether the local player has marked themselves ready */
  ready?: boolean;
  /** True if the player joined as a spectator */
  isSpectator?: boolean;
  /** Set when the host has paused the table */
  paused?: boolean;
}

function getLocal(key: string): string | null {
  return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
}

export const sessionStore = {
  state: {} as SessionState,
  tables: [] as { id: string; config: Record<string, unknown> }[],
  profile: JSON.parse(getLocal('profile') || '{}') as {
    name?: string;
    avatar?: string;
  },
  resumeToken: getLocal('resumeToken') || undefined,

  setProfile(profile: { name: string; avatar?: string }) {
    this.profile = profile;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('profile', JSON.stringify(profile));
    }
  },

  handleResumeToken(token: string) {
    this.resumeToken = token;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('resumeToken', token);
    }
  },

  resume(): string | null {
    if (!this.resumeToken) return null;
    return encodeMsg({ type: 'HELLO', resumeToken: this.resumeToken });
  },

  join(
    roomId: string,
    playerId: string,
    isPrivate = false,
    isSpectator = false,
  ): string {
    this.state.roomId = roomId;
    this.state.playerId = playerId;
    this.state.isPrivate = isPrivate;
    this.state.muted = false;
    this.state.muteReason = undefined;
    this.state.isSpectator = isSpectator;
    const msg: Msg = {
      type: 'JOIN',
      roomId,
      playerId,
      profile: this.profile.name
        ? (this.profile as { name: string; avatar?: string })
        : undefined,
    };
    return encodeMsg(msg);
  },

  leave(): string | null {
    if (!this.state.roomId || !this.state.playerId) return null;
    const msg: Msg = {
      type: 'LEAVE',
      roomId: this.state.roomId,
      playerId: this.state.playerId,
    };
    this.state = {} as SessionState;
    return encodeMsg(msg);
  },

  createTable(config: Record<string, unknown>) {
    const snapshot = JSON.parse(JSON.stringify(config));
    const table = {
      id: `table-${this.tables.length + 1}`,
      config: snapshot,
    };
    this.tables.push(table);
    return table;
  },

  /**
   * Toggle the local ready state and produce a READY message for broadcast.
   * The caller is responsible for sending the returned payload over the wire.
   */
  ready(ready = true): string | null {
    if (!this.state.playerId) return null;
    this.state.ready = ready;
    const msg: Msg = { type: 'READY', playerId: this.state.playerId, ready };
    return encodeMsg(msg);
  },

  /** mark the local client as a spectator */
  setSpectator(isSpectator: boolean) {
    this.state.isSpectator = isSpectator;
  },

  /**
   * Host controls -----------------------------------------------------------
   */

  pause(): string | null {
    if (!this.state.roomId) return null;
    this.state.paused = true;
    return encodeMsg({ type: 'PAUSE', roomId: this.state.roomId });
  },

  resumeGame(): string | null {
    if (!this.state.roomId) return null;
    this.state.paused = false;
    return encodeMsg({ type: 'RESUME', roomId: this.state.roomId });
  },

  endGame(): string | null {
    if (!this.state.roomId) return null;
    return encodeMsg({ type: 'END_GAME', roomId: this.state.roomId });
  },

  /**
   * Basic per-turn timer. Starts a timeout and invokes the callback when the
   * deadline is reached. The deadline timestamp is stored for UI countdowns.
   */
  turnTimer: undefined as ReturnType<typeof setTimeout> | undefined,
  turnDeadline: undefined as number | undefined,
  startTurnTimer(seconds: number, onTimeout: () => void) {
    this.clearTurnTimer();
    this.turnDeadline = Date.now() + seconds * 1000;
    this.turnTimer = setTimeout(() => {
      this.turnTimer = undefined;
      this.turnDeadline = undefined;
      onTimeout();
    }, seconds * 1000);
  },

  clearTurnTimer() {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = undefined;
    }
    this.turnDeadline = undefined;
  },
};
