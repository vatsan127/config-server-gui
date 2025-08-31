import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Code as CodeIcon,
  DataObject as JsonIcon,
  Description as TextIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { apiService, setNotificationHandler } from '../services/api';
import { COLORS, SIZES } from '../theme/colors';
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
  const { enqueueSnackbar } = useSnackbar();
  const searchInputRef = useRef(null);
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setNotificationHandler(enqueueSnackbar);
  }, [enqueueSnackbar]);

  // Handle Ctrl+K to focus search
  const handleSearchFocus = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  useSearchShortcut(handleSearchFocus);

  const fetchFiles = async (path = '/') => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getNamespaceFiles(namespace, path);
      setFiles(data);
      setCurrentPath(path);
    } catch (err) {
      setError('Failed to load files');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (namespace) {
      fetchFiles();
    }
  }, [namespace]);

  const handleItemClick = (item) => {
    if (item.endsWith('/')) {
      const newPath = currentPath === '/' ? item : currentPath + item;
      fetchFiles(newPath);
    } else {
      // Navigate to file view page
      const encodedPath = encodeURIComponent(currentPath);
      const encodedFileName = encodeURIComponent(item);
      navigate(`/namespace/${namespace}/file?path=${encodedPath}&file=${encodedFileName}`);
    }
  };

  const handleBackClick = () => {
    if (currentPath !== '/') {
      const parentPath = currentPath.split('/').slice(0, -2).join('/') + '/';
      const finalPath = parentPath === '/' ? '/' : parentPath;
      fetchFiles(finalPath);
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
      const newPath = '/' + pathSegments.slice(0, index + 1).join('/') + '/';
      fetchFiles(newPath);
    }
  };

  const handleCreateFile = async (fileName) => {
    try {
      await apiService.createFile(namespace, currentPath, fileName);
      enqueueSnackbar(`File "${fileName}" created successfully`, { variant: 'success' });
      fetchFiles(currentPath);
    } catch (error) {
      enqueueSnackbar(`Failed to create file "${fileName}"`, { variant: 'error' });
      console.error('Error creating file:', error);
    }
  };

  const handleCreateFolder = async (folderName) => {
    try {
      await apiService.createFolder(namespace, currentPath, folderName);
      enqueueSnackbar(`Folder "${folderName}" created successfully`, { variant: 'success' });
      fetchFiles(currentPath);
    } catch (error) {
      enqueueSnackbar(`Failed to create folder "${folderName}"`, { variant: 'error' });
      console.error('Error creating folder:', error);
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
        minHeight: '100vh'
      }}>
        <Box mb={SIZES.spacing.xs}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: SIZES.spacing.xs }}>
            <Button 
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              sx={{ 
                color: COLORS.primary.main,
                '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' }
              }}
            >
              Back to Dashboard
            </Button>
          </Box>
          <Box sx={{ 
            bgcolor: COLORS.background.paper, 
            p: SIZES.spacing.xs, 
            borderLeft: `4px solid ${COLORS.primary.main}`,
            borderRadius: `${SIZES.borderRadius.medium}px`,
            boxShadow: SIZES.shadow.sm,
          }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 1, color: 'text.primary' }}>
              Files in "{namespace}"
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Browse and manage configuration files
            </Typography>
          </Box>
        </Box>
        <FileListSkeleton count={6} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: SIZES.spacing.xs }}>
        <Box mb={SIZES.spacing.xs}>
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ 
              color: COLORS.primary.main,
              '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' }
            }}
          >
            Back to Dashboard
          </Button>
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
        <Box mb={SIZES.spacing.xs}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: SIZES.spacing.xs }}>
            <Button 
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              sx={{ 
                color: COLORS.primary.main,
                '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' }
              }}
            >
              Back to Dashboard
            </Button>
            
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
                }}
              />
              <CreateFileButton
                onCreateFile={handleCreateFile}
                onCreateFolder={handleCreateFolder}
              />
            </Box>
          </Box>

          <Divider sx={{ 
            mb: SIZES.spacing.xs, 
            borderColor: COLORS.grey[200],
            opacity: 0.8
          }} />

          <Box sx={{ 
            bgcolor: COLORS.background.paper, 
            p: 2, 
            borderLeft: `3px solid ${COLORS.primary.main}`,
            borderRadius: `${SIZES.borderRadius.small}px`,
            boxShadow: SIZES.shadow.sm,
            mb: 0
          }}>
            <Typography variant="h5" component="h1" sx={{ mb: 0.5, color: 'text.primary', fontSize: '1.2rem', fontWeight: 600 }}>
              Files in "{namespace}"
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
              Browse and manage configuration files
            </Typography>
          </Box>
        </Box>

        {currentPath !== '/' && (
          <Box mb={SIZES.spacing.xs}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBackClick}
              sx={{ 
                color: COLORS.text.secondary,
                fontSize: '0.875rem',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
              }}
            >
              Back to parent folder
            </Button>
          </Box>
        )}

        {searchQuery && (
          <Box sx={{ 
            mb: SIZES.spacing.xs,
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
          borderRadius: `${SIZES.borderRadius.large}px`,
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
              {filteredFiles.map((item, index) => (
                <ListItem
                  key={item}
                  button
                  onClick={() => handleItemClick(item)}
                  sx={{
                    borderBottom: index < filteredFiles.length - 1 ? `1px solid ${COLORS.grey[100]}` : 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: COLORS.hover.card,
                      transform: 'translateX(4px)',
                    },
                    py: 1.5,
                    px: 2
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
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default FilesPage;