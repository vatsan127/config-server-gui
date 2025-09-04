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
  DialogActions,
  alpha
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
  History as HistoryIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { apiService, setNotificationHandler } from '../services/api';
import { COLORS, SIZES, BUTTON_STYLES } from '../theme/colors';
import { normalizePath } from '../utils';
import EmptyState from './common/EmptyState';
import CreateFileButton from './common/CreateFileButton';
import { FileListSkeleton } from './common/SkeletonLoader';
import { useSearchShortcut } from '../hooks/useKeyboardShortcut';
import HistoryPanel from './common/HistoryPanel';

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
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCommitId, setSelectedCommitId] = useState(null);
  const [changesData, setChangesData] = useState(null);
  const [changesLoading, setChangesLoading] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteClick = (fileName, event) => {
    event.stopPropagation(); // Prevent file click when delete button is clicked
    setFileToDelete(fileName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteMessage.trim()) {
      enqueueSnackbar('Delete message is required', { variant: 'error' });
      return;
    }

    setDeleting(true);
    try {
      await apiService.deleteFile(namespace, currentPath, fileToDelete, deleteMessage);
      
      // Refresh the file list after deletion
      fetchFiles(currentPath);
      
      // Close the dialog and reset state
      setDeleteDialogOpen(false);
      setFileToDelete(null);
      setDeleteMessage('');
      
      // Success notification is already handled by the API service
    } catch (error) {
      console.error('Error deleting file:', error);
      // Error notification is already handled by the API service
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFileToDelete(null);
    setDeleteMessage('');
  };

  const handleHistoryClick = async (fileName, event) => {
    event.stopPropagation(); // Prevent file click when history button is clicked
    
    setSelectedFile(fileName);
    setHistoryPanelOpen(true);
    setHistoryLoading(true);
    setShowChanges(false); // Reset to history view
    setSelectedCommitId(null);
    setChangesData(null);
    
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
    setHistoryPanelOpen(false);
    setHistoryData(null);
    setSelectedFile(null);
    setSelectedCommitId(null);
    setChangesData(null);
    setShowChanges(false);
  };

  const handleBackToHistory = () => {
    setShowChanges(false);
    setSelectedCommitId(null);
    setChangesData(null);
  };

  const handleCommitSelect = async (commitId) => {
    setSelectedCommitId(commitId);
    setShowChanges(true);
    setChangesLoading(true);
    setChangesData(null);
    console.log('Selected commit ID:', commitId, 'for file:', selectedFile);
    
    try {
      const changes = await apiService.getCommitChanges(namespace, currentPath, selectedFile, commitId);
      setChangesData(changes);
    } catch (error) {
      console.error('Error fetching commit changes:', error);
      setChangesData(null);
    } finally {
      setChangesLoading(false);
    }
  };

  const handleDownloadFile = async (fileName, event) => {
    event.stopPropagation(); // Prevent file click when download button is clicked
    
    try {
      console.log('Downloading file:', fileName, 'from path:', currentPath);
      const fileData = await apiService.getFileContent(namespace, currentPath, fileName);
      
      // Create blob with YAML content
      const blob = new Blob([fileData.content], { type: 'application/x-yaml' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename with .yml extension if not already present
      const downloadFileName = fileName.endsWith('.yml') || fileName.endsWith('.yaml') 
        ? fileName 
        : `${fileName}.yml`;
      link.download = downloadFileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('File downloaded successfully:', downloadFileName);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      // Error notification is already handled by the API service
    }
  };


  if (loading) {
    return (
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        p: SIZES.spacing.xs,
        bgcolor: 'background.default',
        height: '100%'
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
              {namespace || ''}
            </Typography>
          </Breadcrumbs>
        </Box>
        <FileListSkeleton count={6} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: SIZES.spacing.xs
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
              {namespace || ''}
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
        <Box 
          mb={0.5}
          sx={{
            width: '100%',
            maxWidth: '100%',
            overflowX: 'hidden',
            animation: 'slideInFromTop 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both',
            '@keyframes slideInFromTop': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-15px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 0.5,
            width: '100%',
            minWidth: 0,
            gap: 2
          }}>
            <Breadcrumbs
              aria-label="breadcrumb"
              separator="/"
              sx={{
                flex: 1,
                minWidth: 0,
                '& .MuiBreadcrumbs-separator': {
                  color: COLORS.text.muted,
                  mx: 0.5,
                },
                '& .MuiBreadcrumbs-ol': {
                  flexWrap: 'nowrap',
                  overflow: 'hidden',
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
                {namespace || ''}
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
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 1, 
                alignItems: 'center',
                flexShrink: 0,
                minWidth: 'min-content',
                animation: 'fadeInScale 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.25s both',
                '@keyframes fadeInScale': {
                  '0%': {
                    opacity: 0,
                    transform: 'scale(0.98)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'scale(1)'
                  }
                }
              }}
            >
              <TextField
                inputRef={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                size="small"
                sx={{ 
                  width: 200,
                  minWidth: 150,
                  maxWidth: 250,
                  flexShrink: 1,
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: `${SIZES.borderRadius.medium}px`,
                    bgcolor: COLORS.background.paper,
                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    '& fieldset': {
                      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    },
                    '&:hover fieldset': {
                      borderColor: COLORS.grey[400],
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: COLORS.primary.main,
                      borderWidth: 2,
                      boxShadow: `0 0 0 3px ${COLORS.primary.main}20`,
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
              <Box
                sx={{
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  flexShrink: 0,
                  padding: '4px 0',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <CreateFileButton
                  onCreateConfigFile={handleCreateConfigFile}
                  currentPath={currentPath}
                />
              </Box>
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

        <Box 
          sx={{ 
            bgcolor: COLORS.background.paper,
            border: `1px solid ${COLORS.grey[200]}`,
            borderRadius: `${SIZES.borderRadius.large}px`,
            boxShadow: SIZES.shadow.card,
            overflow: 'auto',
            flex: 1,
            transform: 'translateY(0) scale(1)',
            opacity: 1,
            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            animation: 'slideUpFade 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s both',
            '@keyframes slideUpFade': {
              '0%': {
                opacity: 0,
                transform: 'translateY(30px) scale(0.98)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0) scale(1)'
              }
            },
            '&:hover': {
              boxShadow: SIZES.shadow.elevated,
              transform: 'translateY(-2px) scale(1.01)',
            }
          }}
        >
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
                    transform: 'translateX(0) scale(1)',
                    opacity: 1,
                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    animation: `fadeScaleIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.4 + index * 0.03}s both`,
                    '@keyframes fadeScaleIn': {
                      '0%': {
                        opacity: 0,
                        transform: 'scale(0.95)'
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'scale(1)'
                      }
                    },
                    '&:hover': {
                      bgcolor: COLORS.hover.card,
                      transform: 'translateX(8px) scale(1.01)',
                      borderColor: COLORS.primary.light,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      '& .action-buttons': {
                        opacity: 1,
                        visibility: 'visible',
                        transform: 'translateX(0)',
                      },
                      '& .MuiListItemIcon-root': {
                        transform: 'scale(1.15) rotate(5deg)',
                      },
                      '& .MuiListItemText-primary': {
                        color: COLORS.text.primary,
                        fontWeight: 500,
                        transform: 'translateX(4px)',
                      }
                    },
                    '&:active': {
                      transform: 'translateX(4px) scale(1.005)',
                      transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                    py: 2,
                    px: 3,
                    cursor: 'pointer'
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 40,
                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    {item.endsWith('/') ? (
                      <FolderIcon sx={{ 
                        color: COLORS.primary.main,
                        fontSize: 22
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
                        fontWeight: item.endsWith('/') ? 600 : 400,
                        fontSize: '0.9rem',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        lineHeight: 1.4
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
                        gap: 0.5,
                        opacity: 0,
                        visibility: 'hidden',
                        transform: 'translateX(10px) scale(0.9)',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => handleDownloadFile(item, e)}
                        sx={{
                          color: COLORS.text.secondary,
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            color: '#10b981',
                            bgcolor: 'rgba(16, 185, 129, 0.1)',
                            transform: 'scale(1.1)',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                          },
                          p: 0.5,
                          borderRadius: '6px'
                        }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleHistoryClick(item, e)}
                        sx={{
                          color: COLORS.text.secondary,
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            color: '#3b82f6',
                            bgcolor: 'rgba(59, 130, 246, 0.1)',
                            transform: 'scale(1.1)',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
                          },
                          p: 0.5,
                          borderRadius: '6px'
                        }}
                      >
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteClick(item, e)}
                        sx={{
                          color: COLORS.text.secondary,
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            color: '#ef4444',
                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                            transform: 'scale(1.1)',
                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
                          },
                          p: 0.5,
                          borderRadius: '6px'
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </ListItem>
                );
              })}
            </List>
          )}
        </Box>


        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={handleDeleteCancel} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: COLORS.background.paper,
              border: `1px solid ${COLORS.grey[200]}`,
              borderRadius: `${SIZES.borderRadius.large}px`,
              boxShadow: SIZES.shadow.floating,
              m: 1,
              position: 'relative',
              overflow: 'hidden',
              animation: 'dialogSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              '@keyframes dialogSlideIn': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(-30px) scale(0.95)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0) scale(1)'
                }
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, ${COLORS.error.main}, ${COLORS.warning.main})`,
              }
            }
          }}
          sx={{
            '& .MuiBackdrop-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              animation: 'backdropFadeIn 0.3s ease-out'
            },
            '@keyframes backdropFadeIn': {
              '0%': {
                opacity: 0,
                backdropFilter: 'blur(0px)'
              },
              '100%': {
                opacity: 1,
                backdropFilter: 'blur(8px)'
              }
            }
          }}
        >
          <DialogTitle sx={{ 
            color: COLORS.text.primary, 
            fontSize: '1.25rem', 
            fontWeight: 600,
            borderBottom: `1px solid ${COLORS.grey[200]}`,
            px: 3,
            py: 2.5,
            bgcolor: alpha(COLORS.error.light, 0.05),
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            animation: 'titleSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s both',
            '@keyframes titleSlideIn': {
              '0%': {
                opacity: 0,
                transform: 'translateX(-20px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateX(0)'
              }
            }
          }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: `${SIZES.borderRadius.medium}px`,
                bgcolor: alpha(COLORS.error.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${alpha(COLORS.error.main, 0.2)}`,
                animation: 'iconPulse 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both',
                '@keyframes iconPulse': {
                  '0%': {
                    transform: 'scale(0.8)',
                    opacity: 0
                  },
                  '50%': {
                    transform: 'scale(1.1)'
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 1
                  }
                }
              }}
            >
              <Box sx={{ fontSize: 16, color: COLORS.error.main }}>⚠️</Box>
            </Box>
            Delete File
          </DialogTitle>
          <DialogContent sx={{ 
            px: 3,
            py: 3,
            '&.MuiDialogContent-root': {
              paddingTop: 3
            },
            animation: 'contentFadeIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both',
            '@keyframes contentFadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(10px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}>
            <Typography variant="body2" sx={{ mb: 2, color: COLORS.text.secondary }}>
              Are you sure you want to delete <strong>{fileToDelete}</strong>? This action cannot be undone.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: COLORS.text.secondary }}>
              Please provide a reason for deleting this file:
            </Typography>
            <TextField
              autoFocus
              margin="none"
              label="Delete Message"
              placeholder="e.g., Removing obsolete configuration file"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={deleteMessage}
              onChange={(e) => setDeleteMessage(e.target.value)}
              disabled={deleting}
              inputProps={{
                maxLength: 200
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
                  '&.Mui-focused': {
                    color: COLORS.primary.main
                  }
                }
              }}
            />
            <Typography variant="caption" sx={{ 
              display: 'block', 
              mt: 1, 
              textAlign: 'right',
              color: COLORS.text.secondary 
            }}>
              {deleteMessage.length}/200 characters
            </Typography>
          </DialogContent>
          <DialogActions sx={{ 
            px: 3, 
            py: 2.5, 
            borderTop: `1px solid ${COLORS.grey[200]}`,
            bgcolor: alpha(COLORS.grey[25], 0.5),
            gap: 1.5,
            animation: 'actionsSlideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s both',
            '@keyframes actionsSlideUp': {
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
            <Button 
              onClick={handleDeleteCancel} 
              disabled={deleting}
              sx={{ 
                ...BUTTON_STYLES.secondary,
                px: 2,
                py: 1,
                '&:disabled': {
                  color: COLORS.grey[400]
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              variant="contained"
              disabled={deleting || !deleteMessage.trim()}
              sx={{ 
                bgcolor: COLORS.error.main,
                color: COLORS.text.white,
                px: 2,
                py: 1,
                boxShadow: SIZES.shadow.sm,
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

        {/* History Side Panel */}
        <HistoryPanel
          isOpen={historyPanelOpen}
          onClose={handleHistoryClose}
          fileName={selectedFile}
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

export default FilesPage;