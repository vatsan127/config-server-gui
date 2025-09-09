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
  IconButton,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Apps as AppsIcon,
  Refresh as RefreshIcon,
  Replay as RetryIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { apiService, setNotificationHandler } from '../services/api';
import { COLORS, SIZES, BUTTON_STYLES } from '../theme/colors';
import { FileListSkeleton } from './common/SkeletonLoader';
import PageHeader from './common/PageHeader';

const NotifyPage = () => {
  const { namespace } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [maxNotifications, setMaxNotifications] = useState(0);

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
      setTotalNotifications(data.totalNotifications || 0);
      setMaxNotifications(data.maxNotifications || 0);
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

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get status icon and color
  const getStatusDisplay = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
        return {
          icon: <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />,
          color: '#10b981',
          bgcolor: '#10b98120',
          label: 'Success'
        };
      case 'failed':
        return {
          icon: <ErrorIcon sx={{ fontSize: 20, color: '#ef4444' }} />,
          color: '#ef4444',
          bgcolor: '#ef444420',
          label: 'Failed'
        };
      case 'in_progress':
        return {
          icon: <HourglassEmptyIcon sx={{ fontSize: 20, color: '#f59e0b' }} />,
          color: '#f59e0b',
          bgcolor: '#f59e0b20',
          label: 'In Progress'
        };
      default:
        return {
          icon: <NotificationsIcon sx={{ fontSize: 20, color: COLORS.text.secondary }} />,
          color: COLORS.text.secondary,
          bgcolor: COLORS.grey[100],
          label: status
        };
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  const handleRetry = async (notification) => {
    try {
      await apiService.retryNotification(namespace, notification.id);
      // Refresh the notifications list to get updated status
      fetchNotifications();
    } catch (error) {
      console.error('Error retrying notification:', error);
    }
  };

  const EmptyState = () => (
    <Box sx={{ textAlign: 'center' }}>
      <NotificationsIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3, color: COLORS.text.secondary }} />
      <Typography variant="h6" sx={{ mb: 1, color: COLORS.text.primary, fontWeight: 500 }}>
        No notifications found
      </Typography>
      <Typography variant="body2" sx={{ color: COLORS.text.secondary, fontSize: '0.85rem' }}>
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
        subtitle=""
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

      <Box 
        key={`content-${notifications.length}-${loading}`}
        sx={{ 
          flex: 1,
          animation: loading ? 'none' : 'slideUpFade 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '@keyframes slideUpFade': {
            '0%': {
              opacity: 0,
              transform: 'translateY(15px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}
      >
        {notifications.length === 0 ? (
          <Box sx={{ 
            py: 4, 
            px: 3, 
            textAlign: 'center',
            color: COLORS.text.secondary
          }}>
            <EmptyState />
          </Box>
        ) : (
          <Box 
            sx={{ 
              bgcolor: COLORS.background.paper,
              border: `1px solid ${COLORS.grey[200]}`,
              borderRadius: `${SIZES.borderRadius.large}px`,
              boxShadow: SIZES.shadow.card,
              overflow: 'hidden',
              flex: 1
            }}
          >
          <List sx={{ 
            py: 0,
            overflow: 'auto',
            overflowX: 'hidden',
            height: '100%'
          }}>
            {notifications.map((notification, index) => {
              const statusDisplay = getStatusDisplay(notification.status);
              
              return (
                <ListItem
                  key={`${notification.id}-${index}`}
                  sx={{
                    borderBottom: index !== notifications.length - 1 ? `1px solid ${COLORS.grey[100]}` : 'none',
                    transform: 'translateX(0) scale(1)',
                    opacity: 1,
                    transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    animation: `slideInNotification 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.18 + index * 0.06}s both`,
                    '@keyframes slideInNotification': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateX(-35px) scale(0.88) rotateY(-10deg)'
                      },
                      '50%': {
                        opacity: 0.7,
                        transform: 'translateX(4px) scale(1.03) rotateY(1deg)'
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateX(0) scale(1) rotateY(0deg)'
                      }
                    },
                    '&:hover': {
                      bgcolor: COLORS.hover.card,
                      transform: 'translateX(8px) scale(1.01)',
                      borderColor: COLORS.primary.light,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      '& .MuiListItemIcon-root': {
                        transform: 'scale(1.15)',
                      },
                    },
                    '&:active': {
                      transform: 'translateX(4px) scale(1.005)',
                      transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                    py: 1.5,
                    px: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 24,
                    transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                    alignSelf: 'center'
                  }}>
                    <Box sx={{
                      p: 0.5,
                      borderRadius: '50%',
                      bgcolor: statusDisplay.bgcolor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 20,
                      minHeight: 20
                    }}>
                      {statusDisplay.icon}
                    </Box>
                  </ListItemIcon>
                  
                  <Box sx={{ 
                    flex: 1, 
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: COLORS.text.primary,
                        flexShrink: 0
                      }}
                    >
                      {notification.id.slice(0, 8)}
                    </Typography>
                    
                    <Typography variant="caption" sx={{ 
                      color: COLORS.text.secondary, 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      flexShrink: 0
                    }}>
                      <AppsIcon sx={{ fontSize: 12 }} />
                      {formatDate(notification.initiatedTime)}
                    </Typography>
                    
                    {notification.completedTime && (
                      <Typography variant="caption" sx={{ 
                        color: COLORS.text.secondary, 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        flexShrink: 0
                      }}>
                        <CheckCircleIcon sx={{ fontSize: 12 }} />
                        {formatDate(notification.completedTime)}
                      </Typography>
                    )}
                    
                    {notification.status === 'FAILED' && (
                      <Typography variant="caption" sx={{ 
                        color: '#ef4444', 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontWeight: 500,
                        flexShrink: 0
                      }}>
                        <ErrorIcon sx={{ fontSize: 12 }} />
                        {(notification.totalCount || 0) - (notification.retryCount || 0)}/{notification.totalCount || 0}
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    minWidth: 'fit-content',
                    ml: 2
                  }}>
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
                    {notification.status === 'FAILED' && (
                      <IconButton
                        size="small"
                        onClick={() => handleRetry(notification)}
                        sx={{
                          p: 0.5,
                          color: COLORS.primary.main,
                          '&:hover': {
                            bgcolor: COLORS.primary.light + '20',
                            color: COLORS.primary.dark
                          }
                        }}
                        title="Retry notification"
                      >
                        <RetryIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </Box>
                </ListItem>
              );
            })}
          </List>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default NotifyPage;