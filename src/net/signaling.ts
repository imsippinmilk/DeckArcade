import { encodeMsg, parseMsg, Msg } from './protocol';

/**
 * Simple WebSocket based signalling client used by the tests and the demo
 * application.  The real application will eventually have a more feature rich
 * implementation, however for the purposes of the kata we only need a very
 * small subset which wraps the signalling protocol defined in
 * `src/net/protocol.ts`.
 */
export class SignalingClient {
  private ws!: WebSocket;
  /** identifier assigned by the signalling server after the HELLO handshake */
  public clientId?: string;
  /** room the client is currently joined to */
  public roomId?: string;

  private listeners: Set<(msg: Msg) => void> = new Set();

  // resume token issued by the server after joining a room
  private resumeToken?: string;
  // flag used to avoid auto reconnect when the consumer explicitly closes
  private manualClose = false;

  constructor(private url: string) {}

  /** initialise listeners on a websocket instance */
  private setupSocket(ws: WebSocket): void {
    ws.addEventListener('message', this.handleMessage);
    ws.addEventListener('close', this.handleClose);
  }

  private handleMessage = (ev: MessageEvent) => {
    const msg = parseMsg(ev.data as string);
    if (msg.type === 'HELLO' && msg.clientId) this.clientId = msg.clientId;
    if (msg.type === 'RESUME_TOKEN') this.resumeToken = msg.resumeToken;
    this.dispatch(msg);
  };

  private handleClose = () => {
    if (this.manualClose || !this.resumeToken) return;
    // attempt to reconnect shortly after a disconnect
    setTimeout(() => this.attemptReconnect(), 50);
  };

  private attemptReconnect() {
    if (!this.resumeToken) return;
    this.ws = new WebSocket(this.url);
    this.manualClose = false;
    this.setupSocket(this.ws);
    this.ws.addEventListener(
      'open',
      () => {
        this.ws.send(encodeMsg({ type: 'HELLO', resumeToken: this.resumeToken }));
      },
      { once: true },
    );
  }

  /**
   * Returns a promise that resolves once the initial HELLO message is
   * received from the server.  The server assigns the `clientId` which is
   * stored for later messages.
  */
  async connect(): Promise<void> {
    this.ws = new WebSocket(this.url);
    this.setupSocket(this.ws);
    return new Promise((resolve, reject) => {
      const onHello = (ev: MessageEvent) => {
        try {
          const msg = parseMsg(ev.data as string);
          if (msg.type === 'HELLO' && msg.clientId) {
            this.clientId = msg.clientId;
            this.ws.removeEventListener('message', onHello);
            resolve();
          }
        } catch (err) {
          this.ws.removeEventListener('message', onHello);
          reject(err);
        }
      };
      this.ws.addEventListener('message', onHello);
      this.ws.addEventListener('error', (e) => reject(e), { once: true });
    });
  }

  /** register a callback for all incoming messages */
  onMessage(handler: (msg: Msg) => void): void {
    this.listeners.add(handler);
  }

  offMessage(handler: (msg: Msg) => void): void {
    this.listeners.delete(handler);
  }

  private dispatch(msg: Msg): void {
    for (const cb of this.listeners) cb(msg);
  }

  // ---------------------------------------------------------------------------
  // Room management

  /**
   * Create a new room.  When `isPrivate` is true a random numeric PIN with the
   * given length (default 6) is generated and sent to the server.  The promise
   * resolves with the room id returned by the server and the generated PIN.
   */
  async createRoom({
    isPrivate = false,
    pinLength = 6,
    config,
  }: {
    isPrivate?: boolean;
    pinLength?: number;
    config?: Record<string, unknown>;
  } = {}): Promise<{ roomId: string; pin?: string }> {
    const pin = isPrivate ? generatePin(pinLength) : undefined;
    const msg: Msg = { type: 'CREATE_ROOM', pin, config } as Msg;
    this.ws.send(encodeMsg(msg));
    return new Promise((resolve, reject) => {
      const handler = (ev: MessageEvent) => {
        try {
          const m = parseMsg(ev.data as string);
          this.dispatch(m);
          if (m.type === 'CREATE_ROOM' && m.roomId) {
            this.roomId = m.roomId;
            this.ws.removeEventListener('message', handler);
            resolve({ roomId: m.roomId, pin });
          }
        } catch (err) {
          this.ws.removeEventListener('message', handler);
          reject(err);
        }
      };
      this.ws.addEventListener('message', handler);
    });
  }

  /**
   * Join an existing room.  The room id and client id are stored on success.
   * If the server replies with a KICK message the promise is rejected.
   */
  async joinRoom({
    roomId,
    pin,
    profile,
  }: {
    roomId: string;
    pin?: string;
    profile?: { name: string; avatar?: string };
  }): Promise<void> {
    const playerId = this.clientId || undefined;
    const msg: Msg = { type: 'JOIN', roomId, pin, playerId, profile } as Msg;
    this.ws.send(encodeMsg(msg));
    return new Promise((resolve, reject) => {
      const handler = (ev: MessageEvent) => {
        try {
          const m = parseMsg(ev.data as string);
          this.dispatch(m);
          if (m.type === 'KICK' && (!playerId || m.playerId === playerId)) {
            this.ws.removeEventListener('message', handler);
            reject(new Error('Kicked from room'));
            return;
          }
          if (m.type === 'JOIN' && m.playerId === playerId) {
            this.roomId = roomId;
            this.ws.removeEventListener('message', handler);
            resolve();
          }
        } catch (err) {
          this.ws.removeEventListener('message', handler);
          reject(err);
        }
      };
      this.ws.addEventListener('message', handler);
    });
  }

  /** send a seat selection to the server */
  seat(seat: number): void {
    if (!this.clientId) throw new Error('Not connected');
    this.ws.send(encodeMsg({ type: 'SEAT', playerId: this.clientId, seat }));
  }

  /** send an intent (game action) to the server */
  intent(seq: number, intent: any): void {
    if (!this.clientId) throw new Error('Not connected');
    const msg: Msg = {
      type: 'INTENT',
      playerId: this.clientId,
      seq,
      intent,
    } as Msg;
    this.ws.send(encodeMsg(msg));
  }

  /** Close the underlying websocket connection. */
  close() {
    this.manualClose = true;
    this.ws.close();
  }
}

// ---------------------------------------------------------------------------
// Utilities

/** generate a random numeric PIN string with the given length */
export function generatePin(length = 6): string {
  const digits = [] as string[];
  for (let i = 0; i < length; i += 1) {
    digits.push(Math.floor(Math.random() * 10).toString());
  }
  return digits.join('');
}

/** helper to create a client connected to the default signalling URL */
export async function connectToSignaling(
  url?: string,
): Promise<SignalingClient> {
  const target =
    url ||
    (typeof globalThis !== 'undefined' &&
      (globalThis as any).process?.env?.SIGNALING_URL) ||
    'ws://localhost:8787';
  const client = new SignalingClient(target);
  await client.connect();
  return client;
}

export default SignalingClient;
