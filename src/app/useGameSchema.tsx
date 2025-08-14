import React, { useCallback, useMemo, useState } from 'react';

export interface UseGameSchemaResult {
  elements: React.ReactNode[];
  currentValues: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

interface SchemaProperty {
  type?: string;
  enum?: unknown[];
  const?: unknown;
  default?: unknown;
  items?: { enum?: unknown[] };
}

export default function useGameSchema(
  gameSettingsSchema: { properties?: Record<string, SchemaProperty> } = {},
): UseGameSchemaResult {
  const properties = gameSettingsSchema.properties ?? {};

  const initialValues = useMemo(() => {
    const values: Record<string, unknown> = {};
    Object.entries(properties).forEach(([key, prop]) => {
      if (prop.default !== undefined) {
        values[key] = prop.default;
      } else if (prop.type === 'boolean') {
        values[key] = false;
      } else if (prop.type === 'number') {
        values[key] = 0;
      } else if (prop.enum && prop.enum.length > 0) {
        values[key] = prop.enum[0];
      } else if (prop.const !== undefined) {
        values[key] = prop.const;
      } else if (prop.type === 'array') {
        values[key] = [];
      }
    });
    return values;
  }, [properties]);

  const [currentValues, setCurrentValues] =
    useState<Record<string, unknown>>(initialValues);

  const onChange = useCallback((key: string, value: unknown) => {
    setCurrentValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const elements = useMemo(() => {
    return Object.entries(properties).map(([key, prop]) => {
      if (prop.type === 'number') {
        return (
          <label key={key}>
            {key}
            <input
              type="number"
              value={currentValues[key] as number | ''}
              onChange={(e) => onChange(key, Number(e.target.value))}
            />
          </label>
        );
      }
      if (prop.type === 'boolean') {
        return (
          <label key={key}>
            {key}
            <input
              type="checkbox"
              checked={Boolean(currentValues[key])}
              onChange={(e) => onChange(key, e.target.checked)}
            />
          </label>
        );
      }
      if (prop.enum || prop.const !== undefined) {
        const options = prop.enum ?? [prop.const];
        return (
          <label key={key}>
            {key}
            <select
              value={currentValues[key] as string}
              onChange={(e) => onChange(key, e.target.value)}
            >
              {options.map((opt) => (
                <option key={String(opt)} value={String(opt)}>
                  {String(opt)}
                </option>
              ))}
            </select>
          </label>
        );
      }
      if (prop.type === 'array' && prop.items?.enum) {
        const options = prop.items.enum;
        const selected = Array.isArray(currentValues[key])
          ? (currentValues[key] as unknown[])
          : [];
        return (
          <fieldset key={key}>
            <legend>{key}</legend>
            {options.map((opt) => {
              const strOpt = String(opt);
              const isChecked = selected.includes(opt);
              return (
                <label key={strOpt}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const next = new Set(selected);
                      if (e.target.checked) {
                        next.add(opt);
                      } else {
                        next.delete(opt);
                      }
                      onChange(key, Array.from(next));
                    }}
                  />
                  {strOpt}
                </label>
              );
            })}
          </fieldset>
        );
      }
      return null;
    });
  }, [properties, currentValues, onChange]);

  return { elements, currentValues, onChange };
}
