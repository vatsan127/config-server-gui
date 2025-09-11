import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  alpha,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  ArrowBack as ArrowBackIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { COLORS, SIZES } from '../theme/colors';
import MarkdownPreview from '@uiw/react-markdown-preview';

const DocumentationPage = () => {
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableOfContents, setTableOfContents] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Extract table of contents from markdown content (H1, H2, and H3)
  const extractTableOfContents = useCallback((content) => {
    const headings = [];
    const lines = content.split('\n');
    let inCodeBlock = false;
    
    for (const line of lines) {
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      
      if (inCodeBlock) continue;
      
      const headingMatch = line.match(/^(#{1,3}) (.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const title = headingMatch[2].trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        headings.push({ level, title, id });
      }
    }
    
    return headings;
  }, []);

  useEffect(() => {
    const fetchReadme = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://raw.githubusercontent.com/vatsan127/config-server/master/Readme.md');
        if (!response.ok) {
          throw new Error('Failed to fetch README');
        }
        const content = await response.text();
        setMarkdownContent(content);
        setTableOfContents(extractTableOfContents(content));
      } catch (err) {
        setError(err.message);
        setMarkdownContent('# Config Server Documentation\n\nUnable to load documentation. Please visit [GitHub](https://github.com/vatsan127/config-server).');
      } finally {
        setLoading(false);
      }
    };

    fetchReadme();
  }, [extractTableOfContents]);

  // Scroll to heading function
  const scrollToHeading = useCallback((title) => {
    setTimeout(() => {
      const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const targetHeading = Array.from(allHeadings).find(h => 
        h.textContent.trim().toLowerCase() === title.toLowerCase()
      );
      
      if (targetHeading) {
        targetHeading.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  }, []);

  // Optimized item styles with memoization
  const getItemStyles = useMemo(() => ({
    1: { pl: 2, fontSize: '0.9rem', fontWeight: 600, color: COLORS.text.primary },
    2: { pl: 3, fontSize: '0.85rem', fontWeight: 500, color: COLORS.text.secondary },
    3: { pl: 4, fontSize: '0.8rem', fontWeight: 400, color: alpha(COLORS.text.secondary, 0.8) }
  }), []);

  // Memoized markdown preview styles
  const markdownStyles = useMemo(() => ({ 
    backgroundColor: 'transparent', 
    color: COLORS.text.primary,
    '--color-canvas-default': 'transparent',
    '--color-canvas-subtle': '#1e1e1e',
    '--color-border-default': '#444444',
    '--color-fg-default': COLORS.text.primary,
    '--color-fg-muted': COLORS.text.secondary,
    '--color-neutral-emphasis-plus': '#2d2d2d',
    '--color-neutral-subtle': 'transparent',
    '--color-accent-subtle': 'transparent',
    '--color-accent-emphasis': 'transparent',
    '--color-prettylights-syntax-comment': '#7c7c7c',
    '--color-prettylights-syntax-constant': '#79b8ff',
    '--color-prettylights-syntax-entity': '#b392f0',
    '--color-prettylights-syntax-storage-modifier-import': '#f6f8fa',
    '--color-prettylights-syntax-entity-tag': '#85e89d',
    '--color-prettylights-syntax-keyword': '#f97583',
    '--color-prettylights-syntax-string': '#9ecbff',
    '--color-prettylights-syntax-variable': '#ffab70',
    '--color-prettylights-syntax-markup-heading': '#79b8ff',
    '--color-prettylights-syntax-markup-italic': '#f6f8fa',
    '--color-prettylights-syntax-markup-bold': '#f6f8fa'
  }), []);

  // Sidebar content component
  const SidebarContent = () => (
    <Box sx={{ width: 280 }}>
      <Box sx={{ 
        p: 3, 
        borderBottom: `1px solid ${alpha(COLORS.grey[300], 0.3)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Back to Dashboard">
            <IconButton
              onClick={() => navigate('/')}
              size="small"
              sx={{
                color: COLORS.text.secondary,
                '&:hover': {
                  color: COLORS.text.primary,
                  backgroundColor: alpha(COLORS.grey[100], 0.8)
                }
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            color: COLORS.text.primary,
            fontSize: '1rem'
          }}>
            Contents
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="View on GitHub">
            <IconButton
              href="https://github.com/vatsan127/config-server"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{
                color: COLORS.text.secondary,
                '&:hover': {
                  color: COLORS.text.primary,
                  backgroundColor: alpha(COLORS.grey[100], 0.8)
                }
              }}
            >
              <GitHubIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Open in new tab">
            <IconButton
              href="https://github.com/vatsan127/config-server/blob/master/Readme.md"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{
                color: COLORS.text.secondary,
                '&:hover': {
                  color: COLORS.text.primary,
                  backgroundColor: alpha(COLORS.grey[100], 0.8)
                }
              }}
            >
              <LaunchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {isMobile && (
            <IconButton 
              onClick={() => setSidebarOpen(false)}
              size="small"
              sx={{ color: COLORS.text.secondary }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
      
      <List sx={{ p: 0 }}>
        {tableOfContents.map((item, index) => (
          <ListItem key={index} sx={{ p: 0 }}>
            <ListItemButton
              onClick={() => {
                if (isMobile) setSidebarOpen(false);
                setTimeout(() => scrollToHeading(item.title), 150);
              }}
              sx={{
                pl: getItemStyles[item.level].pl,
                py: 1,
                minHeight: 'auto',
                '&:hover': {
                  backgroundColor: alpha(COLORS.primary.main, 0.08)
                }
              }}
            >
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  ...getItemStyles[item.level],
                  sx: {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ 
        p: 4, 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <Typography variant="h6" color="text.secondary">
          Loading documentation...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box sx={{
          width: 280,
          height: '100vh',
          backgroundColor: COLORS.background.paper,
          borderRight: `1px solid ${alpha(COLORS.grey[300], 0.3)}`,
          position: 'sticky',
          top: 0,
          overflowY: 'auto',
          boxShadow: `2px 0 10px ${alpha(COLORS.grey[500], 0.1)}`
        }}>
          <SidebarContent />
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{ display: { md: 'none' } }}
      >
        <SidebarContent />
      </Drawer>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1,
        height: '100vh',
        overflow: 'auto',
        backgroundColor: COLORS.background.default,
        position: 'relative'
      }}>
        {/* Mobile Menu Button - Floating */}
        {isMobile && (
          <IconButton
            onClick={() => setSidebarOpen(true)}
            sx={{
              position: 'fixed',
              top: 16,
              left: 16,
              zIndex: 1000,
              backgroundColor: alpha(COLORS.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(COLORS.grey[300], 0.3)}`,
              boxShadow: `0 4px 12px ${alpha(COLORS.grey[500], 0.15)}`,
              color: COLORS.text.secondary,
              '&:hover': {
                color: COLORS.text.primary,
                backgroundColor: COLORS.background.paper
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Content */}
        <Box sx={{ 
          maxWidth: '1200px',
          mx: 'auto',
          px: 4,
          py: 4
        }}>
          {error && (
            <Box sx={{ 
              mb: 3,
              p: 2,
              backgroundColor: alpha(COLORS.warning.main, 0.1),
              border: `1px solid ${alpha(COLORS.warning.main, 0.3)}`,
              borderRadius: `${SIZES.borderRadius.medium}px`
            }}>
              <Typography color="warning.main" variant="body2">
                Note: {error}. Displaying fallback content.
              </Typography>
            </Box>
          )}
          
          <Box sx={{
            '& pre, & code, & pre code': {
              fontFamily: '"Consolas", "Monaco", "Courier New", monospace !important',
              color: '#f6f8fa !important'
            },
            '& pre': {
              fontSize: '14px !important',
              lineHeight: '1.4 !important',
              whiteSpace: 'pre !important',
              fontVariantLigatures: 'none !important'
            },
            '& table tr': {
              backgroundColor: 'transparent !important'
            }
          }}>
            <MarkdownPreview 
              source={markdownContent}
              style={markdownStyles}
              data-color-mode="light"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentationPage;