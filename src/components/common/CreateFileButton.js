import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Box,
  Typography,
  alpha
} from '@mui/material';
import {
  Add as AddIcon
} from '@mui/icons-material';
import { COLORS, SIZES, BUTTON_STYLES } from '../../theme/colors';
import { InlineSpinner } from './ProgressIndicator';
import { useTextInputKeyboard, useDialogKeyboard } from '../../hooks/useTextInputKeyboard';
import { getStandardDialogProps, getDialogTitleAnimationStyles, getDialogContentAnimationStyles, getDialogActionsAnimationStyles } from '../../utils/dialogAnimations';


const CreateFileButton = ({ onCreateConfigFile, currentPath = '/' }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [path, setPath] = useState('');
  const [creating, setCreating] = useState(false);
  const nameInputRef = useRef(null);
  const creatingRef = useRef(false);

  useEffect(() => {
    // Set default path when dialog opens
    if (dialogOpen) {
      setPath(currentPath);
    }
  }, [dialogOpen, currentPath]);

  const handleClick = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    if (!creating) {
      setDialogOpen(false);
      setFileName('');
      setPath('');
    }
  };

  const handleCreate = async () => {
    if (fileName.trim() && path.trim()) {
      // Prevent multiple simultaneous calls
      if (creatingRef.current) {
        return;
      }
      
      creatingRef.current = true;
      setCreating(true);
      try {
        await onCreateConfigFile(fileName.trim(), path.trim());
        handleDialogClose();
      } catch (error) {
        // Error handling is done in parent component
      } finally {
        setCreating(false);
        creatingRef.current = false;
      }
    }
  };

  // Keyboard support for dialog
  const createFileDialogKeyboard = useDialogKeyboard(
    handleDialogClose,
    () => {
      if (!creating && fileName.trim() && path.trim()) {
        handleCreate();
      }
    }
  );

  const fileNameInputKeyboard = useTextInputKeyboard(
    setFileName,
    (value) => {
      if (value) {
        setFileName('');
      } else {
        handleDialogClose();
      }
    },
    () => {
      // Move to path field if filename is entered
      const pathInput = document.querySelector('input[name="path"]');
      if (pathInput) {
        pathInput.focus();
      }
    }
  );

  const pathInputKeyboard = useTextInputKeyboard(
    setPath,
    (value) => {
      if (value) {
        setPath('');
      } else {
        // Move back to filename field
        const nameInput = document.querySelector('input[name="fileName"]');
        if (nameInput) {
          nameInput.focus();
        }
      }
    },
    () => {
      if (fileName.trim() && path.trim()) {
        handleCreate();
      }
    }
  );

  const handleKeyPress = (event) => {
    // Only handle Enter without modifiers to avoid conflicts with dialog keyboard handler
    if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey) {
      if (event.target.name === 'path') {
        // Submit if both fields are filled
        if (fileName.trim() && path.trim()) {
          event.preventDefault();
          event.stopPropagation();
          handleCreate();
        }
      } else if (event.target.name === 'fileName') {
        // Move to path field if filename is entered
        event.preventDefault();
        event.stopPropagation();
        const pathInput = document.querySelector('input[name="path"]');
        if (pathInput) {
          pathInput.focus();
        }
      }
    }
  };

  // Handle auto-focus when dialog opens
  const handleDialogEntered = () => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon sx={{ 
          transition: 'all 0.08s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: 18 
        }} />}
        onClick={handleClick}
        size="small"
        sx={{
          bgcolor: COLORS.primary.main,
          color: COLORS.text.white,
          borderRadius: `${SIZES.borderRadius.medium}px`,
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.875rem',
          px: 2.5,
          py: 1.25,
          minWidth: 'auto',
          whiteSpace: 'nowrap',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.08s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: SIZES.shadow.sm,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)',
            transform: 'translateX(-100%) skewX(-15deg)',
            transition: 'transform 0.08s cubic-bezier(0.4, 0, 0.2, 1)'
          },
          '&:hover': {
            bgcolor: COLORS.primary.dark,
            boxShadow: SIZES.shadow.floating,
            transform: 'translateY(-3px) scale(1.02)',
            '&::before': {
              transform: 'translateX(100%) skewX(-15deg)'
            },
            '& .MuiSvgIcon-root': {
              transform: 'rotate(90deg) scale(1.1)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }
          },
          '&:active': {
            transform: 'translateY(-1px) scale(1.01)',
            boxShadow: SIZES.shadow.md,
            transition: 'all 0.06s cubic-bezier(0.4, 0, 0.2, 1)'
          }
        }}
      >
        Create Config
      </Button>

      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
        onKeyDown={createFileDialogKeyboard.handleKeyDown}
        {...getStandardDialogProps('success')}
        TransitionProps={{
          ...getStandardDialogProps('success').TransitionProps,
          onEntered: handleDialogEntered
        }}
      >
        <DialogTitle sx={{ 
          color: COLORS.text.primary, 
          fontSize: '1.25rem', 
          fontWeight: 600,
          borderBottom: `1px solid ${COLORS.grey[200]}`,
          px: 3,
          py: 2.5,
          bgcolor: alpha(COLORS.success.light, 0.3),
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          ...getDialogTitleAnimationStyles()
        }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: `${SIZES.borderRadius.medium}px`,
              bgcolor: alpha(COLORS.success.main, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${alpha(COLORS.success.main, 0.25)}`,
              animation: 'configIconFloat 0.08s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both',
              '@keyframes configIconFloat': {
                '0%': {
                  transform: 'translateY(-20px) rotate(-45deg) scale(0.5)',
                  opacity: 0
                },
                '50%': {
                  transform: 'translateY(5px) rotate(0deg) scale(1.1)'
                },
                '100%': {
                  transform: 'translateY(0) rotate(0deg) scale(1)',
                  opacity: 1
                }
              }
            }}
          >
            <Box sx={{ 
              fontSize: 16, 
              color: COLORS.success.main,
              animation: 'configIconGlow 2s ease-in-out infinite 1s',
              '@keyframes configIconGlow': {
                '0%, 100%': {
                  filter: 'drop-shadow(0 0 2px rgba(16, 185, 129, 0.4))'
                },
                '50%': {
                  filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))'
                }
              }
            }}>
              📄
            </Box>
          </Box>
          Create New Config File
        </DialogTitle>

        <DialogContent sx={{ 
          px: 3,
          py: 3,
          '&.MuiDialogContent-root': {
            paddingTop: 3
          },
          ...getDialogContentAnimationStyles()
        }}>
          <Stack spacing={2}>
            <TextField
              inputRef={nameInputRef}
              name="fileName"
              autoFocus
              margin="none"
              fullWidth
              label="File Name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={(e) => {
                fileNameInputKeyboard.handleKeyDown(e);
                handleKeyPress(e);
              }}
              placeholder="application name"
              variant="outlined"
              disabled={creating}
              InputProps={{
                placeholder: "application name"
              }}
              inputProps={{
                autoComplete: 'off',
                tabIndex: 0,
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

            <Box>
              <TextField
                name="path"
                margin="none"
                fullWidth
                label="Path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                onKeyDown={(e) => {
                  pathInputKeyboard.handleKeyDown(e);
                  handleKeyPress(e);
                }}
                placeholder="/configs/app/"
                variant="outlined"
                disabled={creating}
                inputProps={{
                  autoComplete: 'off',
                  tabIndex: 0,
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
              <Typography variant="body2" sx={{ mt: 0.5, ml: '14px', color: COLORS.text.secondary, fontSize: '0.75rem' }}>
                Note: Path should always start and end with '/'
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ 
          px: 3, 
          py: 2.5, 
          borderTop: `1px solid ${COLORS.grey[200]}`,
          bgcolor: alpha(COLORS.grey[25], 0.5),
          gap: 1.5,
          ...getDialogActionsAnimationStyles()
        }}>
          <Button 
            onClick={handleDialogClose}
            disabled={creating}
            sx={{ 
              px: 3,
              py: 1.25,
              color: COLORS.text.secondary,
              bgcolor: 'transparent',
              border: `1px solid ${COLORS.grey[300]}`,
              borderRadius: `${SIZES.borderRadius.medium}px`,
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'all 0.08s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover:not(:disabled)': {
                bgcolor: COLORS.grey[50],
                borderColor: COLORS.grey[400],
                color: COLORS.text.primary,
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              },
              '&:active:not(:disabled)': {
                transform: 'translateY(0)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.06s cubic-bezier(0.4, 0, 0.2, 1)'
              },
              '&:disabled': {
                color: COLORS.grey[400],
                borderColor: COLORS.grey[200],
                bgcolor: 'transparent',
                transform: 'none',
                boxShadow: 'none'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            variant="contained"
            disabled={creating || !fileName.trim() || !path.trim()}
            sx={{ 
              px: 3,
              py: 1.25,
              minWidth: '120px',
              bgcolor: COLORS.primary.main,
              color: COLORS.text.white,
              borderRadius: `${SIZES.borderRadius.medium}px`,
              fontSize: '0.9rem',
              fontWeight: 600,
              boxShadow: SIZES.shadow.card,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.08s cubic-bezier(0.4, 0, 0.2, 1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(45deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)',
                transform: 'translateX(-100%) skewX(-15deg)',
                transition: 'transform 0.08s cubic-bezier(0.4, 0, 0.2, 1)'
              },
              '&:hover:not(:disabled)': {
                bgcolor: COLORS.primary.dark,
                boxShadow: SIZES.shadow.floating,
                transform: 'translateY(-2px) scale(1.05)',
                '&::before': {
                  transform: 'translateX(100%) skewX(-15deg)'
                }
              },
              '&:active:not(:disabled)': {
                transform: 'translateY(-1px) scale(1.02)',
                boxShadow: SIZES.shadow.elevated,
                transition: 'all 0.06s cubic-bezier(0.4, 0, 0.2, 1)'
              },
              '&:disabled': {
                bgcolor: COLORS.grey[300],
                color: COLORS.grey[500],
                transform: 'none',
                boxShadow: 'none',
                '&::before': {
                  display: 'none'
                }
              }
            }}
          >
            {creating ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InlineSpinner size={16} color={COLORS.text.white} />
                Creating...
              </Box>
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateFileButton;