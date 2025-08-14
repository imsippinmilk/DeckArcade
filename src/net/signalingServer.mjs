import { WebSocketServer } from 'ws';
import { encodeMsg, parseMsg, hashState } from './protocol.js';
import { randomUUID } from 'node:crypto';
import { Filter } from 'bad-words';

const rooms = new Map();
const resumeTokens = new Map();
const MAX_ROLLBACK = 20;
const RATE_WINDOW = 10_000;
const MAX_MSGS = 8;
const MAX_LEN = 200;
const filter = new Filter();
const rateLimit = new Map();

function getRoom(roomId) {
  return rooms.get(roomId);
}

function broadcast(room, msg, except) {
  const data = encodeMsg(msg);
  for (const [id, p] of Object.entries(room.players)) {
    if (id === except) continue;
    p.socket.send(data);
  }
}

export function startSignalingServer({ port = 8080 } = {}) {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws) => {
    const clientId = randomUUID();
    ws.send(encodeMsg({ type: 'HELLO', clientId }));
    let joinedRoomId = null;

    ws.on('message', async (raw) => {
      let msg;
      try {
        msg = parseMsg(raw.toString());
      } catch (e) {
        return;
      }

      switch (msg.type) {
        case 'CREATE_ROOM': {
          const roomId = msg.roomId || randomUUID();
          rooms.set(roomId, {
            roomId,
            pin: msg.pin,
            players: {},
            seats: {},
            seq: 0,
            states: [],
          });
          ws.send(encodeMsg({ type: 'CREATE_ROOM', roomId }));
          break;
        }
        case 'JOIN': {
          let room = getRoom(msg.roomId);
          if (!room) {
            room = {
              roomId: msg.roomId,
              pin: msg.pin,
              players: {},
              seats: {},
              seq: 0,
              states: [],
            };
            rooms.set(msg.roomId, room);
          }
          if (room.pin && room.pin !== msg.pin) {
            ws.send(encodeMsg({ type: 'KICK', playerId: clientId }));
            break;
          }
          room.players[clientId] = { socket: ws };
          joinedRoomId = room.roomId;
          broadcast(room, { type: 'JOIN', roomId: room.roomId, playerId: clientId, profile: msg.profile });
          const resumeToken = randomUUID();
          resumeTokens.set(resumeToken, { roomId: room.roomId, playerId: clientId, seq: room.seq });
          ws.send(encodeMsg({ type: 'RESUME_TOKEN', resumeToken }));
          if (room.states.length) {
            const last = room.states[room.states.length - 1];
            ws.send(encodeMsg({
              type: 'STATE_SNAPSHOT',
              seq: last.seq,
              state: last.state,
              checksum: last.checksum,
            }));
          }
          break;
        }
        case 'LEAVE': {
          const room = getRoom(msg.roomId);
          if (room && room.players[msg.playerId]) {
            delete room.players[msg.playerId];
            broadcast(room, msg, msg.playerId);
          }
          break;
        }
        case 'SEAT': {
          const room = getRoom(joinedRoomId);
          if (room) {
            room.seats[msg.playerId] = msg.seat;
            broadcast(room, msg, clientId);
          }
          break;
        }
        case 'READY':
        case 'MUTE':
        case 'KICK': {
          const room = getRoom(joinedRoomId);
          if (room) broadcast(room, msg, clientId);
          break;
        }
        case 'CHAT': {
          const room = getRoom(joinedRoomId);
          if (room) {
            const now = Date.now();
            const times = rateLimit.get(clientId) || [];
            const recent = times.filter((t) => now - t < RATE_WINDOW);
            if (recent.length >= MAX_MSGS) break;
            recent.push(now);
            rateLimit.set(clientId, recent);
            let text = String(msg.message || '').slice(0, MAX_LEN);
            text = filter.clean(text);
            const out = { type: 'CHAT', playerId: clientId, message: text, ts: now };
            broadcast(room, out, null);
          }
          break;
        }
        case 'RTC_OFFER':
        case 'RTC_ANSWER': {
          const room = getRoom(joinedRoomId);
          if (room) broadcast(room, msg, clientId);
          break;
        }
        case 'INTENT': {
          const room = getRoom(joinedRoomId);
          if (room) {
            room.seq += 1;
            const seq = room.seq;
            const intentMsg = { ...msg, seq };
            broadcast(room, intentMsg, null);
          }
          break;
        }
        case 'STATE_HASH': {
          const room = getRoom(joinedRoomId);
          if (room) {
            const last = room.states.find((s) => s.seq === msg.seq);
            if (!last || last.checksum !== msg.checksum) {
              const latest = room.states[room.states.length - 1];
              if (latest) {
                ws.send(encodeMsg({
                  type: 'STATE_SNAPSHOT',
                  seq: latest.seq,
                  state: latest.state,
                  checksum: latest.checksum,
                }));
              }
            }
          }
          break;
        }
        case 'STATE_SNAPSHOT': {
          const room = getRoom(joinedRoomId);
          if (room) {
            const checksum = await hashState(msg.state);
            room.states.push({ state: msg.state, seq: msg.seq, checksum });
            if (room.states.length > MAX_ROLLBACK) room.states.shift();
            broadcast(room, msg, clientId);
          }
          break;
        }
        case 'HELLO': {
          if (!msg.resumeToken) break;
          const resume = resumeTokens.get(msg.resumeToken);
          if (!resume) break;
          const room = getRoom(resume.roomId);
          if (!room) break;
          joinedRoomId = resume.roomId;
          room.players[resume.playerId] = { socket: ws };
          ws.send(encodeMsg({ type: 'HELLO', clientId: resume.playerId }));
          const seat = room.seats[resume.playerId];
          if (seat !== undefined) {
            ws.send(encodeMsg({ type: 'SEAT', playerId: resume.playerId, seat }));
          }
          const last = room.states[room.states.length - 1];
          if (last) {
            ws.send(encodeMsg({
              type: 'STATE_SNAPSHOT',
              seq: last.seq,
              state: last.state,
              checksum: last.checksum,
            }));
          }
          break;
        }
        default:
          break;
      }
    });

    ws.on('close', () => {
      if (joinedRoomId) {
        const room = getRoom(joinedRoomId);
        if (room && room.players[clientId]) {
          delete room.players[clientId];
          broadcast(room, { type: 'LEAVE', roomId: joinedRoomId, playerId: clientId }, clientId);
        }
      }
      rateLimit.delete(clientId);
    });
  });

  return wss;
}
