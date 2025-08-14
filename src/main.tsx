import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './theme.css';

// The entry point for the Deck Arcade application. It mounts the
// root React component into the DOM. We use React's strict mode
// during development to surface potential issues early.
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
