export const theme = {
  colors: {
    bg: '#0a0e10',
    surface: '#121719',
    surfaceAlt: '#0f1416',
    accentPrimary: '#17bebb',
    accentSecondary: '#e94e77',
    accentTertiary: '#ffc145',
    text: '#eef2f5',
    muted: '#90a4ae',
    success: '#3ddc84',
    warning: '#ffb300',
    danger: '#ff5a5a',
    cardFelt: '#0e3b2e',
  },
  radius: { sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
  shadows: { card: '0 0.75rem 1.75rem rgba(0,0,0,0.35)' },
  typography: {
    display: 'Plus Jakarta Sans',
    body: 'Inter',
    mono: 'JetBrains Mono',
    fallbacks: ['system-ui', '-apple-system', 'Segoe UI', 'Arial'],
  },
  spaceScale: [
    '0',
    '0.25rem',
    '0.5rem',
    '0.75rem',
    '1rem',
    '1.5rem',
    '2rem',
    '3rem',
  ],
  layout: {
    maxWidth: '82.5rem',
    gutter: '1rem',
    breakpoints: {
      xs: '22.5em',
      sm: '40em',
      md: '48em',
      lg: '64em',
      xl: '80em',
    },
  },
  animations: {
    durationMs: { xFast: 90, fast: 150, base: 220, slow: 320, xSlow: 500 },
    easings: {
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};
export default theme;
