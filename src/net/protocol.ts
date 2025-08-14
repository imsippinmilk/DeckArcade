import { z } from 'zod';
import xxhash, { XXHashAPI } from 'xxhash-wasm';

/**
 * Message definitions for the signalling and lockstep protocol.
 * Each message carries a discriminant `type` that allows the Zod
 * runtime validator to perform strict checking.
 */

export const MsgSchema = z.discriminatedUnion('type', [
  // Initial handshake and resume support
  z.object({
    type: z.literal('HELLO'),
    clientId: z.string().optional(),
    resumeToken: z.string().optional(),
  }),

  // Room management
  z.object({
    type: z.literal('CREATE_ROOM'),
    roomId: z.string().optional(),
    pin: z.string().optional(),
    config: z.record(z.string(), z.any()).optional(),
  }),
  z.object({
    type: z.literal('JOIN'),
    roomId: z.string(),
    pin: z.string().optional(),
    playerId: z.string().optional(),
    profile: z
      .object({ name: z.string(), avatar: z.string().optional() })
      .optional(),
  }),
  z.object({
    type: z.literal('LEAVE'),
    roomId: z.string(),
    playerId: z.string(),
  }),

  // Table state
  z.object({ type: z.literal('SEAT'), playerId: z.string(), seat: z.number() }),
  z.object({
    type: z.literal('READY'),
    playerId: z.string(),
    ready: z.boolean(),
  }),

  // Host control messages
  z.object({ type: z.literal('PAUSE'), roomId: z.string().optional() }),
  z.object({ type: z.literal('RESUME'), roomId: z.string().optional() }),
  z.object({ type: z.literal('END_GAME'), roomId: z.string().optional() }),

  // Intent messages are sent in lockstep with a sequence number
  z.object({
    type: z.literal('INTENT'),
    playerId: z.string(),
    seq: z.number(),
    intent: z.any(),
  }),

  // Desync detection
  z.object({
    type: z.literal('STATE_HASH'),
    seq: z.number(),
    checksum: z.string(),
  }),
  z.object({
    type: z.literal('STATE_SNAPSHOT'),
    seq: z.number(),
    state: z.any(),
    checksum: z.string(),
  }),

  // Resume support
  z.object({ type: z.literal('RESUME_TOKEN'), resumeToken: z.string() }),

  // Moderation
  z.object({ type: z.literal('KICK'), playerId: z.string() }),
  z.object({
    type: z.literal('MUTE'),
    playerId: z.string(),
    muted: z.boolean(),
    reason: z.string().optional(),
  }),

  // Communications
  z.object({
    type: z.literal('CHAT'),
    playerId: z.string().optional(),
    message: z.string(),
    ts: z.number().optional(),
  }),

  // WebRTC signalling for voice chat
  z.object({
    type: z.literal('RTC_OFFER'),
    sdp: z.string(),
    from: z.string(),
  }),
  z.object({
    type: z.literal('RTC_ANSWER'),
    sdp: z.string(),
    from: z.string(),
  }),
]);

export type Msg = z.infer<typeof MsgSchema>;

export function encodeMsg(msg: Msg): string {
  return JSON.stringify(msg);
}

export function parseMsg(raw: string): Msg {
  const data = JSON.parse(raw);
  return MsgSchema.parse(data);
}

// ---------------------------------------------------------------------------
// Utilities

let hasher: Promise<XXHashAPI> | null = null;

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortObject((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

export async function hashState(state: unknown): Promise<string> {
  if (!hasher) hasher = xxhash();
  const api = await hasher;
  const stable = JSON.stringify(sortObject(state));
  return api.h64ToString(stable);
}
