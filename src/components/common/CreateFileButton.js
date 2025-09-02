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
import { BUTTON_STYLES } from '../../theme/colors';

const CreateFileButton = ({ onCreateConfigFile, currentPath = '/' }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [path, setPath] = useState('');
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
    setDialogOpen(false);
    setFileName('');
    setPath('');
  };

  const handleCreate = () => {
    if (fileName.trim() && path.trim()) {
      onCreateConfigFile(fileName.trim(), path.trim());
      handleDialogClose();
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
            bgcolor: 'background.paper',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
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
          color: 'text.primary', 
          fontSize: '1.1rem', 
          fontWeight: 600,
          borderBottom: '1px solid #e0e0e0',
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
              InputProps={{
                placeholder: "application name"
              }}
              inputProps={{
                autoComplete: 'off',
                tabIndex: 0,
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#d0d0d0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#b0b0b0',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                    borderWidth: 2
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'text.secondary',
                  transform: 'translate(14px, 12px) scale(1)',
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(14px, -9px) scale(0.75)',
                  },
                  '&.Mui-focused': {
                    color: '#1976d2'
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
                inputProps={{
                  autoComplete: 'off',
                  tabIndex: 0,
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& fieldset': {
                      borderColor: '#d0d0d0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#b0b0b0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                      borderWidth: 2
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'text.secondary',
                    transform: 'translate(14px, 12px) scale(1)',
                    '&.MuiInputLabel-shrink': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    },
                    '&.Mui-focused': {
                      color: '#1976d2'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '10px 12px'
                  }
                }}
              />
              <Typography variant="body2" sx={{ mt: 0.5, ml: '14px', color: 'text.secondary', fontSize: '0.75rem' }}>
                Note: Path should always start and end with '/'
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ 
          px: 2, 
          py: 1.5, 
          borderTop: '1px solid #e0e0e0',
          gap: 1
        }}>
          <Button 
            onClick={handleDialogClose}
            sx={{ 
              px: 2,
              py: 1,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            variant="contained"
            disabled={!fileName.trim() || !path.trim()}
            sx={{ 
              ...BUTTON_STYLES.primary,
              px: 2,
              py: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                ...BUTTON_STYLES.primary['&:hover'],
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                bgcolor: '#d0d0d0',
                color: '#a0a0a0',
                transform: 'none',
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateFileButton;