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
  autoHideDuration: 5000,
  dense: true,
  preventDuplicate: true,
  persist: false,
  hideIconVariant: false,
  iconVariant: {
    success: '✅',
    error: '❌',
    warning: '❌',
    info: '✅',
  },
};

const createSnackbarSx = (color) => ({
  backgroundColor: color,
  color: '#fff',
  borderRadius: 0,
  border: 'none',
  fontWeight: 500,
});

const NOTIFICATION_STYLES = {
  '&.notistack-MuiContent-success': createSnackbarSx(COLORS.alerts.success),
  '&.notistack-MuiContent-error': createSnackbarSx(COLORS.alerts.error),
  '&.notistack-MuiContent-warning': createSnackbarSx(COLORS.alerts.error),
  '&.notistack-MuiContent-info': createSnackbarSx(COLORS.alerts.success),
};

const CloseButton = ({ snackbarId }) => (
  <IconButton
    onClick={() => closeSnackbar(snackbarId)}
    sx={{ 
      color: 'rgba(255, 255, 255, 0.7)',
      '&:hover': { color: 'rgba(255, 255, 255, 0.9)' }
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