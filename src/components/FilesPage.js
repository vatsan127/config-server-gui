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
  InsertDriveFile as FileIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Code as CodeIcon,
  DataObject as JsonIcon,
  Description as TextIcon,
  Image as ImageIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { apiService, setNotificationHandler } from '../services/api';
import { COLORS, SIZES, BUTTON_STYLES } from '../theme/colors';
import { normalizePath } from '../utils';
import EmptyState from './common/EmptyState';
import CreateFileButton from './common/CreateFileButton';
import { FileListSkeleton } from './common/SkeletonLoader';
import { useSearchShortcut } from '../hooks/useKeyboardShortcut';

const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <CodeIcon sx={{ color: COLORS.accent.blue }} />;
    case 'json':
      return <JsonIcon sx={{ color: COLORS.accent.orange }} />;
    case 'md':
    case 'txt':
      return <TextIcon sx={{ color: COLORS.accent.green }} />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
      return <ImageIcon sx={{ color: COLORS.accent.pink }} />;
    default:
      return <FileIcon sx={{ color: COLORS.text.secondary }} />;
  }
};

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
  const [currentPath, setCurrentPath] = useState('/');
  const [searchQuery, setSearchQuery] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCommitId, setSelectedCommitId] = useState(null);

  // Set up notification handler with ref to avoid dependency issues
  const notificationRef = useRef();
  notificationRef.current = enqueueSnackbar;
  
  useEffect(() => {
    setNotificationHandler((message, options) => {
      notificationRef.current(message, options);
    });
  }, []); // Empty dependency array - runs only once

  // Handle Ctrl+K to focus search
  const handleSearchFocus = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  useSearchShortcut(handleSearchFocus);

  const fetchFiles = async (path = '/') => {
    console.log('fetchFiles called with path:', path);
    setLoading(true);
    setError(null);
    
    try {
      const normalizedPath = normalizePath(path);
      console.log('fetchFiles normalizedPath:', normalizedPath);
      const data = await apiService.getNamespaceFiles(namespace, normalizedPath);
      console.log('fetchFiles received data:', data);
      setFiles(data);
      setCurrentPath(normalizedPath);
      console.log('fetchFiles completed successfully');
    } catch (err) {
      setError('Failed to load files');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered - namespace:', namespace, 'searchParams:', searchParams.toString());
    if (namespace) {
      const pathParam = searchParams.get('path');
      console.log('pathParam from URL:', pathParam);
      if (pathParam) {
        const decodedPath = decodeURIComponent(pathParam);
        console.log('decodedPath:', decodedPath);
        fetchFiles(decodedPath);
      } else {
        console.log('No path param, fetching root');
        fetchFiles();
      }
    }
  }, [namespace, location.search]);

  const handleItemClick = (item) => {
    console.log('handleItemClick called with item:', item);
    console.log('currentPath:', currentPath);
    console.log('namespace:', namespace);
    if (item.endsWith('/')) {
      // For folders, construct the new path and directly fetch files
      const newPath = currentPath === '/' ? item : currentPath + item;
      const normalizedPath = normalizePath(newPath);
      console.log('Direct folder navigation to:', normalizedPath);
      
      // Try direct fetchFiles call instead of navigation
      fetchFiles(normalizedPath);
      
      // Also update URL manually
      const fullUrl = `/namespace/${namespace}/files?path=${encodeURIComponent(normalizedPath)}`;
      window.history.pushState({}, '', fullUrl);
      console.log('Updated URL to:', fullUrl);
      
    } else {
      // Navigate to file view page
      const encodedPath = encodeURIComponent(currentPath);
      const encodedFileName = encodeURIComponent(item);
      const fullUrl = `/namespace/${namespace}/file?path=${encodedPath}&file=${encodedFileName}`;
      console.log('Navigating to file:', encodedFileName, 'in path:', encodedPath);
      console.log('Full navigation URL:', fullUrl);
      navigate(fullUrl);
    }
  };


  const pathSegments = useMemo(() => {
    if (currentPath === '/') return [];
    return currentPath.split('/').filter(segment => segment.length > 0);
  }, [currentPath]);

  // Filter files based on search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    return files.filter(file =>
      file.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      fetchFiles('/');
    } else {
      const pathParts = pathSegments.slice(0, index + 1);
      const newPath = '/' + pathParts.join('/') + '/';
      fetchFiles(newPath);
    }
  };

  const handleCreateConfigFile = async (fileName, path) => {
    try {
      await apiService.createConfigFile(namespace, path, fileName);
      // Refresh the current directory to show updated file list
      fetchFiles(currentPath);
      // Success notification is already handled by the API service
    } catch (error) {
      console.error('Error creating config file:', error);
      // Error notification is already handled by the API service
      // Don't show duplicate error messages
    }
  };

  const handleHistoryClick = async (fileName, event) => {
    event.stopPropagation(); // Prevent file click when history button is clicked
    
    setSelectedFile(fileName);
    setHistoryOpen(true);
    setHistoryLoading(true);
    
    try {
      const historyData = await apiService.getFileHistory(namespace, currentPath, fileName);
      setHistoryData(historyData);
    } catch (error) {
      console.error('Error fetching file history:', error);
      setHistoryData({ commits: [] });
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleHistoryClose = () => {
    setHistoryOpen(false);
    setHistoryData(null);
    setSelectedFile(null);
    setSelectedCommitId(null);
  };

  const handleCommitSelect = (commitId) => {
    setSelectedCommitId(commitId);
    console.log('Selected commit ID:', commitId, 'for file:', selectedFile);
    // Store commit ID for future API usage
    // This can be used by other components or API calls that need the specific commit
  };

  if (loading) {
    return (
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        p: SIZES.spacing.xs,
        bgcolor: 'background.default',
        minHeight: '100vh'
      }}>
        <Box mb={0.5}>
          <Breadcrumbs
            aria-label="breadcrumb"
            separator="/"
            sx={{
              '& .MuiBreadcrumbs-separator': {
                color: COLORS.text.muted,
                mx: 0.5,
              },
            }}
          >
            <Typography variant="h5" sx={{
              color: COLORS.text.primary,
              fontWeight: 700,
              fontSize: '1.5rem',
            }}>
              {namespace}
            </Typography>
          </Breadcrumbs>
        </Box>
        <FileListSkeleton count={6} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: SIZES.spacing.xs }}>
        <Box mb={0.5}>
          <Breadcrumbs
            aria-label="breadcrumb"
            separator="/"
            sx={{
              '& .MuiBreadcrumbs-separator': {
                color: COLORS.text.muted,
                mx: 0.5,
              },
            }}
          >
            <Typography variant="h5" sx={{
              color: COLORS.text.primary,
              fontWeight: 700,
              fontSize: '1.5rem',
            }}>
              {namespace}
            </Typography>
          </Breadcrumbs>
        </Box>
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
      minHeight: '100vh'
    }}>
        <Box mb={0.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Breadcrumbs
              aria-label="breadcrumb"
              separator="/"
              sx={{
                '& .MuiBreadcrumbs-separator': {
                  color: COLORS.text.muted,
                  mx: 0.5,
                },
                '& .MuiBreadcrumbs-ol': {
                  flexWrap: 'nowrap',
                },
              }}
            >
              <Link
                component="button"
                variant="h5"
                onClick={() => handleBreadcrumbClick(-1)}
                sx={{
                  color: currentPath === '/' ? COLORS.text.primary : COLORS.primary.main,
                  fontWeight: currentPath === '/' ? 700 : 500,
                  fontSize: '1.5rem',
                  textDecoration: 'none',
                  cursor: currentPath === '/' ? 'default' : 'pointer',
                  '&:hover': {
                    textDecoration: currentPath === '/' ? 'none' : 'underline',
                    color: currentPath === '/' ? COLORS.text.primary : COLORS.primary.dark,
                  },
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {namespace}
              </Link>
              {pathSegments.map((segment, index) => (
                <Link
                  key={index}
                  component="button"
                  variant="h5"
                  onClick={() => handleBreadcrumbClick(index)}
                  sx={{
                    color: index === pathSegments.length - 1 ? COLORS.text.primary : COLORS.primary.main,
                    fontWeight: index === pathSegments.length - 1 ? 700 : 500,
                    fontSize: '1.5rem',
                    textDecoration: 'none',
                    cursor: index === pathSegments.length - 1 ? 'default' : 'pointer',
                    '&:hover': {
                      textDecoration: index === pathSegments.length - 1 ? 'none' : 'underline',
                      color: index === pathSegments.length - 1 ? COLORS.text.primary : COLORS.primary.dark,
                    },
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {segment}
                </Link>
              ))}
            </Breadcrumbs>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                inputRef={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files and folders..."
                size="small"
                sx={{ 
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: `${SIZES.borderRadius.medium}px`,
                    bgcolor: COLORS.background.paper,
                    '&:hover fieldset': {
                      borderColor: COLORS.grey[400],
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: COLORS.primary.main,
                      borderWidth: 2,
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: COLORS.text.muted, fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setSearchQuery('')}
                        size="small"
                        sx={{ 
                          color: COLORS.text.muted,
                          p: 0.5,
                          '&:hover': {
                            color: COLORS.text.primary,
                            bgcolor: COLORS.grey[100]
                          }
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <CreateFileButton
                onCreateConfigFile={handleCreateConfigFile}
                currentPath={currentPath}
              />
            </Box>
          </Box>

          <Divider sx={{ 
            mt: 1.5,
            mb: 1.5,
            borderColor: COLORS.grey[300],
            opacity: 0.6
          }} />

        </Box>


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
                ? `No files found matching "${searchQuery}"`
                : `Showing ${filteredFiles.length} of ${files.length} files matching "${searchQuery}"`
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
                {searchQuery ? "No matching files found" : "No files found"}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                {searchQuery ? `No files match your search for "${searchQuery}"` : "This directory is empty"}
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {filteredFiles.map((item, index) => {
                console.log('Rendering item:', item, 'is folder:', item.endsWith('/'));
                return (
                <ListItem
                  key={item}
                  onClick={() => handleItemClick(item)}
                  sx={{
                    borderBottom: index < filteredFiles.length - 1 ? `1px solid ${COLORS.grey[100]}` : 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: COLORS.hover.card,
                      transform: 'translateX(4px)',
                    },
                    py: 1.5,
                    px: 2,
                    cursor: 'pointer'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {item.endsWith('/') ? (
                      <FolderIcon sx={{ 
                        color: COLORS.primary.main,
                        fontSize: 20
                      }} />
                    ) : (
                      getFileIcon(item)
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
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
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
                    </Box>
                  )}
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
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: `1px solid ${COLORS.grey[200]}`,
            pb: 2
          }}>
            <Typography variant="h6" sx={{ color: COLORS.text.primary, fontWeight: 600 }}>
              History: {selectedFile}
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0 }}>
            {historyLoading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                py: 4 
              }}>
                <CircularProgress size={40} />
              </Box>
            ) : historyData && historyData.commits && historyData.commits.length > 0 ? (
              <List sx={{ py: 0 }}>
                {historyData.commits.map((commit, index) => (
                  <ListItem
                    key={commit.commitId || index}
                    onClick={() => handleCommitSelect(commit.commitId)}
                    sx={{
                      borderBottom: index < historyData.commits.length - 1 ? `1px solid ${COLORS.grey[100]}` : 'none',
                      py: 2,
                      px: 3,
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      bgcolor: selectedCommitId === commit.commitId ? COLORS.primary.light : 'transparent',
                      '&:hover': {
                        bgcolor: selectedCommitId === commit.commitId ? COLORS.primary.light : COLORS.grey[50]
                      },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: COLORS.text.primary, 
                        fontWeight: 500,
                        mb: 0.5,
                        lineHeight: 1.4
                      }}
                    >
                      {commit.message || 'No commit message'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: COLORS.text.secondary,
                        fontSize: '0.8rem'
                      }}
                    >
                      {commit.author && commit.email ? `${commit.author} (${commit.email})` : commit.author || commit.email || 'Unknown author'}
                      {commit.date && ` • ${new Date(commit.date).toLocaleDateString()} ${new Date(commit.date).toLocaleTimeString()}`}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ 
                py: 4, 
                px: 3,
                textAlign: 'center',
                color: COLORS.text.secondary
              }}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  No commit history found
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                  This file may be new or history is not available
                </Typography>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ 
            borderTop: `1px solid ${COLORS.grey[200]}`,
            pt: 2,
            px: 3,
            pb: 2,
            justifyContent: 'space-between'
          }}>
            {selectedCommitId && (
              <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
                Selected: {selectedCommitId.substring(0, 8)}...
              </Typography>
            )}
            <Box sx={{ marginLeft: 'auto' }}>
              <Button 
                onClick={handleHistoryClose}
                sx={{ 
                  color: COLORS.text.secondary,
                  '&:hover': {
                    bgcolor: COLORS.grey[100]
                  }
                }}
              >
                Close
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
    </Box>
  );
};

export default FilesPage;