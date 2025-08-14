import React, { useEffect, useState } from 'react';
import { ToastProvider, useToast } from './Toaster';
import { LobbyJoin } from './LobbyJoin';

type Theme = 'light' | 'dark';

function applyTheme(theme: Theme) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(theme);
}

function AppContent() {
  const [theme, setTheme] = useState<Theme>('dark');
  const toast = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      applyTheme(stored);
    } else {
      const prefersDark = window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;
      const initial: Theme = prefersDark ? 'dark' : 'light';
      setTheme(initial);
      applyTheme(initial);
    }
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    localStorage.setItem('theme', next);
    toast(`Switched to ${next} mode`, 'success');
  };

  return (
    <div>
      <header>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          aria-pressed={theme === 'dark'}
        >
          {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </header>
      <LobbyJoin />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
