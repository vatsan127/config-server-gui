import React from 'react';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Search as SearchIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { theme } from '../theme/theme';
import { COLORS, SIZES } from '../theme/colors';
import { UI_CONSTANTS } from '../constants';
import ErrorBoundary from './common/ErrorBoundary';


const Layout = ({ children, onSearchChange, searchQuery, onSearchFocus }) => {
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      onSearchFocus?.();
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}>
        {/* Navbar */}
        <AppBar 
          position="static" 
          sx={{ 
            bgcolor: COLORS.background.sidebar,
            boxShadow: 'none',
            borderBottom: `1px solid ${COLORS.grey[300]}`,
          }}
        >
          <Toolbar sx={{ px: 3, py: 1 }}>
            {/* Left side - Logo and Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
              <Box sx={{
                width: 36,
                height: 36,
                bgcolor: COLORS.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <SettingsIcon sx={{ color: COLORS.text.white, fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: COLORS.text.white,
                fontSize: '1.25rem'
              }}>
                Configuration
              </Typography>
            </Box>

            {/* Center - Search Bar */}
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mx: 4 }}>
              <TextField
                id="global-search"
                placeholder={UI_CONSTANTS.SEARCH.PLACEHOLDER}
                value={searchQuery || ''}
                onChange={(e) => onSearchChange?.(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: COLORS.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  maxWidth: 400,
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    bgcolor: COLORS.background.paper,
                    height: 40,
                    '& fieldset': {
                      borderColor: COLORS.grey[300],
                    },
                    '&:hover fieldset': {
                      borderColor: COLORS.grey[400],
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: COLORS.primary.main,
                      borderWidth: 2
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '8px 12px',
                    fontSize: '0.875rem'
                  }
                }}
              />
            </Box>

            {/* Right side - Logout Button */}
            <Box>
              <Button 
                startIcon={<LogoutIcon />}
                onClick={() => {
                  // TODO: Implement logout functionality when backend supports it
                  console.log('Logout clicked - functionality to be implemented');
                }}
                sx={{ 
                  color: COLORS.text.white,
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  '&:hover': {
                    bgcolor: COLORS.hover.sidebar,
                    color: COLORS.text.white
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: 'calc(100vh - 64px)',
            position: 'relative',
            overflow: 'auto'
          }}
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;