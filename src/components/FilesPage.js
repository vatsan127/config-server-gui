import React, { useState, useEffect, useMemo } from 'react';
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
  InputAdornment
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { apiService, setNotificationHandler } from '../services/api';
import { COLORS, SIZES } from '../theme/colors';
import EmptyState from './common/EmptyState';
import FilesSidebar from './common/FilesSidebar';
import CreateFileButton from './common/CreateFileButton';

const FilesPage = () => {
  const { namespace } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setNotificationHandler(enqueueSnackbar);
  }, [enqueueSnackbar]);

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

  const handleRefresh = () => {
    fetchFiles(currentPath);
  };

  if (loading) {
    return (
      <Box sx={{ p: SIZES.spacing.lg }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: SIZES.spacing.lg }}>
        <Box mb={SIZES.spacing.md}>
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
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <FilesSidebar
        currentPath={currentPath}
        onPathChange={fetchFiles}
        onRefresh={handleRefresh}
        namespace={namespace}
      />
      
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        marginLeft: `${SIZES.sidebar.width}px`
      }}>
        <Box sx={{ p: SIZES.spacing.lg }}>
          <Box mb={SIZES.spacing.lg}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: SIZES.spacing.md }}>
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files and folders..."
                  size="small"
                  sx={{ minWidth: 250 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: COLORS.text.secondary }} />
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

            <Box sx={{ 
              bgcolor: COLORS.background.paper, 
              p: SIZES.spacing.md, 
              borderLeft: `4px solid ${COLORS.primary.main}`,
              mb: SIZES.spacing.md
            }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 1, color: 'text.primary' }}>
                Files in "{namespace}"
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                Browse and manage configuration files
              </Typography>
            </Box>

          </Box>

          {currentPath !== '/' && (
            <Box mb={SIZES.spacing.sm}>
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
              mb: SIZES.spacing.sm,
              p: SIZES.spacing.sm,
              bgcolor: COLORS.grey[50],
              border: `1px solid ${COLORS.grey[200]}`,
              borderRadius: 0
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
            border: `1px solid ${COLORS.grey[300]}`,
            borderRadius: 0
          }}>
            {filteredFiles.length === 0 ? (
              <EmptyState 
                title={searchQuery ? "No matching files found" : "No files found"}
                description={searchQuery ? `No files match your search for "${searchQuery}"` : "This directory is empty"}
              />
            ) : (
              <List sx={{ py: 0 }}>
                {filteredFiles.map((item, index) => (
                  <ListItem
                    key={item}
                    button
                    onClick={() => handleItemClick(item)}
                    sx={{
                      borderBottom: index < filteredFiles.length - 1 ? `1px solid ${COLORS.grey[200]}` : 'none',
                      '&:hover': {
                        bgcolor: COLORS.grey[50]
                      },
                      py: SIZES.spacing.sm
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {item.endsWith('/') ? (
                        <FolderIcon sx={{ color: COLORS.primary.main }} />
                      ) : (
                        <FileIcon sx={{ color: COLORS.text.secondary }} />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.endsWith('/') ? item.slice(0, -1) : item}
                      primaryTypographyProps={{
                        sx: {
                          color: item.endsWith('/') ? COLORS.primary.main : COLORS.text.primary,
                          fontWeight: item.endsWith('/') ? 500 : 400
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
    </Box>
  );
};

export default FilesPage;