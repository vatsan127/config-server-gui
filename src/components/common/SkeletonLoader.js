import React from 'react';
import { Box, Skeleton, Grid } from '@mui/material';
import { COLORS, SIZES } from '../../theme/colors';

export const NamespaceCardSkeleton = () => (
  <Box sx={{ 
    width: 280,
    height: 160,
    p: 2,
    bgcolor: COLORS.background.paper,
    borderRadius: `${SIZES.borderRadius.large}px`,
    border: `1px solid ${COLORS.grey[200]}`,
    boxShadow: SIZES.shadow.card,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      transform: 'translateX(-100%)',
      animation: 'shimmer 1.5s infinite',
    },
    '@keyframes shimmer': {
      '100%': {
        transform: 'translateX(100%)',
      },
    },
  }}>
    {/* Environment Badge Skeleton */}
    <Skeleton 
      variant="rectangular" 
      width={50} 
      height={20}
      sx={{ 
        position: 'absolute',
        top: 12,
        right: 12,
        borderRadius: `${SIZES.borderRadius.small}px`
      }}
    />
    
    {/* Header with Icon and Title */}
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
      <Skeleton 
        variant="rounded" 
        width={48} 
        height={48}
        sx={{ 
          mr: 2,
          borderRadius: `${SIZES.borderRadius.large}px`
        }}
      />
      <Box sx={{ flex: 1 }}>
        <Skeleton 
          variant="text" 
          width="80%" 
          height={24}
          sx={{ mb: 0.5 }}
        />
      </Box>
    </Box>

    {/* Metadata Skeletons */}
    <Box sx={{ mb: 2, flex: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Skeleton 
          variant="circular" 
          width={16} 
          height={16}
          sx={{ mr: 1 }}
        />
        <Skeleton 
          variant="text" 
          width="60%" 
          height={16}
        />
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Skeleton 
          variant="circular" 
          width={16} 
          height={16}
          sx={{ mr: 1 }}
        />
        <Skeleton 
          variant="text" 
          width="70%" 
          height={16}
        />
      </Box>
    </Box>

    {/* Quick Actions Skeleton */}
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Skeleton 
        variant="circular" 
        width={32} 
        height={32}
      />
      <Skeleton 
        variant="circular" 
        width={32} 
        height={32}
      />
    </Box>
  </Box>
);

export const DashboardSkeletonLoader = ({ count = 8 }) => (
  <Box sx={{ 
    display: 'flex',
    flexWrap: 'wrap',
    gap: 2,
    p: SIZES.spacing.xs
  }}>
    {Array.from({ length: count }).map((_, index) => (
      <NamespaceCardSkeleton key={index} />
    ))}
  </Box>
);

export const FileListSkeleton = ({ count = 6 }) => (
  <Box sx={{ 
    bgcolor: COLORS.background.paper,
    border: `1px solid ${COLORS.grey[200]}`,
    borderRadius: `${SIZES.borderRadius.medium}px`,
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