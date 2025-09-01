import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Folder as FolderIcon,
  ArrowBack as ArrowBackIcon
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
      <Box sx={{ 
        px: SIZES.spacing.sm, 
        py: SIZES.spacing.xs, 
        borderBottom: `1px solid rgba(255, 255, 255, 0.2)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            color: COLORS.text.white,
            fontWeight: 700,
            fontSize: '1.2rem',
            letterSpacing: '0.5px',
            margin: 0
          }}
        >
          Explorer
        </Typography>
      </Box>

      <List sx={{ py: 0, flex: 1 }}>
        <ListItem
          button
          onClick={handleHomeClick}
          sx={{
            py: 1.5,
            px: SIZES.spacing.xs,
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
            bgcolor: (isFilesActive || isFileViewActive) ? 'rgba(99, 102, 241, 0.2)' : 'transparent'
          }}
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            <FolderIcon 
              sx={{ 
                color: (isFilesActive || isFileViewActive) ? COLORS.primary.light : COLORS.text.white,
                fontSize: '1rem'
              }} 
            />
          </ListItemIcon>
          <ListItemText 
            primary="Files"
            primaryTypographyProps={{
              sx: {
                color: COLORS.text.white,
                fontWeight: (isFilesActive || isFileViewActive) ? 600 : 400,
                fontSize: '0.8rem'
              }
            }}
          />
        </ListItem>

        <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', my: 1 }} />

        <ListItem
          button
          onClick={handleBackToDashboard}
          sx={{
            py: 1.5,
            px: SIZES.spacing.xs,
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            <ArrowBackIcon 
              sx={{ 
                color: COLORS.text.white,
                fontSize: '1rem',
                opacity: 0.8
              }} 
            />
          </ListItemIcon>
          <ListItemText 
            primary="Dashboard"
            primaryTypographyProps={{
              sx: {
                color: COLORS.text.white,
                fontWeight: 400,
                fontSize: '0.8rem',
                opacity: 0.8
              }
            }}
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default FilesSidebar;