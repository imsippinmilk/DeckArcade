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

export interface Table {
  id: string;
  config: Record<string, unknown>;
}

export const sessionStore = {
  tables: [] as Table[],
  createTable(config: Record<string, unknown>): Table {
    const snapshot = JSON.parse(JSON.stringify(config));
    const table: Table = {
      id: `table-${this.tables.length + 1}`,
      config: snapshot,
    };
    this.tables.push(table);
    return table;
  },
};
