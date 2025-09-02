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
  Button,
  Chip,
  Divider,
  alpha
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  FiberManualRecord as StatusIcon,
  Code as CodeIcon,
  History as HistoryIcon
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
      console.error('Error saving file:', error);
      // Error notification is already handled by the API service
      // Don't show duplicate error messages
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
  
  const getFileExtension = (filename) => {
    return filename.split('.').pop()?.toLowerCase() || 'yml';
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
      p: 0, // Remove padding
      bgcolor: COLORS.background.default,
      minHeight: '100vh',
      width: 'calc(100vw - 220px)',
      maxWidth: 'calc(100vw - 220px)',
      overflow: 'hidden'
    }}>

      <Paper 
        elevation={3}
        sx={{ 
          bgcolor: COLORS.background.paper,
          borderRadius: 0, // Remove border radius for more space
          overflow: 'hidden',
          border: 'none', // Remove border
          boxShadow: 'none', // Remove shadow
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '100%',
          height: '100vh'
        }}
      >
        {/* Enhanced Header */}
        <Box 
          sx={{ 
            px: 1.5, // Reduce padding
            py: 1, // Reduce padding
            bgcolor: alpha(COLORS.grey[50], 0.8),
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid ${alpha(COLORS.grey[300], 0.6)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '48px', // Reduce height
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: `linear-gradient(90deg, ${COLORS.primary.main}, ${COLORS.accent.purple})`,
            }
          }}
        >
          {/* Left Section - Breadcrumbs and Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
            <Breadcrumbs
              aria-label="breadcrumb"
              separator="/"
              sx={{
                flex: 1,
                minWidth: 0,
                '& .MuiBreadcrumbs-separator': {
                  color: COLORS.text.muted,
                  mx: 0.5,
                  fontSize: '1rem',
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
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  px: 1,
                  py: 0.5,
                  borderRadius: `${SIZES.borderRadius.small}px`,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: alpha(COLORS.primary.main, 0.08),
                    color: COLORS.primary.dark,
                    transform: 'translateY(-1px)',
                  },
                  background: 'none',
                  border: 'none',
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
                  variant="body1"
                  onClick={() => {
                    const folderPath = '/' + pathSegments.slice(0, index + 1).join('/') + '/';
                    navigate(`/namespace/${namespace}/files?path=${encodeURIComponent(folderPath)}`);
                  }}
                  sx={{
                    color: COLORS.primary.main,
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    px: 1,
                    py: 0.5,
                    borderRadius: `${SIZES.borderRadius.small}px`,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: alpha(COLORS.primary.main, 0.08),
                      color: COLORS.primary.dark,
                      transform: 'translateY(-1px)',
                    },
                    background: 'none',
                    border: 'none',
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
                fontSize: '1rem',
                px: 1,
                py: 0.5
              }}>
                {fileName}
              </Typography>
            </Breadcrumbs>
            
            {/* Status Indicators */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<StatusIcon sx={{ fontSize: 10 }} />}
                label={isEditing ? (hasChanges ? "Modified" : "Editing") : "Read-only"}
                size="small"
                variant={isEditing ? (hasChanges ? "filled" : "outlined") : "outlined"}
                sx={{
                  bgcolor: isEditing ? (hasChanges ? alpha(COLORS.warning.border, 0.1) : alpha(COLORS.primary.main, 0.1)) : alpha(COLORS.grey[400], 0.1),
                  color: isEditing ? (hasChanges ? COLORS.warning.text : COLORS.primary.main) : COLORS.text.secondary,
                  border: `1px solid ${isEditing ? (hasChanges ? alpha(COLORS.warning.border, 0.3) : alpha(COLORS.primary.main, 0.3)) : alpha(COLORS.grey[400], 0.3)}`,
                  fontWeight: 500,
                  fontSize: '0.65rem',
                  height: 20,
                  '& .MuiChip-icon': {
                    color: 'inherit'
                  }
                }}
              />
            </Box>
          </Box>

          {/* Right Section - Action Buttons */}
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {!isEditing ? (
              <>
                <Tooltip title="Edit File" arrow>
                  <IconButton 
                    onClick={handleEdit} 
                    size="small"
                    sx={{ 
                      color: COLORS.text.secondary,
                      bgcolor: alpha(COLORS.grey[100], 0.8),
                      borderRadius: `${SIZES.borderRadius.medium}px`,
                      width: 32,
                      height: 32,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: alpha(COLORS.primary.main, 0.1),
                        color: COLORS.primary.main,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(COLORS.primary.main, 0.25)}`
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Refresh Content" arrow>
                  <IconButton 
                    onClick={fetchFileContent} 
                    size="small"
                    sx={{ 
                      color: COLORS.text.secondary,
                      bgcolor: alpha(COLORS.grey[100], 0.8),
                      borderRadius: `${SIZES.borderRadius.medium}px`,
                      width: 32,
                      height: 32,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: alpha(COLORS.accent.blue, 0.1),
                        color: COLORS.accent.blue,
                        transform: 'translateY(-2px) rotate(180deg)',
                        boxShadow: `0 4px 12px ${alpha(COLORS.accent.blue, 0.25)}`
                      }
                    }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Copy Content" arrow>
                  <IconButton 
                    onClick={handleCopy} 
                    size="small"
                    sx={{ 
                      color: COLORS.text.secondary,
                      bgcolor: alpha(COLORS.grey[100], 0.8),
                      borderRadius: `${SIZES.borderRadius.medium}px`,
                      width: 32,
                      height: 32,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: alpha(COLORS.success.border, 0.1),
                        color: COLORS.success.border,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(COLORS.success.border, 0.25)}`
                      }
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title={hasChanges ? "Save Changes" : "No changes to save"} arrow>
                  <span>
                    <IconButton 
                      onClick={handleSave} 
                      size="small"
                      disabled={!hasChanges || saving}
                      sx={{ 
                        color: hasChanges ? COLORS.success.border : COLORS.text.disabled,
                        bgcolor: hasChanges ? alpha(COLORS.success.border, 0.1) : alpha(COLORS.grey[100], 0.8),
                        borderRadius: `${SIZES.borderRadius.medium}px`,
                        width: 32,
                        height: 32,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: hasChanges ? `1px solid ${alpha(COLORS.success.border, 0.2)}` : 'none',
                        '&:hover:not(:disabled)': {
                          bgcolor: alpha(COLORS.success.border, 0.15),
                          transform: 'translateY(-2px) scale(1.05)',
                          boxShadow: `0 6px 16px ${alpha(COLORS.success.border, 0.3)}`
                        },
                        '&.Mui-disabled': { 
                          color: COLORS.text.disabled,
                          bgcolor: alpha(COLORS.grey[100], 0.5)
                        }
                      }}
                    >
                      <SaveIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                
                <Tooltip title="Cancel Editing" arrow>
                  <IconButton 
                    onClick={handleCancel} 
                    size="small"
                    sx={{ 
                      color: COLORS.text.secondary,
                      bgcolor: alpha(COLORS.grey[100], 0.8),
                      borderRadius: `${SIZES.borderRadius.medium}px`,
                      width: 32,
                      height: 32,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: alpha(COLORS.error.border, 0.1),
                        color: COLORS.error.border,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(COLORS.error.border, 0.25)}`
                      }
                    }}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>
        
        {/* Enhanced Editor Container */}
        <Box 
          sx={{ 
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#1e1e1e',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${alpha(COLORS.primary.main, 0.5)}, transparent)`,
              zIndex: 1
            }
          }}
        >
          {/* Editor Status Bar */}
          {!loading && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 22,
                bgcolor: alpha('#2d2d30', 0.95),
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid #3e3e42',
                display: 'flex',
                alignItems: 'center',
                px: 1.5,
                gap: 1.5,
                fontSize: '0.7rem',
                color: '#cccccc',
                zIndex: 10
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CodeIcon sx={{ fontSize: 12 }} />
                <Typography variant="caption" sx={{ color: '#cccccc', fontSize: '0.7rem' }}>
                  YAML
                </Typography>
              </Box>
              
              <Divider orientation="vertical" flexItem sx={{ bgcolor: '#3e3e42', height: 12 }} />
              
              <Typography variant="caption" sx={{ color: '#cccccc', fontSize: '0.7rem' }}>
                {content.split('\n').length} lines
              </Typography>
              
              <Divider orientation="vertical" flexItem sx={{ bgcolor: '#3e3e42', height: 12 }} />
              
              <Typography variant="caption" sx={{ color: '#cccccc', fontSize: '0.7rem' }}>
                {content.length} chars
              </Typography>
              
              {hasChanges && (
                <>
                  <Divider orientation="vertical" flexItem sx={{ bgcolor: '#3e3e42', height: 12 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StatusIcon sx={{ fontSize: 6, color: COLORS.warning.border }} />
                    <Typography variant="caption" sx={{ color: COLORS.warning.border, fontSize: '0.7rem' }}>
                      Modified
                    </Typography>
                  </Box>
                </>
              )}
              
              <Box sx={{ flex: 1 }} />
              
              <Typography variant="caption" sx={{ color: '#cccccc', opacity: 0.7, fontSize: '0.7rem' }}>
                {isEditing ? 'Edit Mode' : 'Read Only'}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <Editor
              width="100%"
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
                fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
                lineHeight: 1.5,
                letterSpacing: 0.3,
                lineNumbers: 'on',
                lineNumbersMinChars: 3, // Minimal space for line numbers themselves
                folding: true,
                foldingStrategy: 'indentation',
                wordWrap: 'on',
                wordWrapColumn: 120,
                automaticLayout: true,
                contextmenu: isEditing,
                quickSuggestions: isEditing,
                suggestOnTriggerCharacters: isEditing,
                wordBasedSuggestions: isEditing ? 'allDocuments' : 'off',
                bracketPairColorization: { enabled: true },
                guides: {
                  indentation: true,
                  bracketPairs: true,
                  bracketPairsHorizontal: true
                },
                renderWhitespace: isEditing ? 'boundary' : 'none',
                renderControlCharacters: false,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                mouseWheelScrollSensitivity: 1,
                scrollbar: {
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10,
                  useShadows: true,
                  horizontal: 'auto',
                  vertical: 'auto'
                },
                overviewRulerBorder: true,
                rulers: [80, 120],
                padding: { top: 12, bottom: 24 },
                // Prevent horizontal expansion
                stopRenderingLineAfter: 200, // Shorter lines
                glyphMargin: false, // Disable glyph margin to reduce left space
                lineDecorationsWidth: 15, // Increase space after line numbers
                lineNumbersMinChars: 3, // Minimal space for line numbers themselves
                folding: false, // Disable folding to save space
                wordWrapColumn: 80 // Shorter wrap column
              }}
              loading={
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  bgcolor: '#1e1e1e',
                  flexDirection: 'column',
                  gap: 2
                }}>
                  <CircularProgress size={32} sx={{ color: COLORS.primary.main }} />
                  <Typography variant="body2" sx={{ color: '#cccccc' }}>
                    Loading editor...
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Box>
      </Paper>

      {/* Enhanced Commit Message Dialog */}
      <Dialog 
        open={showCommitDialog} 
        onClose={handleCommitCancel} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: COLORS.background.paper,
            border: `1px solid ${alpha(COLORS.grey[200], 0.8)}`,
            borderRadius: `${SIZES.borderRadius.large}px`,
            boxShadow: SIZES.shadow.floating,
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, ${COLORS.primary.main}, ${COLORS.accent.purple})`,
            }
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'transparent'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'none'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: COLORS.text.primary, 
          fontSize: '1.25rem', 
          fontWeight: 600,
          borderBottom: `1px solid ${alpha(COLORS.grey[200], 0.6)}`,
          px: 3,
          py: 2.5,
          bgcolor: alpha(COLORS.grey[50], 0.5),
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: `${SIZES.borderRadius.medium}px`,
              bgcolor: alpha(COLORS.success.border, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${alpha(COLORS.success.border, 0.2)}`
            }}
          >
            <SaveIcon sx={{ fontSize: 16, color: COLORS.success.border }} />
          </Box>
          Save Changes
        </DialogTitle>
        <DialogContent sx={{ 
          px: 3,
          py: 3,
          '&.MuiDialogContent-root': {
            paddingTop: 3
          }
        }}>
          <Typography variant="body2" sx={{ 
            mb: 3, 
            color: COLORS.text.secondary,
            fontSize: '0.95rem',
            lineHeight: 1.5
          }}>
            Please provide a descriptive message for your changes. This will help track the history of modifications to this file.
          </Typography>
          <TextField
            autoFocus
            margin="none"
            label="Commit Message"
            placeholder="e.g., Updated configuration settings for production environment"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            disabled={saving}
            inputProps={{
              maxLength: 200
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: `${SIZES.borderRadius.large}px`,
                bgcolor: alpha(COLORS.grey[50], 0.5),
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '& fieldset': {
                  borderColor: alpha(COLORS.grey[300], 0.6),
                },
                '&:hover fieldset': {
                  borderColor: alpha(COLORS.primary.main, 0.5),
                  boxShadow: `0 0 0 1px ${alpha(COLORS.primary.main, 0.1)}`
                },
                '&.Mui-focused': {
                  bgcolor: COLORS.background.paper,
                  '& fieldset': {
                    borderColor: COLORS.primary.main,
                    borderWidth: 2,
                    boxShadow: `0 0 0 3px ${alpha(COLORS.primary.main, 0.1)}`
                  }
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.95rem',
                  lineHeight: 1.5
                }
              },
              '& .MuiInputLabel-root': {
                color: COLORS.text.secondary,
                fontSize: '0.95rem',
                '&.Mui-focused': {
                  color: COLORS.primary.main
                }
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
            <Typography variant="caption" sx={{ 
              color: COLORS.text.muted,
              fontSize: '0.8rem'
            }}>
              💡 Use descriptive messages for better change tracking
            </Typography>
            <Typography variant="caption" sx={{ 
              color: commitMessage.length > 180 ? COLORS.warning.text : COLORS.text.secondary,
              fontWeight: 500
            }}>
              {commitMessage.length}/200 characters
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          py: 2.5, 
          borderTop: `1px solid ${alpha(COLORS.grey[200], 0.6)}`,
          bgcolor: alpha(COLORS.grey[25], 0.5),
          gap: 1.5,
          justifyContent: 'flex-end'
        }}>
          <Button 
            onClick={handleCommitCancel} 
            disabled={saving}
            sx={{ 
              ...BUTTON_STYLES.secondary,
              px: 3,
              py: 1.5,
              borderRadius: `${SIZES.borderRadius.large}px`,
              fontWeight: 500,
              '&:disabled': {
                color: COLORS.grey[400],
                bgcolor: alpha(COLORS.grey[100], 0.5)
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
              px: 3,
              py: 1.5,
              borderRadius: `${SIZES.borderRadius.large}px`,
              fontWeight: 600,
              boxShadow: SIZES.shadow.md,
              position: 'relative',
              overflow: 'hidden',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, ${alpha('#ffffff', 0.2)}, transparent)`,
                opacity: 0,
                transition: 'opacity 0.2s ease',
              },
              '&:hover:not(:disabled)': {
                boxShadow: SIZES.shadow.floating,
                transform: 'translateY(-2px) scale(1.02)',
                '&:before': {
                  opacity: 1
                }
              },
              '&:disabled': {
                bgcolor: COLORS.grey[300],
                color: COLORS.grey[500],
                transform: 'none',
                boxShadow: 'none'
              }
            }}
          >
            {saving ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
                Saving...
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SaveIcon fontSize="small" />
                Save Changes
              </Box>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileViewPage;