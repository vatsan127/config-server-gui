import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton
} from '@mui/material';
import { COLORS, SIZES } from '../../theme/colors';

const ModernList = ({ 
  items = [],
  emptyState,
  onItemClick,
  renderIcon,
  renderActions,
  getItemText,
  searchQuery = '',
  itemType = 'item'
}) => {
  if (items.length === 0) {
    return (
      <Box sx={{ 
        py: SIZES.spacing.md, 
        px: SIZES.spacing.lg,
        textAlign: 'center',
        color: COLORS.text.secondary
      }}>
        {emptyState || (
          <>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              {searchQuery ? `No matching ${itemType}s found` : `No ${itemType}s found`}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              {searchQuery ? 
                `No ${itemType}s match your search for "${searchQuery}"` : 
                `Add your first ${itemType} to get started`
              }
            </Typography>
          </>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: COLORS.background.paper,
      border: `1px solid ${COLORS.grey[200]}`,
      borderRadius: `${SIZES.borderRadius.large}px`,
      boxShadow: SIZES.shadow.card,
      overflow: 'hidden',
      '&:hover': {
        boxShadow: SIZES.shadow.elevated,
        transform: 'translateY(-2px)',
      },
      transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }}>
      <List sx={{ 
        py: 0,
        overflow: 'auto',
        overflowX: 'hidden',
        height: '100%',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: COLORS.grey[300],
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: COLORS.grey[400],
        },
        scrollbarWidth: 'thin',
        scrollbarColor: `${COLORS.grey[300]} transparent`
      }}>
        {items.map((item, index) => (
          <ModernListItem
            key={item.id || item.key || item.name || index}
            item={item}
            index={index}
            isLast={index === items.length - 1}
            onClick={onItemClick}
            renderIcon={renderIcon}
            renderActions={renderActions}
            getItemText={getItemText}
          />
        ))}
      </List>
    </Box>
  );
};

const ModernListItem = ({ 
  item, 
  index, 
  isLast, 
  onClick, 
  renderIcon, 
  renderActions, 
  getItemText 
}) => {
  const text = getItemText ? getItemText(item) : item;
  
  return (
    <ListItem
      onClick={() => onClick?.(item)}
      sx={{
        borderBottom: !isLast ? `1px solid ${COLORS.grey[100]}` : 'none',
        transform: 'translateX(0) scale(1)',
        opacity: 1,
        transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        animation: `slideInModern 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.15 + index * 0.07}s both`,
        '@keyframes slideInModern': {
          '0%': {
            opacity: 0,
            transform: 'translateX(-25px) scale(0.92) rotateZ(-2deg)'
          },
          '40%': {
            opacity: 0.6,
            transform: 'translateX(3px) scale(1.02) rotateZ(0.5deg)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateX(0) scale(1) rotateZ(0deg)'
          }
        },
        '&:hover': {
          bgcolor: COLORS.hover.card,
          transform: 'translateX(8px) scale(1.01)',
          borderColor: COLORS.primary.light,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          '& .action-buttons': {
            opacity: 1,
            visibility: 'visible',
            transform: 'translateX(0)',
          },
          '& .MuiListItemIcon-root': {
            transform: 'scale(1.15) rotate(5deg)',
          },
          '& .MuiListItemText-primary': {
            color: COLORS.text.primary,
            fontWeight: 500,
            transform: 'translateX(4px)',
          }
        },
        '&:active': {
          transform: 'translateX(4px) scale(1.005)',
          transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        py: 2,
        px: 3,
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {renderIcon && (
        <ListItemIcon sx={{ 
          minWidth: 40,
          transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {renderIcon(item)}
        </ListItemIcon>
      )}
      
      <ListItemText 
        primary={text}
        primaryTypographyProps={{
          sx: {
            color: COLORS.text.primary,
            fontWeight: 400,
            fontSize: '0.9rem',
            transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
            lineHeight: 1.4
          }
        }}
      />

      {renderActions && (
        <Box 
          className="action-buttons"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            ml: 1, 
            gap: 0.5,
            opacity: 0,
            visibility: 'hidden',
            transform: 'translateX(10px)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
        >
          {renderActions(item)}
        </Box>
      )}
    </ListItem>
  );
};

export const ModernActionButton = ({ 
  icon, 
  onClick, 
  color = COLORS.text.secondary,
  hoverColor = '#3b82f6',
  hoverBg = 'rgba(59, 130, 246, 0.1)',
  hoverShadow = '0 2px 8px rgba(59, 130, 246, 0.2)',
  tooltip
}) => (
  <IconButton
    size="small"
    onClick={onClick}
    title={tooltip}
    sx={{
      color: color,
      transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        color: hoverColor,
        bgcolor: hoverBg,
        transform: 'scale(1.1)',
        boxShadow: hoverShadow,
      },
      p: 0.5,
      borderRadius: '6px'
    }}
  >
    {icon}
  </IconButton>
);

export default ModernList;