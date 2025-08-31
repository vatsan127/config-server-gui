export const COLORS = {
  primary: {
    main: '#2196F3',
    dark: '#1976D2',
    light: '#42A5F5',
  },
  secondary: {
    main: '#FF5722',
    dark: '#D84315',
    light: '#FF7043',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
    sidebar: '#000000',
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
    white: '#ffffff',
    muted: '#B0BEC5',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  warning: {
    background: '#FFF3E0',
    border: '#FF9800',
  },
  hover: {
    sidebar: '#333333',
    card: '#f5f5f5',
  },
  alerts: {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
  }
};

export const SIZES = {
  navbar: {
    height: 64, // Standard Material-UI AppBar height
  },
  sidebar: {
    width: 200,
  },
  icon: {
    small: 20,
    medium: 24,
    large: 28,
    namespace: 60,
  },
  spacing: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  }
};

// Common button styles
export const BUTTON_STYLES = {
  primary: {
    color: COLORS.primary.main,
    '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' }
  },
  secondary: {
    color: COLORS.text.secondary,
    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
  }
};