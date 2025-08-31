import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import FilesLayout from './components/FilesLayout';
import NotificationProvider from './components/common/NotificationProvider';
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
      <Route path="/namespace/:namespace/*" element={<FilesLayout />} />
    </Routes>
  );
};

function App() {
  return (
    <NotificationProvider>
      <Router>
        <AppContent />
      </Router>
    </NotificationProvider>
  );
}

export default App;
