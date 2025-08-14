import React from 'react';
import { ToastProvider } from './Toaster';

function AppContent() {
  return (
    <div>
      <header>
        <h1>Deck Arcade</h1>
      </header>
      <main role="main">
        <div className="table" role="img" aria-label="Table preview" />
      </main>
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
