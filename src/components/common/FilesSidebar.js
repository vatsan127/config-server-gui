import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { COLORS, SIZES } from '../../theme/colors';

const FilesSidebar = ({ 
  currentPath = '/', 
  onPathChange, 
  onRefresh,
  namespace 
}) => {
  const handleHomeClick = () => {
    onPathChange('/');
  };

  const handleRefreshClick = () => {
    onRefresh();
  };

  return (
    <Box
      sx={{
        width: SIZES.sidebar.width,
        height: '100vh',
        bgcolor: '#000000',
        borderRight: `1px solid ${COLORS.grey[300]}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000
      }}
    >
      <Box sx={{ p: SIZES.spacing.sm, borderBottom: `1px solid rgba(255, 255, 255, 0.2)` }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: COLORS.text.white,
            fontWeight: 600,
            mb: 0.5
          }}
        >
          {namespace}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: COLORS.text.muted,
            fontSize: '0.75rem'
          }}
        >
          Namespace
        </Typography>
      </Box>

      <List sx={{ py: 0, flex: 1 }}>
        <ListItem
          button
          onClick={handleHomeClick}
          sx={{
            py: SIZES.spacing.xs,
            px: SIZES.spacing.sm,
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
            bgcolor: 'rgba(33, 150, 243, 0.3)'
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <HomeIcon 
              sx={{ 
                color: COLORS.primary.light,
                fontSize: '1.25rem'
              }} 
            />
          </ListItemIcon>
          <ListItemText 
            primary="Files"
            primaryTypographyProps={{
              sx: {
                color: COLORS.text.white,
                fontWeight: 600,
                fontSize: '0.875rem'
              }
            }}
          />
        </ListItem>

        <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        <ListItem
          button
          onClick={handleRefreshClick}
          sx={{
            py: SIZES.spacing.xs,
            px: SIZES.spacing.sm,
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <RefreshIcon sx={{ color: COLORS.text.muted, fontSize: '1.25rem' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Refresh"
            primaryTypographyProps={{
              sx: {
                color: COLORS.text.muted,
                fontSize: '0.875rem'
              }
            }}
          />
        </ListItem>

        <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

      </List>
    </Box>
  );
};

export default FilesSidebar;