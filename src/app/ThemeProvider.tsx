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

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggle: () => {},
});

function applyTheme(theme: Theme) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;
    const initial: Theme = stored ?? (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    localStorage.setItem('theme', next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
