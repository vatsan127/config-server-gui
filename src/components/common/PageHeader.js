import React from 'react';
import {
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { COLORS, SIZES } from '../../theme/colors';

const PageHeader = ({
  title,
  subtitle,
  icon: IconComponent,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search',
  actions = [],
  showDivider = true
}) => {
  return (
    <Box 
      sx={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
        animation: 'slideInFromTop 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both',
        '@keyframes slideInFromTop': {
          '0%': {
            opacity: 0,
            transform: 'translateY(-15px)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        },
        mb: 0.5
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 0.5,
        width: '100%',
        minWidth: 0,
        gap: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flex: 1,
          minWidth: 0
        }}>
          {IconComponent && (
            <IconComponent sx={{ 
              color: COLORS.primary.main, 
              fontSize: 24,
              flexShrink: 0,
              mr: 1
            }} />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" sx={{
              color: COLORS.text.primary,
              fontWeight: 700,
              fontSize: '1.5rem',
              textDecoration: 'none',
              cursor: 'default',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ 
                color: COLORS.text.secondary,
                mt: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          alignItems: 'center',
          flexShrink: 0,
          minWidth: 'min-content',
          animation: 'fadeInScale 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.25s both',
          '@keyframes fadeInScale': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.98)'
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1)'
            }
          }
        }}>
          {onSearchChange && (
            <TextField
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              size="small"
              sx={{ 
                width: 200,
                minWidth: 150,
                maxWidth: 250,
                flexShrink: 1,
                transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '& .MuiOutlinedInput-root': {
                  borderRadius: `${SIZES.borderRadius.medium}px`,
                  bgcolor: COLORS.background.paper,
                  transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '& fieldset': {
                    transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  },
                  '&:hover fieldset': {
                    borderColor: COLORS.grey[400],
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: COLORS.primary.main,
                    borderWidth: 2,
                    boxShadow: `0 0 0 3px ${COLORS.primary.main}20`,
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: COLORS.text.muted, fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: searchValue && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => onSearchChange('')}
                      size="small"
                      sx={{ 
                        color: COLORS.text.muted,
                        p: 0.5,
                        '&:hover': {
                          color: COLORS.text.primary,
                          bgcolor: COLORS.grey[100]
                        }
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
          
          {actions.map((action, index) => (
            <Box
              key={index}
              sx={{
                transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                flexShrink: 0,
                padding: '4px 0',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {React.isValidElement(action) ? action : (
                <Button
                  variant={action.variant || 'contained'}
                  startIcon={action.icon}
                  onClick={action.onClick}
                  sx={action.sx}
                >
                  {action.label}
                </Button>
              )}
            </Box>
          ))}
        </Box>
      </Box>
      
      {showDivider && (
        <Divider sx={{ 
          mt: 1.5,
          mb: 1.5,
          borderColor: COLORS.grey[300],
          opacity: 0.6
        }} />
      )}
    </Box>
  );
};

export default PageHeader;