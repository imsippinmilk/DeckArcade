import React from 'react';
import { useTheme } from './ThemeProvider';

export function Home() {
  const { theme, toggle } = useTheme();
  return (
    <div className="container">
      <h2>Deck Arcade</h2>
      <p>The current theme is {theme} mode.</p>
      <button className="theme-toggle" onClick={toggle}>
        {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
    </div>
  );
}
