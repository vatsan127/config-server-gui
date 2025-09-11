import React, { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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
import PropTypes from 'prop-types';

const FilesSidebar = ({ namespace }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle navigation errors gracefully
  const handleNavigation = useCallback((path) => {
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [navigate]);
  
  // Memoized navigation items configuration
  const navigationItems = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: DashboardIcon,
      onClick: () => handleNavigation('/'),
      color: '#6366f1',
      isActive: false // Dashboard is not part of namespace, so never active
    },
    {
      id: 'files',
      label: 'Files',
      icon: HomeIcon,
      onClick: () => handleNavigation(`/namespace/${namespace}/files`),
      color: '#10b981',
      isActive: location.pathname.includes('/files') || location.pathname.includes('/file')
    },
    {
      id: 'vault',
      label: 'Vault',
      icon: SecurityIcon,
      onClick: () => handleNavigation(`/namespace/${namespace}/vault`),
      color: '#f59e0b',
      isActive: location.pathname.includes('/vault')
    },
    {
      id: 'events',
      label: 'Events',
      icon: TimelineIcon,
      onClick: () => handleNavigation(`/namespace/${namespace}/events`),
      color: '#8b5cf6',
      isActive: location.pathname.includes('/events')
    },
    {
      id: 'notify',
      label: 'Notify',
      icon: NotificationsIcon,
      onClick: () => handleNavigation(`/namespace/${namespace}/notify`),
      color: '#06b6d4',
      isActive: location.pathname.includes('/notify')
    }
  ], [namespace, location.pathname, handleNavigation]);

  // Memoized sidebar item styles function
  const getSidebarItemStyles = useCallback((isActive, color) => ({
    py: 1.25,
    px: 1.5,
    mb: 0.5,
    borderRadius: `${SIZES.borderRadius.medium}px`,
    bgcolor: isActive ? alpha(color, 0.15) : 'transparent',
    borderLeft: isActive ? `3px solid ${color}` : '3px solid transparent',
    '&:hover': { 
      bgcolor: isActive ? alpha(color, 0.2) : alpha(color, 0.1)
    }
  }), []);

  // Memoized SidebarItem component
  const SidebarItem = React.memo(({ item }) => {
    const IconComponent = item.icon;
    return (
      <ListItem
        button
        onClick={item.onClick}
        sx={getSidebarItemStyles(item.isActive, item.color)}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          <IconComponent 
            sx={{ 
              color: item.isActive ? item.color : alpha(COLORS.text.white, 0.8),
              fontSize: '1.1rem'
            }} 
          />
        </ListItemIcon>
        <ListItemText 
          primary={item.label}
          primaryTypographyProps={{
            sx: {
              color: item.isActive ? '#e2e8f0' : alpha(COLORS.text.white, 0.9),
              fontWeight: item.isActive ? 600 : 500,
              fontSize: '0.875rem'
            }
          }}
        />
      </ListItem>
    );
  });

  // Set display name for debugging
  SidebarItem.displayName = 'SidebarItem';

  return (
    <Box
      component="nav"
      role="navigation" 
      aria-label="Main navigation"
      sx={{
        width: SIZES.sidebar.width,
        height: '100vh',
        bgcolor: COLORS.background.sidebar,
        borderRight: `1px solid ${COLORS.grey[300]}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000
      }}
    >
      {/* Header */}
      <Box sx={{ 
        px: 3, 
        py: 2.5, 
        display: 'flex',
        alignItems: 'center',
        borderBottom: `1px solid ${alpha(COLORS.text.white, 0.08)}`
      }}>
        <Box sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: '#4ade80',
          mr: 1.5
        }} />
        <Typography 
          variant="h6" 
          sx={{ 
            color: COLORS.text.white,
            fontWeight: 600,
            fontSize: '1.1rem'
          }}
        >
          {namespace}
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List sx={{ py: 1, flex: 1, px: 2 }}>
        {navigationItems.map((item) => (
          <SidebarItem key={item.id} item={item} />
        ))}
      </List>
    </Box>
  );
};

// PropTypes validation
FilesSidebar.propTypes = {
  namespace: PropTypes.string.isRequired
};

// Default props
FilesSidebar.defaultProps = {
  namespace: 'Default'
};

export default FilesSidebar;