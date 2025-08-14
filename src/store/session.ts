// Session + Lobby (PIN) + Chat + Host controls, no external deps.
import { createStore } from './createStore';

export type Peer = {
  id: string;
  name: string;
  emoji?: string;
  isHost?: boolean;
  connected: boolean;
  balanceCents: number;
};

export type ChatMsg = { id: string; userId: string; text: string; ts: number };

export type GameRules = {
  blackjack?: {
    numDecks: number;
    dealerHitsSoft17: boolean; // H17 vs S17 config (common casino variants). :contentReference[oaicite:1]{index=1}
    blackjackPayout: number; // 1.5 for 3:2, 1.2 for 6:5, etc.
    allowDouble: boolean;
    allowSplit: boolean;
    allowDoubleAfterSplit: boolean;
    dealerPeek: boolean;
    allowSurrender: boolean;
  };
  // other games here...
};

export type LobbyState = {
  pin: string | null;
  hostId: string | null;
  gameId: string | null;
  rules: GameRules;
  peers: Record<string, Peer>;
  status: 'idle' | 'open' | 'playing' | 'ended';
  chat: ChatMsg[];
};

export type SessionState = {
  self: Peer | null;
  lobby: LobbyState;
};

export interface LobbyPeer {
  id: string;
  name: string;
  emoji?: string;
  isHost?: boolean;
}

export interface LobbyState {
  pin?: string;
  peers: Record<string, LobbyPeer>;
}

function getLocal(key: string): string | null {
  return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
}

