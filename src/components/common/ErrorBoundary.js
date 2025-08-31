import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { COLORS } from '../../theme/colors';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 4,
            textAlign: 'center'
          }}
        >
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              maxWidth: 600,
              bgcolor: COLORS.alerts.error,
              color: 'white'
            }}
          >
            Something went wrong
          </Alert>
          
          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
            An unexpected error occurred
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            {this.state.error?.message || 'Please try refreshing the page'}
          </Typography>
          
          <Button
            startIcon={<RefreshIcon />}
            onClick={this.handleReload}
            variant="contained"
            sx={{
              bgcolor: COLORS.primary.main,
              '&:hover': {
                bgcolor: COLORS.primary.dark
              }
            }}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;