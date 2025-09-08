import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  Alert,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Security as SecurityIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  VpnKey as VpnKeyIcon,
  History as HistoryIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { apiService, setNotificationHandler } from '../services/api';
import { COLORS, SIZES, BUTTON_STYLES } from '../theme/colors';
import { FileListSkeleton } from './common/SkeletonLoader';
import { useSearchShortcut } from '../hooks/useKeyboardShortcut';
import { getStandardDialogProps, getDialogTitleAnimationStyles, getDialogContentAnimationStyles, getDialogActionsAnimationStyles } from '../utils/dialogAnimations';
import HistoryPanel from './common/HistoryPanel';
import PageHeader from './common/PageHeader';
import SearchResultInfo from './common/SearchResultInfo';
import ModernList, { ModernActionButton } from './common/ModernList';

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
  
  // Delete secret dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [secretToDelete, setSecretToDelete] = useState('');
  const [deleteCommitMessage, setDeleteCommitMessage] = useState('');
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
  const secretKeys = useMemo(() => Object.keys(secrets), [secrets]);
  
  const filteredSecrets = useMemo(() => {
    if (!searchQuery.trim()) return secretKeys;
    return secretKeys.filter(key =>
      key.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [secretKeys, searchQuery]);

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
      await fetchSecrets();
    } catch (err) {
      console.error('Error saving secret:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleHistoryClick = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryPanelOpen(true);
    
    try {
      const data = await apiService.getVaultHistory(namespace);
      setHistoryData({
        ...data,
        filePath: data.vaultFile || 'Vault'
      });
    } catch (err) {
      console.error('Error fetching vault history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [namespace]);

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

  const handleDeleteClick = (secretKey) => {
    setSecretToDelete(secretKey);
    setDeleteCommitMessage(`Remove secret: ${secretKey}`);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSecret = async () => {
    if (!deleteCommitMessage.trim()) {
      enqueueSnackbar('Commit message is required', { variant: 'error' });
      return;
    }

    setDeleting(true);
    try {
      // Remove the key from secrets object
      const updatedSecrets = { ...secrets };
      delete updatedSecrets[secretToDelete];
      
      await apiService.updateVaultSecrets(namespace, 'user@example.com', deleteCommitMessage, updatedSecrets);
      
      setSecrets(updatedSecrets);
      setDeleteDialogOpen(false);
      setSecretToDelete('');
      setDeleteCommitMessage('');
      
      // Show warning about encrypted value placeholder
      enqueueSnackbar(
        `Secret "${secretToDelete}" removed. Remember to update any encrypted value placeholders in your config files.`, 
        { variant: 'warning', autoHideDuration: 8000 }
      );
      
      await fetchSecrets();
    } catch (err) {
      console.error('Error deleting secret:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSecretToDelete('');
    setDeleteCommitMessage('');
  };



  // Render functions for ModernList
  const renderIcon = useCallback(() => (
    <VpnKeyIcon sx={{ 
      color: COLORS.primary.main,
      fontSize: 22
    }} />
  ), []);

  const renderActions = useCallback((secretKey) => [
    <ModernActionButton
      key="edit"
      icon={<EditIcon fontSize="small" />}
      onClick={(e) => {
        e.stopPropagation();
        handleSecretClick(secretKey);
      }}
      tooltip="Edit Secret"
    />,
    <ModernActionButton
      key="delete"
      icon={<DeleteIcon fontSize="small" />}
      onClick={(e) => {
        e.stopPropagation();
        handleDeleteClick(secretKey);
      }}
      tooltip="Delete Secret"
      color="#ef4444"
      hoverColor="#dc2626"
      hoverBg="rgba(239, 68, 68, 0.1)"
      hoverShadow="0 2px 8px rgba(239, 68, 68, 0.2)"
    />
  ], [handleSecretClick]);

  const emptyState = useMemo(() => (
    <Box sx={{ textAlign: 'center' }}>
      <SecurityIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3, color: COLORS.text.secondary }} />
      <Typography variant="h6" sx={{ mb: 1, color: COLORS.text.primary, fontWeight: 500 }}>
        {secretKeys.length === 0 ? 'No secrets found' : 'No matching secrets'}
      </Typography>
      <Typography variant="body2" sx={{ color: COLORS.text.secondary, fontSize: '0.85rem' }}>
        {secretKeys.length === 0 ? 'Add your first secret to get started' : 'Try adjusting your search query'}
      </Typography>
    </Box>
  ), [secretKeys.length]);

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

  return (
    <Box sx={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column',
      p: SIZES.spacing.xs,
      bgcolor: 'background.default',
      height: '100vh',
      overflow: 'hidden',
      animation: 'fadeInUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.15s both',
      '@keyframes fadeInUp': {
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
      <PageHeader
        title={`${namespace} • Vault`}
        subtitle={`${secretKeys.length} secrets`}
        icon={SecurityIcon}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search secrets"
        actions={[
          {
            label: 'Add Secret',
            icon: <AddIcon />,
            onClick: () => setAddDialogOpen(true),
            sx: BUTTON_STYLES.primary
          }
        ]}
      />

      <SearchResultInfo 
        searchQuery={searchQuery}
        filteredCount={filteredSecrets.length}
        totalCount={secretKeys.length}
        itemType="secret"
      />

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <ModernList
          items={filteredSecrets}
          emptyState={emptyState}
          onItemClick={handleSecretClick}
          renderIcon={renderIcon}
          renderActions={renderActions}
          searchQuery={searchQuery}
          itemType="secret"
        />
      </Box>

      {/* Secret Detail Modal */}
      <Dialog
        open={secretModalOpen}
        onClose={() => setSecretModalOpen(false)}
        maxWidth="sm"
        fullWidth
        {...getStandardDialogProps()}
        PaperProps={{
          sx: {
            borderRadius: `${SIZES.borderRadius.large}px`,
            boxShadow: SIZES.shadow.elevated,
            bgcolor: COLORS.background.paper,
            border: `1px solid ${COLORS.grey[200]}`,
            backdropFilter: 'blur(10px)',
            animation: 'dialogSlideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            '@keyframes dialogSlideIn': {
              '0%': {
                opacity: 0,
                transform: 'scale(0.95) translateY(-20px)'
              },
              '100%': {
                opacity: 1,
                transform: 'scale(1) translateY(0)'
              }
            }
          }
        }}
      >
        <DialogTitle sx={{
          ...getDialogTitleAnimationStyles(),
          bgcolor: COLORS.grey[50],
          borderBottom: `1px solid ${COLORS.grey[200]}`,
          p: 3,
          borderTopLeftRadius: `${SIZES.borderRadius.large}px`,
          borderTopRightRadius: `${SIZES.borderRadius.large}px`
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            animation: 'fadeInRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s both',
            '@keyframes fadeInRight': {
              '0%': {
                opacity: 0,
                transform: 'translateX(-10px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateX(0)'
              }
            }
          }}>
            <Box sx={{
              p: 1.5,
              borderRadius: `${SIZES.borderRadius.medium}px`,
              bgcolor: `${COLORS.primary.main}15`,
              border: `1px solid ${COLORS.primary.main}30`,
              display: 'flex',
              alignItems: 'center'
            }}>
              <VpnKeyIcon sx={{ 
                color: COLORS.primary.main,
                fontSize: 24
              }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ 
                color: COLORS.text.primary,
                fontWeight: 600,
                fontSize: '1.25rem'
              }}>
                {selectedSecret}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{
          ...getDialogContentAnimationStyles(),
          px: 3,
          pt: editMode ? 2 : 3,
          pb: 2
        }}>
          {editMode && (
            <TextField
              fullWidth
              label="Commit Message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Describe your changes..."
              required
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              sx={{ 
                mt: 1,
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: `${SIZES.borderRadius.medium}px`,
                  bgcolor: COLORS.background.paper,
                  transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover fieldset': {
                    borderColor: COLORS.grey[400],
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: COLORS.primary.main,
                    borderWidth: 2,
                    boxShadow: `0 0 0 3px ${COLORS.primary.main}20`,
                  }
                }
              }}
            />
          )}
          
          <TextField
            fullWidth
            label="Secret Value"
            type={showValue ? 'text' : 'password'}
            value={editMode ? editedValue : (secrets[selectedSecret] || '')}
            onChange={(e) => editMode && setEditedValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (editMode && commitMessage.trim()) {
                  handleSaveSecret();
                }
              }
            }}
            disabled={!editMode}
            sx={{
              mt: editMode ? 0 : 2,
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                borderRadius: `${SIZES.borderRadius.medium}px`,
                bgcolor: editMode ? COLORS.background.paper : COLORS.grey[50],
                transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover fieldset': {
                  borderColor: editMode ? COLORS.grey[400] : COLORS.grey[300],
                },
                '&.Mui-focused fieldset': {
                  borderColor: COLORS.primary.main,
                  borderWidth: 2,
                  boxShadow: `0 0 0 3px ${COLORS.primary.main}20`,
                },
                '&.Mui-disabled': {
                  bgcolor: COLORS.grey[100],
                  '& fieldset': {
                    borderColor: COLORS.grey[200]
                  }
                }
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowValue(!showValue)}
                    edge="end"
                    sx={{
                      color: COLORS.text.secondary,
                      transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      '&:hover': {
                        color: COLORS.primary.main,
                        bgcolor: `${COLORS.primary.main}10`,
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    {showValue ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        
        <DialogActions sx={{
          ...getDialogActionsAnimationStyles(),
          p: 3,
          pt: 2,
          bgcolor: COLORS.grey[50],
          borderTop: `1px solid ${COLORS.grey[200]}`,
          borderBottomLeftRadius: `${SIZES.borderRadius.large}px`,
          borderBottomRightRadius: `${SIZES.borderRadius.large}px`,
          gap: 1
        }}>
          {!editMode ? (
            <>
              <Button 
                onClick={() => setSecretModalOpen(false)}
                sx={{
                  color: COLORS.text.secondary,
                  '&:hover': {
                    bgcolor: COLORS.grey[100]
                  }
                }}
              >
                Close
              </Button>
              <Button 
                onClick={handleEditSecret}
                variant="contained"
                startIcon={<EditIcon />}
                sx={{
                  ...BUTTON_STYLES.primary,
                  animation: 'bounceIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both',
                  '@keyframes bounceIn': {
                    '0%': {
                      opacity: 0,
                      transform: 'scale(0.8)'
                    },
                    '50%': {
                      transform: 'scale(1.05)'
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'scale(1)'
                    }
                  }
                }}
              >
                Edit Secret
              </Button>
            </>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              width: '100%',
              animation: 'slideInFromRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              '@keyframes slideInFromRight': {
                '0%': {
                  opacity: 0,
                  transform: 'translateX(20px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateX(0)'
                }
              }
            }}>
              <Button 
                onClick={handleCancelEdit}
                sx={{
                  color: COLORS.text.secondary,
                  '&:hover': {
                    bgcolor: COLORS.grey[100]
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveSecret}
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saving || !commitMessage.trim()}
                sx={{
                  ...BUTTON_STYLES.primary,
                  '&:disabled': {
                    bgcolor: COLORS.grey[300],
                    color: COLORS.grey[500]
                  }
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (newSecretKey.trim() && newSecretValue.trim()) {
                  handleAddSecret();
                }
              }
            }}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: `${SIZES.borderRadius.medium}px`,
                bgcolor: COLORS.background.paper,
                transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover fieldset': {
                  borderColor: COLORS.grey[400],
                },
                '&.Mui-focused fieldset': {
                  borderColor: COLORS.primary.main,
                  borderWidth: 2,
                  boxShadow: `0 0 0 3px ${COLORS.primary.main}20`,
                }
              }
            }}
          />
          <TextField
            margin="dense"
            label="Secret Value"
            fullWidth
            variant="outlined"
            value={newSecretValue}
            onChange={(e) => setNewSecretValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (newSecretKey.trim() && newSecretValue.trim()) {
                  handleAddSecret();
                }
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                borderRadius: `${SIZES.borderRadius.medium}px`,
                bgcolor: COLORS.background.paper,
                transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover fieldset': {
                  borderColor: COLORS.grey[400],
                },
                '&.Mui-focused fieldset': {
                  borderColor: COLORS.primary.main,
                  borderWidth: 2,
                  boxShadow: `0 0 0 3px ${COLORS.primary.main}20`,
                }
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

      {/* Delete Secret Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
        {...getStandardDialogProps()}
      >
        <DialogTitle sx={getDialogTitleAnimationStyles()}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DeleteIcon sx={{ color: '#ef4444', fontSize: 24 }} />
            <Typography variant="h6" sx={{ color: COLORS.text.primary }}>
              Delete Secret
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={getDialogContentAnimationStyles()}>
          <Typography variant="body1" sx={{ mb: 2, color: COLORS.text.primary }}>
            Are you sure you want to delete the secret <strong>"{secretToDelete}"</strong>?
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: COLORS.text.secondary, bgcolor: '#fff3cd', p: 2, borderRadius: 1, border: '1px solid #ffeaa7' }}>
            <strong>Warning:</strong> If you've used this secret as an encrypted value placeholder in your config files, 
            you'll need to manually update those references after deletion.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Commit Message"
            value={deleteCommitMessage}
            onChange={(e) => setDeleteCommitMessage(e.target.value)}
            placeholder="Describe why you're removing this secret..."
            required
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: `${SIZES.borderRadius.medium}px`,
                bgcolor: COLORS.background.paper,
                transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover fieldset': {
                  borderColor: COLORS.grey[400],
                },
                '&.Mui-focused fieldset': {
                  borderColor: COLORS.primary.main,
                  borderWidth: 2,
                  boxShadow: `0 0 0 3px ${COLORS.primary.main}20`,
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={getDialogActionsAnimationStyles()}>
          <Button onClick={handleCancelDelete}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteSecret}
            variant="contained"
            disabled={deleting || !deleteCommitMessage.trim()}
            sx={{
              bgcolor: '#ef4444',
              '&:hover': {
                bgcolor: '#dc2626'
              },
              '&:disabled': {
                bgcolor: COLORS.grey[300],
                color: COLORS.grey[500]
              }
            }}
          >
            {deleting ? 'Deleting...' : 'Delete Secret'}
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