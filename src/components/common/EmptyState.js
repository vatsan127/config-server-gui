import React from 'react';
import { Box, Typography } from '@mui/material';
import { 
  Inbox as InboxIcon, 
  Search as SearchIcon, 
  Folder as FolderIcon,
  Add as AddIcon 
} from '@mui/icons-material';
import { COLORS, SIZES } from '../../theme/colors';

const EmptyState = ({ 
  title = 'No items found', 
  description = 'Get started by creating your first item',
  type = 'default' 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return <SearchIcon sx={{ fontSize: 24, color: COLORS.text.muted }} />;
      case 'files':
        return <FolderIcon sx={{ fontSize: 24, color: COLORS.text.muted }} />;
      case 'create':
        return <AddIcon sx={{ fontSize: 24, color: COLORS.text.muted }} />;
      default:
        return <InboxIcon sx={{ fontSize: 24, color: COLORS.text.muted }} />;
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: SIZES.spacing.md,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          bgcolor: COLORS.grey[50],
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: SIZES.spacing.sm,
          border: `2px solid ${COLORS.grey[100]}`,
        }}
      >
        {getIcon()}
      </Box>
      <Typography variant="h6" sx={{ 
        mb: SIZES.spacing.sm, 
        color: COLORS.text.primary, 
        fontWeight: 600,
        fontSize: '1.1rem',
      }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ 
        color: COLORS.text.secondary,
        maxWidth: 400,
        lineHeight: 1.6,
        fontSize: '0.9rem',
      }}>
        {description}
      </Typography>
    </Box>
  );
};

export default React.memo(EmptyState);