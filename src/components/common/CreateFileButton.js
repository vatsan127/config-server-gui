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
  Typography
} from '@mui/material';
import {
  Add as AddIcon
} from '@mui/icons-material';
import { COLORS, SIZES, BUTTON_STYLES } from '../../theme/colors';
import { InlineSpinner } from './ProgressIndicator';

const CreateFileButton = ({ onCreateConfigFile, currentPath = '/' }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [path, setPath] = useState('');
  const [creating, setCreating] = useState(false);
  const nameInputRef = useRef(null);

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
      setCreating(true);
      try {
        await onCreateConfigFile(fileName.trim(), path.trim());
        handleDialogClose();
      } catch (error) {
        // Error handling is done in parent component
      } finally {
        setCreating(false);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && event.target.name === 'path') {
      // Move focus to create button or submit if both fields are filled
      if (fileName.trim() && path.trim()) {
        handleCreate();
      }
    } else if (event.key === 'Enter' && event.target.name === 'fileName') {
      // Move to path field if filename is entered
      const pathInput = document.querySelector('input[name="path"]');
      if (pathInput) {
        pathInput.focus();
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
        startIcon={<AddIcon />}
        onClick={handleClick}
        sx={BUTTON_STYLES.primary}
      >
        Create Config
      </Button>

      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose}
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
          Create New Config File
        </DialogTitle>

        <DialogContent sx={{ 
          px: 2,
          py: 2,
          '&.MuiDialogContent-root': {
            paddingTop: 2
          }
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
              onKeyPress={handleKeyPress}
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
                onKeyPress={handleKeyPress}
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
          px: 2, 
          py: 1.5, 
          borderTop: `1px solid ${COLORS.grey[200]}`,
          gap: 1
        }}>
          <Button 
            onClick={handleDialogClose}
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
            onClick={handleCreate} 
            variant="contained"
            disabled={creating || !fileName.trim() || !path.trim()}
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
              'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateFileButton;