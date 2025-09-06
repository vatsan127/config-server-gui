import React from 'react';
import { Box, Typography } from '@mui/material';
import { COLORS, SIZES } from '../../theme/colors';

const SearchResultInfo = ({ 
  searchQuery, 
  filteredCount, 
  totalCount, 
  itemType = 'item' 
}) => {
  if (!searchQuery) return null;

  const pluralType = itemType.endsWith('s') ? itemType : `${itemType}s`;

  return (
    <Box sx={{ 
      mb: 1,
      p: SIZES.spacing.xs,
      bgcolor: COLORS.grey[50],
      border: `1px solid ${COLORS.grey[200]}`,
      borderRadius: `${SIZES.borderRadius.medium}px`,
      animation: 'slideInFromTop 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      '@keyframes slideInFromTop': {
        '0%': {
          opacity: 0,
          transform: 'translateY(-10px)'
        },
        '100%': {
          opacity: 1,
          transform: 'translateY(0)'
        }
      }
    }}>
      <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
        {filteredCount === 0 
          ? `No ${pluralType} found matching "${searchQuery}"`
          : `Showing ${filteredCount} of ${totalCount} ${pluralType} matching "${searchQuery}"`
        }
      </Typography>
    </Box>
  );
};

export default SearchResultInfo;