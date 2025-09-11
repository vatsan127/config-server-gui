import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  alpha
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { COLORS, SIZES } from '../../theme/colors';

const FilesSidebar = ({ namespace }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleHomeClick = () => {
    navigate(`/namespace/${namespace}/files`);
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleVaultClick = () => {
    navigate(`/namespace/${namespace}/vault`);
  };

  const handleEventsClick = () => {
    navigate(`/namespace/${namespace}/events`);
  };

  const handleNotifyClick = () => {
    navigate(`/namespace/${namespace}/notify`);
  };

  const isFilesActive = location.pathname.includes('/files');
  const isFileViewActive = location.pathname.includes('/file');
  const isVaultActive = location.pathname.includes('/vault');
  const isEventsActive = location.pathname.includes('/events');
  const isNotifyActive = location.pathname.includes('/notify');

  return (
    <Box
      sx={{
        width: SIZES.sidebar.width,
        height: '100vh',
        background: `linear-gradient(180deg, ${alpha(COLORS.background.sidebar, 0.98)} 0%, ${alpha(COLORS.background.sidebar, 0.92)} 100%)`,
        /* Removed expensive backdrop-filter for better performance */
        borderRight: `1px solid ${alpha(COLORS.grey[300], 0.2)}`,
        boxShadow: '0 8px 32px rgba(6, 57, 112, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha('#4F46E5', 0.1)} 0%, transparent 50%, ${alpha('#10B981', 0.05)} 100%)`,
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.15s ease',
        },
        '&:hover::before': {
          opacity: 1,
        },
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        overflow: 'hidden'
      }}
    >

      <Box sx={{ 
        px: 3, 
        py: 2.5, 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderBottom: `1px solid ${alpha(COLORS.text.white, 0.08)}`,
        mb: 0.5
      }}>
        <Box sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: '#4ade80',
          mr: 1.5,
          boxShadow: `0 0 12px ${alpha('#4ade80', 0.6)}, 0 0 24px ${alpha('#4ade80', 0.3)}`,
          position: 'relative',
          /* Removed infinite pulse animation for better performance */
          '@keyframes pulse': {
            '0%, 100%': {
              opacity: 1,
              transform: 'scale(1)'
            },
            '50%': {
              opacity: 0.8,
              transform: 'scale(1.1)'
            }
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            borderRadius: '50%',
            border: `1px solid ${alpha('#4ade80', 0.3)}`,
            /* Removed infinite ripple animation for better performance */
            '@keyframes ripple': {
              '0%': {
                transform: 'scale(0.8)',
                opacity: 1
              },
              '100%': {
                transform: 'scale(2.5)',
                opacity: 0
              }
            }
          }
        }} />
        <Typography 
          variant="h6" 
          sx={{ 
            color: COLORS.text.white,
            fontWeight: 600,
            fontSize: '1.1rem',
            letterSpacing: '-0.01em',
            margin: 0
          }}
        >
          {namespace}
        </Typography>
      </Box>

      <List sx={{ py: 0.5, flex: 1, px: 2 }}>
        <ListItem
          button
          onClick={handleBackToDashboard}
          sx={{
            py: 1.25,
            px: 1.5,
            mb: 0.5,
            borderRadius: `${SIZES.borderRadius.medium}px`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': { 
              bgcolor: alpha('#6366f1', 0.15),
              transform: 'translateX(4px) scale(1.02)',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.2)',
              '& .MuiListItemIcon-root': {
                color: '#6366f1',
                transform: 'scale(1.1)'
              },
              '& .MuiListItemText-primary': {
                color: '#ffffff',
                fontWeight: 600
              },
              '&::before': {
                transform: 'scaleY(1)'
              },
              '&::after': {
                opacity: 1,
                transform: 'translateX(0)'
              }
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              width: 3,
              height: '100%',
              bgcolor: '#6366f1',
              transform: 'scaleY(0)',
              transformOrigin: 'bottom',
              transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(90deg, transparent 0%, ${alpha('#6366f1', 0.1)} 100%)`,
              opacity: 0,
              transform: 'translateX(100%)',
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
            }
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 32,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <DashboardIcon 
              sx={{ 
                color: alpha(COLORS.text.white, 0.8),
                fontSize: '1.1rem'
              }} 
            />
          </ListItemIcon>
          <ListItemText 
            primary="Dashboard"
            primaryTypographyProps={{
              sx: {
                color: alpha(COLORS.text.white, 0.9),
                fontWeight: 500,
                fontSize: '0.875rem',
                letterSpacing: '-0.005em',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }
            }}
          />
        </ListItem>

        <ListItem
          button
          onClick={handleHomeClick}
          sx={{
            py: 1.25,
            px: 1.5,
            mb: 0.5,
            borderRadius: `${SIZES.borderRadius.medium}px`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            bgcolor: (isFilesActive || isFileViewActive) ? alpha('#10b981', 0.15) : 'transparent',
            '&:hover': { 
              bgcolor: (isFilesActive || isFileViewActive) ? alpha('#10b981', 0.25) : alpha('#10b981', 0.12),
              transform: 'translateX(4px) scale(1.02)',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.25)',
              '& .MuiListItemIcon-root': {
                color: '#10b981',
                transform: 'scale(1.15) rotate(5deg)'
              },
              '& .MuiListItemText-primary': {
                color: '#ffffff',
                fontWeight: 700
              },
              '&::before': {
                transform: 'scaleY(1)'
              },
              '&::after': {
                opacity: 1,
                transform: 'translateX(0)'
              }
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              width: 3,
              height: '100%',
              bgcolor: '#10b981',
              transform: (isFilesActive || isFileViewActive) ? 'scaleY(1)' : 'scaleY(0)',
              transformOrigin: 'bottom',
              transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(90deg, transparent 0%, ${alpha('#10b981', 0.1)} 100%)`,
              opacity: 0,
              transform: 'translateX(100%)',
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
            }
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 32,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <HomeIcon 
              sx={{ 
                color: (isFilesActive || isFileViewActive) ? '#10b981' : alpha(COLORS.text.white, 0.8),
                fontSize: '1.1rem'
              }} 
            />
          </ListItemIcon>
          <ListItemText 
            primary="Files"
            primaryTypographyProps={{
              sx: {
                color: (isFilesActive || isFileViewActive) ? '#e2e8f0' : alpha(COLORS.text.white, 0.9),
                fontWeight: (isFilesActive || isFileViewActive) ? 600 : 500,
                fontSize: '0.875rem',
                letterSpacing: '-0.005em',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }
            }}
          />
        </ListItem>

        <ListItem
          button
          onClick={handleVaultClick}
          sx={{
            py: 1.25,
            px: 1.5,
            mb: 0.5,
            borderRadius: `${SIZES.borderRadius.medium}px`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            bgcolor: isVaultActive ? alpha('#f59e0b', 0.15) : 'transparent',
            '&:hover': { 
              bgcolor: isVaultActive ? alpha('#f59e0b', 0.25) : alpha('#f59e0b', 0.12),
              transform: 'translateX(4px) scale(1.02)',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.25)',
              '& .MuiListItemIcon-root': {
                color: '#f59e0b',
                transform: 'scale(1.15) rotate(-5deg)'
              },
              '& .MuiListItemText-primary': {
                color: '#ffffff',
                fontWeight: 700
              },
              '&::before': {
                transform: 'scaleY(1)'
              },
              '&::after': {
                opacity: 1,
                transform: 'translateX(0)'
              }
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              width: 3,
              height: '100%',
              bgcolor: '#f59e0b',
              transform: isVaultActive ? 'scaleY(1)' : 'scaleY(0)',
              transformOrigin: 'bottom',
              transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(90deg, transparent 0%, ${alpha('#f59e0b', 0.1)} 100%)`,
              opacity: 0,
              transform: 'translateX(100%)',
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
            }
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 32,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <SecurityIcon 
              sx={{ 
                color: isVaultActive ? '#f59e0b' : alpha(COLORS.text.white, 0.8),
                fontSize: '1.1rem'
              }} 
            />
          </ListItemIcon>
          <ListItemText 
            primary="Vault"
            primaryTypographyProps={{
              sx: {
                color: isVaultActive ? '#e2e8f0' : alpha(COLORS.text.white, 0.9),
                fontWeight: isVaultActive ? 600 : 500,
                fontSize: '0.875rem',
                letterSpacing: '-0.005em',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }
            }}
          />
        </ListItem>

        <ListItem
          button
          onClick={handleEventsClick}
          sx={{
            py: 1.25,
            px: 1.5,
            mb: 0.5,
            borderRadius: `${SIZES.borderRadius.medium}px`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            bgcolor: isEventsActive ? alpha('#8b5cf6', 0.15) : 'transparent',
            '&:hover': { 
              bgcolor: isEventsActive ? alpha('#8b5cf6', 0.25) : alpha('#8b5cf6', 0.12),
              transform: 'translateX(4px) scale(1.02)',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.25)',
              '& .MuiListItemIcon-root': {
                color: '#8b5cf6',
                transform: 'scale(1.15) rotate(5deg)'
              },
              '& .MuiListItemText-primary': {
                color: '#ffffff',
                fontWeight: 700
              },
              '&::before': {
                transform: 'scaleY(1)'
              },
              '&::after': {
                opacity: 1,
                transform: 'translateX(0)'
              }
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              width: 3,
              height: '100%',
              bgcolor: '#8b5cf6',
              transform: isEventsActive ? 'scaleY(1)' : 'scaleY(0)',
              transformOrigin: 'bottom',
              transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(90deg, transparent 0%, ${alpha('#8b5cf6', 0.1)} 100%)`,
              opacity: 0,
              transform: 'translateX(100%)',
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
            }
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 32,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <TimelineIcon 
              sx={{ 
                color: isEventsActive ? '#8b5cf6' : alpha(COLORS.text.white, 0.8),
                fontSize: '1.1rem'
              }} 
            />
          </ListItemIcon>
          <ListItemText 
            primary="Events"
            primaryTypographyProps={{
              sx: {
                color: isEventsActive ? '#e2e8f0' : alpha(COLORS.text.white, 0.9),
                fontWeight: isEventsActive ? 600 : 500,
                fontSize: '0.875rem',
                letterSpacing: '-0.005em',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }
            }}
          />
        </ListItem>

        <ListItem
          button
          onClick={handleNotifyClick}
          sx={{
            py: 1.25,
            px: 1.5,
            mb: 0.5,
            borderRadius: `${SIZES.borderRadius.medium}px`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            bgcolor: isNotifyActive ? alpha('#06b6d4', 0.15) : 'transparent',
            '&:hover': { 
              bgcolor: isNotifyActive ? alpha('#06b6d4', 0.25) : alpha('#06b6d4', 0.12),
              transform: 'translateX(4px) scale(1.02)',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.25)',
              '& .MuiListItemIcon-root': {
                color: '#06b6d4',
                transform: 'scale(1.15) rotate(-5deg)'
              },
              '& .MuiListItemText-primary': {
                color: '#ffffff',
                fontWeight: 700
              },
              '&::before': {
                transform: 'scaleY(1)'
              },
              '&::after': {
                opacity: 1,
                transform: 'translateX(0)'
              }
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              width: 3,
              height: '100%',
              bgcolor: '#06b6d4',
              transform: isNotifyActive ? 'scaleY(1)' : 'scaleY(0)',
              transformOrigin: 'bottom',
              transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(90deg, transparent 0%, ${alpha('#06b6d4', 0.1)} 100%)`,
              opacity: 0,
              transform: 'translateX(100%)',
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
            }
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 32,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <NotificationsIcon 
              sx={{ 
                color: isNotifyActive ? '#06b6d4' : alpha(COLORS.text.white, 0.8),
                fontSize: '1.1rem'
              }} 
            />
          </ListItemIcon>
          <ListItemText 
            primary="Notify"
            primaryTypographyProps={{
              sx: {
                color: isNotifyActive ? '#e2e8f0' : alpha(COLORS.text.white, 0.9),
                fontWeight: isNotifyActive ? 600 : 500,
                fontSize: '0.875rem',
                letterSpacing: '-0.005em',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }
            }}
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default FilesSidebar;