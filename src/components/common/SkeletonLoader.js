import React from 'react';
import { Box, Skeleton, Grid } from '@mui/material';
import { COLORS, SIZES } from '../../theme/colors';

export const NamespaceCardSkeleton = () => (
  <Box sx={{ 
    p: SIZES.spacing.md,
    bgcolor: COLORS.background.paper,
    borderRadius: `${SIZES.borderRadius.large}px`,
    border: `1px solid ${COLORS.grey[200]}`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  }}>
    <Skeleton 
      variant="circular" 
      width={SIZES.icon.namespace} 
      height={SIZES.icon.namespace}
      sx={{ mb: SIZES.spacing.md }}
    />
    <Skeleton 
      variant="text" 
      width="80%" 
      height={28}
      sx={{ mb: SIZES.spacing.xs }}
    />
    <Skeleton 
      variant="text" 
      width="60%" 
      height={20}
    />
  </Box>
);

export const DashboardSkeletonLoader = ({ count = 8 }) => (
  <Grid container spacing={SIZES.spacing.md}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <NamespaceCardSkeleton />
      </Grid>
    ))}
  </Grid>
);

export const FileListSkeleton = ({ count = 6 }) => (
  <Box sx={{ 
    bgcolor: COLORS.background.paper,
    border: `1px solid ${COLORS.grey[200]}`,
    borderRadius: `${SIZES.borderRadius.large}px`,
    overflow: 'hidden'
  }}>
    {Array.from({ length: count }).map((_, index) => (
      <Box
        key={index}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: SIZES.spacing.md,
          borderBottom: index < count - 1 ? `1px solid ${COLORS.grey[100]}` : 'none',
        }}
      >
        <Skeleton
          variant="circular"
          width={24}
          height={24}
          sx={{ mr: SIZES.spacing.lg }}
        />
        <Skeleton
          variant="text"
          width={`${Math.random() * 40 + 40}%`}
          height={20}
        />
      </Box>
    ))}
  </Box>
);

export default {
  NamespaceCardSkeleton,
  DashboardSkeletonLoader,
  FileListSkeleton,
};