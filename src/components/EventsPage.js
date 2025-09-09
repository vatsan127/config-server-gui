import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  Alert,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { apiService, setNotificationHandler } from '../services/api';
import { COLORS, SIZES } from '../theme/colors';
import { FileListSkeleton } from './common/SkeletonLoader';
import PageHeader from './common/PageHeader';

const EventsPage = () => {
  const { namespace } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCommits, setTotalCommits] = useState(0);

  // Set up notification handler
  const notificationRef = useRef();
  notificationRef.current = enqueueSnackbar;
  
  useEffect(() => {
    setNotificationHandler((message, options) => {
      notificationRef.current(message, options);
    });
  }, []);


  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getNamespaceEvents(namespace);
      setEvents(data.commits || []);
      setTotalCommits(data.totalCommits || 0);
    } catch (err) {
      console.error('Error fetching namespace events:', err);
      setError('Failed to load namespace events');
    } finally {
      setLoading(false);
    }
  }, [namespace]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Utility functions
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

  const getAuthorInitials = (author) => {
    return author.split(' ').map(name => name.charAt(0).toUpperCase()).join('').slice(0, 2);
  };

  const getAuthorColor = (author) => {
    let hash = 0;
    for (let i = 0; i < author.length; i++) {
      hash = author.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#1976d2', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return colors[Math.abs(hash) % colors.length];
  };

  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
  };

  const EmptyState = () => (
    <Box sx={{ textAlign: 'center' }}>
      <TimelineIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3, color: COLORS.text.secondary }} />
      <Typography variant="h6" sx={{ mb: 1, color: COLORS.text.primary, fontWeight: 500 }}>
        No events found
      </Typography>
      <Typography variant="body2" sx={{ color: COLORS.text.secondary, fontSize: '0.85rem' }}>
        No activity has been recorded for this namespace
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
      animation: 'fadeInUp 0.2s cubic-bezier(0.4, 0, 0.2, 1) 0.08s both',
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
        title={`${namespace} • Events`}
        subtitle={`${totalCommits} total commits`}
        icon={TimelineIcon}
        actions={[]}
      />

      {events.length === 0 ? (
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
            <List sx={{ 
              py: 0,
              overflow: 'auto',
              overflowX: 'hidden',
              height: '100%'
            }}>
              {events.map((event, index) => (
                <ListItem
                  key={event.commitId}
                  onClick={() => handleEventClick(event)}
                  sx={{
                    borderBottom: index !== events.length - 1 ? `1px solid ${COLORS.grey[100]}` : 'none',
                    transform: 'translateX(0) scale(1)',
                    opacity: 1,
                    transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    animation: `slideInEvent 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.2 + index * 0.08}s both`,
                    '@keyframes slideInEvent': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateX(-40px) scale(0.85) rotateZ(-3deg)'
                      },
                      '60%': {
                        opacity: 0.8,
                        transform: 'translateX(5px) scale(1.03) rotateZ(1deg)'
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
                    <Avatar 
                      sx={{ 
                        width: 32,
                        height: 32,
                        bgcolor: getAuthorColor(event.author),
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      {getAuthorInitials(event.author)}
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText 
                    primary={event.commitMessage}
                    secondary={`${event.author} • ${formatDate(event.date)} • ${event.commitId.slice(0, 8)}`}
                    primaryTypographyProps={{
                      sx: {
                        color: COLORS.text.primary,
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                        lineHeight: 1.4
                      }
                    }}
                    secondaryTypographyProps={{
                      sx: {
                        color: COLORS.text.secondary,
                        fontSize: '0.75rem',
                        fontWeight: 400,
                        mt: 0.25
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
      )}
    </Box>
  );
};

export default EventsPage;