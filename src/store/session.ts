/**
 * Types and helpers relating to a player's session. Eventually this
 * module may use a state management library like Redux or Zustand,
 * but for now it simply defines a TypeScript interface.
 */
export interface Session {
  id: string;
  playerName: string;
  joinedAt?: number;
}