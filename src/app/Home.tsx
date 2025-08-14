import React, { useRef, useEffect } from 'react';
import { Link } from './router';
import { Animations } from '../animations';

export const Home: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) Animations.play('highlightPulse', ref.current);
  }, []);
  return (
    <main className="container" style={{ display: 'grid', gap: '1rem' }}>
      <section className="card" style={{ padding: '2rem' }}>
        <h1
          style={{
            marginTop: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
          }}
        >
          Jump into fast, beautiful card games.
        </h1>
        <p>Blackjack now. Poker, War & more next.</p>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <Link href="/quick">Quick Play</Link>
          <Link href="/host">Host a Table</Link>
        </div>
      </section>
      <section className="card" style={{ padding: '1rem 1rem 1.25rem' }}>
        <h3 style={{ marginTop: 0 }}>Featured</h3>
        <div
          ref={ref}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          <GameCard title="Blackjack" to="/games#blackjack" />
          <GameCard title="War" to="/games#war" />
          <GameCard title="Hearts" to="/games#hearts" />
        </div>
      </section>
    </main>
  );
};

const GameCard: React.FC<{ title: string; to: string }> = ({ title, to }) => (
  <Link href={to}>
    <div
      className="card"
      style={{ padding: '1rem', display: 'grid', gap: '.5rem' }}
    >
      <div
        style={{
          height: 120,
          background: 'var(--surfaceAlt)',
          borderRadius: 'var(--radius-md)',
        }}
      />
      <strong>{title}</strong>
      <span style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
        Fast. Fair. Fun.
      </span>
    </div>
  </Link>
);
