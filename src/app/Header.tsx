import React from 'react';
import { navigate } from './router';

export function Header() {
  return (
    <header>
      <nav>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          Home
        </a>
        <a
          href="/games"
          onClick={(e) => {
            e.preventDefault();
            navigate('/games');
          }}
        >
          Games
        </a>
        <a
          href="/host"
          onClick={(e) => {
            e.preventDefault();
            navigate('/host');
          }}
        >
          Host
        </a>
        <a
          href="/how"
          onClick={(e) => {
            e.preventDefault();
            navigate('/how');
          }}
        >
          How
        </a>
      </nav>
    </header>
  );
}
