import React from 'react';
import { 
  Box, 
  CircularProgress, 
  LinearProgress, 
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { COLORS, SIZES } from '../../theme/colors';

// Floating Progress Indicator for async operations
export const FloatingProgress = ({ 
  open, 
  message = 'Processing...', 
  progress = null // 0-100 for determinate progress
}) => (
  <Snackbar
    open={open}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    sx={{
      '& .MuiSnackbarContent-root': {
        bgcolor: COLORS.background.paper,
        color: COLORS.text.primary,
        borderRadius: `${SIZES.borderRadius.large}px`,
        boxShadow: SIZES.shadow.floating,
        border: `1px solid ${COLORS.grey[200]}`,
        minWidth: 300,
      }
    }}
  >
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2,
      p: 2
    }}>
      <CircularProgress 
        size={20} 
        thickness={4}
        sx={{ color: COLORS.primary.main }}
        variant={progress !== null ? 'determinate' : 'indeterminate'}
        value={progress}
      />
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ 
          fontWeight: 500,
          color: COLORS.text.primary,
          mb: progress !== null ? 0.5 : 0
        }}>
          {message}
        </Typography>
        {progress !== null && (
          <LinearProgress 
            variant="determinate" 
            value={progress}
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: COLORS.grey[200],
              '& .MuiLinearProgress-bar': {
                bgcolor: COLORS.primary.main,
                borderRadius: 2,
              }
            }}
          />
        )}
      </Box>
      {progress !== null && (
        <Typography variant="caption" sx={{ 
          color: COLORS.text.secondary,
          fontWeight: 600,
          minWidth: 35,
          textAlign: 'right'
        }}>
          {Math.round(progress)}%
        </Typography>
      )}
    </Box>
  </Snackbar>
);

// Status Indicator for connection/system status
export const StatusIndicator = ({ 
  status = 'connected', // connected, disconnected, syncing, error
  message,
  compact = false 
}) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircleIcon,
          color: COLORS.success.border,
          bgColor: COLORS.success.background,
          defaultMessage: 'Connected to config-server'
        };
      case 'syncing':
        return {
          icon: null, // Will show spinner
          color: COLORS.primary.main,
          bgColor: COLORS.primary.light + '20',
          defaultMessage: 'Syncing changes...'
        };
      case 'warning':
        return {
          icon: WarningIcon,
          color: COLORS.warning.border,
          bgColor: COLORS.warning.background,
          defaultMessage: 'Server connection unstable'
        };
      case 'error':
      case 'disconnected':
        return {
          icon: ErrorIcon,
          color: COLORS.error.border,
          bgColor: COLORS.error.background,
          defaultMessage: 'Failed to connect to config-server'
        };
      default:
        return {
          icon: InfoIcon,
          color: COLORS.alerts.info,
          bgColor: COLORS.primary.light + '20',
          defaultMessage: message || 'Status unknown'
        };
    }
  };

  const config = getStatusConfig(status);
  const StatusIcon = config.icon;

  if (compact) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1 
      }}>
        {status === 'syncing' ? (
          <CircularProgress size={12} thickness={4} sx={{ color: config.color }} />
        ) : (
          StatusIcon && <StatusIcon sx={{ fontSize: 14, color: config.color }} />
        )}
        <Typography variant="caption" sx={{ 
          color: config.color,
          fontWeight: 500,
          fontSize: '0.75rem'
        }}>
          {message || config.defaultMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Alert
      severity={status === 'connected' ? 'success' : status === 'syncing' ? 'info' : status === 'warning' ? 'warning' : 'error'}
      icon={status === 'syncing' ? (
        <CircularProgress size={18} thickness={4} sx={{ color: config.color }} />
      ) : undefined}
      sx={{
        bgcolor: config.bgColor,
        border: `1px solid ${config.color}`,
        borderRadius: `${SIZES.borderRadius.large}px`,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        animation: 'statusAlertSlideIn 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        '@keyframes statusAlertSlideIn': {
          '0%': {
            opacity: 0,
            transform: 'translateY(-10px) scale(0.95)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0) scale(1)',
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${config.color}, transparent)`,
          animation: status === 'syncing' ? 'statusPulse 2s ease-in-out infinite' : 'none',
          '@keyframes statusPulse': {
            '0%, 100%': {
              opacity: 0.5,
              transform: 'scaleX(1)'
            },
            '50%': {
              opacity: 1,
              transform: 'scaleX(1.1)'
            }
          }
        },
        '& .MuiAlert-message': {
          color: config.color,
          fontWeight: 500,
          transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        },
        '& .MuiAlert-icon': {
          color: config.color,
          animation: status === 'syncing' ? 'none' : 'iconPop 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.1s both',
          '@keyframes iconPop': {
            '0%': {
              transform: 'scale(0) rotate(-180deg)',
              opacity: 0
            },
            '100%': {
              transform: 'scale(1) rotate(0deg)',
              opacity: 1
            }
          }
        },
        '&:hover': {
          transform: 'translateY(-2px) scale(1.02)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '& .MuiAlert-message': {
            transform: 'translateX(2px)'
          }
        }
      }}
    >
      {message || config.defaultMessage}
    </Alert>
  );
};

// Inline loading spinner for buttons and small components
export const InlineSpinner = ({ 
  size = 16, 
  color = COLORS.primary.main,
  thickness = 4 
}) => (
  <CircularProgress 
    size={size} 
    thickness={thickness}
    sx={{ color }}
  />
);

// Step Progress Indicator for multi-step processes
export const StepProgress = ({ 
  steps = [], 
  currentStep = 0,
  variant = 'horizontal' // horizontal or vertical
}) => {
  if (variant === 'vertical') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {steps.map((step, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: index <= currentStep ? COLORS.primary.main : COLORS.grey[300],
              color: COLORS.text.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              {index < currentStep ? '✓' : index + 1}
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: index <= currentStep ? COLORS.text.primary : COLORS.text.secondary,
                fontWeight: index === currentStep ? 600 : 400
              }}
            >
              {step}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <Box sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: index <= currentStep ? COLORS.primary.main : COLORS.grey[300],
            color: COLORS.text.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 600,
            transition: 'all 0.15s ease'
          }}>
            {index < currentStep ? '✓' : index + 1}
          </Box>
          {index < steps.length - 1 && (
            <Box sx={{
              flex: 1,
              height: 2,
              bgcolor: index < currentStep ? COLORS.primary.main : COLORS.grey[300],
              borderRadius: 1,
              transition: 'all 0.15s ease'
            }} />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};

export default {
  FloatingProgress,
  StatusIndicator,
  InlineSpinner,
  StepProgress,
};