import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import { 
  Folder as FolderIcon,
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
  Description as FileIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { COLORS, SIZES } from '../../theme/colors';

const NamespaceCard = ({ namespace, onClick, fileCount = 0, lastModified = null }) => {
  const getNamespaceIcon = (namespace) => {
    const firstWord = namespace.split('-')[0];
    return firstWord.toUpperCase();
  };

  const getNamespaceInitials = (namespace) => {
    const words = namespace.split(/[-_\s]+/).filter(word => word.length > 0);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return namespace.substring(0, 2).toUpperCase();
  };

  const getEnvironmentType = (namespace) => {
    const lower = namespace.toLowerCase();
    if (lower.includes('prod')) return { label: 'PROD', color: COLORS.error.border };
    if (lower.includes('staging') || lower.includes('stage')) return { label: 'STAGE', color: COLORS.warning.border };
    if (lower.includes('dev') || lower.includes('development')) return { label: 'DEV', color: COLORS.accent.blue };
    if (lower.includes('test')) return { label: 'TEST', color: COLORS.accent.purple };
    return { label: 'OTHER', color: COLORS.grey[500] };
  };

  const formatLastModified = (dateString) => {
    if (!dateString) return 'No recent changes';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const envType = getEnvironmentType(namespace);

  return (
    <Card 
      sx={{ 
        width: 280,
        height: 160,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        bgcolor: COLORS.background.paper,
        border: `1px solid ${COLORS.grey[200]}`,
        borderRadius: `${SIZES.borderRadius.large}px`,
        boxShadow: SIZES.shadow.card,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: COLORS.primary.main,
          boxShadow: SIZES.shadow.hover,
          transform: 'translateY(-4px) scale(1.02)',
          bgcolor: COLORS.grey[25],
          '& .namespace-icon': {
            transform: 'scale(1.1)',
            bgcolor: COLORS.primary.dark,
          },
          '& .quick-actions': {
            opacity: 1,
            visibility: 'visible',
          }
        },
        '&:active': {
          transform: 'translateY(-2px) scale(1.01)',
          boxShadow: SIZES.shadow.elevated,
        }
      }}
      elevation={0}
      onClick={onClick}
    >
      {/* Environment Badge */}
      <Chip
        label={envType.label}
        size="small"
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          bgcolor: envType.color,
          color: 'white',
          fontWeight: 600,
          fontSize: '0.65rem',
          height: 20,
          '& .MuiChip-label': {
            px: 1,
          }
        }}
      />

      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        '&:last-child': { pb: 2 }
      }}>
        {/* Header with Icon and Title */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              bgcolor: COLORS.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: `${SIZES.borderRadius.large}px`,
              boxShadow: SIZES.shadow.md,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              mr: 2,
            }}
            className="namespace-icon"
          >
            <FolderIcon sx={{ 
              color: COLORS.text.white,
              fontSize: 24
            }} />
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              component="h2"
              sx={{ 
                fontWeight: 700,
                color: COLORS.text.primary,
                fontSize: '1.1rem',
                mb: 0.5,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {namespace}
            </Typography>
          </Box>
        </Box>

        {/* Metadata */}
        <Box sx={{ mb: 2, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <FileIcon sx={{ 
              fontSize: 16, 
              color: COLORS.text.secondary, 
              mr: 1 
            }} />
            <Typography variant="body2" sx={{ 
              color: COLORS.text.secondary,
              fontSize: '0.8rem'
            }}>
              {fileCount || 0} config files
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon sx={{ 
              fontSize: 16, 
              color: COLORS.text.secondary, 
              mr: 1 
            }} />
            <Typography variant="body2" sx={{ 
              color: COLORS.text.secondary,
              fontSize: '0.8rem'
            }}>
              {formatLastModified(lastModified)}
            </Typography>
          </Box>
        </Box>

        {/* Quick Actions - Hidden by default, shown on hover */}
        <Box 
          className="quick-actions"
          sx={{ 
            display: 'flex', 
            gap: 1,
            opacity: 0,
            visibility: 'hidden',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            mt: 'auto'
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              // Handle quick settings
            }}
            sx={{
              bgcolor: COLORS.grey[100],
              color: COLORS.text.secondary,
              '&:hover': {
                bgcolor: COLORS.primary.main,
                color: COLORS.text.white,
              }
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
          
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              // Handle more options
            }}
            sx={{
              bgcolor: COLORS.grey[100],
              color: COLORS.text.secondary,
              '&:hover': {
                bgcolor: COLORS.grey[200],
                color: COLORS.text.primary,
              }
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(NamespaceCard);