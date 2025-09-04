import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import FilesLayout from './components/FilesLayout';
import Login from './components/Login';
import NotificationProvider from './components/common/NotificationProvider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useSearch } from './hooks/useSearch';
import { useUniversalKeyboardShortcuts } from './hooks/useKeyboardShortcut';
import { Box, CircularProgress, Typography } from '@mui/material';
import { COLORS } from './theme/colors';

// Loading component
const LoadingScreen = () => (
  <Box sx={{
    minHeight: '100vh',
    bgcolor: COLORS.background.default,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  }}>
    <CircularProgress size={40} sx={{ color: COLORS.primary.main }} />
    <Typography variant="body1" sx={{ color: COLORS.text.secondary }}>
      Loading...
    </Typography>
  </Box>
);

// Authenticated app content
const AuthenticatedAppContent = () => {
  const location = useLocation();
  const { searchQuery, setSearchQuery } = useSearch();
  
  // Reference to store the Dashboard's openCreateDialog function
  const createDialogRef = useRef(null);
  
  // Set up universal keyboard shortcuts
  useUniversalKeyboardShortcuts();

  // Clear search when route changes
  React.useEffect(() => {
    console.log('🔄 Route changed - clearing search', {
      pathname: location.pathname,
      timestamp: new Date().toISOString()
    });
    setSearchQuery('');
  }, [location.pathname, setSearchQuery]);

  const getSearchPlaceholder = () => {
    if (location.pathname.includes('/files')) {
      return 'Search files and folders... (Ctrl+K)';
    }
    return 'Search namespaces... (Ctrl+K)';
  };

  const isDashboard = location.pathname === '/';

  // Handle create namespace for navbar
  const handleCreateNamespace = () => {
    if (createDialogRef.current) {
      createDialogRef.current();
    }
  };

  // Callback to receive Dashboard's openCreateDialog function
  const setCreateDialogFunction = (openDialogFn) => {
    createDialogRef.current = openDialogFn;
  };

  if (isDashboard) {
    return (
      <Layout 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={getSearchPlaceholder()}
        showCreateButton={true}
        onCreateNamespace={handleCreateNamespace}
      >
        <Routes>
          <Route path="/" element={<Dashboard searchQuery={searchQuery} onCreateNamespace={setCreateDialogFunction} />} />
        </Routes>
      </Layout>
    );
  }

  return (
    <Routes>
      <Route path="/namespace/:namespace/*" element={<FilesLayout />} />
    </Routes>
  );
};

// Main app content with auth checking  
const AppContent = () => {
  const { isAuthenticated, checking, login } = useAuth();

  // Show loading screen while checking authentication
  if (checking) {
    return <LoadingScreen />;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  // Show authenticated app content
  return <AuthenticatedAppContent />;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
