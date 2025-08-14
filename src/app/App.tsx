import React, { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function applyTheme(theme: Theme) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(theme);
}

export default function App() {
  const [theme, setTheme] = useState<Theme>('dark');

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
  };

  return (
    <div>
      <header>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </header>
      <main>
        <h1>Deck Arcade</h1>
        <p>The current theme is {theme} mode.</p>
        <div className="table">Table preview</div>
      </main>
    </div>
  );
}
