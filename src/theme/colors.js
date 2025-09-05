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
    main: '#F59E0B',
    light: '#FFFBEB',
    dark: '#D97706',
    background: '#FFFBEB',
    border: '#F59E0B',
    text: '#92400E',
  },
  success: {
    main: '#10B981',
    light: '#ECFDF5',
    dark: '#059669',
    background: '#ECFDF5',
    border: '#10B981',
    text: '#065F46',
  },
  error: {
    main: '#EF4444',
    light: '#FEF2F2',
    dark: '#DC2626',
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
    small: 4,
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
    card: '0 2px 8px rgba(0, 0, 0, 0.08)',
    elevated: '0 4px 16px rgba(0, 0, 0, 0.12)',
    floating: '0 8px 32px rgba(0, 0, 0, 0.16)',
    hover: '0 6px 20px rgba(0, 0, 0, 0.15)',
  }
};

// Enhanced button styles with modern hover effects
export const BUTTON_STYLES = {
  primary: {
    bgcolor: COLORS.primary.main,
    color: COLORS.text.white,
    borderRadius: `${SIZES.borderRadius.medium}px`,
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: SIZES.shadow.sm,
    border: 'none',
    position: 'relative',
    overflow: 'hidden',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
      opacity: 0,
      transition: 'opacity 0.1s ease',
    },
    '&:hover': { 
      bgcolor: '#0056b3',
      boxShadow: SIZES.shadow.elevated,
      transform: 'translateY(-2px) scale(1.02)',
      '&:before': {
        opacity: 1,
      }
    },
    '&:active': {
      bgcolor: '#004085',
      transform: 'translateY(-1px) scale(1.01)',
      boxShadow: SIZES.shadow.md,
    },
    '&:focus': {
      outline: `3px solid ${COLORS.primary.main}40`,
      outlineOffset: '2px',
    }
  },
  secondary: {
    bgcolor: COLORS.background.paper,
    color: COLORS.text.secondary,
    border: `1px solid ${COLORS.grey[300]}`,
    borderRadius: `${SIZES.borderRadius.medium}px`,
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, ${COLORS.grey[100]}, ${COLORS.grey[50]})`,
      opacity: 0,
      transition: 'opacity 0.1s ease',
    },
    '&:hover': { 
      bgcolor: COLORS.grey[25],
      borderColor: COLORS.grey[400],
      color: COLORS.text.primary,
      boxShadow: SIZES.shadow.md,
      transform: 'translateY(-1px) scale(1.01)',
      '&:before': {
        opacity: 1,
      }
    },
    '&:active': {
      bgcolor: COLORS.grey[100],
      transform: 'translateY(0px) scale(1.00)',
      boxShadow: SIZES.shadow.sm,
    },
    '&:focus': {
      outline: `3px solid ${COLORS.grey[400]}40`,
      outlineOffset: '2px',
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
  gradient: {
    background: `linear-gradient(135deg, ${COLORS.primary.main}, ${COLORS.primary.dark})`,
    color: COLORS.text.white,
    borderRadius: `${SIZES.borderRadius.medium}px`,
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: SIZES.shadow.md,
    border: 'none',
    position: 'relative',
    overflow: 'hidden',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, ${COLORS.primary.dark}, #2563eb)`,
      opacity: 0,
      transition: 'opacity 0.15s ease',
    },
    '&:hover': {
      transform: 'translateY(-3px) scale(1.02)',
      boxShadow: SIZES.shadow.floating,
      '&:before': {
        opacity: 1,
      }
    },
    '&:active': {
      transform: 'translateY(-1px) scale(1.01)',
      boxShadow: SIZES.shadow.elevated,
    }
  },
  floating: {
    bgcolor: COLORS.background.paper,
    color: COLORS.text.primary,
    borderRadius: `${SIZES.borderRadius.xl}px`,
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: SIZES.shadow.floating,
    border: `1px solid ${COLORS.grey[200]}`,
    backdropFilter: 'blur(10px)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      bgcolor: COLORS.grey[25],
      borderColor: COLORS.primary.main,
      color: COLORS.primary.main,
      transform: 'translateY(-4px) scale(1.05)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    },
    '&:active': {
      transform: 'translateY(-2px) scale(1.02)',
    }
  },
  success: {
    bgcolor: COLORS.success.border,
    color: COLORS.text.white,
    borderRadius: `${SIZES.borderRadius.medium}px`,
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: SIZES.shadow.sm,
    '&:hover': { 
      bgcolor: '#059669',
      boxShadow: SIZES.shadow.elevated,
      transform: 'translateY(-2px) scale(1.02)',
    },
    '&:active': {
      bgcolor: '#047857',
      transform: 'translateY(-1px) scale(1.01)',
      boxShadow: SIZES.shadow.md,
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