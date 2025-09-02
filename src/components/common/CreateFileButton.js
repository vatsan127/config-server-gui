import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack
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
        maxWidth="sm"
        fullWidth
        TransitionProps={{
          onEntered: handleDialogEntered
        }}
      >
        <DialogTitle>
          Create New Config File
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <TextField
              inputRef={nameInputRef}
              name="fileName"
              autoFocus
              fullWidth
              label="File Name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="application.properties"
              variant="outlined"
            />

            <TextField
              name="path"
              fullWidth
              label="Path"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="/configs/app/"
              variant="outlined"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            variant="contained"
            disabled={!fileName.trim() || !path.trim()}
            sx={BUTTON_STYLES.primary}
          >
            Create Config File
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateFileButton;