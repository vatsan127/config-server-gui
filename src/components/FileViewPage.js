import React, { useState, useEffect, useRef } from 'react';
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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
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
  const [commitId, setCommitId] = useState(null);
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const commitIdRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    commitIdRef.current = commitId;
    console.log('CommitId state changed to:', commitId);
  }, [commitId]);

  // Set up notification handler with ref to avoid dependency issues
  const notificationRef = useRef();
  notificationRef.current = enqueueSnackbar;
  
  useEffect(() => {
    setNotificationHandler((message, options) => {
      notificationRef.current(message, options);
    });
  }, []); // Empty dependency array - runs only once

  const fetchFileContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fileData = await apiService.getFileContent(namespace, normalizedPath, fileName);
      const content = typeof fileData === 'string' ? fileData : fileData.content;
      const commitIdFromResponse = typeof fileData === 'object' ? fileData.commitId : null;
      
      setContent(content);
      setOriginalContent(content);
      setCommitId(commitIdFromResponse);
      commitIdRef.current = commitIdFromResponse;
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
    } catch (error) {
      console.error('Failed to copy file content:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setShowCommitDialog(true);
  };

  const handleCommitSave = async () => {
    if (!commitMessage.trim()) {
      enqueueSnackbar('Commit message is required', { variant: 'error' });
      return;
    }

    const currentCommitId = commitIdRef.current;
    console.log('Saving with commitId (from ref):', currentCommitId);
    console.log('Saving with commitId (from state):', commitId);
    setSaving(true);
    try {
      const result = await apiService.updateFileContent(
        namespace, 
        normalizedPath, 
        fileName, 
        content, 
        currentCommitId, 
        commitMessage
      );
      
      // Update commitId with the new one from the server response
      if (result && result.commitId) {
        console.log('Updating commitId from', currentCommitId, 'to', result.commitId);
        setCommitId(result.commitId);
        commitIdRef.current = result.commitId;
      }
      
      setOriginalContent(content);
      setIsEditing(false);
      setShowCommitDialog(false);
      setCommitMessage('');
      // Don't show success notification here since it's handled in the API service
    } catch (error) {
      enqueueSnackbar('Failed to save file', { variant: 'error' });
      console.error('Error saving file:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCommitCancel = () => {
    setShowCommitDialog(false);
    setCommitMessage('');
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
    } catch (error) {
      console.error('Failed to download file:', error);
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

      {/* Commit Message Dialog */}
      <Dialog 
        open={showCommitDialog} 
        onClose={handleCommitCancel} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: COLORS.background.paper,
            border: `1px solid ${COLORS.grey[200]}`,
            borderRadius: `${SIZES.borderRadius.medium}px`,
            boxShadow: SIZES.shadow.md,
            m: 1
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: COLORS.text.primary, 
          fontSize: '1.1rem', 
          fontWeight: 600,
          borderBottom: `1px solid ${COLORS.grey[200]}`,
          px: 2,
          py: 1.5
        }}>
          Save Changes
        </DialogTitle>
        <DialogContent sx={{ 
          px: 2,
          py: 2,
          '&.MuiDialogContent-root': {
            paddingTop: 2
          }
        }}>
          <Typography variant="body2" sx={{ mb: 2, color: COLORS.text.secondary }}>
            Please provide a descriptive message for your changes:
          </Typography>
          <TextField
            autoFocus
            margin="none"
            label="Commit Message"
            placeholder="e.g., Updated configuration settings for production environment"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            disabled={saving}
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
            {commitMessage.length}/200 characters
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          px: 2, 
          py: 1.5, 
          borderTop: `1px solid ${COLORS.grey[200]}`,
          gap: 1
        }}>
          <Button 
            onClick={handleCommitCancel} 
            disabled={saving}
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
            onClick={handleCommitSave} 
            variant="contained"
            disabled={saving || !commitMessage.trim()}
            sx={{ 
              ...BUTTON_STYLES.primary,
              px: 2,
              py: 1,
              boxShadow: SIZES.shadow.sm,
              '&:hover': {
                ...BUTTON_STYLES.primary['&:hover'],
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
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileViewPage;