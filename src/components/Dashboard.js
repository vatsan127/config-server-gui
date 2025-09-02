import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider
} from '@mui/material';
import { 
  Folder as FolderIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { setNotificationHandler } from '../services/api';
import { COLORS, SIZES, BUTTON_STYLES } from '../theme/colors';
import { UI_CONSTANTS } from '../constants';
import { useNamespaces } from '../hooks/useNamespaces';
import { useDialog } from '../hooks/useDialog';
import { validateNamespace } from '../utils/validation';
import EmptyState from './common/EmptyState';
import { InlineSpinner } from './common/ProgressIndicator';

const Dashboard = ({ searchQuery = '', onCreateNamespace }) => {
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
    createNamespace,
    deleteNamespace 
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

  // Expose openCreateDialog function to parent
  useEffect(() => {
    if (onCreateNamespace) {
      onCreateNamespace(openCreateDialog);
    }
  }, [openCreateDialog, onCreateNamespace]);

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

  // Handle namespace click
  const handleNamespaceClick = (namespace) => {
    navigate(`/namespace/${namespace}/files`);
  };

  // Handle namespace delete
  const handleDeleteNamespace = async (namespace) => {
    if (window.confirm(`Are you sure you want to delete the namespace "${namespace}"?`)) {
      await deleteNamespace(namespace);
    }
  };

  // Filter namespaces based on search query
  const filteredNamespaces = useMemo(() => {
    if (!searchQuery.trim()) return namespaces;
    return namespaces.filter(namespace =>
      namespace.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [namespaces, searchQuery]);

  if (loading) {
    return (
      <Box sx={{ p: SIZES.spacing.xs, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Typography>Loading namespaces...</Typography>
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
      {/* Total Namespaces Count */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ 
          color: COLORS.text.primary,
          fontWeight: 600,
          mb: 1
        }}>
          Namespaces ({namespaces.length})
        </Typography>
      </Box>

      {/* Namespace List */}
      {filteredNamespaces.length > 0 && (
        <Box sx={{
          bgcolor: COLORS.background.paper,
          borderRadius: `${SIZES.borderRadius.large}px`,
          border: `1px solid ${COLORS.grey[200]}`,
          boxShadow: SIZES.shadow.card,
          overflow: 'hidden'
        }}>
          <List sx={{ py: 0 }}>
            {filteredNamespaces.map((namespace, index) => (
              <React.Fragment key={namespace}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleNamespaceClick(namespace)}
                    sx={{
                      py: 2,
                      px: 3,
                      '&:hover': {
                        bgcolor: COLORS.hover.card,
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <FolderIcon sx={{ 
                        color: COLORS.primary.main,
                        fontSize: 24
                      }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={namespace}
                      primaryTypographyProps={{
                        sx: {
                          color: COLORS.text.primary,
                          fontWeight: 500,
                          fontSize: '1rem'
                        }
                      }}
                    />
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNamespace(namespace);
                      }}
                      sx={{
                        color: COLORS.text.secondary,
                        '&:hover': {
                          color: COLORS.error.border,
                          bgcolor: COLORS.hover.error
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemButton>
                </ListItem>
                {index < filteredNamespaces.length - 1 && (
                  <Divider variant="inset" component="li" sx={{ ml: 7 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      {/* Empty States */}
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
              px: 2,
              py: 1,
              color: COLORS.text.secondary,
              bgcolor: 'transparent',
              border: `1px solid ${COLORS.grey[300]}`,
              borderRadius: `${SIZES.borderRadius.medium}px`,
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: COLORS.grey[50],
                borderColor: COLORS.grey[400],
                color: COLORS.text.primary,
              },
              '&:disabled': {
                color: COLORS.grey[400],
                borderColor: COLORS.grey[200],
                bgcolor: 'transparent',
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
              px: 2,
              py: 1,
              minWidth: '120px',
              bgcolor: COLORS.primary.main,
              color: COLORS.text.white,
              borderRadius: `${SIZES.borderRadius.medium}px`,
              fontSize: '0.9rem',
              fontWeight: 600,
              boxShadow: SIZES.shadow.card,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: COLORS.primary.dark,
                boxShadow: SIZES.shadow.elevated,
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: SIZES.shadow.card,
              },
              '&:disabled': {
                bgcolor: COLORS.grey[300],
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