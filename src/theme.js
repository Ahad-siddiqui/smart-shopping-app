// Centralized design tokens so every screen shares the same look.
// Palette: deep teal brand (like OLX's signature dark teal/white look),
// warm orange accent for CTAs, neutral grays for text/borders.
export const COLORS = {
  brand: '#0f766e',
  brandDark: '#0c5c56',
  brandDarker: '#003632',
  accent: '#f97316',

  bg: '#f4f5f7',
  surface: '#ffffff',
  border: '#e8e8ea',
  borderStrong: '#d4d4d8',

  text: '#171717',
  textMuted: '#6b7280',
  textFaint: '#9ca3af',

  success: '#16a34a',
  danger: '#dc2626',
  warning: '#d97706',
  info: '#2563eb',
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  raised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};
