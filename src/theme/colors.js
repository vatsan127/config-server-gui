export const COLORS = {
  primary: {
    main: '#007BFF',
    dark: '#4F46E5',
    light: '#007BFF',
  },
  secondary: {
    main: '#F59E0B',
    dark: '#D97706',
    light: '#FCD34D',
  },
  background: {
    default: '#FAFBFC',
    paper: '#FFFFFF',
    sidebar: '#063970',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    white: '#FFFFFF',
    muted: '#9CA3AF',
  },
  grey: {
    25: '#FCFCFD',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  accent: {
    blue: '#3B82F6',
    green: '#10B981',
    purple: '#007BFF',
    orange: '#F59E0B',
    pink: '#EC4899',
    teal: '#14B8A6',
  },
  warning: {
    background: '#FFFBEB',
    border: '#F59E0B',
    text: '#92400E',
  },
  success: {
    background: '#ECFDF5',
    border: '#10B981',
    text: '#065F46',
  },
  error: {
    background: '#FEF2F2',
    border: '#EF4444',
    text: '#991B1B',
  },
  hover: {
    sidebar: '#0a4d8a',
    card: '#F9FAFB',
    button: 'rgba(99, 102, 241, 0.08)',
  },
  alerts: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  }
};

export const SIZES = {
  navbar: {
    height: 40,
  },
  sidebar: {
    width: 220,
  },
  icon: {
    small: 16,
    medium: 20,
    large: 24,
    namespace: 48,
  },
  spacing: {
    xs: 4,    // 4px
    sm: 8,    // 8px  
    md: 16,   // 16px
    lg: 24,   // 24px
    xl: 32,   // 32px
    xxl: 48,  // 48px
  },
  borderRadius: {
    small: 0,
    medium: 0,
    large: 0,
    xl: 0,
  },
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  }
};

// Common button styles with Bootstrap-like hover effects
export const BUTTON_STYLES = {
  primary: {
    bgcolor: COLORS.primary.main,
    color: COLORS.text.white,
    borderRadius: `${SIZES.borderRadius.medium}px`,
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.15s ease-in-out',
    '&:hover': { 
      bgcolor: '#0056b3',
      boxShadow: '0 4px 8px rgba(0, 123, 255, 0.25)',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      bgcolor: '#004085',
      transform: 'translateY(0px)',
      boxShadow: '0 2px 4px rgba(0, 123, 255, 0.25)',
    }
  },
  secondary: {
    bgcolor: 'transparent',
    color: COLORS.text.secondary,
    border: `1px solid ${COLORS.grey[300]}`,
    borderRadius: `${SIZES.borderRadius.medium}px`,
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.15s ease-in-out',
    '&:hover': { 
      bgcolor: COLORS.grey[50],
      borderColor: COLORS.grey[400],
      color: COLORS.text.primary,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      bgcolor: COLORS.grey[100],
      transform: 'translateY(0px)',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    }
  },
  ghost: {
    bgcolor: 'transparent',
    color: COLORS.text.primary,
    borderRadius: `${SIZES.borderRadius.medium}px`,
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.15s ease-in-out',
    '&:hover': { 
      bgcolor: COLORS.hover.button,
      color: COLORS.primary.main,
      transform: 'translateY(-1px)',
    },
    '&:active': {
      bgcolor: 'rgba(99, 102, 241, 0.12)',
      transform: 'translateY(0px)',
    }
  },
  success: {
    bgcolor: COLORS.success.border,
    color: COLORS.text.white,
    borderRadius: `${SIZES.borderRadius.medium}px`,
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.15s ease-in-out',
    '&:hover': { 
      bgcolor: '#059669',
      boxShadow: '0 4px 8px rgba(16, 185, 129, 0.25)',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      bgcolor: '#047857',
      transform: 'translateY(0px)',
      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.25)',
    }
  },
  warning: {
    bgcolor: COLORS.warning.border,
    color: COLORS.text.white,
    borderRadius: `${SIZES.borderRadius.medium}px`,
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.15s ease-in-out',
    '&:hover': { 
      bgcolor: '#d97706',
      boxShadow: '0 4px 8px rgba(245, 158, 11, 0.25)',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      bgcolor: '#b45309',
      transform: 'translateY(0px)',
      boxShadow: '0 2px 4px rgba(245, 158, 11, 0.25)',
    }
  },
  danger: {
    bgcolor: COLORS.error.border,
    color: COLORS.text.white,
    borderRadius: `${SIZES.borderRadius.medium}px`,
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.15s ease-in-out',
    '&:hover': { 
      bgcolor: '#dc2626',
      boxShadow: '0 4px 8px rgba(239, 68, 68, 0.25)',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      bgcolor: '#b91c1c',
      transform: 'translateY(0px)',
      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.25)',
    }
  }
};