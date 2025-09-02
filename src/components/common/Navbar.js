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
  AppBar
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
        color: COLORS.text.primary
      }}
    >
      <Toolbar sx={{ px: SIZES.spacing.xs, minHeight: '64px !important' }}>
        {/* Dashboard Button */}
        <Button
          startIcon={<DashboardIcon />}
          onClick={handleDashboardClick}
          sx={{
            ...BUTTON_STYLES.ghost,
            mr: 2,
            minWidth: 'auto',
            px: 2,
            py: 1,
            fontSize: '0.875rem'
          }}
        >
          Dashboard
        </Button>

        {/* Namespace Display */}
        {namespace && (
          <Typography 
            variant="h6" 
            sx={{ 
              color: COLORS.text.primary,
              fontWeight: 600,
              mr: 2,
              fontSize: '1.1rem'
            }}
          >
            {namespace}
          </Typography>
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
              minWidth: 250,
              mr: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: `${SIZES.borderRadius.medium}px`,
                bgcolor: COLORS.background.paper,
                '&:hover fieldset': {
                  borderColor: COLORS.grey[400],
                },
                '&.Mui-focused fieldset': {
                  borderColor: COLORS.primary.main,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: COLORS.text.muted }} />
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
                      '&:hover': {
                        color: COLORS.text.primary,
                        bgcolor: COLORS.grey[100]
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