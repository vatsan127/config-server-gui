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
  ListItemText
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Apps as AppsIcon,
  Refresh as RefreshIcon
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
      case 'inprogress':
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

  const EmptyState = () => (
    <Box sx={{ textAlign: 'center' }}>
      <NotificationsIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3, color: COLORS.text.secondary }} />
      <Typography variant="h6" sx={{ mb: 1, color: COLORS.text.primary, fontWeight: 500 }}>
        No notifications found
      </Typography>
      <Typography variant="body2" sx={{ color: COLORS.text.secondary, fontSize: '0.85rem' }}>
        No client app notifications have been recorded for this namespace
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
      overflow: 'hidden',
      animation: 'fadeInUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.15s both',
      '@keyframes fadeInUp': {
        '0%': {
          opacity: 0,
          transform: 'translateY(20px)'
        },
        '100%': {
          opacity: 1,
          transform: 'translateY(0)'
        }
      }
    }}>
      <PageHeader
        title={`${namespace} • Notifications`}
        subtitle={`${totalNotifications} notifications (max: ${maxNotifications})`}
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
            overflow: 'auto',
            flex: 1,
            transform: 'translateY(0) scale(1)',
            opacity: 1,
            transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            animation: 'slideUpFade 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s both',
            '@keyframes slideUpFade': {
              '0%': {
                opacity: 0,
                transform: 'translateY(30px) scale(0.98)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0) scale(1)'
              }
            }
          }}
        >
          <List sx={{ py: 0 }}>
            {notifications.map((notification, index) => {
              const statusDisplay = getStatusDisplay(notification.status);
              
              return (
                <ListItem
                  key={`${notification.appName}-${notification.triggeredAt}-${index}`}
                  sx={{
                    borderBottom: index !== notifications.length - 1 ? `1px solid ${COLORS.grey[100]}` : 'none',
                    transform: 'translateX(0) scale(1)',
                    opacity: 1,
                    transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    animation: `fadeScaleIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.4 + index * 0.03}s both`,
                    '@keyframes fadeScaleIn': {
                      '0%': {
                        opacity: 0,
                        transform: 'scale(0.95)'
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'scale(1)'
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
                    cursor: 'pointer'
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 40,
                    transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    <Box sx={{
                      p: 1,
                      borderRadius: '50%',
                      bgcolor: statusDisplay.bgcolor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {statusDisplay.icon}
                    </Box>
                  </ListItemIcon>
                  
                  <ListItemText 
                    primary={`${notification.operation.toUpperCase()} - ${notification.appName}`}
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: COLORS.text.secondary, display: 'block' }}>
                          {formatDate(notification.triggeredAt)} • Retry: {notification.retryCount}
                        </Typography>
                        {notification.errorMessage && (
                          <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mt: 0.25 }}>
                            {notification.errorMessage}
                          </Typography>
                        )}
                        {notification.commitId && (
                          <Chip
                            label={notification.commitId.slice(0, 8)}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              bgcolor: COLORS.grey[100],
                              color: COLORS.text.secondary,
                              fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
                              mt: 0.5
                            }}
                          />
                        )}
                      </Box>
                    }
                    primaryTypographyProps={{
                      sx: {
                        color: COLORS.text.primary,
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                        lineHeight: 1.4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }
                    }}
                  />
                  
                  <Box sx={{ ml: 2 }}>
                    <Chip
                      label={statusDisplay.label}
                      size="small"
                      sx={{
                        bgcolor: statusDisplay.bgcolor,
                        color: statusDisplay.color,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 24
                      }}
                    />
                  </Box>
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default NotifyPage;