export const sessionStore = {
  state: {} as SessionState,
  lobby: { peers: {} } as LobbyState,
  tables: [] as { id: string; config: Record<string, unknown> }[],
  profile: JSON.parse(getLocal('profile') || '{}') as {
    name?: string;
    avatar?: string;
  },
  resumeToken: getLocal('resumeToken') || undefined,

type SignalingEvent =
  | { type: 'peer-joined'; peer: Peer }
  | { type: 'peer-left'; peerId: string }
  | { type: 'chat'; msg: ChatMsg }
  | { type: 'lobby-update'; patch: Partial<LobbyState> }
  | { type: 'start-game' }
  | { type: 'end-game' };

export interface Signaling {
  createLobby(pin: string, host: Peer): Promise<void>;
  joinLobby(pin: string, peer: Peer): Promise<void>;
  leaveLobby(pin: string, peerId: string): Promise<void>;
  broadcast(pin: string, ev: SignalingEvent): Promise<void>;
  onMessage(pin: string, handler: (ev: SignalingEvent) => void): void;
}

// Simple in-tab dev bus so you can click around without a server.
// Swap for your WebSocket/WebRTC signaling. Uses RTCDataChannel in production. :contentReference[oaicite:2]{index=2}
class LocalBus implements Signaling {
  private static rooms = new Map<string, EventTarget>();
  private room(pin: string) {
    if (!LocalBus.rooms.has(pin)) LocalBus.rooms.set(pin, new EventTarget());
    return LocalBus.rooms.get(pin)!;
  }
  async createLobby(pin: string, _host: Peer) {
    this.room(pin);
  }
  async joinLobby(pin: string, peer: Peer) {
    this.room(pin).dispatchEvent(
      new CustomEvent('msg', {
        detail: { type: 'peer-joined', peer } as SignalingEvent,
      }),
    );
  }
  async leaveLobby(pin: string, peerId: string) {
    this.room(pin).dispatchEvent(
      new CustomEvent('msg', {
        detail: { type: 'peer-left', peerId } as SignalingEvent,
      }),
    );
  }
  async broadcast(pin: string, ev: SignalingEvent) {
    this.room(pin).dispatchEvent(new CustomEvent('msg', { detail: ev }));
  }
  onMessage(pin: string, handler: (ev: SignalingEvent) => void) {
    this.room(pin).addEventListener('msg', (e: Event) =>
      handler((e as CustomEvent).detail),
    );
  }
}
export const DevSignaling = new LocalBus();


function genId(prefix = 'u'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}
export function generatePIN(len = 6): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no ambigious chars
  let out = '';
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export const session = createStore<SessionState>(
  (set, get) =>
    ({
      self: null,
      lobby: {
        pin: null,
        hostId: null,
        gameId: null,
        rules: {
          blackjack: {
            numDecks: 6,
            dealerHitsSoft17: true,
            blackjackPayout: 1.5,
            allowDouble: true,
            allowSplit: true,
            allowDoubleAfterSplit: true,
            dealerPeek: true,
            allowSurrender: false,
          },
        },
        peers: {},
        status: 'idle',
        chat: [],
      },
      // Actions (attached below)
    }) as any,
);

// Actions
export const sessionActions = {
  attachSignaling(sig: Signaling) {
    (session as any)._sig = sig;
  },
  async createLobby(hostName: string, emoji?: string) {
    const pin = generatePIN();
    const host: Peer = {
      id: genId('host'),
      name: hostName,
      emoji,
      isHost: true,
      connected: true,
      balanceCents: 0,
    };
    const sig: Signaling = (session as any)._sig || DevSignaling;
    await sig.createLobby(pin, host);
    sig.onMessage(pin, (ev) => handleSignal(ev));
    session.setState({
      self: host,
      lobby: {
        ...session.getState().lobby,
        pin,
        hostId: host.id,
        peers: { [host.id]: host },
        status: 'open',
      },
    });
  },
  async joinLobby(pin: string, name: string, emoji?: string) {
    const self: Peer = {
      id: genId('p'),
      name,
      emoji,
      connected: true,
      isHost: false,
      balanceCents: 0,
    };
    const sig: Signaling = (session as any)._sig || DevSignaling;
    sig.onMessage(pin, (ev) => handleSignal(ev));
    await sig.joinLobby(pin, self);
    session.setState({
      self,
      lobby: { ...session.getState().lobby, pin, status: 'open' },
    });
  },
  async leaveLobby() {
    const st = session.getState();
    const pin = st.lobby.pin;
    if (!pin || !st.self) return;
    const sig: Signaling = (session as any)._sig || DevSignaling;
    await sig.leaveLobby(pin, st.self.id);
    session.setState({
      self: null,
      lobby: {
        ...st.lobby,
        status: 'idle',
        pin: null,
        peers: {},
        chat: [],
        hostId: null,
        gameId: null,
      },
    });
  },
  setGame(gameId: string | null) {
    const l = session.getState().lobby;
    session.setState({ lobby: { ...l, gameId } });
    broadcast({ type: 'lobby-update', patch: { gameId } });
  },
  setBlackjackRule<K extends keyof NonNullable<GameRules['blackjack']>>(
    key: K,
    value: NonNullable<GameRules['blackjack']>[K],
  ) {
    const l = session.getState().lobby;
    const bj = { ...(l.rules.blackjack || {}) } as GameRules['blackjack'];
    (bj as any)[key] = value;
    const rules = { ...l.rules, blackjack: bj };
    session.setState({ lobby: { ...l, rules } });
    broadcast({ type: 'lobby-update', patch: { rules } });
  },
  sendChat(text: string) {
    const st = session.getState();
    if (!st.self || !st.lobby.pin) return;
    const msg: ChatMsg = {
      id: genId('m'),
      userId: st.self.id,
      text,
      ts: Date.now(),
    };
    broadcast({ type: 'chat', msg });
    const chat = [...st.lobby.chat, msg];
    session.setState({ lobby: { ...st.lobby, chat } });
  },
  startGame() {
    const l = session.getState().lobby;
    session.setState({ lobby: { ...l, status: 'playing' } });
    broadcast({ type: 'start-game' });
  },
  endGame() {
    const l = session.getState().lobby;
    session.setState({ lobby: { ...l, status: 'ended' } });
    broadcast({ type: 'end-game' });
  },
};

function broadcast(ev: SignalingEvent) {
  const st = session.getState();
  const sig: Signaling = (session as any)._sig || DevSignaling;
  if (!st.lobby.pin) return;
  void sig.broadcast(st.lobby.pin, ev);
}

  clearTurnTimer() {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = undefined;
    }
    this.turnDeadline = undefined;
  },
};

export const session = {
  getState: () => sessionStore,
};

export const sessionActions = {
  joinLobby(pin: string, name: string, emoji: string) {
    sessionStore.lobby.pin = pin;
    const id = Math.random().toString(36).slice(2);
    sessionStore.lobby.peers[id] = { id, name, emoji };
  },
};

function handleSignal(ev: SignalingEvent) {
  const st = session.getState();
  const l = st.lobby;
  if (ev.type === 'peer-joined' && ev.peer) {
    session.setState({
      lobby: { ...l, peers: { ...l.peers, [ev.peer.id]: ev.peer } },
    });
  } else if (ev.type === 'peer-left') {
    const { [ev.peerId]: _, ...rest } = l.peers;
    session.setState({ lobby: { ...l, peers: rest } });
  } else if (ev.type === 'chat') {
    session.setState({ lobby: { ...l, chat: [...l.chat, ev.msg] } });
  } else if (ev.type === 'lobby-update') {
    session.setState({ lobby: { ...l, ...ev.patch } });
  } else if (ev.type === 'start-game') {
    session.setState({ lobby: { ...l, status: 'playing' } });
  } else if (ev.type === 'end-game') {
    session.setState({ lobby: { ...l, status: 'ended' } });
  }
}
