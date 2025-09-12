import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { apiService, setNotificationHandler } from '../services/api';
import { COLORS, SIZES, BUTTON_STYLES } from '../theme/colors';
import { FileListSkeleton } from './common/SkeletonLoader';
import PageHeader from './common/PageHeader';

// Memoized notification item component
const NotificationItem = React.memo(({ notification, index, isLast, getStatusDisplay, formatDate }) => {
  const statusDisplay = getStatusDisplay(notification.status);
  
  return (
    <ListItem
      sx={{
        borderBottom: !isLast ? `1px solid ${COLORS.grey?.[100] || '#f3f4f6'}` : 'none',
        py: 1.5,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        '&:hover': {
          bgcolor: COLORS.hover?.card || 'rgba(0, 0, 0, 0.04)'
        }
      }}
    >
      <ListItemIcon sx={{ minWidth: 32 }}>
        <Box sx={{
          p: 0.5,
          borderRadius: '50%',
          bgcolor: statusDisplay.bgcolor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32
        }}>
          {statusDisplay.icon}
        </Box>
      </ListItemIcon>
      
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: COLORS.text?.primary || '#111827',
            mb: 0.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={notification.id}
        >
          {notification.id.slice(0, 8)}
        </Typography>
        
        <Typography variant="caption" sx={{ 
          color: COLORS.text?.secondary || '#6b7280',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}>
          <ScheduleIcon sx={{ fontSize: 12 }} />
          {formatDate(notification.initiatedTime)}
        </Typography>
      </Box>
      
      <Chip
        label={statusDisplay.label}
        size="small"
        sx={{
          bgcolor: statusDisplay.bgcolor,
          color: statusDisplay.color,
          fontWeight: 600,
          fontSize: '0.7rem',
          height: 24,
          minWidth: 'fit-content'
        }}
      />
    </ListItem>
  );
});

const NotifyPage = () => {
  const { namespace } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up notification handler
  const notificationRef = useRef();
  notificationRef.current = enqueueSnackbar;
  
  useEffect(() => {
    setNotificationHandler((message, options) => {
      notificationRef.current(message, options);
    });
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getNamespaceNotifications(namespace);
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Error fetching namespace notifications:', err);
      setError('Failed to load namespace notifications');
    } finally {
      setLoading(false);
    }
  }, [namespace]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const formatDate = useCallback((dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid date';
    }
  }, []);

  const getStatusDisplay = useCallback((status) => {
    const normalizedStatus = status?.toUpperCase();
    
    switch (normalizedStatus) {
      case 'SUCCESS':
        return {
          icon: <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />,
          color: '#10b981',
          bgcolor: 'rgba(16, 185, 129, 0.1)',
          label: 'Success'
        };
      case 'FAILED':
        return {
          icon: <ErrorIcon sx={{ fontSize: 20, color: '#ef4444' }} />,
          color: '#ef4444',
          bgcolor: 'rgba(239, 68, 68, 0.1)',
          label: 'Failed'
        };
      case 'IN_PROGRESS':
        return {
          icon: <HourglassEmptyIcon sx={{ fontSize: 20, color: '#f59e0b' }} />,
          color: '#f59e0b',
          bgcolor: 'rgba(245, 158, 11, 0.1)',
          label: 'In Progress'
        };
      default:
        return {
          icon: <NotificationsIcon sx={{ fontSize: 20, color: COLORS.text.secondary }} />,
          color: COLORS.text.secondary,
          bgcolor: COLORS.grey?.[100] || 'rgba(0, 0, 0, 0.05)',
          label: status || 'Unknown'
        };
    }
  }, []);

  const handleRefresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);


  const EmptyState = () => (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <NotificationsIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3, color: COLORS.text.secondary }} />
      <Typography variant="h6" sx={{ mb: 1, color: COLORS.text.primary, fontWeight: 500 }}>
        No notifications found
      </Typography>
      <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
        No notification events have been recorded for this namespace
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ p: 4, pt: 2 }}>
        <FileListSkeleton />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column',
      p: SIZES.spacing.xs,
      bgcolor: 'background.default',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <PageHeader
        title="Notifications"
        subtitle={`${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
        icon={NotificationsIcon}
        actions={[
          {
            label: 'Refresh',
            icon: <RefreshIcon />,
            onClick: handleRefresh,
            sx: BUTTON_STYLES.secondary
          }
        ]}
      />

      <Box sx={{ flex: 1 }}>
        {notifications.length === 0 ? (
          <EmptyState />
        ) : (
          <Box 
            sx={{ 
              bgcolor: COLORS.background?.paper || '#ffffff',
              border: `1px solid ${COLORS.grey?.[200] || '#e5e7eb'}`,
              borderRadius: `${SIZES.borderRadius?.large || 8}px`,
              boxShadow: SIZES.shadow?.card || '0 1px 3px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              flex: 1
            }}
          >
            <List sx={{ 
              py: 0,
              overflow: 'auto',
              height: '100%'
            }}>
            {notifications.map((notification, index) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                index={index}
                isLast={index === notifications.length - 1}
                getStatusDisplay={getStatusDisplay}
                formatDate={formatDate}
              />
            ))}
          </List>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default NotifyPage;