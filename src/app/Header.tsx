import React from 'react';
import { Link } from './router';

interface HeaderProps {
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ children }) => (
  <header
    className="container"
    style={{
      padding: '1rem 0',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}
  >
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: '1.25rem',
      }}
    >
      DeckArcade
    </div>
    <nav style={{ marginLeft: 'auto', display: 'flex', gap: '.75rem' }}>
      <Link href="/">Home</Link>
      <Link href="/games">Games</Link>
      <Link href="/quick">Quick Play</Link>
      <Link href="/host">Host</Link>
      <Link href="/how">How It Works</Link>
    </nav>
    {children}
  </header>
);
