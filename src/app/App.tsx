import React, { useEffect, useState } from 'react';
import { ToastProvider, useToast } from './Toaster';
import { Header } from './Header';

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
      <Header>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          aria-pressed={theme === 'dark'}
        >
          {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </Header>
      <main role="main">
        <h1>Deck Arcade</h1>
        <p>The current theme is {theme} mode.</p>
        <div className="table" role="img" aria-label="Table preview" />
      </main>
    </div>
  );
}

import React from 'react';
import '../styles/global.css';
import { ThemeProvider } from './ThemeProvider';
import { Header } from './Header';
import { Router } from './router';
import { Home } from './Home';
import { Games } from './Games';
import { Host } from './Host';


export default function App() {
  const routes = [
    {
      path: '/',
      element: (
        <>
          <Header />
          <Home />
        </>
      ),
    },
    {
      path: '/games',
      element: (
        <>
          <Header />
          <Games />
        </>
      ),
    },
    {
      path: '/quick',
      element: (
        <>
          <Header />
          <Games />
        </>
      ),
    },
    {
      path: '/host',
      element: (
        <>
          <Header />
          <Host />
        </>
      ),
    },
    {
      path: '/how',
      element: (
        <>
          <Header />
          <div className="container">
            <h2>How It Works</h2>
            <p>Join by PIN or host locally with WebRTC.</p>
          </div>
        </>
      ),
    },
  ];
  return (
    <ThemeProvider>
      <Router routes={routes} />
    </ThemeProvider>
  );
}
