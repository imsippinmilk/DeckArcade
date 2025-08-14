import React from 'react';
import HomePage from '../pages/HomePage';

/**
 * Root application component. For now the app simply renders
 * the Home page. As the project evolves this file can be
 * extended to include routing between pages and lazy loading of
 * individual game modules.
 */
const App: React.FC = () => {
  return <HomePage />;
};

export default App;