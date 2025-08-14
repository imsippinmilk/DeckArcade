/**
 * Shared animation tokens. These values define baseline durations,
 * delays and easing curves used throughout the application. When
 * editing these values, take care to honour users' reduced motion
 * preferences by scaling durations appropriately.
 */
export const animationTokens = {
  durationMs: {
    xFast: 90,
    fast: 150,
    base: 220,
    slow: 320,
    xSlow: 500
  },
  delayMs: {
    none: 0,
    tiny: 40,
    small: 80,
    medium: 120
  },
  easings: {
    standard: 'cubic-bezier(0.2, 0.0, 0.0, 1)',
    emphasized: 'cubic-bezier(0.2, 0.0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    springy: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
  }
};