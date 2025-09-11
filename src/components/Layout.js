import React, { useRef, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { 
  Search as SearchIcon,
  Clear as ClearIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { theme } from '../theme/theme';
import { COLORS, SIZES, BUTTON_STYLES } from '../theme/colors';
import { UI_CONSTANTS, DOM_IDS } from '../constants';
import ErrorBoundary from './common/ErrorBoundary';

const Layout = ({ children, onSearchChange, searchQuery, searchPlaceholder, onCreateNamespace, showCreateButton = false }) => {
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+K or Cmd+K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      // Escape to clear search and blur if focused on search  
      if (event.key === 'Escape') {
        if (document.activeElement === searchInputRef.current) {
          if (searchQuery) {
            // Clear search first
            onSearchChange?.('');
          } else {
            // If already empty, blur the input
            searchInputRef.current?.blur();
          }
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }

      // Forward slash to focus search (like GitHub)
      if (event.key === '/' && document.activeElement !== searchInputRef.current && 
          !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSearchChange, searchQuery]);

  // Handle search input keyboard events
  const handleSearchKeyDown = (event) => {
    switch (event.key) {
      // Escape is handled by document-level handler to avoid conflicts
      // case 'Escape': - removed to prevent double handling
      
      case 'Home':
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+Home - go to beginning and select all
          event.preventDefault();
          event.target.setSelectionRange(0, 0);
        }
        // Normal Home behavior is handled by browser
        break;
      
      case 'End':
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+End - go to end
          event.preventDefault();
          const length = event.target.value.length;
          event.target.setSelectionRange(length, length);
        }
        // Normal End behavior is handled by browser
        break;
      
      case 'a':
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+A - select all (browser handles this, but we can enhance)
          event.target.select();
        }
        break;
      
      case 'Backspace':
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+Backspace - delete word
          event.preventDefault();
          const input = event.target;
          const start = input.selectionStart;
          const value = input.value;
          
          // Find the start of the current word
          let wordStart = start - 1;
          while (wordStart > 0 && !/\s/.test(value[wordStart - 1])) {
            wordStart--;
          }
          
          const newValue = value.slice(0, wordStart) + value.slice(start);
          onSearchChange?.(newValue);
          
          // Set cursor position after update
          setTimeout(() => {
            input.setSelectionRange(wordStart, wordStart);
          }, 0);
        }
        break;
      
      case 'Delete':
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+Delete - delete word forward
          event.preventDefault();
          const input = event.target;
          const start = input.selectionStart;
          const value = input.value;
          
          // Find the end of the current word
          let wordEnd = start;
          while (wordEnd < value.length && !/\s/.test(value[wordEnd])) {
            wordEnd++;
          }
          // Skip whitespace
          while (wordEnd < value.length && /\s/.test(value[wordEnd])) {
            wordEnd++;
          }
          
          const newValue = value.slice(0, start) + value.slice(wordEnd);
          onSearchChange?.(newValue);
          
          setTimeout(() => {
            input.setSelectionRange(start, start);
          }, 0);
        }
        break;

      case 'ArrowLeft':
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+Left - move cursor to previous word
          event.preventDefault();
          const input = event.target;
          const start = input.selectionStart;
          const value = input.value;
          
          let newPos = start - 1;
          // Skip current word
          while (newPos > 0 && !/\s/.test(value[newPos])) {
            newPos--;
          }
          // Skip whitespace
          while (newPos > 0 && /\s/.test(value[newPos])) {
            newPos--;
          }
          // Go to start of previous word
          while (newPos > 0 && !/\s/.test(value[newPos - 1])) {
            newPos--;
          }
          
          if (event.shiftKey) {
            input.setSelectionRange(newPos, start);
          } else {
            input.setSelectionRange(newPos, newPos);
          }
        }
        break;

      case 'ArrowRight':
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+Right - move cursor to next word
          event.preventDefault();
          const input = event.target;
          const start = input.selectionStart;
          const value = input.value;
          
          let newPos = start;
          // Skip current word
          while (newPos < value.length && !/\s/.test(value[newPos])) {
            newPos++;
          }
          // Skip whitespace
          while (newPos < value.length && /\s/.test(value[newPos])) {
            newPos++;
          }
          
          if (event.shiftKey) {
            input.setSelectionRange(start, newPos);
          } else {
            input.setSelectionRange(newPos, newPos);
          }
        }
        break;
    }
  };

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
                inputRef={searchInputRef}
                id={DOM_IDS.GLOBAL_SEARCH}
                placeholder="Search"
                value={searchQuery || ''}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onKeyDown={handleSearchKeyDown}
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
                    transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
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
              {/* Documentation Button */}
              <Button 
                startIcon={<ArticleIcon sx={{ fontSize: 18 }} />}
                onClick={() => navigate('/docs')}
                sx={{ 
                  color: COLORS.text.white,
                  bgcolor: alpha(COLORS.text.white, 0.1),
                  px: 2,
                  py: 1,
                  fontSize: '0.8rem',
                  border: `1px solid ${alpha(COLORS.text.white, 0.3)}`,
                  borderRadius: `${SIZES.borderRadius.medium}px`,
                  transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: alpha(COLORS.text.white, 0.2),
                    borderColor: alpha(COLORS.text.white, 0.5),
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                Docs
              </Button>

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
                    transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
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