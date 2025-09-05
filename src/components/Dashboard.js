import React, { useEffect, useMemo, useRef, forwardRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grow, Slide } from '@mui/material';
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
  CardActionArea,
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
import { getNamespaceColor } from '../utils/colorUtils';
import EmptyState from './common/EmptyState';
import { InlineSpinner } from './common/ProgressIndicator';
import { useDialogKeyboard } from '../hooks/useTextInputKeyboard';

// Custom transition for create namespace dialog
const GrowTransition = forwardRef(function GrowTransition(props, ref) {
  return <Grow ref={ref} {...props} />;
});

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
      console.error('Failed to delete namespace:', error);
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
      <Box sx={{ 
        p: SIZES.spacing.xs, 
        bgcolor: 'background.default', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2
      }}>
        <Box
          sx={{
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.7, transform: 'scale(1.05)' }
            }
          }}
        >
          <InlineSpinner size={32} color={COLORS.primary.main} />
        </Box>
        <Typography
          sx={{
            color: COLORS.text.secondary,
            animation: 'fadeInSlide 1s ease-out',
            '@keyframes fadeInSlide': {
              '0%': { opacity: 0, transform: 'translateY(10px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          Loading namespaces...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: SIZES.spacing.xs }}>
        <Alert 
          severity="error"
          sx={{
            borderRadius: `${SIZES.borderRadius.large}px`,
            border: `1px solid ${COLORS.error.main}`,
            bgcolor: alpha(COLORS.error.light, 0.8),
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.15)',
            animation: 'errorAlertBounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            '@keyframes errorAlertBounceIn': {
              '0%': {
                opacity: 0,
                transform: 'scale(0.3) translateY(-30px)',
              },
              '50%': {
                transform: 'scale(1.05) translateY(5px)',
              },
              '100%': {
                opacity: 1,
                transform: 'scale(1) translateY(0)',
              }
            },
            '& .MuiAlert-icon': {
              animation: 'errorIconPulse 2s ease-in-out infinite 0.5s',
              '@keyframes errorIconPulse': {
                '0%, 100%': {
                  transform: 'scale(1)',
                  filter: 'drop-shadow(0 0 2px rgba(239, 68, 68, 0.3))'
                },
                '50%': {
                  transform: 'scale(1.1)',
                  filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))'
                }
              }
            },
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
      <Box 
        sx={{ 
          mb: 3,
          animation: 'slideInFromTop 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '@keyframes slideInFromTop': {
            '0%': {
              opacity: 0,
              transform: 'translateY(-20px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}
      >
        <Typography variant="h5" sx={{ 
          color: COLORS.text.primary,
          fontWeight: 600,
          mb: 1,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -4,
            left: 0,
            width: 0,
            height: 3,
            bgcolor: COLORS.primary.main,
            borderRadius: '2px',
            transition: 'width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s',
            animation: 'underlineExpand 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s both',
          },
          '@keyframes underlineExpand': {
            '0%': { width: 0 },
            '100%': { width: '60px' }
          }
        }}>
          Namespaces ({namespaces.length})
        </Typography>
      </Box>

      {/* Namespace Cards Grid */}
      {filteredNamespaces.length > 0 && (
        <Grid container spacing={3}>
          {filteredNamespaces.map((namespace, index) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={namespace}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: COLORS.background.paper,
                  border: `1px solid ${COLORS.grey[200]}`,
                  borderRadius: `${SIZES.borderRadius.large}px`,
                  boxShadow: SIZES.shadow.card,
                  transform: 'translateY(0) scale(1)',
                  opacity: 1,
                  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  transitionDelay: `${index * 0.1}s`,
                  animation: `slideInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.1}s both`,
                  '@keyframes slideInUp': {
                    '0%': {
                      transform: 'translateY(30px) scale(0.95)',
                      opacity: 0
                    },
                    '100%': {
                      transform: 'translateY(0) scale(1)',
                      opacity: 1
                    }
                  },
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06)',
                    borderColor: COLORS.primary.light,
                  },
                  '&:active': {
                    transform: 'translateY(-4px) scale(1.01)',
                    transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                  }
                }}
              >
                <CardActionArea
                  onClick={() => handleNamespaceClick(namespace)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    p: 0
                  }}
                >
                  <CardContent
                    sx={{
                      width: '100%',
                      p: 3,
                      pb: '16px !important',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >
                    {/* Options Menu Button */}
                    <IconButton
                      onClick={(e) => handleOptionsClick(e, namespace)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: COLORS.text.secondary,
                        bgcolor: 'transparent',
                        width: 32,
                        height: 32,
                        opacity: 0,
                        transform: 'scale(0.8) rotate(0deg)',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        '.MuiCard-root:hover &': {
                          opacity: 1,
                          transform: 'scale(1) rotate(0deg)',
                        },
                        '&:hover': {
                          color: COLORS.text.primary,
                          bgcolor: COLORS.grey[100],
                          transform: 'scale(1.15) rotate(90deg)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        },
                        '&:active': {
                          transform: 'scale(1.05) rotate(90deg)',
                        }
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>

                    {/* Folder Icon */}
                    <Box
                      sx={{
                        position: 'relative',
                        mb: 2,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '120%',
                          height: '120%',
                          transform: 'translate(-50%, -50%) scale(0)',
                          borderRadius: '50%',
                          bgcolor: `${getNamespaceColor(namespace)}15`,
                          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          zIndex: -1,
                        },
                        '.MuiCard-root:hover &::before': {
                          transform: 'translate(-50%, -50%) scale(1)',
                        }
                      }}
                    >
                      <FolderIcon
                        sx={{
                          color: getNamespaceColor(namespace),
                          fontSize: 48,
                          transform: 'rotate(0deg) scale(1)',
                          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                          animation: `iconFloat 3s ease-in-out infinite ${index * 0.2}s`,
                          '@keyframes iconFloat': {
                            '0%, 100%': {
                              transform: 'rotate(0deg) scale(1) translateY(0px)',
                            },
                            '50%': {
                              transform: 'rotate(2deg) scale(1.02) translateY(-2px)',
                            }
                          },
                          '.MuiCard-root:hover &': {
                            transform: 'rotate(-5deg) scale(1.15)',
                            filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2))',
                            animation: 'none',
                          },
                          '.MuiCard-root:active &': {
                            transform: 'rotate(-3deg) scale(1.1)',
                            transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                          }
                        }}
                      />
                    </Box>

                    {/* Namespace Name */}
                    <Typography
                      variant="h6"
                      sx={{
                        color: COLORS.text.primary,
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
                        textAlign: 'center',
                        transform: 'translateY(0)',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        '.MuiCard-root:hover &': {
                          transform: 'translateY(-2px)',
                          color: COLORS.primary.main,
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        }
                      }}
                    >
                      {namespace}
                    </Typography>
                  </CardContent>
                </CardActionArea>
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
          sx: {
            bgcolor: COLORS.background.paper,
            border: `1px solid ${COLORS.grey[200]}`,
            borderRadius: `${SIZES.borderRadius.medium}px`,
            boxShadow: SIZES.shadow.md,
            minWidth: 150
          }
        }}
      >
        <MenuItem
          onClick={handleDeleteClick}
          sx={{
            color: COLORS.error.main,
            py: 1.5,
            px: 2,
            fontSize: '0.9rem',
            '&:hover': {
              bgcolor: COLORS.hover.error,
            }
          }}
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
        TransitionComponent={GrowTransition}
        onKeyDown={createDialogKeyboard.handleKeyDown}
        TransitionProps={{
          onEntered: handleDialogEntered,
          timeout: {
            enter: 500,
            exit: 400
          }
        }}
        PaperProps={{
          sx: {
            bgcolor: COLORS.background.paper,
            border: `1px solid ${COLORS.grey[200]}`,
            borderRadius: `${SIZES.borderRadius.large}px`,
            boxShadow: SIZES.shadow.floating,
            m: 1,
            position: 'relative',
            overflow: 'hidden',
            animation: 'dialogBounceIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            '@keyframes dialogBounceIn': {
              '0%': {
                opacity: 0,
                transform: 'scale(0.3) translateY(-50px)'
              },
              '50%': {
                transform: 'scale(1.05) translateY(0)'
              },
              '100%': {
                opacity: 1,
                transform: 'scale(1) translateY(0)'
              }
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, ${COLORS.primary.main}, ${COLORS.accent.blue})`,
            }
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: COLORS.text.primary, 
          fontSize: '1.25rem', 
          fontWeight: 600,
          borderBottom: `1px solid ${COLORS.grey[200]}`,
          px: 3,
          py: 2.5,
          bgcolor: alpha(COLORS.primary.light, 0.05),
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          animation: 'titleSlideInLeft 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s both',
          '@keyframes titleSlideInLeft': {
            '0%': {
              opacity: 0,
              transform: 'translateX(-30px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateX(0)'
            }
          }
        }}>
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
              animation: 'iconSpin 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both',
              '@keyframes iconSpin': {
                '0%': {
                  transform: 'rotate(-180deg) scale(0.5)',
                  opacity: 0
                },
                '100%': {
                  transform: 'rotate(0deg) scale(1)',
                  opacity: 1
                }
              }
            }}
          >
            <Box sx={{ fontSize: 16, color: COLORS.primary.main }}>✨</Box>
          </Box>
          {UI_CONSTANTS.DIALOG.CREATE_NAMESPACE.TITLE}
        </DialogTitle>
        <DialogContent sx={{ 
          px: 3,
          py: 3,
          '&.MuiDialogContent-root': {
            paddingTop: 3
          },
          animation: 'contentSlideInUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both',
          '@keyframes contentSlideInUp': {
            '0%': {
              opacity: 0,
              transform: 'translateY(20px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
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
        <DialogActions sx={{ 
          px: 3, 
          py: 2.5, 
          borderTop: `1px solid ${COLORS.grey[200]}`,
          bgcolor: alpha(COLORS.grey[25], 0.5),
          gap: 1.5,
          animation: 'actionsSlideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s both',
          '@keyframes actionsSlideInRight': {
            '0%': {
              opacity: 0,
              transform: 'translateX(30px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateX(0)'
            }
          }
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        maxWidth="xs"
        fullWidth
        TransitionComponent={GrowTransition}
        onKeyDown={deleteDialogKeyboard.handleKeyDown}
        PaperProps={{
          sx: {
            bgcolor: COLORS.background.paper,
            border: `1px solid ${COLORS.error.light}`,
            borderRadius: `${SIZES.borderRadius.large}px`,
            boxShadow: SIZES.shadow.floating,
            m: 1,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, ${COLORS.error.main}, ${COLORS.error.dark})`,
            }
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle sx={{
          color: COLORS.text.primary,
          fontSize: '1.25rem',
          fontWeight: 600,
          borderBottom: `1px solid ${COLORS.grey[200]}`,
          px: 3,
          py: 2.5,
          bgcolor: alpha(COLORS.error.light, 0.05),
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
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
        <DialogContent sx={{
          px: 3,
          py: 3,
          '&.MuiDialogContent-root': {
            paddingTop: 3
          }
        }}>
          <Typography variant="body1" sx={{ color: COLORS.text.primary, mb: 2 }}>
            Are you sure you want to delete the namespace <strong>"{namespaceToDelete}"</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
            This action will permanently delete the namespace directory and all its contents. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{
          px: 3,
          py: 2.5,
          borderTop: `1px solid ${COLORS.grey[200]}`,
          bgcolor: alpha(COLORS.grey[25], 0.5),
          gap: 1.5
        }}>
          <Button
            onClick={handleDeleteDialogClose}
            disabled={isDeleting}
            sx={{
              px: 2,
              py: 1,
              color: COLORS.text.secondary,
              bgcolor: 'transparent',
              border: `1px solid ${COLORS.grey[300]}`,
              borderRadius: `${SIZES.borderRadius.medium}px`,
              fontSize: '0.9rem',
              fontWeight: 500,
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
            onClick={handleDeleteNamespace}
            variant="contained"
            disabled={isDeleting}
            sx={{
              px: 2,
              py: 1,
              minWidth: '120px',
              bgcolor: COLORS.error.main,
              color: COLORS.text.white,
              borderRadius: `${SIZES.borderRadius.medium}px`,
              fontSize: '0.9rem',
              fontWeight: 600,
              boxShadow: SIZES.shadow.card,
              '&:hover': {
                bgcolor: COLORS.error.dark,
                boxShadow: SIZES.shadow.elevated,
              },
              '&:disabled': {
                bgcolor: COLORS.grey[300],
                color: COLORS.grey[500],
                boxShadow: 'none',
              }
            }}
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