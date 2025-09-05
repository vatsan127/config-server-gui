import React, { useEffect } from 'react';
import { useDialogKeyboard } from '../../hooks/useTextInputKeyboard';
import {
  Box,
  Typography,
  List,
  ListItem,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { COLORS, SIZES } from '../../theme/colors';
import DiffViewer from './DiffViewer';

const HistoryPanel = ({ 
  isOpen, 
  onClose, 
  fileName, 
  historyData, 
  historyLoading, 
  changesData, 
  changesLoading, 
  showChanges, 
  onBackToHistory, 
  onCommitSelect, 
  selectedCommitId 
}) => {

  // Enhanced keyboard support for panel
  const panelKeyboard = useDialogKeyboard(
    onClose,
    null,
    () => {
      if (showChanges) {
        onBackToHistory();
      } else {
        onClose();
      }
    }
  );

  // Handle ESC key functionality
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        if (showChanges) {
          // If in changes view, go back to history
          onBackToHistory();
        } else {
          // If in history view, close the panel
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [isOpen, showChanges, onClose, onBackToHistory]);

  return (
    <Box
      onKeyDown={panelKeyboard.handleKeyDown}
      tabIndex={-1}
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '600px',
        height: '100vh',
        background: `linear-gradient(135deg, ${COLORS.background.paper} 0%, ${COLORS.grey[25]} 100%)`,
        backdropFilter: 'blur(24px) saturate(1.1)',
        borderLeft: `1px solid ${COLORS.grey[200]}`,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.08)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, ${COLORS.primary.main}05 0%, transparent 25%, ${COLORS.accent.green}03 75%, transparent 100%)`,
          pointerEvents: 'none',
          opacity: isOpen ? 0.7 : 0,
          transition: 'opacity 0.15s ease',
        },
        zIndex: 1200,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? 'visible' : 'hidden',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        maxWidth: '600px'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${COLORS.grey[200]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${COLORS.grey[50]} 0%, ${COLORS.background.paper} 100%)`,
          backdropFilter: 'blur(12px)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '10%',
            right: '10%',
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${COLORS.primary.main} 50%, transparent 100%)`,
            opacity: 0.3,
          },
          transform: isOpen ? 'translateY(0)' : 'translateY(-20px)',
          opacity: isOpen ? 1 : 0,
          transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          transitionDelay: isOpen ? '0.1s' : '0s'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
          {showChanges && (
            <IconButton
              onClick={onBackToHistory}
              size="small"
              sx={{
                color: COLORS.text.secondary,
                bgcolor: COLORS.grey[100],
                borderRadius: '12px',
                p: 1.2,
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(90deg, transparent, ${COLORS.primary.main}20, transparent)`,
                  transition: 'left 0.15s ease',
                },
                '&:hover': {
                  color: COLORS.primary.main,
                  bgcolor: COLORS.primary.main + '10',
                  transform: 'translateX(-4px) scale(1.05)',
                  boxShadow: `0 4px 12px ${COLORS.primary.main}30`,
                  '&::before': {
                    left: '100%',
                  }
                }
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          )}
          
          <HistoryIcon 
            sx={{ 
              color: COLORS.primary.main, 
              fontSize: 20,
              flexShrink: 0,
              transform: showChanges ? 'rotate(180deg) scale(0.9)' : 'rotate(0deg) scale(1)',
              transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }} 
          />
          
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                color: COLORS.text.primary,
                fontWeight: 600,
                fontSize: '1.1rem',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                transform: showChanges ? 'translateY(0)' : 'translateY(0)',
                transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}
            >
              {showChanges && changesData ? 
                (changesData.message || 'No commit message') : 
                `History: ${fileName || ''}`
              }
            </Typography>
            
            {showChanges && changesData && (
              <Typography
                variant="caption"
                sx={{
                  color: COLORS.text.secondary,
                  fontSize: '0.75rem',
                  display: 'block',
                  mt: 0.5
                }}
              >
                {changesData.author} • {changesData.commitTime ? 
                  new Date(changesData.commitTime).toLocaleString() : 
                  'Unknown time'
                }
              </Typography>
            )}
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: COLORS.text.secondary,
            bgcolor: COLORS.grey[100],
            borderRadius: '12px',
            p: 1.2,
            ml: 2,
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 0,
              height: 0,
              borderRadius: '50%',
              background: COLORS.error.main,
              transform: 'translate(-50%, -50%)',
              transition: 'all 0.15s ease',
              opacity: 0.1,
            },
            '&:hover': {
              color: COLORS.error.main,
              bgcolor: COLORS.error.background,
              transform: 'rotate(90deg) scale(1.1)',
              boxShadow: `0 4px 16px ${COLORS.error.main}30`,
              '&::before': {
                width: '100%',
                height: '100%',
              }
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Content */}
      <Box 
        sx={{ 
          flex: 1, 
          overflow: 'hidden',
          transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
          opacity: isOpen ? 1 : 0,
          transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          transitionDelay: isOpen ? '0.2s' : '0s'
        }}
      >
        {historyLoading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              gap: 2,
              transform: isOpen ? 'scale(1)' : 'scale(0.8)',
              opacity: isOpen ? 1 : 0,
              transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transitionDelay: isOpen ? '0.2s' : '0s'
            }}
          >
            <CircularProgress 
              size={40} 
              sx={{ 
                color: COLORS.primary.main,
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                  '50%': {
                    transform: 'scale(1.1)',
                    opacity: 0.7,
                  }
                }
              }} 
            />
            <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
              Loading history...
            </Typography>
          </Box>
        ) : showChanges ? (
          <Box sx={{ 
            height: '100%', 
            overflowY: 'auto', 
            overflowX: 'hidden',
            transform: showChanges ? 'translateX(0)' : 'translateX(100%)',
            opacity: showChanges ? 1 : 0,
            transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            '&::-webkit-scrollbar': {
              width: 0,
              background: 'transparent',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-corner': {
              background: 'transparent',
            },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {changesLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  gap: 2,
                  transform: showChanges ? 'scale(1)' : 'scale(0.8)',
                  opacity: showChanges ? 1 : 0,
                  transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
              >
                <CircularProgress 
                  size={32} 
                  sx={{ 
                    color: COLORS.primary.main,
                    animation: 'spin 1s linear infinite, glow 2s ease-in-out infinite alternate',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    },
                    '@keyframes glow': {
                      '0%': { filter: 'drop-shadow(0 0 2px currentColor)' },
                      '100%': { filter: 'drop-shadow(0 0 8px currentColor)' }
                    }
                  }} 
                />
                <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
                  Loading changes...
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  transform: showChanges ? 'translateX(0) scale(1)' : 'translateX(20px) scale(0.95)',
                  opacity: showChanges ? 1 : 0,
                  transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  transitionDelay: showChanges ? '0.2s' : '0s'
                }}
              >
                <DiffViewer diffText={changesData?.changes} />
              </Box>
            )}
          </Box>
        ) : historyData && historyData.commits && historyData.commits.length > 0 ? (
          <List sx={{ 
            py: 0, 
            overflowY: 'auto', 
            overflowX: 'hidden', 
            height: '100%',
            transform: !showChanges ? 'translateX(0)' : 'translateX(-100%)',
            opacity: !showChanges ? 1 : 0,
            transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            '&::-webkit-scrollbar': {
              width: 0,
              background: 'transparent',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-corner': {
              background: 'transparent',
            },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {historyData.commits.map((commit, index) => (
              <ListItem
                key={commit.commitId || index}
                onClick={() => onCommitSelect(commit.commitId)}
                sx={{
                  borderBottom: index < historyData.commits.length - 1 ? 
                    `1px solid ${COLORS.grey[200]}` : 'none',
                  py: 2.5,
                  px: 3,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  bgcolor: selectedCommitId === commit.commitId ? 
                    COLORS.primary.main + '15' : 'transparent',
                  transform: (isOpen && !showChanges) ? 'translate3d(0, 0, 0)' : 'translate3d(-30px, 0, 0)',
                  WebkitTransform: (isOpen && !showChanges) ? 'translate3d(0, 0, 0)' : 'translate3d(-30px, 0, 0)',
                  opacity: (isOpen && !showChanges) ? 1 : 0,
                  transition: 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 0.2s ease, margin-left 0.2s ease',
                  transitionDelay: (isOpen && !showChanges) ? `${0.3 + index * 0.03}s` : '0s',
                  position: 'relative',
                  overflow: 'hidden',
                  willChange: 'transform, opacity',
                  WebkitPerspective: 1000,
                  perspective: 1000,
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(90deg, transparent 0%, ${COLORS.primary.main}08 50%, transparent 100%)`,
                    opacity: 0,
                    transition: 'opacity 0.15s ease',
                  },
                  '&::after': selectedCommitId === commit.commitId ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '4px',
                    height: '100%',
                    background: `linear-gradient(180deg, ${COLORS.primary.main}, ${COLORS.primary.dark})`,
                    borderRadius: '0 2px 2px 0',
                  } : {},
                  '&:hover': {
                    bgcolor: selectedCommitId === commit.commitId ? 
                      COLORS.primary.main + '20' : 
                      COLORS.grey[50],
                    marginLeft: (isOpen && !showChanges) ? '6px' : '0px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    '&::before': {
                      opacity: 1,
                    }
                  }
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: COLORS.text.primary,
                    fontWeight: 500,
                    mb: 0.5,
                    lineHeight: 1.4,
                    width: '100%',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility',
                    transform: 'translateZ(0)',
                    WebkitTransform: 'translateZ(0)',
                    filter: 'none'
                  }}
                >
                  {commit.commitMessage || commit.message || 'No commit message'}
                </Typography>
                
                <Typography
                  variant="body2"
                  sx={{
                    color: COLORS.text.secondary,
                    fontSize: '0.8rem',
                    width: '100%',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility',
                    transform: 'translateZ(0)',
                    WebkitTransform: 'translateZ(0)',
                    filter: 'none'
                  }}
                >
                  {commit.author && commit.email ? 
                    `${commit.author} (${commit.email})` : 
                    commit.author || commit.email || 'Unknown author'
                  }
                  {commit.date && 
                    ` • ${new Date(commit.date).toLocaleDateString()} ${new Date(commit.date).toLocaleTimeString()}`
                  }
                </Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              gap: 2,
              px: 3,
              transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
              opacity: isOpen ? 1 : 0,
              transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transitionDelay: isOpen ? '0.15s' : '0s'
            }}
          >
            <HistoryIcon 
              sx={{ 
                fontSize: 48, 
                color: COLORS.text.secondary,
                opacity: 0.5,
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': {
                    transform: 'translateY(0px)',
                  },
                  '50%': {
                    transform: 'translateY(-10px)',
                  }
                }
              }} 
            />
            <Typography variant="h6" sx={{ 
              color: COLORS.text.primary, 
              fontWeight: 500,
              textAlign: 'center'
            }}>
              No commit history found
            </Typography>
            <Typography variant="body2" sx={{ 
              color: COLORS.text.secondary,
              textAlign: 'center',
              fontSize: '0.875rem'
            }}>
              This file may be new or history is not available
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HistoryPanel;