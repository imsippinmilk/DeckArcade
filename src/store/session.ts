import { encodeMsg, Msg } from '../net/protocol';

export interface SessionState {
  roomId?: string;
  playerId?: string;
  seat?: number;
  muted?: boolean;
  isPrivate?: boolean;
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

  join(roomId: string, playerId: string, isPrivate = false): string {
    this.state.roomId = roomId;
    this.state.playerId = playerId;
    this.state.isPrivate = isPrivate;
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
};
