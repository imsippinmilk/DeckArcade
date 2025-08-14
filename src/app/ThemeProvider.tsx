import React, { useEffect, useState } from 'react';

type Mode = 'auto' | 'light' | 'dark';

interface Props {
  initialMode?: Mode;
  children?: React.ReactNode;
}

export const ThemeProvider = ({ initialMode = 'auto', children }: Props) => {
  const [mode, setMode] = useState<Mode>(
    () => (localStorage.getItem('da_theme') as Mode) || initialMode,
  );

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia?.(
      '(prefers-color-scheme: dark)',
    ).matches;
    const resolved = mode === 'auto' ? (systemDark ? 'dark' : 'light') : mode;
    root.setAttribute('data-theme', resolved);
    localStorage.setItem('da_theme', mode);
  }, [mode]);

  return (
    <div>
      <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 50 }}>
        <select
          aria-label="Theme mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
        >
          <option value="auto">Auto</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      {children}
    </div>
  );
};
