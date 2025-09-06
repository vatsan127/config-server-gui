import React, { forwardRef } from 'react';
import { Slide } from '@mui/material';
import { COLORS, SIZES } from '../theme/colors';

/**
 * Standardized dialog transition component
 * Uses slide-down animation like CreateFileButton for consistency
 */
export const StandardDialogTransition = forwardRef(function StandardDialogTransition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

/**
 * Standardized dialog animation styles
 * Based on the create config dialog animation for consistency
 */
export const getDialogAnimationStyles = (variant = 'standard') => {
  const baseStyles = {
    position: 'relative',
    overflow: 'hidden',
    animation: 'standardDialogSlideIn 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    '@keyframes standardDialogSlideIn': {
      '0%': {
        opacity: 0,
        transform: 'translateY(-50px) scale(0.9) rotateX(15deg)'
      },
      '100%': {
        opacity: 1,
        transform: 'translateY(0) scale(1) rotateX(0deg)'
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
          animation: 'progressSlide 0.15s ease-out 0.2s both',
          '@keyframes progressSlide': {
            '0%': {
              transform: 'translateX(-100%) scaleX(0.5)'
            },
            '100%': {
              transform: 'translateX(0) scaleX(1)'
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
          animation: 'progressSlide 0.15s ease-out 0.2s both',
          '@keyframes progressSlide': {
            '0%': {
              transform: 'translateX(-100%) scaleX(0.5)'
            },
            '100%': {
              transform: 'translateX(0) scaleX(1)'
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
          animation: 'progressSlide 0.15s ease-out 0.2s both',
          '@keyframes progressSlide': {
            '0%': {
              transform: 'translateX(-100%) scaleX(0.5)'
            },
            '100%': {
              transform: 'translateX(0) scaleX(1)'
            }
          }
        }
      };
    default:
      return baseStyles;
  }
};

/**
 * Standardized dialog title animation styles
 */
export const getDialogTitleAnimationStyles = () => ({
  animation: 'titleSlideIn 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s both',
  '@keyframes titleSlideIn': {
    '0%': {
      opacity: 0,
      transform: 'translateX(-25px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateX(0)'
    }
  }
});

/**
 * Standardized dialog content animation styles
 */
export const getDialogContentAnimationStyles = () => ({
  animation: 'contentFadeIn 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both',
  '@keyframes contentFadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(15px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)'
    }
  }
});

/**
 * Standardized dialog actions animation styles
 */
export const getDialogActionsAnimationStyles = () => ({
  animation: 'actionsSlideIn 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.15s both',
  '@keyframes actionsSlideIn': {
    '0%': {
      opacity: 0,
      transform: 'translateX(25px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateX(0)'
    }
  }
});

/**
 * Standardized backdrop styles
 */
export const getDialogBackdropStyles = () => ({
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }
});

/**
 * Standard dialog props for consistent behavior
 */
export const getStandardDialogProps = (variant = 'standard') => ({
  TransitionComponent: StandardDialogTransition,
  TransitionProps: {
    timeout: {
      enter: 500,
      exit: 350
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