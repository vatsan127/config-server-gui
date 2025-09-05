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
  IconButton,
  alpha,
} from '@mui/material';
import { 
  Search as SearchIcon,
  Clear as ClearIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { theme } from '../theme/theme';
import { COLORS, SIZES, BUTTON_STYLES } from '../theme/colors';
import { UI_CONSTANTS, DOM_IDS } from '../constants';
import ErrorBoundary from './common/ErrorBoundary';

const Layout = ({ children, onSearchChange, searchQuery, searchPlaceholder, onCreateNamespace, showCreateButton = false }) => {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}>
        {/* Navbar */}
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{ 
            bgcolor: alpha(COLORS.background.sidebar, 0.95),
            backdropFilter: 'blur(20px)',
            boxShadow: 'none',
            borderBottom: `1px solid ${alpha(COLORS.grey[300], 0.5)}`,
            position: 'sticky',
            top: 0,
            zIndex: 1100
          }}
        >
          <Toolbar sx={{ px: 2, py: 2, minHeight: '56px !important', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left side - Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <DashboardIcon sx={{ 
                color: COLORS.text.white,
                fontSize: 24
              }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: COLORS.text.white,
                fontSize: '1.1rem',
                letterSpacing: '-0.01em'
              }}>
                Dashboard
              </Typography>
            </Box>

            {/* Center - Search Bar */}
            <Box sx={{ 
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              mx: 3
            }}>
              <TextField
                id={DOM_IDS.GLOBAL_SEARCH}
                placeholder="Search"
                value={searchQuery || ''}
                onChange={(e) => onSearchChange?.(e.target.value)}
                sx={{ maxWidth: '400px', minWidth: '300px' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: COLORS.text.muted, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => onSearchChange?.('')}
                        size="small"
                        sx={{ 
                          color: COLORS.text.muted,
                          p: 0.5,
                          '&:hover': {
                            color: COLORS.text.primary,
                            bgcolor: alpha(COLORS.background.paper, 0.8)
                          }
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: `${SIZES.borderRadius.medium}px`,
                    bgcolor: alpha(COLORS.background.paper, 0.9),
                    height: 40,
                    border: `1px solid ${alpha(COLORS.grey[300], 0.5)}`,
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover': {
                      bgcolor: COLORS.background.paper,
                      borderColor: COLORS.grey[400],
                      transform: 'scale(1.01)',
                    },
                    '&.Mui-focused': {
                      bgcolor: COLORS.background.paper,
                      borderColor: COLORS.primary.main,
                      borderWidth: 2,
                      transform: 'scale(1.01)',
                      boxShadow: `0 0 0 4px ${alpha(COLORS.primary.main, 0.1)}`,
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    fontWeight: 400,
                  }
                }}
              />
            </Box>

            {/* Right side - Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Create Namespace Button */}
              {showCreateButton && (
                <Button 
                  startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                  onClick={onCreateNamespace}
                  sx={{ 
                    color: COLORS.text.white,
                    bgcolor: alpha(COLORS.text.white, 0.1),
                    px: 2,
                    py: 1,
                    fontSize: '0.8rem',
                    border: `1px solid ${alpha(COLORS.text.white, 0.3)}`,
                    borderRadius: `${SIZES.borderRadius.medium}px`,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: alpha(COLORS.text.white, 0.2),
                      borderColor: alpha(COLORS.text.white, 0.5),
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  Create
                </Button>
              )}
              
              {/* Logout Button */}
              <Button 
                startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
                onClick={() => {
                  // TODO: Implement logout functionality when backend supports it
                  console.log('Logout clicked - functionality to be implemented');
                }}
                sx={{ 
                  color: COLORS.text.white,
                  bgcolor: alpha(COLORS.text.white, 0.1),
                  px: 2,
                  py: 1,
                  fontSize: '0.8rem',
                  border: `1px solid ${alpha(COLORS.text.white, 0.3)}`,
                  borderRadius: `${SIZES.borderRadius.medium}px`,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: alpha(COLORS.text.white, 0.2),
                    borderColor: alpha(COLORS.text.white, 0.5),
                    transform: 'translateY(-1px)',
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
            height: 'calc(100vh - 56px)',
            overflow: 'auto',
            position: 'relative'
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