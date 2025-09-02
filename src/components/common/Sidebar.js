import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Collapse,
  Button,
  alpha,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  Code as CodeIcon,
  MenuOpen as MenuOpenIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { COLORS, SIZES, BUTTON_STYLES } from '../../theme/colors';

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 72;

const Sidebar = ({ 
  namespaces = [], 
  currentNamespace = null,
  onCreateNamespace,
  loading = false,
  onToggle,
  collapsed = false 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [namespacesExpanded, setNamespacesExpanded] = useState(true);

  // Filter namespaces based on search
  const filteredNamespaces = useMemo(() => {
    if (!searchQuery.trim()) return namespaces;
    return namespaces.filter(namespace =>
      namespace.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [namespaces, searchQuery]);

  // Get environment type for namespace
  const getEnvironmentType = useCallback((namespace) => {
    const lower = namespace.toLowerCase();
    if (lower.includes('prod')) return { label: 'PROD', color: COLORS.error.border };
    if (lower.includes('staging') || lower.includes('stage')) return { label: 'STAGE', color: COLORS.warning.border };
    if (lower.includes('dev') || lower.includes('development')) return { label: 'DEV', color: COLORS.accent.blue };
    if (lower.includes('test')) return { label: 'TEST', color: COLORS.accent.purple };
    return { label: 'OTHER', color: COLORS.grey[500] };
  }, []);

  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const isCurrentPath = useCallback((path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  }, [location.pathname]);

  const SidebarContent = () => (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: COLORS.background.paper,
      borderRight: `1px solid ${COLORS.grey[200]}`,
    }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        borderBottom: `1px solid ${COLORS.grey[200]}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 64,
      }}>
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 32,
              height: 32,
              borderRadius: `${SIZES.borderRadius.medium}px`,
              background: `linear-gradient(135deg, ${COLORS.primary.main}, ${COLORS.primary.dark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <StorageIcon sx={{ color: COLORS.text.white, fontSize: 18 }} />
            </Box>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              color: COLORS.text.primary,
              letterSpacing: '-0.01em'
            }}>
              Config Manager
            </Typography>
          </Box>
        )}
        
        <IconButton 
          onClick={onToggle}
          size="small"
          sx={{
            color: COLORS.text.secondary,
            '&:hover': {
              bgcolor: COLORS.grey[100],
              color: COLORS.text.primary,
            }
          }}
        >
          {collapsed ? <MenuIcon fontSize="small" /> : <MenuOpenIcon fontSize="small" />}
        </IconButton>
      </Box>

      {/* Main Navigation */}
      <List sx={{ pt: 2, px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleNavigation('/')}
            selected={isCurrentPath('/') && location.pathname === '/'}
            sx={{
              borderRadius: `${SIZES.borderRadius.medium}px`,
              mb: 0.5,
              mx: 1,
              '&.Mui-selected': {
                bgcolor: alpha(COLORS.primary.main, 0.1),
                color: COLORS.primary.main,
                '&:hover': {
                  bgcolor: alpha(COLORS.primary.main, 0.15),
                }
              },
              '&:hover': {
                bgcolor: COLORS.grey[50],
              }
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 40,
              color: isCurrentPath('/') && location.pathname === '/' ? COLORS.primary.main : COLORS.text.secondary
            }}>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText 
                primary="Dashboard" 
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: isCurrentPath('/') && location.pathname === '/' ? 600 : 400
                }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ mx: 2, my: 1 }} />

      {/* Namespaces Section */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1 }}>
          {/* Section Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            {!collapsed && (
              <Typography variant="subtitle2" sx={{
                color: COLORS.text.secondary,
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Namespaces ({namespaces.length})
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Create Namespace" placement="right">
                <IconButton
                  size="small"
                  onClick={onCreateNamespace}
                  sx={{
                    color: COLORS.text.secondary,
                    '&:hover': {
                      bgcolor: COLORS.primary.main,
                      color: COLORS.text.white,
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              {!collapsed && (
                <IconButton
                  size="small"
                  onClick={() => setNamespacesExpanded(!namespacesExpanded)}
                  sx={{
                    color: COLORS.text.secondary,
                    '&:hover': {
                      bgcolor: COLORS.grey[100],
                      color: COLORS.text.primary,
                    }
                  }}
                >
                  {namespacesExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Search - Only show when not collapsed and expanded */}
          {!collapsed && namespacesExpanded && (
            <TextField
              size="small"
              placeholder="Search namespaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: `${SIZES.borderRadius.medium}px`,
                  bgcolor: COLORS.grey[25],
                  '&:hover fieldset': {
                    borderColor: COLORS.grey[300],
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: COLORS.primary.main,
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: COLORS.text.muted, fontSize: 16 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      sx={{ p: 0.5 }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        </Box>

        {/* Namespaces List */}
        <Collapse in={namespacesExpanded || collapsed}>
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto',
            px: 1,
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: COLORS.grey[300],
              borderRadius: 3,
              '&:hover': {
                background: COLORS.grey[400],
              }
            }
          }}>
            <List sx={{ py: 0 }}>
              {filteredNamespaces.map((namespace) => {
                const isSelected = currentNamespace === namespace;
                const envType = getEnvironmentType(namespace);
                
                return (
                  <ListItem key={namespace} disablePadding sx={{ mb: 0.5 }}>
                    <Tooltip 
                      title={collapsed ? namespace : ''} 
                      placement="right"
                      disableHoverListener={!collapsed}
                    >
                      <ListItemButton
                        onClick={() => handleNavigation(`/namespace/${namespace}/files`)}
                        selected={isSelected}
                        sx={{
                          borderRadius: `${SIZES.borderRadius.medium}px`,
                          mx: 1,
                          py: 1.5,
                          '&.Mui-selected': {
                            bgcolor: alpha(COLORS.primary.main, 0.1),
                            borderLeft: `3px solid ${COLORS.primary.main}`,
                            '&:hover': {
                              bgcolor: alpha(COLORS.primary.main, 0.15),
                            }
                          },
                          '&:hover': {
                            bgcolor: COLORS.grey[50],
                          }
                        }}
                      >
                        <ListItemIcon sx={{ 
                          minWidth: 40,
                          color: isSelected ? COLORS.primary.main : COLORS.text.secondary
                        }}>
                          <FolderIcon fontSize="small" />
                        </ListItemIcon>
                        
                        {!collapsed && (
                          <>
                            <ListItemText 
                              primary={namespace}
                              primaryTypographyProps={{
                                fontSize: '0.85rem',
                                fontWeight: isSelected ? 600 : 400,
                                color: isSelected ? COLORS.primary.main : COLORS.text.primary,
                                noWrap: true
                              }}
                            />
                            
                            <Chip
                              label={envType.label}
                              size="small"
                              sx={{
                                bgcolor: envType.color,
                                color: 'white',
                                height: 18,
                                fontSize: '0.6rem',
                                fontWeight: 600,
                                '& .MuiChip-label': {
                                  px: 0.5,
                                }
                              }}
                            />
                          </>
                        )}
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </List>

            {/* Empty State */}
            {filteredNamespaces.length === 0 && !loading && (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4, 
                px: 2,
                color: COLORS.text.secondary 
              }}>
                {!collapsed && (
                  <>
                    <Typography variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                      {searchQuery ? 'No matching namespaces' : 'No namespaces found'}
                    </Typography>
                    <Button
                      size="small"
                      onClick={onCreateNamespace}
                      sx={{
                        ...BUTTON_STYLES.secondary,
                        fontSize: '0.75rem',
                        py: 0.5,
                        px: 1
                      }}
                    >
                      Create First Namespace
                    </Button>
                  </>
                )}
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>

      {/* Footer */}
      {!collapsed && (
        <Box sx={{
          p: 2,
          borderTop: `1px solid ${COLORS.grey[200]}`,
          bgcolor: COLORS.grey[25]
        }}>
          <Button
            startIcon={<SettingsIcon fontSize="small" />}
            fullWidth
            size="small"
            sx={{
              ...BUTTON_STYLES.ghost,
              justifyContent: 'flex-start',
              fontSize: '0.8rem',
              py: 1
            }}
            onClick={() => handleNavigation('/settings')}
          >
            Settings
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRight: 'none',
        },
      }}
    >
      <SidebarContent />
    </Drawer>
  );
};

export default Sidebar;