import React, { forwardRef } from 'react';
import { Slide } from '@mui/material';
import { COLORS, SIZES } from '../theme/colors';

/**
 * Standardized dialog transition component
 * Uses simple slide-down animation for better performance
 */
export const StandardDialogTransition = forwardRef(function StandardDialogTransition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

/**
 * Optimized dialog animation styles
 * Removed 3D transforms and complex animations for better performance
 */
export const getDialogAnimationStyles = (variant = 'standard') => {
  const baseStyles = {
    position: 'relative',
    overflow: 'hidden',
    animation: 'standardDialogSlideIn 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    '@keyframes standardDialogSlideIn': {
      '0%': {
        opacity: 0,
        transform: 'translateY(-20px)'
      },
      '100%': {
        opacity: 1,
        transform: 'translateY(0)'
      }
    }
  };

  switch (variant) {
    case 'success':
      return {
        ...baseStyles,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${COLORS.success.main}, ${COLORS.accent.green})`,
          animation: 'progressSlide 0.2s ease-out 0.1s both',
          '@keyframes progressSlide': {
            '0%': {
              transform: 'translateX(-100%)'
            },
            '100%': {
              transform: 'translateX(0)'
            }
          }
        }
      };
    case 'error':
    case 'delete':
      return {
        ...baseStyles,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${COLORS.error.main}, ${COLORS.accent.red})`,
          animation: 'progressSlide 0.2s ease-out 0.1s both',
          '@keyframes progressSlide': {
            '0%': {
              transform: 'translateX(-100%)'
            },
            '100%': {
              transform: 'translateX(0)'
            }
          }
        }
      };
    case 'primary':
      return {
        ...baseStyles,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${COLORS.primary.main}, ${COLORS.accent.blue})`,
          animation: 'progressSlide 0.2s ease-out 0.1s both',
          '@keyframes progressSlide': {
            '0%': {
              transform: 'translateX(-100%)'
            },
            '100%': {
              transform: 'translateX(0)'
            }
          }
        }
      };
    default:
      return baseStyles;
  }
};

/**
 * Optimized dialog title animation styles
 */
export const getDialogTitleAnimationStyles = () => ({
  animation: 'titleSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) 0.05s both',
  '@keyframes titleSlideIn': {
    '0%': {
      opacity: 0,
      transform: 'translateX(-20px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateX(0)'
    }
  }
});

/**
 * Optimized dialog content animation styles
 */
export const getDialogContentAnimationStyles = () => ({
  animation: 'contentFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both',
  '@keyframes contentFadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(10px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)'
    }
  }
});

/**
 * Optimized dialog actions animation styles
 */
export const getDialogActionsAnimationStyles = () => ({
  animation: 'actionsSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) 0.15s both',
  '@keyframes actionsSlideIn': {
    '0%': {
      opacity: 0,
      transform: 'translateX(20px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateX(0)'
    }
  }
});

/**
 * Optimized backdrop styles - removed expensive blur
 */
export const getDialogBackdropStyles = () => ({
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    transition: 'opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
  }
});

/**
 * Standard dialog props for consistent behavior
 */
export const getStandardDialogProps = (variant = 'standard') => ({
  TransitionComponent: StandardDialogTransition,
  TransitionProps: {
    timeout: {
      enter: 150,
      exit: 120
    }
  },
  PaperProps: {
    sx: {
      bgcolor: COLORS.background.paper,
      border: `1px solid ${COLORS.grey[200]}`,
      borderRadius: `${SIZES.borderRadius.large}px`,
      boxShadow: SIZES.shadow.floating,
      m: 1,
      ...getDialogAnimationStyles(variant)
    }
  },
  sx: getDialogBackdropStyles()
});

export default {
  StandardDialogTransition,
  getDialogAnimationStyles,
  getDialogTitleAnimationStyles,
  getDialogContentAnimationStyles,
  getDialogActionsAnimationStyles,
  getDialogBackdropStyles,
  getStandardDialogProps
};