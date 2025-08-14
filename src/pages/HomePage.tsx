import React from 'react';
import { theme } from '../ui/theme';
import Button from '../ui/Button';
import TextChat from '../comms/TextChat';

// A small catalogue preview for the home page. Only slugs are stored here;
// details can be fetched from a proper catalogue service in the future.
const catalogPreview = {
  items: [
    'blackjack',
    'poker-holdem',
    'war',
    'hearts',
    'spades',
    'gin-rummy',
    'crazy-eights',
    'solitaire-klondike',
    'euchre',
    'baccarat',
    'cribbage',
    'rummy-500',
  ],
};

/**
 * Home page component. Renders the hero, navigation and a preview of the
 * game catalogue. This is step one of the build process outlined in
 * the specification. Styling is kept inline for brevity; consider
 * extracting to styled components or CSS modules as the codebase
 * matures.
 */
const HomePage: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: theme.colors.bg,
        color: theme.colors.text,
        minHeight: '100vh',
        fontFamily: theme.typography.body,
      }}
    >
      <header
        style={{
          padding: theme.spaceScale[5],
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: theme.typography.display,
            fontSize: '1.75rem',
          }}
        >
          DeckArcade
        </h1>
        <nav>
          <a
            href="/"
            style={{
              marginRight: theme.spaceScale[4],
              color: theme.colors.text,
              textDecoration: 'none',
            }}
          >
            Home
          </a>
          <a
            href="/games"
            style={{
              marginRight: theme.spaceScale[4],
              color: theme.colors.text,
              textDecoration: 'none',
            }}
          >
            Games
          </a>
          <a
            href="/host"
            style={{ color: theme.colors.text, textDecoration: 'none' }}
          >
            Host
          </a>
        </nav>
      </header>
      <main>
        <section
          style={{
            padding: theme.spaceScale[6],
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: '2.5rem',
              fontFamily: theme.typography.display,
              marginBottom: theme.spaceScale[3],
            }}
          >
            Jump into fast, beautiful card games.
          </h2>
          <p
            style={{
              fontSize: '1.25rem',
              color: theme.colors.muted,
              marginBottom: theme.spaceScale[5],
            }}
          >
            Blackjack now. Poker, War & more next. Join by PIN or host locally.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: theme.spaceScale[3],
            }}
          >
            <Button variant="primary">Host a Table</Button>
            <Button variant="outline">Join with PIN</Button>
          </div>
        </section>
        <section
          style={{
            padding: theme.spaceScale[6],
          }}
        >
          <h3
            style={{
              fontSize: '1.5rem',
              fontFamily: theme.typography.display,
              marginBottom: theme.spaceScale[4],
            }}
          >
            Featured Games
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: theme.spaceScale[4],
            }}
          >
            {catalogPreview.items.slice(0, 6).map((slug) => (
              <div
                key={slug}
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radius.md,
                  boxShadow: theme.shadows.card,
                  height: '200px',
                }}
              />
            ))}
          </div>
        </section>
      </main>
      <TextChat />
    </div>
  );
};

export default HomePage;
