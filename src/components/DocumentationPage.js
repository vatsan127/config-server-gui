import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  ArrowBack as ArrowBackIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { COLORS, SIZES } from '../theme/colors';
import MarkdownPreview from '@uiw/react-markdown-preview';

const DocumentationPage = () => {
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    <Box sx={{ 
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
              color: COLORS.text.primary
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
                fontSize: '0.75rem'
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
  );
};

export default DocumentationPage;