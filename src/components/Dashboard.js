import React, { useEffect, useMemo, useRef, useCallback, memo } from 'react';
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
  Card,
  CardContent,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  alpha
} from '@mui/material';
import { 
  Folder as FolderIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { setNotificationHandler } from '../services/api';
import { COLORS, SIZES } from '../theme/colors';
import { UI_CONSTANTS } from '../constants';
import { useNamespaces } from '../hooks/useNamespaces';
import { useDialog } from '../hooks/useDialog';
import { validateNamespace } from '../utils/validation';
import { getNamespaceColor } from "../utils/colorUtils";
import { getStandardDialogProps, getDialogTitleAnimationStyles, getDialogContentAnimationStyles, getDialogActionsAnimationStyles } from "../utils/dialogAnimations";
import EmptyState from './common/EmptyState';
import { InlineSpinner } from './common/ProgressIndicator';
import { useDialogKeyboard } from '../hooks/useTextInputKeyboard';


const Dashboard = ({ searchQuery = '', onCreateNamespace }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const nameInputRef = useRef(null);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const [selectedNamespace, setSelectedNamespace] = React.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [namespaceToDelete, setNamespaceToDelete] = React.useState(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  
  // Removed console.log to prevent excessive logging

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
  const handleCreateNamespace = useCallback(async (formData) => {
    const validation = validateNamespace(formData.namespaceName);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    await createNamespace(formData.namespaceName);
  }, [createNamespace]);

  // Dialog keyboard shortcuts with stable references
  const handleCreateDialogSubmit = useCallback(() => {
    if (!creating && namespaceName.trim()) {
      handleDialogSubmit(handleCreateNamespace);
    }
  }, [creating, namespaceName, handleDialogSubmit, handleCreateNamespace]);

  const createDialogKeyboard = useDialogKeyboard(closeCreateDialog, handleCreateDialogSubmit);

  // Handle namespace click
  const handleNamespaceClick = (namespace) => {
    navigate(`/namespace/${namespace}/files`);
  };

  // Handle options menu
  const handleOptionsClick = (event, namespace) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedNamespace(namespace);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedNamespace(null);
  };

  // Handle opening delete confirmation dialog
  const handleDeleteClick = () => {
    setNamespaceToDelete(selectedNamespace);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Handle namespace delete
  const handleDeleteNamespace = useCallback(async () => {
    if (!namespaceToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteNamespace(namespaceToDelete);
      setDeleteDialogOpen(false);
      setNamespaceToDelete(null);
    } catch (error) {
      // Error is already handled by the notification system in the hook
    } finally {
      setIsDeleting(false);
    }
  }, [namespaceToDelete, deleteNamespace]);

  // Handle delete dialog close
  const handleDeleteDialogClose = useCallback(() => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
      setNamespaceToDelete(null);
    }
  }, [isDeleting]);

  // Delete dialog keyboard support
  const handleDeleteDialogSubmit = useCallback(() => {
    if (!isDeleting) {
      handleDeleteNamespace();
    }
  }, [isDeleting, handleDeleteNamespace]);

  const deleteDialogKeyboard = useDialogKeyboard(handleDeleteDialogClose, handleDeleteDialogSubmit);

  // Filter namespaces based on search query
  const filteredNamespaces = useMemo(() => {
    if (!searchQuery.trim()) return namespaces;
    return namespaces.filter(namespace =>
      namespace.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [namespaces, searchQuery]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <InlineSpinner size={32} color={COLORS.primary.main} />
        </div>
        <Typography className="loading-text">
          Loading namespaces...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: SIZES.spacing.xs }}>
        <Alert 
          severity="error"
          className="error-alert"
          sx={{
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: SIZES.spacing.xs, bgcolor: 'background.default', height: '100%' }}>
      {/* Total Namespaces Count */}
      <div className="page-header">
        <Typography variant="h5" className="page-title">
          Namespaces ({namespaces.length})
        </Typography>
      </div>

      {/* Namespace Cards Grid */}
      {filteredNamespaces.length > 0 && (
        <Grid container spacing={3}>
          {filteredNamespaces.map((namespace, index) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={namespace}>
              <Card className="namespace-card" style={{animationDelay: `${index * 0.08}s`}}>
                <Box
                  onClick={() => handleNamespaceClick(namespace)}
                  className="namespace-card-wrapper"
                >
                  <CardContent className="namespace-card-content">
                    {/* Options Menu Button */}
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionsClick(e, namespace);
                      }}
                      className="namespace-options-button"
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>

                    {/* Folder Icon */}
                    <div className="namespace-icon-container">
                      <FolderIcon
                        sx={{
                          color: getNamespaceColor(namespace),
                          fontSize: 48,
                        }}
                      />
                    </div>

                    {/* Namespace Name */}
                    <Typography
                      variant="h6"
                      className="namespace-title"
                    >
                      {namespace}
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Options Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          className: "menu-paper"
        }}
      >
        <MenuItem
          onClick={handleDeleteClick}
          className="menu-item"
        >
          <DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} />
          Delete
        </MenuItem>
      </Menu>

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
        onKeyDown={createDialogKeyboard.handleKeyDown}
        {...getStandardDialogProps('primary')}
        TransitionProps={{
          ...getStandardDialogProps('primary').TransitionProps,
          onEntered: handleDialogEntered
        }}
        PaperProps={{
          className: "dialog-paper"
        }}
      >
        <DialogTitle className="dialog-title">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: `${SIZES.borderRadius.medium}px`,
              bgcolor: alpha(COLORS.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${alpha(COLORS.primary.main, 0.2)}`,
            }}
          >
            <Box sx={{ fontSize: 16, color: COLORS.primary.main }}>✨</Box>
          </Box>
          {UI_CONSTANTS.DIALOG.CREATE_NAMESPACE.TITLE}
        </DialogTitle>
        <DialogContent className="dialog-content">
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
              // Basic keyboard support - Enter to submit (only without modifiers)
              if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !creating && namespaceName.trim()) {
                e.preventDefault();
                handleDialogSubmit(handleCreateNamespace);
              }
              // Escape to clear or close (only if not handled by dialog)
              if (e.key === 'Escape' && !e.ctrlKey && !e.metaKey) {
                if (namespaceName) {
                  updateFormData({ namespaceName: '' });
                } else {
                  closeCreateDialog();
                }
                e.preventDefault();
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
        <DialogActions className="dialog-actions">
          <Button 
            onClick={closeCreateDialog} 
            disabled={creating}
            className="btn-secondary"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleDialogSubmit(handleCreateNamespace)} 
            variant="contained"
            disabled={creating || !namespaceName.trim()}
            className="btn-primary"
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        maxWidth="xs"
        fullWidth
        onKeyDown={deleteDialogKeyboard.handleKeyDown}
        {...getStandardDialogProps('delete')}
        PaperProps={{
          className: "dialog-paper dialog-paper--delete"
        }}
      >
        <DialogTitle className="dialog-title dialog-title--delete">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: `${SIZES.borderRadius.medium}px`,
              bgcolor: alpha(COLORS.error.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${alpha(COLORS.error.main, 0.2)}`,
            }}
          >
            <DeleteIcon sx={{ fontSize: 16, color: COLORS.error.main }} />
          </Box>
          Delete Namespace
        </DialogTitle>
        <DialogContent className="dialog-content">
          <Typography variant="body1" sx={{ color: COLORS.text.primary, mb: 2 }}>
            Are you sure you want to delete the namespace <strong>"{namespaceToDelete}"</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
            This action will permanently delete the namespace directory and all its contents. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button
            onClick={handleDeleteDialogClose}
            disabled={isDeleting}
            className="btn-secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteNamespace}
            variant="contained"
            disabled={isDeleting}
            className="btn-danger"
          >
            {isDeleting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InlineSpinner size={16} color={COLORS.text.white} />
                Deleting...
              </Box>
            ) : (
              'Delete Namespace'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default memo(Dashboard);