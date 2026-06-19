// TechTown Design Tokens — TypeScript
export const colors = {
  primary: '#1C62ED',
  primaryDark: '#1557D6',
  accent: '#3B7EFF',
  background: '#FFFFFF',
  backgroundAlt: '#F9FAFB',
  backgroundDark: '#1F2937',
  text: '#1F2937',
  textLight: '#6B7280',
  textWhite: '#FFFFFF',
  border: '#E5E7EB',
  // Dark mode
  dark: {
    background: '#0F172A',
    backgroundAlt: '#1E293B',
    text: '#F1F5F9',
    textLight: '#94A3B8',
    border: '#334155',
    primary: '#3B7EFF',
  },
} as const;

export const spacing = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;

export const typography = {
  fontFamily: '"Poppins", sans-serif',
  weights: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700 },
  sizes: {
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
} as const;
