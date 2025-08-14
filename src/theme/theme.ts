// Design tokens (aligned with README colors, radii, typography)
export const theme = {
  mode: 'auto' as 'auto' | 'light' | 'dark',
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
    display: '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", Arial',
    body: '"Inter", system-ui, -apple-system, "Segoe UI", Arial',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco',
  },
  space: [
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
    touchTargetsMinRem: 2.75,
  },
} as const;

export type Theme = typeof theme;
