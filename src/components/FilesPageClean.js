import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Button,
  Breadcrumbs,
  Link,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Folder as FolderIcon,
  History as HistoryIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { apiService, setNotificationHandler } from '../services/api';
import { COLORS, SIZES, BUTTON_STYLES } from '../theme/colors';
import { normalizePath, getFileIconComponent } from '../utils';
import EmptyState from './common/EmptyState';
import CreateFileButton from './common/CreateFileButton';
import { FileListSkeleton } from './common/SkeletonLoader';
import { useSearchShortcut } from '../hooks/useKeyboardShortcut';
import DiffViewer from './common/DiffViewer';
import Navbar from './common/Navbar';


const FilesPage = () => {
  const { namespace } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const searchInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCommitId, setSelectedCommitId] = useState(null);
  const [changesData, setChangesData] = useState(null);
  const [changesLoading, setChangesLoading] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleting, setDeleting] = useState(false);

  const currentPath = searchParams.get('path') || '/';

  useEffect(() => {
    setNotificationHandler((data) => {
      if (data?.configFileCreated && data.path && data.fileName) {
        enqueueSnackbar(`Configuration file "${data.fileName}" created successfully`, { variant: 'success' });
        fetchFiles();
      } else if (data?.fileDeleted) {
        enqueueSnackbar(`File deleted successfully`, { variant: 'success' });
        fetchFiles();
      } else if (data?.error) {
        enqueueSnackbar(data.error, { variant: 'error' });
      }
    });

    return () => {
      setNotificationHandler(null);
    };
  }, [enqueueSnackbar]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get('/files', {
        params: { namespace, path: currentPath }
      });

      if (response.data?.files) {
        setFiles(response.data.files.sort((a, b) => {
          const aIsFolder = a.endsWith('/');
          const bIsFolder = b.endsWith('/');
          if (aIsFolder && !bIsFolder) return -1;
          if (!aIsFolder && bIsFolder) return 1;
          return a.localeCompare(b);
        }));
      }
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (namespace) {
      fetchFiles();
    }
  }, [namespace, currentPath]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    
    const query = searchQuery.toLowerCase();
    return files.filter(file => 
      file.toLowerCase().includes(query)
    );
  }, [files, searchQuery]);

  const handleItemClick = (item) => {
    if (item.endsWith('/')) {
      const folder = item.slice(0, -1);
      const newPath = currentPath === '/' 
        ? `/${folder}`
        : `${currentPath}/${folder}`;
      
      navigate(`/namespace/${namespace}/files?path=${encodeURIComponent(newPath)}`);
    } else {
      const filePath = currentPath === '/' 
        ? `/${item}`
        : `${currentPath}/${item}`;
      
      navigate(`/namespace/${namespace}/file?path=${encodeURIComponent(filePath)}`);
    }
  };

  const handleBreadcrumbClick = (segmentIndex) => {
    if (segmentIndex === -1) {
      navigate(`/namespace/${namespace}/files`);
    } else {
      const normalizedPath = normalizePath(currentPath);
      const pathSegments = normalizedPath === '/' ? [] : normalizedPath.split('/').filter(segment => segment.length > 0);
      const newPathSegments = pathSegments.slice(0, segmentIndex + 1);
      const newPath = newPathSegments.length === 0 ? '/' : `/${newPathSegments.join('/')}`;
      
      navigate(`/namespace/${namespace}/files?path=${encodeURIComponent(newPath)}`);
    }
  };

  const handleCreateConfigFile = () => {
    fetchFiles();
  };

  const handleDownloadFile = async (fileName, event) => {
    event.stopPropagation();
    
    try {
      const filePath = currentPath === '/' ? `/${fileName}` : `${currentPath}/${fileName}`;
      const response = await apiService.get('/file/content', {
        params: { namespace, path: filePath },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      enqueueSnackbar(`Downloaded ${fileName}`, { variant: 'success' });
    } catch (err) {
      console.error('Download error:', err);
      enqueueSnackbar(`Failed to download ${fileName}`, { variant: 'error' });
    }
  };

  const handleHistoryClick = async (fileName, event) => {
    event.stopPropagation();
    setSelectedFile(fileName);
    setHistoryOpen(true);
    setHistoryLoading(true);

    try {
      const filePath = currentPath === '/' ? `/${fileName}` : `${currentPath}/${fileName}`;
      const response = await apiService.get('/file/history', {
        params: { namespace, path: filePath }
      });

      setHistoryData(response.data?.commits || []);
    } catch (err) {
      console.error('History error:', err);
      enqueueSnackbar(`Failed to load history for ${fileName}`, { variant: 'error' });
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteClick = (fileName, event) => {
    event.stopPropagation();
    setFileToDelete(fileName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    
    try {
      setDeleting(true);
      const filePath = currentPath === '/' ? `/${fileToDelete}` : `${currentPath}/${fileToDelete}`;
      
      await apiService.delete('/file', {
        data: { namespace, path: filePath, message: deleteMessage }
      });
      
      setDeleteDialogOpen(false);
      setFileToDelete(null);
      setDeleteMessage('');
      fetchFiles();
    } catch (err) {
      console.error('Delete error:', err);
      enqueueSnackbar(`Failed to delete ${fileToDelete}`, { variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFileToDelete(null);
    setDeleteMessage('');
    setDeleting(false);
  };

  const handleHistoryClose = () => {
    setHistoryOpen(false);
    setSelectedFile(null);
    setSelectedCommitId(null);
    setChangesData(null);
    setShowChanges(false);
  };

  useSearchShortcut(searchInputRef);

  const normalizedPath = normalizePath(currentPath);
  const pathSegments = normalizedPath === '/' ? [] : normalizedPath.split('/').filter(segment => segment.length > 0);

  if (loading) {
    return (
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'background.default',
        minHeight: '100vh'
      }}>
        <Navbar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchInputRef={searchInputRef}
          showSearch={true}
          showCreateConfig={true}
          onCreateConfigFile={handleCreateConfigFile}
          currentPath={currentPath}
        />
        <Box sx={{ p: SIZES.spacing.xs }}>
          <Box mb={0.5}>
            <Typography variant="body1" sx={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              color: COLORS.text.primary 
            }}>
              {namespace || ''}
            </Typography>
          </Box>
          <FileListSkeleton count={6} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'background.default',
        minHeight: '100vh'
      }}>
        <Navbar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchInputRef={searchInputRef}
          showSearch={true}
          showCreateConfig={true}
          onCreateConfigFile={handleCreateConfigFile}
          currentPath={currentPath}
        />
        <Box sx={{ p: SIZES.spacing.xs }}>
          <Box mb={0.5}>
            <Typography variant="body1" sx={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              color: COLORS.text.primary 
            }}>
              {namespace || ''}
            </Typography>
          </Box>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default',
      minHeight: '100vh'
    }}>
      <Navbar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchInputRef}
        showSearch={true}
        showCreateConfig={true}
        onCreateConfigFile={handleCreateConfigFile}
        currentPath={currentPath}
      />
      
      <Box sx={{ p: SIZES.spacing.xs }}>
        {searchQuery && (
          <Box sx={{ 
            mb: 1,
            p: SIZES.spacing.xs,
            bgcolor: COLORS.grey[50],
            border: `1px solid ${COLORS.grey[200]}`,
            borderRadius: `${SIZES.borderRadius.medium}px`
          }}>
            <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
              {filteredFiles.length === 0 
                ? `No items found matching "${searchQuery}"`
                : `Showing ${filteredFiles.length} of ${files.length} items matching "${searchQuery}"`
              }
            </Typography>
          </Box>
        )}

        <Box sx={{ 
          bgcolor: COLORS.background.paper,
          border: `1px solid ${COLORS.grey[200]}`,
          borderRadius: `${SIZES.borderRadius.medium}px`,
          boxShadow: SIZES.shadow.sm,
          overflow: 'hidden',
          minHeight: filteredFiles.length === 0 ? 'auto' : 'initial'
        }}>
          {filteredFiles.length === 0 ? (
            <Box sx={{ 
              py: SIZES.spacing.md, 
              px: SIZES.spacing.lg,
              textAlign: 'center',
              color: COLORS.text.secondary
            }}>
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                {searchQuery ? "No matching items found" : "No items found"}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                {searchQuery ? `No items match your search for "${searchQuery}"` : "This directory is empty"}
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0, px: 0 }}>
              {filteredFiles.map((item, index) => {
                return (
                <ListItem
                  key={item}
                  sx={{
                    borderBottom: index < filteredFiles.length - 1 ? `1px solid ${COLORS.grey[100]}` : 'none',
                    py: 0,
                    px: 0,
                    mx: 0,
                    width: '100%',
                    '&.MuiListItem-root': {
                      paddingLeft: 0,
                      paddingRight: 0,
                      marginLeft: 0,
                      marginRight: 0
                    }
                  }}
                >
                  <Box 
                    onClick={() => handleItemClick(item)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      py: 1.5,
                      transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: COLORS.hover.card,
                        transform: 'translateX(4px)',
                        '& .action-buttons': {
                          opacity: 1,
                          visibility: 'visible'
                        }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, pl: 2 }}>
                      {item.endsWith('/') ? (
                        <FolderIcon sx={{ 
                          color: COLORS.primary.main,
                          fontSize: 20
                        }} />
                      ) : (
                        getFileIconComponent(item)
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.endsWith('/') ? item.slice(0, -1) : item}
                      primaryTypographyProps={{
                        sx: {
                          color: item.endsWith('/') ? COLORS.primary.main : COLORS.text.primary,
                          fontWeight: item.endsWith('/') ? 500 : 400,
                          fontSize: '0.85rem',
                        }
                      }}
                    />
                    {!item.endsWith('/') && (
                      <Box 
                        className="action-buttons"
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          ml: 1, 
                          mr: 2,
                          gap: 0.5,
                          opacity: 0,
                          visibility: 'hidden',
                          transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => handleDownloadFile(item, e)}
                          sx={{
                            color: COLORS.text.secondary,
                            '&:hover': {
                              color: COLORS.success.main,
                              bgcolor: COLORS.grey[100]
                            },
                            p: 0.5
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleHistoryClick(item, e)}
                          sx={{
                            color: COLORS.text.secondary,
                            '&:hover': {
                              color: COLORS.primary.main,
                              bgcolor: COLORS.grey[100]
                            },
                            p: 0.5
                          }}
                        >
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleDeleteClick(item, e)}
                          sx={{
                            color: COLORS.text.secondary,
                            '&:hover': {
                              color: COLORS.error.main,
                              bgcolor: COLORS.grey[100]
                            },
                            p: 0.5
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </ListItem>
                );
              })}
            </List>
          )}
        </Box>

        {/* History Dialog */}
        <Dialog
          open={historyOpen}
          onClose={handleHistoryClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: `${SIZES.borderRadius.medium}px`,
              mt: -8
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: `1px solid ${COLORS.grey[200]}`,
            pb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <Typography variant="h6" sx={{ 
                color: COLORS.text.primary, 
                fontSize: '1.1rem', 
                fontWeight: 600, 
                mb: 0.5 
              }}>
                File History
              </Typography>
              <Typography variant="body2" sx={{ 
                color: COLORS.text.secondary, 
                fontSize: '0.85rem' 
              }}>
                {selectedFile}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowChanges(!showChanges)}
                disabled={!selectedCommitId}
                sx={{
                  ...BUTTON_STYLES.secondary,
                  minWidth: 'auto',
                  px: 2,
                  py: 0.5,
                  fontSize: '0.75rem'
                }}
                startIcon={showChanges ? <ArrowBackIcon fontSize="small" /> : null}
              >
                {showChanges ? 'Back' : 'View Changes'}
              </Button>
              <IconButton onClick={handleHistoryClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0 }}>
            {historyLoading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: 200,
                flexDirection: 'column',
                gap: 2
              }}>
                <CircularProgress size={32} />
                <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
                  Loading file history...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ minHeight: 300, maxHeight: 500, overflow: 'auto' }}>
                {historyData.length === 0 ? (
                  <EmptyState 
                    message="No history available"
                    description="This file has no commit history."
                  />
                ) : (
                  historyData.map((commit, index) => (
                    <Box
                      key={commit.commitId}
                      onClick={() => setSelectedCommitId(commit.commitId)}
                      sx={{
                        p: 2,
                        borderBottom: index < historyData.length - 1 ? `1px solid ${COLORS.grey[100]}` : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        bgcolor: selectedCommitId === commit.commitId ? COLORS.primary.light : 'transparent',
                        '&:hover': {
                          bgcolor: selectedCommitId === commit.commitId ? COLORS.primary.light : COLORS.grey[50]
                        },
                        transition: 'background-color 0.1s ease'
                      }}
                    >
                      <Typography variant="body2" sx={{ 
                        fontWeight: 600, 
                        color: COLORS.text.primary,
                        mb: 0.5
                      }}>
                        {commit.message || 'No commit message'}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: COLORS.text.secondary,
                        fontSize: '0.75rem'
                      }}>
                        {commit.author} • {commit.date ? new Date(commit.date).toLocaleString() : 'Unknown date'} • {commit.commitId?.substring(0, 7)}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            )}
          </DialogContent>
          
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={handleDeleteCancel} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: `${SIZES.borderRadius.medium}px`
            }
          }}
        >
          <DialogTitle sx={{ 
            color: COLORS.text.primary, 
            fontSize: '1.1rem', 
            fontWeight: 600,
            pb: 1
          }}>
            Delete File
          </DialogTitle>
          <DialogContent sx={{ 
            px: 2,
            py: 2,
            '&.MuiDialogContent-root': {
              paddingTop: 2
            }
          }}>
            <Typography variant="body1" sx={{ mb: 2, color: COLORS.text.primary }}>
              Are you sure you want to delete <strong>{fileToDelete}</strong>?
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: COLORS.text.secondary }}>
              This action cannot be undone. Please provide a deletion message:
            </Typography>
            <TextField
              autoFocus
              fullWidth
              multiline
              rows={3}
              value={deleteMessage}
              onChange={(e) => setDeleteMessage(e.target.value.slice(0, 200))}
              placeholder="Reason for deletion..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: `${SIZES.borderRadius.medium}px`,
                  '&.Mui-focused fieldset': {
                    borderColor: COLORS.primary.main,
                  },
                },
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: COLORS.text.secondary, 
                mt: 1, 
                display: 'block',
                textAlign: 'right'
              }}
            >
              {deleteMessage.length}/200 characters
            </Typography>
          </DialogContent>
          <DialogActions sx={{ 
            px: 2, 
            py: 1.5, 
            gap: 1,
            borderTop: `1px solid ${COLORS.grey[200]}`
          }}>
            <Button 
              onClick={handleDeleteCancel}
              disabled={deleting}
              sx={{
                ...BUTTON_STYLES.secondary,
                minWidth: 80
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm}
              disabled={deleting || deleteMessage.trim().length === 0}
              sx={{
                bgcolor: COLORS.error.main,
                color: COLORS.text.white,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: `${SIZES.borderRadius.medium}px`,
                minWidth: 100,
                '&:hover': {
                  bgcolor: COLORS.error.dark,
                  boxShadow: SIZES.shadow.md,
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  bgcolor: COLORS.grey[300],
                  color: COLORS.grey[500],
                  transform: 'none',
                }
              }}
            >
              {deleting ? 'Deleting...' : 'Delete File'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default FilesPage;