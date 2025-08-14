import React from 'react';
import useGameSchema from './useGameSchema';
import { sessionStore } from '../store/session';

interface Props {
  gameName: string;
  gameSettingsSchema: any;
}

export default function HostPanel({ gameName, gameSettingsSchema }: Props) {
  const { elements, state } = useGameSchema(gameSettingsSchema);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStore.createTable({ game: gameName, ...state });
  };
  return (
    <form onSubmit={handleSubmit}>
      {elements}
      <button type="submit">Start table</button>
    </form>
  );
}
