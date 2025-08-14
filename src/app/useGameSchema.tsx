import React from 'react';

type Schema = {
  properties: Record<string, any>;
};

export default function useGameSchema(schema: Schema) {
  const elements = React.useMemo(() => {
    const els: React.ReactNode[] = [];
    for (const [name, prop] of Object.entries(schema.properties)) {
      if (prop.type === 'number') {
        els.push(
          <label key={name}>
            {name}
            <input aria-label={name} type="number" />
          </label>,
        );
      } else if (prop.type === 'boolean') {
        els.push(
          <label key={name}>
            {name}
            <input aria-label={name} type="checkbox" />
          </label>,
        );
      } else if (prop.enum) {
        els.push(
          <label key={name}>
            {name}
            <select aria-label={name}>
              {prop.enum.map((v: string) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>,
        );
      } else if (prop.type === 'array' && prop.items?.enum) {
        els.push(
          <div key={name}>
            {prop.items.enum.map((v: string) => (
              <label key={v}>
                {v}
                <input aria-label={v} type="checkbox" value={v} />
              </label>
            ))}
          </div>,
        );
      }
    }
    return els;
  }, [schema]);
  return { elements };
}
