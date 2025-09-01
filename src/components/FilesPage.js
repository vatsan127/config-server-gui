import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  Search as SearchIcon,
  Code as CodeIcon,
  DataObject as JsonIcon,
  Description as TextIcon,
  Image as ImageIcon
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
  const { enqueueSnackbar } = useSnackbar();
  const searchInputRef = useRef(null);
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [searchQuery, setSearchQuery] = useState('');

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
    setLoading(true);
    setError(null);
    
    try {
      const normalizedPath = normalizePath(path);
      const data = await apiService.getNamespaceFiles(namespace, normalizedPath);
      setFiles(data);
      setCurrentPath(normalizedPath);
    } catch (err) {
      setError('Failed to load files');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (namespace) {
      const pathParam = searchParams.get('path');
      if (pathParam) {
        const decodedPath = decodeURIComponent(pathParam);
        fetchFiles(decodedPath);
      } else {
        fetchFiles();
      }
    }
  }, [namespace, searchParams]);

  const handleItemClick = (item) => {
    if (item.endsWith('/')) {
      // For folders, construct the new path and navigate to update URL
      const newPath = currentPath === '/' ? item : currentPath + item;
      const normalizedPath = normalizePath(newPath);
      navigate(`/namespace/${namespace}/files?path=${encodeURIComponent(normalizedPath)}`);
    } else {
      // Navigate to file view page
      const encodedPath = encodeURIComponent(currentPath);
      const encodedFileName = encodeURIComponent(item);
      navigate(`/namespace/${namespace}/file?path=${encodedPath}&file=${encodedFileName}`);
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
                }}
              />
              <CreateFileButton
                onCreateFile={handleCreateFile}
                onCreateFolder={handleCreateFolder}
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
  );
};

export default FilesPage;