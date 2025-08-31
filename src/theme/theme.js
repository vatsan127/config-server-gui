import { createTheme } from '@mui/material';
import { COLORS } from './colors';

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
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 400,
      fontSize: '2rem',
      color: COLORS.text.primary,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 0,
  },
  shadows: Array(25).fill('none'),
});