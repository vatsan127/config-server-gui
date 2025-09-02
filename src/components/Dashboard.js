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
import { StatusIndicator, InlineSpinner } from './common/ProgressIndicator';

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

  // Generate mock metadata for namespaces (in real app, this would come from API)
  const getNamespaceMetadata = useCallback((namespace) => {
    // Mock data - in real implementation, this would be fetched from API
    const mockData = {
      fileCount: Math.floor(Math.random() * 50) + 5,
      lastModified: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    return mockData;
  }, []);

  // Memoized components with enhanced metadata
  const namespaceCards = useMemo(() => 
    filteredNamespaces.map((namespace) => {
      const metadata = getNamespaceMetadata(namespace);
      return (
        <NamespaceCard 
          key={namespace}
          namespace={namespace}
          fileCount={metadata.fileCount}
          lastModified={metadata.lastModified}
          onClick={() => handleCardClick(namespace)}
        />
      );
    }), [filteredNamespaces, handleCardClick, getNamespaceMetadata]
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
      {/* Status Indicator */}
      <Box sx={{ mb: 3, maxWidth: 400 }}>
        <StatusIndicator 
          status="connected" 
          message="Connected to config-server"
          compact={true}
        />
      </Box>

      {/* Dashboard Stats */}
      {namespaces.length > 0 && (
        <Box sx={{ 
          mb: 4,
          display: 'flex',
          gap: 3,
          flexWrap: 'wrap'
        }}>
          <Box sx={{
            bgcolor: COLORS.background.paper,
            border: `1px solid ${COLORS.grey[200]}`,
            borderRadius: `${SIZES.borderRadius.large}px`,
            p: 2,
            boxShadow: SIZES.shadow.card,
            minWidth: 140,
          }}>
            <Typography variant="h4" sx={{ 
              color: COLORS.primary.main,
              fontWeight: 700,
              mb: 0.5
            }}>
              {namespaces.length}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: COLORS.text.secondary,
              fontSize: '0.8rem'
            }}>
              Total Namespaces
            </Typography>
          </Box>
          
          <Box sx={{
            bgcolor: COLORS.background.paper,
            border: `1px solid ${COLORS.grey[200]}`,
            borderRadius: `${SIZES.borderRadius.large}px`,
            p: 2,
            boxShadow: SIZES.shadow.card,
            minWidth: 140,
          }}>
            <Typography variant="h4" sx={{ 
              color: COLORS.accent.green,
              fontWeight: 700,
              mb: 0.5
            }}>
              {filteredNamespaces.reduce((acc, ns) => acc + getNamespaceMetadata(ns).fileCount, 0)}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: COLORS.text.secondary,
              fontSize: '0.8rem'
            }}>
              Config Files
            </Typography>
          </Box>

          {searchQuery && (
            <Box sx={{
              bgcolor: COLORS.primary.main + '10',
              border: `1px solid ${COLORS.primary.main}30`,
              borderRadius: `${SIZES.borderRadius.large}px`,
              p: 2,
              boxShadow: SIZES.shadow.card,
              minWidth: 140,
            }}>
              <Typography variant="h4" sx={{ 
                color: COLORS.primary.main,
                fontWeight: 700,
                mb: 0.5
              }}>
                {filteredNamespaces.length}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: COLORS.primary.main,
                fontSize: '0.8rem'
              }}>
                Search Results
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <Box 
        sx={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
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

      {/* Enhanced Floating Action Button for Create */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ 
          position: 'fixed', 
          bottom: SIZES.spacing.lg, 
          right: SIZES.spacing.lg,
          background: `linear-gradient(135deg, ${COLORS.primary.main}, ${COLORS.primary.dark})`,
          boxShadow: SIZES.shadow.floating,
          width: 64,
          height: 64,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: `2px solid ${COLORS.background.paper}`,
          '&:hover': {
            background: `linear-gradient(135deg, ${COLORS.primary.dark}, #2563eb)`,
            boxShadow: '0 12px 40px rgba(0, 123, 255, 0.4)',
            transform: 'translateY(-4px) scale(1.1)',
          },
          '&:active': {
            transform: 'translateY(-2px) scale(1.05)',
            boxShadow: SIZES.shadow.elevated,
          },
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover:before': {
            opacity: 1,
          }
        }}
        onClick={openCreateDialog}
      >
        <AddIcon sx={{ fontSize: 28 }} />
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
              ...BUTTON_STYLES.gradient,
              px: 2,
              py: 1,
              minWidth: '120px',
              '&:disabled': {
                background: COLORS.grey[300],
                color: COLORS.grey[500],
                transform: 'none',
                boxShadow: 'none',
              }
            }}
          >
            {creating ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InlineSpinner size={16} color={COLORS.text.white} />
                Creating...
              </Box>
            ) : (
              'Create Namespace'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;