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
        borderRadius: `${SIZES.borderRadius.medium}px`,
        '& .MuiAlert-message': {
          color: config.color,
          fontWeight: 500,
        },
        '& .MuiAlert-icon': {
          color: config.color,
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
            transition: 'all 0.3s ease'
          }}>
            {index < currentStep ? '✓' : index + 1}
          </Box>
          {index < steps.length - 1 && (
            <Box sx={{
              flex: 1,
              height: 2,
              bgcolor: index < currentStep ? COLORS.primary.main : COLORS.grey[300],
              borderRadius: 1,
              transition: 'all 0.3s ease'
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