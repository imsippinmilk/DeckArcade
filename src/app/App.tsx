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
