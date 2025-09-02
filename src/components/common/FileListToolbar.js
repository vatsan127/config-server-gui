import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Menu,
  MenuList,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Tooltip,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Schedule as ScheduleIcon,
  TextFields as TextFieldsIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { COLORS, SIZES, BUTTON_STYLES } from '../../theme/colors';

const FileListToolbar = ({
  searchQuery,
  onSearchChange,
  sortBy = 'name',
  sortOrder = 'asc',
  onSortChange,
  viewMode = 'list', // 'list' | 'grid'
  onViewModeChange,
  filters = [],
  onFiltersChange,
  totalFiles = 0,
  searchPlaceholder = "Search files and folders..."
}) => {
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const searchInputRef = useRef(null);

  const sortOptions = [
    { value: 'name', label: 'Name', icon: TextFieldsIcon },
    { value: 'modified', label: 'Modified', icon: ScheduleIcon },
    { value: 'type', label: 'Type', icon: FileIcon },
    { value: 'size', label: 'Size', icon: FolderOpenIcon },
  ];

  const filterOptions = [
    { value: 'folders', label: 'Folders Only', count: 0 },
    { value: 'files', label: 'Files Only', count: 0 },
    { value: 'yml', label: 'YAML Files', count: 0 },
    { value: 'json', label: 'JSON Files', count: 0 },
    { value: 'recent', label: 'Modified Today', count: 0 },
  ];

  const handleSortMenuClick = (event) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClick = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleSortSelect = (newSortBy) => {
    const newOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(newSortBy, newOrder);
    setSortMenuAnchor(null);
  };

  const handleFilterToggle = (filterValue) => {
    const newFilters = filters.includes(filterValue)
      ? filters.filter(f => f !== filterValue)
      : [...filters, filterValue];
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange([]);
    setFilterMenuAnchor(null);
  };

  const getSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    return option ? option.label : 'Name';
  };

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: 2,
      bgcolor: COLORS.background.paper,
      borderRadius: `${SIZES.borderRadius.large}px`,
      border: `1px solid ${COLORS.grey[200]}`,
      boxShadow: SIZES.shadow.card,
      mb: 2,
      flexWrap: 'wrap'
    }}>
      {/* Search */}
      <TextField
        ref={searchInputRef}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        size="small"
        sx={{
          minWidth: 250,
          flex: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: `${SIZES.borderRadius.medium}px`,
            bgcolor: COLORS.grey[25],
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: COLORS.background.paper,
              '& fieldset': {
                borderColor: COLORS.grey[300],
              }
            },
            '&.Mui-focused': {
              bgcolor: COLORS.background.paper,
              '& fieldset': {
                borderColor: COLORS.primary.main,
                borderWidth: 2,
              }
            }
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: COLORS.text.muted, fontSize: 18 }} />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
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

      {/* Results Count */}
      {(searchQuery || filters.length > 0) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`${totalFiles} results`}
            size="small"
            sx={{
              bgcolor: alpha(COLORS.primary.main, 0.1),
              color: COLORS.primary.main,
              fontWeight: 600,
              border: `1px solid ${alpha(COLORS.primary.main, 0.3)}`
            }}
          />
        </Box>
      )}

      {/* Sort Button */}
      <Tooltip title={`Sort by ${getSortLabel()} (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`}>
        <Button
          onClick={handleSortMenuClick}
          startIcon={<SortIcon />}
          endIcon={sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
          size="small"
          sx={{
            ...BUTTON_STYLES.secondary,
            minWidth: 120,
            px: 2,
            '& .MuiButton-endIcon': {
              fontSize: 16,
              color: COLORS.primary.main
            }
          }}
        >
          {getSortLabel()}
        </Button>
      </Tooltip>

      {/* Filter Button */}
      <Tooltip title="Filters">
        <Button
          onClick={handleFilterMenuClick}
          startIcon={<FilterIcon />}
          size="small"
          sx={{
            ...BUTTON_STYLES.secondary,
            minWidth: 80,
            px: 2,
            position: 'relative',
            ...(filters.length > 0 && {
              bgcolor: alpha(COLORS.primary.main, 0.1),
              color: COLORS.primary.main,
              borderColor: COLORS.primary.main,
            })
          }}
        >
          Filters
          {filters.length > 0 && (
            <Chip
              label={filters.length}
              size="small"
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                minWidth: 20,
                height: 20,
                bgcolor: COLORS.primary.main,
                color: 'white',
                fontSize: '0.65rem',
                '& .MuiChip-label': {
                  px: 0.5,
                }
              }}
            />
          )}
        </Button>
      </Tooltip>

      {/* View Mode Toggle */}
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={(e, newMode) => newMode && onViewModeChange(newMode)}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            border: `1px solid ${COLORS.grey[300]}`,
            borderRadius: `${SIZES.borderRadius.small}px`,
            px: 1.5,
            color: COLORS.text.secondary,
            '&.Mui-selected': {
              bgcolor: COLORS.primary.main,
              color: COLORS.text.white,
              '&:hover': {
                bgcolor: COLORS.primary.dark,
              }
            },
            '&:hover': {
              bgcolor: COLORS.grey[50],
            }
          }
        }}
      >
        <ToggleButton value="list" aria-label="list view">
          <ViewListIcon fontSize="small" />
        </ToggleButton>
        <ToggleButton value="grid" aria-label="grid view">
          <ViewModuleIcon fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => setSortMenuAnchor(null)}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: `${SIZES.borderRadius.medium}px`,
            boxShadow: SIZES.shadow.elevated,
            border: `1px solid ${COLORS.grey[200]}`,
            minWidth: 180,
          }
        }}
      >
        <MenuList dense>
          {sortOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = sortBy === option.value;
            
            return (
              <MenuItem
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
                selected={isSelected}
                sx={{
                  py: 1,
                  '&.Mui-selected': {
                    bgcolor: alpha(COLORS.primary.main, 0.1),
                    color: COLORS.primary.main,
                  }
                }}
              >
                <ListItemIcon>
                  <IconComponent 
                    fontSize="small" 
                    sx={{ color: isSelected ? COLORS.primary.main : COLORS.text.secondary }}
                  />
                </ListItemIcon>
                <ListItemText primary={option.label} />
                {isSelected && (
                  <Box sx={{ ml: 1 }}>
                    {sortOrder === 'asc' ? 
                      <ArrowUpwardIcon fontSize="small" sx={{ color: COLORS.primary.main }} /> :
                      <ArrowDownwardIcon fontSize="small" sx={{ color: COLORS.primary.main }} />
                    }
                  </Box>
                )}
              </MenuItem>
            );
          })}
        </MenuList>
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: `${SIZES.borderRadius.medium}px`,
            boxShadow: SIZES.shadow.elevated,
            border: `1px solid ${COLORS.grey[200]}`,
            minWidth: 200,
          }
        }}
      >
        <MenuList dense>
          {filterOptions.map((option) => {
            const isSelected = filters.includes(option.value);
            
            return (
              <MenuItem
                key={option.value}
                onClick={() => handleFilterToggle(option.value)}
                sx={{
                  py: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  ...(isSelected && {
                    bgcolor: alpha(COLORS.primary.main, 0.1),
                    color: COLORS.primary.main,
                  })
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 2,
                      border: `2px solid ${isSelected ? COLORS.primary.main : COLORS.grey[400]}`,
                      bgcolor: isSelected ? COLORS.primary.main : 'transparent',
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && (
                      <Box sx={{ 
                        width: 6, 
                        height: 6, 
                        bgcolor: 'white', 
                        borderRadius: '50%' 
                      }} />
                    )}
                  </Box>
                  {option.label}
                </Box>
                {option.count > 0 && (
                  <Chip
                    label={option.count}
                    size="small"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                )}
              </MenuItem>
            );
          })}
          
          {filters.length > 0 && (
            <>
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={clearFilters}>
                <ListItemText 
                  primary="Clear All Filters" 
                  primaryTypographyProps={{
                    color: COLORS.text.secondary,
                    fontSize: '0.85rem'
                  }}
                />
              </MenuItem>
            </>
          )}
        </MenuList>
      </Menu>

      {/* Active Filters */}
      {filters.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1, 
          width: '100%',
          mt: 1,
          pt: 1,
          borderTop: `1px solid ${COLORS.grey[200]}`
        }}>
          {filters.map((filter) => {
            const option = filterOptions.find(opt => opt.value === filter);
            return (
              <Chip
                key={filter}
                label={option?.label || filter}
                size="small"
                onDelete={() => handleFilterToggle(filter)}
                sx={{
                  bgcolor: alpha(COLORS.primary.main, 0.1),
                  color: COLORS.primary.main,
                  border: `1px solid ${alpha(COLORS.primary.main, 0.3)}`,
                  '& .MuiChip-deleteIcon': {
                    color: COLORS.primary.main,
                    '&:hover': {
                      color: COLORS.primary.dark,
                    }
                  }
                }}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default FileListToolbar;