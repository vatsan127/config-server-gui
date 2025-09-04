import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Toolbar,
  AppBar,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { COLORS, SIZES, BUTTON_STYLES } from '../../theme/colors';
import CreateFileButton from './CreateFileButton';

const Navbar = ({ 
  searchQuery, 
  onSearchChange, 
  searchInputRef, 
  showSearch = true, 
  showCreateConfig = true,
  onCreateConfigFile,
  currentPath 
}) => {
  const navigate = useNavigate();
  const { namespace } = useParams();

  const handleDashboardClick = () => {
    navigate('/');
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        bgcolor: COLORS.background.paper,
        borderBottom: `1px solid ${COLORS.grey[200]}`,
        color: COLORS.text.primary,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 1px 0 rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
        animation: 'navbarSlideIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        '@keyframes navbarSlideIn': {
          '0%': {
            opacity: 0,
            transform: 'translateY(-20px)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${COLORS.primary.main}, ${COLORS.accent.blue}, ${COLORS.accent.purple})`,
          opacity: 0.6,
          animation: 'gradientShift 3s ease-in-out infinite',
          '@keyframes gradientShift': {
            '0%, 100%': {
              opacity: 0.6,
              transform: 'scaleX(1)'
            },
            '50%': {
              opacity: 0.8,
              transform: 'scaleX(1.02)'
            }
          }
        }
      }}
    >
      <Toolbar sx={{ px: SIZES.spacing.xs, minHeight: '64px !important' }}>
        {/* Dashboard Button */}
        <Button
          startIcon={<DashboardIcon sx={{ 
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fontSize: 20
          }} />}
          onClick={handleDashboardClick}
          sx={{
            ...BUTTON_STYLES.ghost,
            mr: 2,
            minWidth: 'auto',
            px: 2.5,
            py: 1.25,
            fontSize: '0.875rem',
            fontWeight: 600,
            borderRadius: `${SIZES.borderRadius.large}px`,
            border: '1px solid transparent',
            position: 'relative',
            overflow: 'hidden',
            animation: 'dashboardButtonSlide 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s both',
            '@keyframes dashboardButtonSlide': {
              '0%': {
                opacity: 0,
                transform: 'translateX(-20px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateX(0)'
              }
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(45deg, ${COLORS.primary.main}20, ${COLORS.accent.blue}20)`,
              opacity: 0,
              transition: 'opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            },
            '&:hover': {
              bgcolor: alpha(COLORS.primary.main, 0.08),
              borderColor: COLORS.primary.main,
              color: COLORS.primary.main,
              transform: 'translateY(-2px) scale(1.02)',
              boxShadow: `0 4px 12px rgba(59, 130, 246, 0.2)`,
              '&::before': {
                opacity: 1
              },
              '& .MuiSvgIcon-root': {
                transform: 'rotate(360deg) scale(1.1)',
                filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))'
              }
            },
            '&:active': {
              transform: 'translateY(-1px) scale(1.01)',
              transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)'
            }
          }}
        >
          Dashboard
        </Button>

        {/* Namespace Display */}
        {namespace && (
          <Box
            sx={{
              mr: 2,
              animation: 'namespaceSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both',
              '@keyframes namespaceSlideIn': {
                '0%': {
                  opacity: 0,
                  transform: 'translateX(-15px) scale(0.95)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateX(0) scale(1)'
                }
              }
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: COLORS.text.primary,
                fontWeight: 700,
                fontSize: '1.1rem',
                position: 'relative',
                px: 2,
                py: 0.5,
                borderRadius: `${SIZES.borderRadius.medium}px`,
                bgcolor: alpha(COLORS.primary.main, 0.05),
                border: `1px solid ${alpha(COLORS.primary.main, 0.15)}`,
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: '60%',
                  bgcolor: COLORS.primary.main,
                  borderRadius: '0 2px 2px 0',
                },
                '&:hover': {
                  bgcolor: alpha(COLORS.primary.main, 0.1),
                  borderColor: alpha(COLORS.primary.main, 0.3),
                  transform: 'scale(1.02)',
                  boxShadow: `0 2px 8px rgba(59, 130, 246, 0.15)`
                }
              }}
            >
              {namespace}
            </Typography>
          </Box>
        )}

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Search Bar */}
        {showSearch && (
          <TextField
            inputRef={searchInputRef}
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search files and folders..."
            size="small"
            sx={{ 
              minWidth: 280,
              mr: 2,
              animation: 'searchBarSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s both',
              '@keyframes searchBarSlideIn': {
                '0%': {
                  opacity: 0,
                  transform: 'translateX(20px) scale(0.95)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateX(0) scale(1)'
                }
              },
              '& .MuiOutlinedInput-root': {
                borderRadius: `${SIZES.borderRadius.large}px`,
                bgcolor: alpha(COLORS.grey[50], 0.5),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(COLORS.grey[300], 0.5)}`,
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '& fieldset': {
                  border: 'none'
                },
                '&:hover': {
                  bgcolor: alpha(COLORS.grey[50], 0.8),
                  borderColor: alpha(COLORS.primary.main, 0.3),
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(59, 130, 246, 0.1)`
                },
                '&.Mui-focused': {
                  bgcolor: alpha(COLORS.background.paper, 0.9),
                  borderColor: COLORS.primary.main,
                  transform: 'translateY(-2px) scale(1.02)',
                  boxShadow: `0 8px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(59, 130, 246, 0.2)`
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ 
                    color: COLORS.text.muted,
                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    fontSize: 20
                  }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => onSearchChange && onSearchChange('')}
                    sx={{ 
                      color: COLORS.text.muted,
                      p: 0.5,
                      borderRadius: `${SIZES.borderRadius.medium}px`,
                      transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      '&:hover': {
                        color: COLORS.text.white,
                        bgcolor: COLORS.error.main,
                        transform: 'scale(1.1) rotate(90deg)',
                        boxShadow: `0 2px 8px rgba(239, 68, 68, 0.3)`
                      },
                      '&:active': {
                        transform: 'scale(0.95) rotate(90deg)',
                        transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)'
                      }
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        )}

        {/* Create Config Button */}
        {showCreateConfig && (
          <CreateFileButton 
            onCreateConfigFile={onCreateConfigFile}
            currentPath={currentPath}
          />
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;