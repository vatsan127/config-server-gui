import React, { useState } from 'react';
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
import { COLORS } from '../../theme/colors';

const CreateFileButton = ({ onCreateFile, onCreateFolder }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createType, setCreateType] = useState('file');
  const [name, setName] = useState('');

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

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleClick}
        sx={{
          bgcolor: COLORS.primary.main,
          color: 'white',
          '&:hover': {
            bgcolor: COLORS.primary.dark
          },
          textTransform: 'none',
          fontWeight: 600
        }}
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
      >
        <DialogTitle>
          Create New {createType === 'file' ? 'File' : 'Folder'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              fullWidth
              label={`${createType === 'file' ? 'File' : 'Folder'} Name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={createType === 'file' ? 'config.properties' : 'new-folder'}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            variant="contained"
            disabled={!name.trim()}
            sx={{
              bgcolor: COLORS.primary.main,
              '&:hover': {
                bgcolor: COLORS.primary.dark
              }
            }}
          >
            Create {createType === 'file' ? 'File' : 'Folder'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateFileButton;