import React from 'react';
import { Box, Typography } from '@mui/material';
import { COLORS } from '../../theme/colors';

const EmptyState = ({ 
  icon = 'N', 
  title = 'No items found', 
  description = 'Get started by creating your first item' 
}) => {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 8,
        textAlign: 'center',
        bgcolor: COLORS.background.paper,
        border: `1px solid ${COLORS.grey[300]}`,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          bgcolor: COLORS.grey[100],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3
        }}
      >
        <Typography 
          variant="h3" 
          sx={{ 
            color: COLORS.grey[500],
            fontWeight: 400,
            fontSize: '2.5rem'
          }}
        >
          {icon}
        </Typography>
      </Box>
      <Typography variant="h5" sx={{ mb: 2, color: 'text.primary', fontWeight: 500 }}>
        {title}
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {description}
      </Typography>
    </Box>
  );
};

export default React.memo(EmptyState);