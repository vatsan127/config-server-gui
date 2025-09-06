import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  alpha
} from '@mui/material';
import {
  Security as SecurityIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { apiService, setNotificationHandler } from '../services/api';
import { COLORS, SIZES, BUTTON_STYLES } from '../theme/colors';
import { FileListSkeleton } from './common/SkeletonLoader';
import { useSearchShortcut } from '../hooks/useKeyboardShortcut';
import { getStandardDialogProps, getDialogTitleAnimationStyles, getDialogContentAnimationStyles, getDialogActionsAnimationStyles } from '../utils/dialogAnimations';
import HistoryPanel from './common/HistoryPanel';

const VaultPage = () => {
  const { namespace } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const searchInputRef = useRef(null);
  
  const [secrets, setSecrets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Secret modal states
  const [selectedSecret, setSelectedSecret] = useState(null);
  const [secretModalOpen, setSecretModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedValue, setEditedValue] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [showValue, setShowValue] = useState(false);
  
  // History states
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [changesData, setChangesData] = useState(null);
  const [changesLoading, setChangesLoading] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  const [selectedCommitId, setSelectedCommitId] = useState(null);
  
  // Add secret dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSecretKey, setNewSecretKey] = useState('');
  const [newSecretValue, setNewSecretValue] = useState('');
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [secretToDelete, setSecretToDelete] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Set up notification handler
  const notificationRef = useRef();
  notificationRef.current = enqueueSnackbar;
  
  useEffect(() => {
    setNotificationHandler((message, options) => {
      notificationRef.current(message, options);
    });
  }, []);

  // Handle Ctrl+K to focus search
  const handleSearchFocus = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useSearchShortcut(handleSearchFocus);

  const fetchSecrets = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getVaultSecrets(namespace);
      const secretsData = data.secrets || {};
      setSecrets(secretsData);
    } catch (err) {
      console.error('Error fetching vault secrets:', err);
      setError('Failed to load vault secrets');
    } finally {
      setLoading(false);
    }
  }, [namespace]);

  useEffect(() => {
    fetchSecrets();
  }, [fetchSecrets]);

  // Filter secrets based on search query
  const filteredSecrets = useMemo(() => {
    const secretKeys = Object.keys(secrets);
    if (!searchQuery.trim()) return secretKeys;
    return secretKeys.filter(key =>
      key.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [secrets, searchQuery]);

  const handleSecretClick = useCallback((secretKey) => {
    setSelectedSecret(secretKey);
    setEditedValue(secrets[secretKey]);
    setSecretModalOpen(true);
    setEditMode(false);
    setShowValue(false);
    setCommitMessage('');
  }, [secrets]);

  const handleEditSecret = () => {
    setEditMode(true);
    setShowValue(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedValue(secrets[selectedSecret]);
    setCommitMessage('');
    setShowValue(false);
  };

  const handleSaveSecret = async () => {
    if (!commitMessage.trim()) {
      enqueueSnackbar('Commit message is required', { variant: 'error' });
      return;
    }

    setSaving(true);
    try {
      const updatedSecrets = { ...secrets, [selectedSecret]: editedValue };
      await apiService.updateVaultSecrets(namespace, 'user@example.com', commitMessage, updatedSecrets);
      
      setSecrets(updatedSecrets);
      setSecretModalOpen(false);
      setEditMode(false);
      setCommitMessage('');
      await fetchSecrets(); // Refresh to get latest data
    } catch (err) {
      console.error('Error saving secret:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleHistoryClick = async (secretKey, event) => {
    event.stopPropagation();
    setHistoryLoading(true);
    setHistoryPanelOpen(true);
    
    try {
      const data = await apiService.getVaultHistory(namespace);
      setHistoryData({
        ...data,
        // Use vault file name instead of individual secret
        filePath: data.vaultFile || 'Vault'
      });
    } catch (err) {
      console.error('Error fetching vault history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCommitSelect = async (commitId) => {
    if (selectedCommitId === commitId && showChanges) {
      return;
    }

    setSelectedCommitId(commitId);
    setChangesLoading(true);
    setShowChanges(true);

    try {
      const data = await apiService.getVaultChanges(namespace, commitId);
      setChangesData(data);
    } catch (err) {
      console.error('Error fetching vault changes:', err);
      setChangesData(null);
    } finally {
      setChangesLoading(false);
    }
  };

  const handleBackToHistory = () => {
    setShowChanges(false);
    setChangesData(null);
    setSelectedCommitId(null);
  };

  const handleCloseHistory = () => {
    setHistoryPanelOpen(false);
    setShowChanges(false);
    setChangesData(null);
    setSelectedCommitId(null);
  };

  const handleAddSecret = async () => {
    if (!newSecretKey.trim() || !newSecretValue.trim()) {
      enqueueSnackbar('Both key and value are required', { variant: 'error' });
      return;
    }

    if (secrets[newSecretKey]) {
      enqueueSnackbar('Secret key already exists', { variant: 'error' });
      return;
    }

    try {
      const updatedSecrets = { ...secrets, [newSecretKey]: newSecretValue };
      await apiService.updateVaultSecrets(namespace, 'user@example.com', `Add secret: ${newSecretKey}`, updatedSecrets);
      
      setSecrets(updatedSecrets);
      setNewSecretKey('');
      setNewSecretValue('');
      setAddDialogOpen(false);
      await fetchSecrets();
    } catch (err) {
      console.error('Error adding secret:', err);
    }
  };

  const handleDeleteClick = useCallback((secretKey, event) => {
    event.stopPropagation();
    setSecretToDelete(secretKey);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteMessage.trim()) {
      enqueueSnackbar('Delete message is required', { variant: 'error' });
      return;
    }

    setDeleting(true);
    try {
      const updatedSecrets = { ...secrets };
      delete updatedSecrets[secretToDelete];
      
      await apiService.updateVaultSecrets(namespace, 'user@example.com', deleteMessage, updatedSecrets);
      
      setSecrets(updatedSecrets);
      setDeleteDialogOpen(false);
      setDeleteMessage('');
      setSecretToDelete(null);
      await fetchSecrets();
    } catch (err) {
      console.error('Error deleting secret:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, pt: 2 }}>
        <FileListSkeleton />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const secretKeys = Object.keys(secrets);

  return (
    <Box sx={{ p: 4, pt: 2 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 3,
        pb: 2,
        borderBottom: `1px solid ${alpha(COLORS.grey[300], 0.3)}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SecurityIcon sx={{ 
            color: COLORS.primary.main, 
            fontSize: 28,
            background: `linear-gradient(135deg, ${alpha(COLORS.primary.main, 0.1)}, ${alpha(COLORS.primary.main, 0.05)})`,
            p: 0.8,
            borderRadius: '8px'
          }} />
          <Box>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              color: COLORS.text.primary,
              mb: 0.5
            }}>
              Vault Secrets
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
              {namespace} • {secretKeys.length} secrets
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            ref={searchInputRef}
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ 
              width: 280,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: alpha(COLORS.background.paper, 0.8),
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: COLORS.text.secondary }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{ color: COLORS.text.secondary }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
            sx={BUTTON_STYLES.primary}
          >
            Add Secret
          </Button>
        </Box>
      </Box>

      {/* Secrets List */}
      {filteredSecrets.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          color: COLORS.text.secondary 
        }}>
          <SecurityIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            {secretKeys.length === 0 ? 'No secrets found' : 'No matching secrets'}
          </Typography>
          <Typography variant="body2">
            {secretKeys.length === 0 ? 'Add your first secret to get started' : 'Try adjusting your search query'}
          </Typography>
        </Box>
      ) : (
        <List sx={{ 
          bgcolor: COLORS.background.paper,
          borderRadius: '12px',
          border: `1px solid ${alpha(COLORS.grey[300], 0.2)}`,
          overflow: 'hidden'
        }}>
          {filteredSecrets.map((secretKey, index) => (
            <ListItem
              key={secretKey}
              sx={{
                borderBottom: index < filteredSecrets.length - 1 ? `1px solid ${alpha(COLORS.grey[300], 0.1)}` : 'none',
                '&:hover': {
                  backgroundColor: alpha(COLORS.primary.main, 0.04),
                },
                py: 1.5,
                px: 3
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <VpnKeyIcon sx={{ 
                  color: COLORS.primary.main,
                  fontSize: 20
                }} />
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ 
                    fontWeight: 500,
                    color: COLORS.text.primary
                  }}>
                    {secretKey}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" sx={{ 
                    color: COLORS.text.secondary,
                    fontFamily: 'monospace',
                    fontSize: '0.75rem'
                  }}>
                    •••••••••••••••••••••••••••••
                  </Typography>
                }
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Edit Secret">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSecretClick(secretKey);
                    }}
                    sx={{
                      color: COLORS.text.secondary,
                      '&:hover': {
                        color: COLORS.accent.blue,
                        backgroundColor: alpha(COLORS.accent.blue, 0.1)
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="View History">
                  <IconButton
                    size="small"
                    onClick={(e) => handleHistoryClick(secretKey, e)}
                    sx={{
                      color: COLORS.text.secondary,
                      '&:hover': {
                        color: COLORS.primary.main,
                        backgroundColor: alpha(COLORS.primary.main, 0.1)
                      }
                    }}
                  >
                    <HistoryIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete Secret">
                  <IconButton
                    size="small"
                    onClick={(e) => handleDeleteClick(secretKey, e)}
                    sx={{
                      color: COLORS.text.secondary,
                      '&:hover': {
                        color: COLORS.error.main,
                        backgroundColor: alpha(COLORS.error.main, 0.1)
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItem>
          ))}
        </List>
      )}

      {/* Secret Detail Modal */}
      <Dialog
        open={secretModalOpen}
        onClose={() => setSecretModalOpen(false)}
        maxWidth="sm"
        fullWidth
        {...getStandardDialogProps()}
      >
        <DialogTitle sx={getDialogTitleAnimationStyles()}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VpnKeyIcon sx={{ color: COLORS.primary.main }} />
            {selectedSecret}
          </Box>
        </DialogTitle>
        
        <DialogContent sx={getDialogContentAnimationStyles()}>
          {editMode && (
            <TextField
              fullWidth
              label="Commit Message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Describe your changes..."
              required
              sx={{ mb: 3 }}
            />
          )}
          
          <TextField
            fullWidth
            label="Secret Value"
            type={showValue ? 'text' : 'password'}
            value={editMode ? editedValue : secrets[selectedSecret]}
            onChange={editMode ? (e) => setEditedValue(e.target.value) : undefined}
            disabled={!editMode}
            multiline={editMode}
            rows={editMode ? 3 : 1}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowValue(!showValue)}
                    edge="end"
                  >
                    {showValue ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
              }
            }}
          />
        </DialogContent>
        
        <DialogActions sx={getDialogActionsAnimationStyles()}>
          <Button onClick={() => setSecretModalOpen(false)}>
            Close
          </Button>
          
          {!editMode ? (
            <Button 
              onClick={handleEditSecret}
              variant="contained"
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
          ) : (
            <>
              <Button onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveSecret}
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saving || !commitMessage.trim()}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Add Secret Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        {...getStandardDialogProps()}
      >
        <DialogTitle sx={getDialogTitleAnimationStyles()}>
          Add New Secret
        </DialogTitle>
        <DialogContent sx={getDialogContentAnimationStyles()}>
          <TextField
            autoFocus
            margin="dense"
            label="Secret Key"
            fullWidth
            variant="outlined"
            value={newSecretKey}
            onChange={(e) => setNewSecretKey(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Secret Value"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newSecretValue}
            onChange={(e) => setNewSecretValue(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={getDialogActionsAnimationStyles()}>
          <Button onClick={() => setAddDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddSecret}
            variant="contained"
            disabled={!newSecretKey.trim() || !newSecretValue.trim()}
          >
            Add Secret
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        {...getStandardDialogProps()}
      >
        <DialogTitle sx={getDialogTitleAnimationStyles()}>
          Delete Secret
        </DialogTitle>
        <DialogContent sx={getDialogContentAnimationStyles()}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete the secret "{secretToDelete}"?
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Delete Message"
            value={deleteMessage}
            onChange={(e) => setDeleteMessage(e.target.value)}
            placeholder="Reason for deletion..."
            required
          />
        </DialogContent>
        <DialogActions sx={getDialogActionsAnimationStyles()}>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting || !deleteMessage.trim()}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Panel */}
      <HistoryPanel
        isOpen={historyPanelOpen}
        onClose={handleCloseHistory}
        fileName="Vault"
        historyData={historyData}
        historyLoading={historyLoading}
        changesData={changesData}
        changesLoading={changesLoading}
        showChanges={showChanges}
        onBackToHistory={handleBackToHistory}
        onCommitSelect={handleCommitSelect}
        selectedCommitId={selectedCommitId}
      />
    </Box>
  );
};

export default VaultPage;