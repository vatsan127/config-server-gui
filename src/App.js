import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { SnackbarProvider, closeSnackbar } from 'notistack';
import { IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import FilesPage from './components/FilesPage';
import FileViewPage from './components/FileViewPage';
import { COLORS } from './theme/colors';
import { useSearch } from './hooks/useSearch';

const AppContent = () => {
  const location = useLocation();
  const { searchQuery, setSearchQuery } = useSearch();

  // Clear search when route changes
  React.useEffect(() => {
    setSearchQuery('');
  }, [location.pathname, setSearchQuery]);

  const handleSearchFocus = () => {
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
      searchInput.focus();
    }
  };

  const getSearchPlaceholder = () => {
    if (location.pathname.includes('/files')) {
      return 'Search files and folders... (Ctrl+K)';
    }
    return 'Search namespaces... (Ctrl+K)';
  };

  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';

  if (isDashboard) {
    return (
      <Layout 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchFocus={handleSearchFocus}
        searchPlaceholder={getSearchPlaceholder()}
      >
        <Routes>
          <Route path="/" element={<Dashboard searchQuery={searchQuery} />} />
          <Route path="/dashboard" element={<Dashboard searchQuery={searchQuery} />} />
        </Routes>
      </Layout>
    );
  }

  return (
    <Routes>
      <Route path="/namespace/:namespace/files" element={<FilesPage />} />
      <Route path="/namespace/:namespace/file" element={<FileViewPage />} />
    </Routes>
  );
};

function App() {
  return (
    <SnackbarProvider 
      maxSnack={5} 
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      autoHideDuration={5000}
      dense
      preventDuplicate
      persist={false}
      hideIconVariant={false}
      action={(snackbarId) => (
        <IconButton
          onClick={() => closeSnackbar(snackbarId)}
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': { color: 'rgba(255, 255, 255, 0.9)' }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
      iconVariant={{
        success: '✅',
        error: '❌',
        warning: '❌',
        info: '✅',
      }}
      sx={{
        '&.notistack-MuiContent-success': {
          backgroundColor: COLORS.alerts.success,
          color: '#fff',
          borderRadius: 0,
          border: 'none',
          fontWeight: 500,
        },
        '&.notistack-MuiContent-error': {
          backgroundColor: COLORS.alerts.error,
          color: '#fff',
          borderRadius: 0,
          border: 'none',
          fontWeight: 500,
        },
        '&.notistack-MuiContent-warning': {
          backgroundColor: COLORS.alerts.error,
          color: '#fff',
          borderRadius: 0,
          border: 'none',
          fontWeight: 500,
        },
        '&.notistack-MuiContent-info': {
          backgroundColor: COLORS.alerts.success,
          color: '#fff',
          borderRadius: 0,
          border: 'none',
          fontWeight: 500,
        }
      }}
    >
      <Router>
        <AppContent />
      </Router>
    </SnackbarProvider>
  );
}

export default App;
