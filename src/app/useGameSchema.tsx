import React, { useState } from 'react';

interface Schema {
  properties: Record<string, any>;
}

export default function useGameSchema(
  schema: Schema,
  firstFieldRef?: React.RefObject<any>,
) {
  const [state, setState] = useState<Record<string, any>>({});

  const elements = Object.entries(schema.properties || {}).map(
    ([key, def], index) => {
      const refProp =
        index === 0 && firstFieldRef ? { ref: firstFieldRef as any } : {};
      if (def.type === 'number') {
        return (
          <label key={key}>
            {key}
            <input
              {...refProp}
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
              {...refProp}
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
              {...refProp}
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
            {def.items.enum.map((opt: string, optIndex: number) => {
              const optRef =
                index === 0 && optIndex === 0 && firstFieldRef
                  ? { ref: firstFieldRef as any }
                  : {};
              return (
                <label key={opt}>
                  {opt}
                  <input
                    {...optRef}
                    aria-label={opt}
                    type="checkbox"
                    onChange={(e) => {
                      const arr = Array.isArray(state[key])
                        ? [...state[key]]
                        : [];
                      if (e.target.checked) arr.push(opt);
                      else arr.splice(arr.indexOf(opt), 1);
                      setState({ ...state, [key]: arr });
                    }}
                  />
                </label>
              );
            })}
          </div>
        );
      }
      return null;
    },
  );

  return { elements, state };
}
