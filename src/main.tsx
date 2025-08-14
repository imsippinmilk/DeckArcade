import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './theme.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
