import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemSecondaryAction,
  alpha,
  Chip,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { COLORS, SIZES } from '../../theme/colors';
import { getFileIconComponent, formatFileSize, formatLastModified } from '../../utils';


const FileItem = ({ 
  item, 
  onItemClick, 
  onEdit, 
  onDownload, 
  onHistory, 
  onDelete, 
  onCopy,
  showInlineActions = true 
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const isFolder = item.name?.endsWith('/') || item.type === 'folder';
  const displayName = isFolder ? item.name?.replace('/', '') : item.name;

  const handleMenuOpen = useCallback((event) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
  }, []);

  const handleAction = useCallback((action, event) => {
    event.stopPropagation();
    handleMenuClose();
    
    switch (action) {
      case 'edit':
        onEdit?.(item);
        break;
      case 'download':
        onDownload?.(item);
        break;
      case 'history':
        onHistory?.(item);
        break;
      case 'delete':
        onDelete?.(item);
        break;
      case 'copy':
        onCopy?.(item);
        break;
    }
  }, [handleMenuClose, onEdit, onDownload, onHistory, onDelete, onCopy, item]);

  const quickActions = useMemo(() => [
    { 
      id: 'edit', 
      icon: EditIcon, 
      label: 'Edit', 
      color: COLORS.primary.main,
      show: !isFolder 
    },
    { 
      id: 'download', 
      icon: DownloadIcon, 
      label: 'Download', 
      color: COLORS.accent.green,
      show: !isFolder 
    },
    { 
      id: 'history', 
      icon: HistoryIcon, 
      label: 'History', 
      color: COLORS.accent.blue,
      show: !isFolder 
    },
    { 
      id: 'delete', 
      icon: DeleteIcon, 
      label: 'Delete', 
      color: COLORS.error.border,
      show: true 
    }
  ], [isFolder]);

  const menuActions = useMemo(() => [
    { id: 'edit', icon: EditIcon, label: 'Edit File', show: !isFolder },
    { id: 'copy', icon: CopyIcon, label: 'Copy Path', show: true },
    { id: 'download', icon: DownloadIcon, label: 'Download', show: !isFolder },
    { id: 'history', icon: HistoryIcon, label: 'View History', show: !isFolder },
    { divider: true },
    { id: 'delete', icon: DeleteIcon, label: 'Delete', show: true, danger: true }
  ], [isFolder]);

  return (
    <ListItem 
      disablePadding
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ 
        '&:hover .file-actions': {
          opacity: 1,
          visibility: 'visible'
        }
      }}
    >
      <ListItemButton
        onClick={() => onItemClick?.(item)}
        sx={{
          borderRadius: `${SIZES.borderRadius.medium}px`,
          py: 1.5,
          px: 2,
          mx: 0.5,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            bgcolor: COLORS.hover.card,
            transform: 'translateX(4px)',
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          {getFileIconComponent(displayName, isFolder)}
        </ListItemIcon>
        
        <ListItemText 
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: isFolder ? COLORS.primary.main : COLORS.text.primary,
                  fontWeight: isFolder ? 600 : 400,
                  fontSize: '0.9rem',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {displayName}
              </Typography>
              
              {/* File Type Badge */}
              {!isFolder && item.name && (
                <Chip
                  label={item.name.split('.').pop()?.toUpperCase() || 'FILE'}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    bgcolor: alpha(COLORS.primary.main, 0.1),
                    color: COLORS.primary.main,
                    border: `1px solid ${alpha(COLORS.primary.main, 0.3)}`,
                    '& .MuiChip-label': {
                      px: 0.5,
                    }
                  }}
                />
              )}
            </Box>
          }
          secondary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
              {item.size && !isFolder && (
                <Typography variant="caption" sx={{ color: COLORS.text.secondary }}>
                  {formatFileSize(item.size)}
                </Typography>
              )}
              
              {item.lastModified && (
                <Typography variant="caption" sx={{ color: COLORS.text.secondary }}>
                  {formatLastModified(item.lastModified)}
                </Typography>
              )}

              {item.author && (
                <Typography variant="caption" sx={{ color: COLORS.text.muted }}>
                  by {item.author}
                </Typography>
              )}
            </Box>
          }
        />

        {/* Quick Actions - Inline */}
        {showInlineActions && (
          <Box 
            className="file-actions"
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              ml: 2,
              opacity: 0,
              visibility: 'hidden',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {quickActions.filter(action => action.show).slice(0, 3).map((action) => {
              const IconComponent = action.icon;
              return (
                <Tooltip key={action.id} title={action.label} placement="top">
                  <IconButton
                    size="small"
                    onClick={(e) => handleAction(action.id, e)}
                    sx={{
                      color: COLORS.text.secondary,
                      width: 28,
                      height: 28,
                      '&:hover': {
                        bgcolor: alpha(action.color, 0.1),
                        color: action.color,
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <IconComponent fontSize="small" />
                  </IconButton>
                </Tooltip>
              );
            })}

            {/* More Actions Menu */}
            <Tooltip title="More actions" placement="top">
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{
                  color: COLORS.text.secondary,
                  width: 28,
                  height: 28,
                  '&:hover': {
                    bgcolor: COLORS.grey[100],
                    color: COLORS.text.primary,
                  }
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </ListItemButton>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 0.5,
            borderRadius: `${SIZES.borderRadius.medium}px`,
            boxShadow: SIZES.shadow.elevated,
            border: `1px solid ${COLORS.grey[200]}`,
            minWidth: 160,
          }
        }}
      >
        {menuActions.map((action, index) => {
          if (action.divider) {
            return <Divider key={index} />;
          }
          
          if (!action.show) return null;
          
          const IconComponent = action.icon;
          
          return (
            <MenuItem
              key={action.id}
              onClick={(e) => handleAction(action.id, e)}
              sx={{
                py: 1,
                px: 2,
                fontSize: '0.85rem',
                ...(action.danger && {
                  color: COLORS.error.border,
                  '&:hover': {
                    bgcolor: alpha(COLORS.error.border, 0.1),
                  }
                })
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <IconComponent 
                  fontSize="small" 
                  sx={{ 
                    color: action.danger ? COLORS.error.border : COLORS.text.secondary 
                  }}
                />
              </ListItemIcon>
              <ListItemText primary={action.label} />
            </MenuItem>
          );
        })}
      </Menu>
    </ListItem>
  );
};

// Memoize FileItem to prevent unnecessary re-renders
const MemoizedFileItem = React.memo(FileItem);

const EnhancedFileList = ({
  files = [],
  onItemClick,
  onEdit,
  onDownload,
  onHistory,
  onDelete,
  onCopy,
  loading = false,
  emptyMessage = "No files found",
  showInlineActions = true,
  viewMode = 'list' // 'list' | 'grid'
}) => {
  if (loading) {
    return (
      <Box sx={{ 
        bgcolor: COLORS.background.paper,
        borderRadius: `${SIZES.borderRadius.large}px`,
        border: `1px solid ${COLORS.grey[200]}`,
        boxShadow: SIZES.shadow.card,
        p: 4,
        textAlign: 'center'
      }}>
        <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
          Loading files...
        </Typography>
      </Box>
    );
  }

  if (files.length === 0) {
    return (
      <Box sx={{ 
        bgcolor: COLORS.background.paper,
        borderRadius: `${SIZES.borderRadius.large}px`,
        border: `1px solid ${COLORS.grey[200]}`,
        boxShadow: SIZES.shadow.card,
        p: 4,
        textAlign: 'center'
      }}>
        <Typography variant="body1" sx={{ 
          color: COLORS.text.secondary,
          mb: 1,
          fontWeight: 500 
        }}>
          {emptyMessage}
        </Typography>
        <Typography variant="body2" sx={{ 
          color: COLORS.text.muted,
          fontSize: '0.85rem' 
        }}>
          This directory appears to be empty or no files match your search criteria.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: COLORS.background.paper,
      borderRadius: `${SIZES.borderRadius.large}px`,
      border: `1px solid ${COLORS.grey[200]}`,
      boxShadow: SIZES.shadow.card,
      overflow: 'hidden'
    }}>
      <List sx={{ py: 0 }}>
        {files.map((file, index) => (
          <React.Fragment key={file.name || index}>
            <MemoizedFileItem
              item={file}
              onItemClick={onItemClick}
              onEdit={onEdit}
              onDownload={onDownload}
              onHistory={onHistory}
              onDelete={onDelete}
              onCopy={onCopy}
              showInlineActions={showInlineActions}
            />
            {index < files.length - 1 && (
              <Divider variant="inset" component="li" sx={{ ml: 6 }} />
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default React.memo(EnhancedFileList);