import React from 'react';
import HomePage from '../pages/HomePage';
import { SolitaireUI } from '../games/solitaire';

/**
 * Root application component. For now the app simply renders
 * the Home page. As the project evolves this file can be
 * extended to include routing between pages and lazy loading of
 * individual game modules.
 */
const App: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('game') === 'solitaire') {
    return <SolitaireUI />;
  }
  return <HomePage />;
};

export default App;
