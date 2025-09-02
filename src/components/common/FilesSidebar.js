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
  Dashboard as DashboardIcon
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

  const isFilesActive = location.pathname.includes('/files');
  const isFileViewActive = location.pathname.includes('/file');

  return (
    <Box
      sx={{
        width: SIZES.sidebar.width,
        height: '100vh',
        bgcolor: alpha(COLORS.background.sidebar, 0.95),
        backdropFilter: 'blur(20px)',
        borderRight: `1px solid ${alpha(COLORS.grey[300], 0.3)}`,
        boxShadow: SIZES.shadow.lg,
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
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: '#4ade80',
          mr: 1.5,
          boxShadow: `0 0 8px ${alpha('#4ade80', 0.4)}`
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
          Configuration
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
              bgcolor: alpha('#6366f1', 0.12),
              transform: 'translateX(2px)',
              '& .MuiListItemIcon-root': {
                color: '#6366f1'
              },
              '& .MuiListItemText-primary': {
                color: '#e2e8f0'
              },
              '&::before': {
                transform: 'scaleY(1)'
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
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
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
              bgcolor: (isFilesActive || isFileViewActive) ? alpha('#10b981', 0.2) : alpha('#10b981', 0.08),
              transform: 'translateX(2px)',
              '& .MuiListItemIcon-root': {
                color: '#10b981'
              },
              '& .MuiListItemText-primary': {
                color: '#e2e8f0'
              },
              '&::before': {
                transform: 'scaleY(1)'
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
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
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
            primary={`${namespace || 'Files'}`}
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
      </List>
    </Box>
  );
};

export default FilesSidebar;