import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import FilesLayout from './components/FilesLayout';
import NotificationProvider from './components/common/NotificationProvider';
import { useSearch } from './hooks/useSearch';
import { useUniversalKeyboardShortcuts } from './hooks/useKeyboardShortcut';

const AppContent = () => {
  const location = useLocation();
  const { searchQuery, setSearchQuery } = useSearch();
  
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

  // Reference to store the Dashboard's openCreateDialog function
  const createDialogRef = useRef(null);

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
