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
    sidebar: '#000000',
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
    sidebar: '#1a1a1a',
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
    width: 180,
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
    small: 6,
    medium: 8,
    large: 12,
    xl: 16,
  },
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  }
};

// Common button styles
export const BUTTON_STYLES = {
  primary: {
    bgcolor: COLORS.primary.main,
    color: COLORS.text.white,
    borderRadius: `${SIZES.borderRadius.medium}px`,
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': { 
      bgcolor: COLORS.primary.dark,
    }
  },
  secondary: {
    bgcolor: 'transparent',
    color: COLORS.text.secondary,
    border: `1px solid ${COLORS.grey[300]}`,
    borderRadius: `${SIZES.borderRadius.medium}px`,
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': { 
      bgcolor: COLORS.grey[50],
      borderColor: COLORS.grey[400],
    }
  },
  ghost: {
    bgcolor: 'transparent',
    color: COLORS.text.primary,
    borderRadius: `${SIZES.borderRadius.medium}px`,
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': { 
      bgcolor: COLORS.hover.button,
    }
  }
};