import React, { useState } from 'react';

interface Schema {
  properties: Record<string, any>;
}

export default function useGameSchema(schema: Schema) {
  const [state, setState] = useState<Record<string, any>>({});
  const elements = Object.entries(schema.properties || {}).map(([key, def]) => {
    if (def.type === 'number') {
      return (
        <label key={key}>
          {key}
          <input
            aria-label={key}
            type="number"
            onChange={(e) =>
              setState({ ...state, [key]: Number(e.target.value) })
            }
          />
        </label>
      );
    }
    if (def.type === 'boolean') {
      return (
        <label key={key}>
          {key}
          <input
            aria-label={key}
            type="checkbox"
            onChange={(e) => setState({ ...state, [key]: e.target.checked })}
          />
        </label>
      );
    }
    if (def.enum) {
      return (
        <label key={key}>
          {key}
          <select
            aria-label={key}
            onChange={(e) => setState({ ...state, [key]: e.target.value })}
          >
            {def.enum.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      );
    }
    if (def.type === 'array' && def.items?.enum) {
      return (
        <div key={key}>
          {def.items.enum.map((opt: string) => (
            <label key={opt}>
              {opt}
              <input
                aria-label={opt}
                type="checkbox"
                onChange={(e) => {
                  const arr = Array.isArray(state[key]) ? [...state[key]] : [];
                  if (e.target.checked) arr.push(opt);
                  else arr.splice(arr.indexOf(opt), 1);
                  setState({ ...state, [key]: arr });
                }}
              />
            </label>
          ))}
        </div>
      );
    }
    return null;
  });
  return { elements, state };
}
