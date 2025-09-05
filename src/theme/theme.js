import { createTheme } from '@mui/material';
import { COLORS, SIZES } from './colors';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: {
      default: COLORS.background.default,
      paper: COLORS.background.paper,
    },
    text: {
      primary: COLORS.text.primary,
      secondary: COLORS.text.secondary,
    },
    grey: COLORS.grey,
    success: {
      main: COLORS.alerts.success,
      light: COLORS.success.background,
      dark: COLORS.success.text,
    },
    error: {
      main: COLORS.alerts.error,
      light: COLORS.error.background,
      dark: COLORS.error.text,
    },
    warning: {
      main: COLORS.alerts.warning,
      light: COLORS.warning.background,
      dark: COLORS.warning.text,
    },
    info: {
      main: COLORS.alerts.info,
      light: COLORS.accent.blue,
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 600,
      fontSize: '3rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      color: COLORS.text.primary,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      color: COLORS.text.primary,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.875rem',
      lineHeight: 1.3,
      color: COLORS.text.primary,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: COLORS.text.primary,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      color: COLORS.text.primary,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      color: COLORS.text.primary,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: COLORS.text.secondary,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: COLORS.text.secondary,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: COLORS.text.primary,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: COLORS.text.secondary,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: COLORS.text.muted,
    },
  },
  shape: {
    borderRadius: SIZES.borderRadius.medium,
  },
  shadows: [
    'none',
    SIZES.shadow.sm,
    SIZES.shadow.base,
    SIZES.shadow.md,
    SIZES.shadow.lg,
    SIZES.shadow.xl,
    ...Array(19).fill(SIZES.shadow.xl),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: SIZES.borderRadius.medium,
          fontWeight: 500,
          textTransform: 'none',
          padding: '8px 16px',
          transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          boxShadow: SIZES.shadow.sm,
          '&:hover': {
            boxShadow: SIZES.shadow.md,
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: SIZES.borderRadius.medium,
          boxShadow: SIZES.shadow.base,
          border: `1px solid ${COLORS.grey[200]}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: SIZES.borderRadius.medium,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: COLORS.grey[400],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: COLORS.primary.main,
              borderWidth: 2,
            },
          },
        },
      },
    },
  },
});