import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import Editor from '@monaco-editor/react';
import { apiService, setNotificationHandler } from '../services/api';
import { COLORS, SIZES, BUTTON_STYLES } from '../theme/colors';
import { normalizePath } from '../utils';

const FileViewPage = () => {
  const { namespace } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  
  const filePath = decodeURIComponent(searchParams.get('path') || '/');
  const normalizedPath = normalizePath(filePath);
  const fileName = decodeURIComponent(searchParams.get('file') || '');
  
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotificationHandler(enqueueSnackbar);
  }, [enqueueSnackbar]);

  const fetchFileContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fileContent = await apiService.getFileContent(namespace, normalizedPath, fileName);
      setContent(fileContent);
      setOriginalContent(fileContent);
    } catch (err) {
      setError('Failed to load file content');
      console.error('Error fetching file content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (namespace && fileName) {
      fetchFileContent();
    }
  }, [namespace, normalizedPath, fileName]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      enqueueSnackbar('File content copied to clipboard', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to copy file content', { variant: 'error' });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.updateFileContent(namespace, normalizedPath, fileName, content);
      setOriginalContent(content);
      setIsEditing(false);
      enqueueSnackbar('File saved successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to save file', { variant: 'error' });
      console.error('Error saving file:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(originalContent);
    setIsEditing(false);
  };

  const handleContentChange = (value) => {
    setContent(value || '');
  };

  const hasChanges = content !== originalContent;

  const handleDownload = () => {
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      enqueueSnackbar('File downloaded successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to download file', { variant: 'error' });
    }
  };

  const pathSegments = normalizedPath === '/' ? [] : normalizedPath.split('/').filter(segment => segment.length > 0);

  if (loading) {
    return (
      <Box sx={{ p: SIZES.spacing.xs }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: SIZES.spacing.md }}>
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

      <Paper 
        sx={{ 
          bgcolor: COLORS.background.paper,
          border: `1px solid ${COLORS.grey[300]}`,
          borderRadius: 0,
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            p: 2,
            bgcolor: COLORS.grey[50],
            borderBottom: `1px solid ${COLORS.grey[300]}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '36px'
          }}
        >
          <Breadcrumbs
            aria-label="breadcrumb"
            separator="/"
            sx={{
              '& .MuiBreadcrumbs-separator': {
                color: COLORS.text.muted,
                mx: 0.5,
                fontSize: '1.1rem',
              },
              '& .MuiBreadcrumbs-ol': {
                flexWrap: 'nowrap',
              },
            }}
          >
            <Link
              component="button"
              variant="body1"
              onClick={() => navigate(`/namespace/${namespace}/files`)}
              sx={{
                color: COLORS.primary.main,
                fontWeight: 500,
                fontSize: '1.1rem',
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                  color: COLORS.primary.dark,
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
                variant="body1"
                onClick={() => {
                  const folderPath = '/' + pathSegments.slice(0, index + 1).join('/') + '/';
                  navigate(`/namespace/${namespace}/files?path=${encodeURIComponent(folderPath)}`);
                }}
                sx={{
                  color: COLORS.primary.main,
                  fontWeight: 500,
                  fontSize: '1.1rem',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: COLORS.primary.dark,
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
            <Typography variant="body1" sx={{ 
              color: COLORS.text.primary, 
              fontWeight: 600, 
              fontSize: '1.1rem' 
            }}>
              {fileName}
            </Typography>
          </Breadcrumbs>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {!isEditing ? (
              <>
                <Tooltip title="Edit">
                  <IconButton onClick={handleEdit} size="small" sx={{ color: COLORS.text.secondary, p: 0.5 }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Refresh">
                  <IconButton onClick={fetchFileContent} size="small" sx={{ color: COLORS.text.secondary, p: 0.5 }}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy">
                  <IconButton onClick={handleCopy} size="small" sx={{ color: COLORS.text.secondary, p: 0.5 }}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download">
                  <IconButton onClick={handleDownload} size="small" sx={{ color: COLORS.text.secondary, p: 0.5 }}>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title={hasChanges ? "Save changes" : "No changes to save"}>
                  <span>
                    <IconButton 
                      onClick={handleSave} 
                      size="small" 
                      disabled={!hasChanges || saving}
                      sx={{ 
                        color: hasChanges ? COLORS.primary.main : COLORS.text.disabled,
                        '&.Mui-disabled': { color: COLORS.text.disabled },
                        p: 0.5
                      }}
                    >
                      <SaveIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Cancel editing">
                  <IconButton onClick={handleCancel} size="small" sx={{ color: COLORS.text.secondary, p: 0.5 }}>
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            height: '75vh',
            border: 'none'
          }}
        >
          <Editor
            height="100%"
            language="yaml"
            theme="vs-dark"
            value={content || '# File is empty'}
            onChange={handleContentChange}
            options={{
              readOnly: !isEditing,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: 'on',
              folding: true,
              wordWrap: 'on',
              automaticLayout: true,
              contextmenu: isEditing,
              quickSuggestions: isEditing,
              suggestOnTriggerCharacters: isEditing,
              wordBasedSuggestions: isEditing
            }}
            loading={<CircularProgress size={24} />}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default FileViewPage;