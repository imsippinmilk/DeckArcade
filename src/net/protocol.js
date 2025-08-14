import { z } from 'zod';
import xxhash from 'xxhash-wasm';

export const MsgSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('HELLO'),
    clientId: z.string().optional(),
    resumeToken: z.string().optional(),
  }),
  z.object({
    type: z.literal('CREATE_ROOM'),
    roomId: z.string().optional(),
    pin: z.string().optional(),
    config: z.record(z.any()).optional(),
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
  z.object({ type: z.literal('SEAT'), playerId: z.string(), seat: z.number() }),
  z.object({
    type: z.literal('READY'),
    playerId: z.string(),
    ready: z.boolean(),
  }),
  z.object({ type: z.literal('PAUSE'), roomId: z.string().optional() }),
  z.object({ type: z.literal('RESUME'), roomId: z.string().optional() }),
  z.object({ type: z.literal('END_GAME'), roomId: z.string().optional() }),
  z.object({
    type: z.literal('INTENT'),
    playerId: z.string(),
    seq: z.number(),
    intent: z.any(),
  }),
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
  z.object({ type: z.literal('RESUME_TOKEN'), resumeToken: z.string() }),
  z.object({ type: z.literal('KICK'), playerId: z.string() }),
  z.object({
    type: z.literal('MUTE'),
    playerId: z.string(),
    muted: z.boolean(),
    reason: z.string().optional(),
  }),
  z.object({
    type: z.literal('CHAT'),
    playerId: z.string().optional(),
    message: z.string(),
    ts: z.number().optional(),
  }),
  // WebRTC signalling for voice chat
  z.object({ type: z.literal('RTC_OFFER'), sdp: z.string(), from: z.string() }),
  z.object({
    type: z.literal('RTC_ANSWER'),
    sdp: z.string(),
    from: z.string(),
  }),
]);

export const encodeMsg = (msg) => JSON.stringify(msg);
export const parseMsg = (raw) => MsgSchema.parse(JSON.parse(raw));

let hasherPromise = null;
function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === 'object') {
    const sorted = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortObject(value[key]);
    }
    return sorted;
  }
  return value;
}
export async function hashState(state) {
  if (!hasherPromise) hasherPromise = xxhash();
  const api = await hasherPromise;
  const stable = JSON.stringify(sortObject(state));
  return api.h64ToString(stable);
}
