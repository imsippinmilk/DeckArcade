import React from 'react';
import { ToastProvider } from './Toaster';

import React, { useEffect, useState } from 'react';
import { ToastProvider, useToast } from './Toaster';
import { LobbyJoin } from './LobbyJoin';

import { Header } from './Header';


type Theme = 'light' | 'dark';

function applyTheme(theme: Theme) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(theme);
}

function AppContent() {
  return (
    <div>
      <header>
        <h1>Deck Arcade</h1>
      </header>
      <Header>
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

      </Header>
      <main role="main">
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
