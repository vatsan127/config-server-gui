import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box
} from '@mui/material';
import {
  Add as AddIcon,
  CreateNewFolder as CreateNewFolderIcon,
  InsertDriveFile as InsertDriveFileIcon
} from '@mui/icons-material';
import { COLORS, BUTTON_STYLES } from '../../theme/colors';

const CreateFileButton = ({ onCreateFile, onCreateFolder }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createType, setCreateType] = useState('file');
  const [name, setName] = useState('');
  const nameInputRef = useRef(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (type) => {
    setCreateType(type);
    setDialogOpen(true);
    handleClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setName('');
  };

  const handleCreate = () => {
    if (name.trim()) {
      if (createType === 'file') {
        onCreateFile(name.trim());
      } else {
        onCreateFolder(name.trim());
      }
      handleDialogClose();
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleCreate();
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
        Create
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleMenuItemClick('file')}>
          <ListItemIcon>
            <InsertDriveFileIcon />
          </ListItemIcon>
          <ListItemText>New File</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('folder')}>
          <ListItemIcon>
            <CreateNewFolderIcon />
          </ListItemIcon>
          <ListItemText>New Folder</ListItemText>
        </MenuItem>
      </Menu>

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
          Create New {createType === 'file' ? 'File' : 'Folder'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
              inputRef={nameInputRef}
              autoFocus
              fullWidth
              label={`${createType === 'file' ? 'File' : 'Folder'} Name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={createType === 'file' ? 'config.properties' : 'new-folder'}
              variant="outlined"
            />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            variant="contained"
            disabled={!name.trim()}
            sx={BUTTON_STYLES.primary}
          >
            Create {createType === 'file' ? 'File' : 'Folder'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateFileButton;