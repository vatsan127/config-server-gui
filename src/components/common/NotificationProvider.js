import React from 'react';
import { SnackbarProvider, closeSnackbar } from 'notistack';
import { IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { COLORS } from '../../theme/colors';

const NOTIFICATION_CONFIG = {
  maxSnack: 5,
  anchorOrigin: {
    vertical: 'top',
    horizontal: 'right',
  },
  autoHideDuration: 2000,
  dense: false,
  preventDuplicate: true,
  persist: false,
  hideIconVariant: false,
  iconVariant: {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  },
};

const createSnackbarSx = (color, bgColor) => ({
  backgroundColor: bgColor || color,
  color: '#fff',
  borderRadius: '12px',
  border: `1px solid ${color}`,
  fontWeight: 500,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  backdropFilter: 'blur(10px)',
  '&.SnackbarContent-root': {
    animation: 'notificationSlideIn 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    '@keyframes notificationSlideIn': {
      '0%': {
        opacity: 0,
        transform: 'translateX(100%) scale(0.8)',
      },
      '100%': {
        opacity: 1,
        transform: 'translateX(0) scale(1)',
      }
    }
  }
});

const NOTIFICATION_STYLES = {
  '&.notistack-MuiContent-success': createSnackbarSx(COLORS.alerts.success, 'rgba(16, 185, 129, 0.95)'),
  '&.notistack-MuiContent-error': createSnackbarSx(COLORS.alerts.error, 'rgba(239, 68, 68, 0.95)'),
  '&.notistack-MuiContent-warning': createSnackbarSx(COLORS.alerts.warning, 'rgba(245, 158, 11, 0.95)'),
  '&.notistack-MuiContent-info': createSnackbarSx(COLORS.alerts.info, 'rgba(59, 130, 246, 0.95)'),
};

const CloseButton = ({ snackbarId }) => (
  <IconButton
    onClick={() => closeSnackbar(snackbarId)}
    sx={{ 
      color: 'rgba(255, 255, 255, 0.7)',
      transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      borderRadius: '8px',
      width: 32,
      height: 32,
      '&:hover': { 
        color: 'rgba(255, 255, 255, 1)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        transform: 'scale(1.1) rotate(90deg)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
      },
      '&:active': {
        transform: 'scale(0.95) rotate(90deg)',
        transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)'
      }
    }}
  >
    <CloseIcon fontSize="small" />
  </IconButton>
);

const NotificationProvider = ({ children }) => (
  <SnackbarProvider 
    {...NOTIFICATION_CONFIG}
    action={(snackbarId) => <CloseButton snackbarId={snackbarId} />}
    sx={NOTIFICATION_STYLES}
  >
    {children}
  </SnackbarProvider>
);

export default NotificationProvider;