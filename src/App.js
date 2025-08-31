import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SnackbarProvider, closeSnackbar } from 'notistack';
import { IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import { COLORS } from './theme/colors';
import { useSearch } from './hooks/useSearch';

function App() {
  const { searchQuery, setSearchQuery } = useSearch();

  const handleSearchFocus = () => {
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
      searchInput.focus();
    }
  };

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
        <Layout 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchFocus={handleSearchFocus}
        >
          <Routes>
            <Route path="/" element={<Dashboard searchQuery={searchQuery} />} />
            <Route path="/dashboard" element={<Dashboard searchQuery={searchQuery} />} />
          </Routes>
        </Layout>
      </Router>
    </SnackbarProvider>
  );
}

export default App;
