import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  alpha
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
  if (!isOpen) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '600px',
        height: '100vh',
        bgcolor: COLORS.background.paper,
        backdropFilter: 'blur(20px)',
        borderLeft: `1px solid ${COLORS.grey[300]}`,
        boxShadow: SIZES.shadow.xl,
        zIndex: 1200,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
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
          bgcolor: COLORS.grey[50]
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
                borderRadius: '8px',
                p: 1,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  color: COLORS.text.primary,
                  bgcolor: COLORS.grey[100],
                  transform: 'translateX(-2px)'
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
              flexShrink: 0
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
                whiteSpace: 'nowrap'
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
            borderRadius: '8px',
            p: 1,
            ml: 2,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              color: COLORS.error.border,
              bgcolor: COLORS.error.background,
              transform: 'rotate(90deg)'
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {historyLoading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              gap: 2
            }}
          >
            <CircularProgress size={40} sx={{ color: COLORS.primary.main }} />
            <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
              Loading history...
            </Typography>
          </Box>
        ) : showChanges ? (
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            {changesLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  gap: 2
                }}
              >
                <CircularProgress size={32} sx={{ color: COLORS.primary.main }} />
                <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
                  Loading changes...
                </Typography>
              </Box>
            ) : (
              <DiffViewer diffText={changesData?.changes} />
            )}
          </Box>
        ) : historyData && historyData.commits && historyData.commits.length > 0 ? (
          <List sx={{ py: 0, overflow: 'auto', height: '100%' }}>
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
                    COLORS.hover.button : 'transparent',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: selectedCommitId === commit.commitId ? 
                      COLORS.hover.button : 
                      COLORS.grey[50],
                    transform: 'translateX(4px)'
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
                    width: '100%'
                  }}
                >
                  {commit.commitMessage || commit.message || 'No commit message'}
                </Typography>
                
                <Typography
                  variant="body2"
                  sx={{
                    color: COLORS.text.secondary,
                    fontSize: '0.8rem',
                    width: '100%'
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
              px: 3
            }}
          >
            <HistoryIcon 
              sx={{ 
                fontSize: 48, 
                color: COLORS.text.secondary,
                opacity: 0.5 
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