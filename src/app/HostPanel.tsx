import React, { useEffect } from 'react';
import useGameSchema from './useGameSchema';
import Button from '../ui/Button';
import { sessionStore } from '../store/session';

interface HostPanelProps {
  gameName: string;
  gameSettingsSchema: Record<string, unknown>;
}

const presetKey = (gameName: string) => `preset-${gameName}`;

const HostPanel: React.FC<HostPanelProps> = ({
  gameName,
  gameSettingsSchema,
}) => {
  const { elements, currentValues, onChange } =
    useGameSchema(gameSettingsSchema);

  useEffect(() => {
    const saved = localStorage.getItem(presetKey(gameName));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([k, v]) => onChange(k, v));
      } catch {
        /* ignore malformed presets */
      }
    }
  }, [gameName, onChange]);

  useEffect(() => {
    localStorage.setItem(presetKey(gameName), JSON.stringify(currentValues));
  }, [gameName, currentValues]);

  const startTable = () => {
    sessionStore.createTable(currentValues);
  };

  return (
    <div>
      {elements}
      <Button onClick={startTable}>Start table</Button>
    </div>
  );
};

export default HostPanel;
