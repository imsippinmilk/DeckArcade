import React, { useEffect, useRef, useState } from 'react';
import useGameSchema from './useGameSchema';
import { sessionStore } from '../store/tableSession';
import { useToast } from './Toaster';

interface Props {
  gameName: string;
  gameSettingsSchema: any;
}

export default function HostPanel({ gameName, gameSettingsSchema }: Props) {
  const firstFieldRef = useRef<any>(null);
  const submitRef = useRef<HTMLButtonElement | null>(null);
  const { elements, state } = useGameSchema(gameSettingsSchema, firstFieldRef);
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, [elements]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    sessionStore.createTable({ game: gameName, ...state });
    toast('Table created', 'success');
    submitRef.current?.focus();
    setBusy(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {elements}
      <button ref={submitRef} type="submit" disabled={busy} aria-busy={busy}>
        {busy ? (
          <>
            <span className="spinner" aria-hidden="true" /> Creating...
          </>
        ) : (
          'Start table'
        )}
      </button>
    </form>
  );
}
