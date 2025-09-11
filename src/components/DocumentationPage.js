import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
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
  Article as ArticleIcon,
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

  // Extract table of contents from markdown content (H1 and H2 only)
  const extractTableOfContents = (content) => {
    const headings = [];
    const lines = content.split('\n');
    let inCodeBlock = false;
    
    lines.forEach((line) => {
      // Check if we're entering or exiting a code block
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return;
      }
      
      // Skip lines inside code blocks
      if (inCodeBlock) {
        return;
      }
      
      // Check for headings only outside code blocks
      const h1Match = line.match(/^# (.+)$/);
      const h2Match = line.match(/^## (.+)$/);
      
      if (h1Match) {
        const title = h1Match[1].trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        headings.push({ level: 1, title, id });
      } else if (h2Match) {
        const title = h2Match[1].trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        headings.push({ level: 2, title, id });
      }
    });
    
    return headings;
  };

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
        
        // Extract table of contents
        const toc = extractTableOfContents(content);
        setTableOfContents(toc);
      } catch (err) {
        setError(err.message);
        setMarkdownContent(`
# Config Server Documentation

Unable to load the latest documentation from GitHub. Please visit the repository directly for the most up-to-date information.

[View on GitHub](https://github.com/vatsan127/config-server)
        `);
      } finally {
        setLoading(false);
      }
    };

    fetchReadme();
  }, []);

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
        <Typography variant="h6" sx={{ 
          fontWeight: 600,
          color: COLORS.text.primary,
          fontSize: '1rem'
        }}>
          Contents
        </Typography>
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
      
      <List sx={{ p: 0 }}>
        {tableOfContents.map((item, index) => (
          <ListItem key={index} sx={{ p: 0 }}>
            <ListItemButton
              onClick={() => {
                // Find heading by text content
                const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                const targetHeading = Array.from(allHeadings).find(h => 
                  h.textContent.trim().toLowerCase() === item.title.toLowerCase()
                );
                
                if (targetHeading) {
                  targetHeading.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                  });
                }
                
                if (isMobile) {
                  setSidebarOpen(false);
                }
              }}
              sx={{
                pl: item.level === 1 ? 2 : 3,
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
                  fontSize: item.level === 1 ? '0.9rem' : '0.85rem',
                  fontWeight: item.level === 1 ? 600 : 500,
                  color: item.level === 1 ? COLORS.text.primary : COLORS.text.secondary,
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
        backgroundColor: COLORS.background.default
      }}>
        {/* Header */}
        <Box sx={{ 
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: alpha(COLORS.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(COLORS.grey[300], 0.3)}`,
          px: 4,
          py: 2
        }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '1200px',
            mx: 'auto'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isMobile && (
                <IconButton
                  onClick={() => setSidebarOpen(true)}
                  sx={{
                    color: COLORS.text.secondary,
                    mr: 1,
                    '&:hover': {
                      color: COLORS.text.primary,
                      backgroundColor: alpha(COLORS.grey[100], 0.8)
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Tooltip title="Back to Dashboard">
                <IconButton
                  onClick={() => navigate('/')}
                  sx={{
                    color: COLORS.text.secondary,
                    '&:hover': {
                      color: COLORS.text.primary,
                      backgroundColor: alpha(COLORS.grey[100], 0.8)
                    }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
              <ArticleIcon sx={{ 
                fontSize: 28,
                color: COLORS.primary.main
              }} />
              <Typography variant="h5" sx={{ 
                fontWeight: 600,
                color: COLORS.text.primary,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}>
                Config Server Documentation
              </Typography>
              <Chip 
                label="Live from GitHub"
                size="small"
                variant="outlined"
                sx={{
                  borderColor: COLORS.success.main,
                  color: COLORS.success.main,
                  fontSize: '0.75rem',
                  display: { xs: 'none', sm: 'inline-flex' }
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="View on GitHub">
                <IconButton
                  href="https://github.com/vatsan127/config-server"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: COLORS.text.secondary,
                    '&:hover': {
                      color: COLORS.text.primary,
                      backgroundColor: alpha(COLORS.grey[100], 0.8)
                    }
                  }}
                >
                  <GitHubIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Open in new tab">
                <IconButton
                  href="https://github.com/vatsan127/config-server/blob/master/Readme.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: COLORS.text.secondary,
                    '&:hover': {
                      color: COLORS.text.primary,
                      backgroundColor: alpha(COLORS.grey[100], 0.8)
                    }
                  }}
                >
                  <LaunchIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

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
          
          <MarkdownPreview 
            source={markdownContent}
            style={{
              backgroundColor: 'transparent',
              color: COLORS.text.primary
            }}
            data-color-mode="light"
            wrapperElement={{
              "data-color-mode": "light"
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentationPage;