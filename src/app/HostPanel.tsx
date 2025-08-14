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

import React, { useState } from 'react';
import { sessionStore } from '../store/session';

interface HostPanelProps {
  gameName: string;
  gameSettingsSchema: {
    properties?: Record<string, any>;
  };
}

const HostPanel: React.FC<HostPanelProps> = ({
  gameName,
  gameSettingsSchema,
}) => {
  const properties = gameSettingsSchema?.properties || {};
  const [settings, setSettings] = useState<Record<string, any>>({});

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (key: string, schema: any) => {
    const common: any = {};
    if (schema.minimum !== undefined) common.min = schema.minimum;
    if (schema.maximum !== undefined) common.max = schema.maximum;
    const value = settings[key];

    if (Array.isArray(schema.enum)) {
      return (
        <label key={key} style={{ display: 'block', marginBottom: '0.5rem' }}>
          {key}
          <select
            value={value ?? schema.enum[0] ?? ''}
            onChange={(e) => handleChange(key, e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          >
            {schema.enum.map((opt: any) => (
              <option key={String(opt)} value={opt}>
                {String(opt)}
              </option>
            ))}
          </select>
        </label>
      );
    }

    if (schema.type === 'boolean') {
      return (
        <label key={key} style={{ display: 'block', marginBottom: '0.5rem' }}>
          {key}
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleChange(key, e.target.checked)}
            style={{ marginLeft: '0.5rem' }}
          />
        </label>
      );
    }

    if (schema.type === 'number' || schema.type === 'integer') {
      return (
        <label key={key} style={{ display: 'block', marginBottom: '0.5rem' }}>
          {key}
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => handleChange(key, e.target.value)}
            {...common}
            style={{ marginLeft: '0.5rem' }}
          />
        </label>
      );
    }

    return (
      <label key={key} style={{ display: 'block', marginBottom: '0.5rem' }}>
        {key}
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => handleChange(key, e.target.value)}
          style={{ marginLeft: '0.5rem' }}
        />
      </label>
    );
  };

  const startTable = () => {
    const config: Record<string, any> = {};
    for (const [key, schema] of Object.entries(properties)) {
      let value = settings[key];
      if (schema.type === 'number' || schema.type === 'integer') {
        const num = Number(value);
        if (!Number.isNaN(num)) value = num;
      }
      config[key] = value;
    }
    sessionStore.createTable(config);
    // Networking and other side effects would be handled here in a full app
  };

  return (
    <div>
      {Object.entries(properties).map(([key, schema]) =>
        renderField(key, schema),
      )}
      <button onClick={startTable}>Start table</button>
    </div>
  );
};

export default HostPanel;