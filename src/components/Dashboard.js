import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { setNotificationHandler } from '../services/api';
import { COLORS, SIZES, BUTTON_STYLES } from '../theme/colors';
import { UI_CONSTANTS } from '../constants';
import { useNamespaces } from '../hooks/useNamespaces';
import { useDialog } from '../hooks/useDialog';
import { validateNamespace } from '../utils/validation';
import NamespaceCard from './common/NamespaceCard';
import EmptyState from './common/EmptyState';
import { DashboardSkeletonLoader } from './common/SkeletonLoader';

const Dashboard = ({ searchQuery = '' }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const nameInputRef = useRef(null);
  
  console.log('🏠 Dashboard component rendered', {
    timestamp: new Date().toISOString(),
    searchQuery
  });

  // Custom hooks for state management
  const { 
    namespaces, 
    loading, 
    error, 
    createNamespace 
  } = useNamespaces();
  
  const {
    isOpen: createDialogOpen,
    formData: { namespaceName = '' } = {},
    isSubmitting: creating,
    openDialog: openCreateDialog,
    closeDialog: closeCreateDialog,
    updateFormData,
    handleSubmit: handleDialogSubmit
  } = useDialog({ namespaceName: '' });

  // Set up notification handler with ref to avoid dependency issues
  const notificationRef = useRef();
  notificationRef.current = enqueueSnackbar;
  
  useEffect(() => {
    setNotificationHandler((message, options) => {
      notificationRef.current(message, options);
    });
  }, []); // Empty dependency array - runs only once

  // Handle auto-focus when dialog opens
  const handleDialogEntered = () => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  };

  // Handle namespace creation
  const handleCreateNamespace = async (formData) => {
    const validation = validateNamespace(formData.namespaceName);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    await createNamespace(formData.namespaceName);
  };

  // Handle card clicks
  const handleCardClick = (namespace) => {
    navigate(`/namespace/${namespace}/files`);
  };

  // Filter namespaces based on search query
  const filteredNamespaces = useMemo(() => {
    if (!searchQuery.trim()) return namespaces;
    return namespaces.filter(namespace =>
      namespace.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [namespaces, searchQuery]);

  // Memoized components
  const namespaceCards = useMemo(() => 
    filteredNamespaces.map((namespace) => (
      <NamespaceCard 
        key={namespace}
        namespace={namespace}
        onClick={() => handleCardClick(namespace)}
      />
    )), [filteredNamespaces, handleCardClick]
  );

  if (loading) {
    return (
      <Box sx={{ p: SIZES.spacing.xs, bgcolor: 'background.default', minHeight: '100vh' }}>
        <DashboardSkeletonLoader count={8} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: SIZES.spacing.xs }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: SIZES.spacing.xs, bgcolor: 'background.default', minHeight: '100vh' }}>

      <Box 
        sx={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {namespaceCards}
      </Box>

      {namespaces.length === 0 && (
        <EmptyState 
          type="create"
          title={UI_CONSTANTS.MESSAGES.EMPTY_NAMESPACES}
          description={UI_CONSTANTS.MESSAGES.EMPTY_NAMESPACES_DESC}
        />
      )}

      {namespaces.length > 0 && filteredNamespaces.length === 0 && searchQuery && (
        <EmptyState 
          type="search"
          title={UI_CONSTANTS.MESSAGES.NO_SEARCH_RESULTS}
          description={`No namespaces found matching "${searchQuery}"`}
        />
      )}

      {/* Floating Action Button for Create */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ 
          position: 'fixed', 
          bottom: SIZES.spacing.lg, 
          right: SIZES.spacing.lg,
          bgcolor: COLORS.primary.main,
          boxShadow: '0 6px 16px rgba(0, 123, 255, 0.3)',
          width: 56,
          height: 56,
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            bgcolor: '#0056b3',
            boxShadow: '0 8px 25px rgba(0, 123, 255, 0.4)',
            transform: 'translateY(-2px) scale(1.05)',
          },
          '&:active': {
            bgcolor: '#004085',
            transform: 'translateY(-1px) scale(1.02)',
            boxShadow: '0 4px 12px rgba(0, 123, 255, 0.35)',
          }
        }}
        onClick={openCreateDialog}
      >
        <AddIcon sx={{ fontSize: 24 }} />
      </Fab>

      {/* Create Namespace Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={closeCreateDialog} 
        maxWidth="xs" 
        fullWidth
        TransitionProps={{
          onEntered: handleDialogEntered
        }}
        PaperProps={{
          sx: {
            bgcolor: COLORS.background.paper,
            border: `1px solid ${COLORS.grey[200]}`,
            borderRadius: `${SIZES.borderRadius.medium}px`,
            boxShadow: SIZES.shadow.md,
            m: 1
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: COLORS.text.primary, 
          fontSize: '1.1rem', 
          fontWeight: 600,
          borderBottom: `1px solid ${COLORS.grey[200]}`,
          px: 2,
          py: 1.5
        }}>
          {UI_CONSTANTS.DIALOG.CREATE_NAMESPACE.TITLE}
        </DialogTitle>
        <DialogContent sx={{ 
          px: 2,
          py: 2,
          '&.MuiDialogContent-root': {
            paddingTop: 2
          }
        }}>
          <TextField
            inputRef={nameInputRef}
            autoFocus
            margin="none"
            label="Namespace"
            placeholder={UI_CONSTANTS.DIALOG.CREATE_NAMESPACE.PLACEHOLDER}
            type="text"
            fullWidth
            variant="outlined"
            value={namespaceName}
            onChange={(e) => updateFormData({ namespaceName: e.target.value })}
            disabled={creating}
            inputProps={{
              autoComplete: 'off',
              tabIndex: 0,
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !creating && namespaceName.trim()) {
                e.preventDefault();
                handleDialogSubmit(handleCreateNamespace);
              }
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: `${SIZES.borderRadius.medium}px`,
                '& fieldset': {
                  borderColor: COLORS.grey[300],
                },
                '&:hover fieldset': {
                  borderColor: COLORS.grey[400],
                },
                '&.Mui-focused fieldset': {
                  borderColor: COLORS.primary.main,
                  borderWidth: 2
                }
              },
              '& .MuiInputLabel-root': {
                color: COLORS.text.secondary,
                transform: 'translate(14px, 12px) scale(1)',
                '&.MuiInputLabel-shrink': {
                  transform: 'translate(14px, -9px) scale(0.75)',
                },
                '&.Mui-focused': {
                  color: COLORS.primary.main
                }
              },
              '& .MuiOutlinedInput-input': {
                padding: '10px 12px'
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ 
          px: 2, 
          py: 1.5, 
          borderTop: `1px solid ${COLORS.grey[200]}`,
          gap: 1
        }}>
          <Button 
            onClick={closeCreateDialog} 
            disabled={creating}
            sx={{ 
              ...BUTTON_STYLES.secondary,
              px: 2,
              py: 1,
              '&:disabled': {
                color: COLORS.grey[400]
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleDialogSubmit(handleCreateNamespace)} 
            variant="contained"
            disabled={creating || !namespaceName.trim()}
            sx={{ 
              ...BUTTON_STYLES.primary,
              px: 2,
              py: 1,
              minWidth: '100px',
              boxShadow: '0 2px 8px rgba(0, 123, 255, 0.25)',
              '&:hover': {
                ...BUTTON_STYLES.primary['&:hover'],
                boxShadow: '0 4px 12px rgba(0, 123, 255, 0.35)',
                transform: 'translateY(-2px)',
              },
              '&:active': {
                ...BUTTON_STYLES.primary['&:active'],
                transform: 'translateY(0px)',
              },
              '&:disabled': {
                bgcolor: COLORS.grey[300],
                color: COLORS.grey[500],
                transform: 'none',
                boxShadow: 'none',
              }
            }}
          >
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;