import React, { useEffect, useState } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { SIZES } from '../theme/colors';
import FilesSidebar from './common/FilesSidebar';
import FilesPage from './FilesPage';
import FileViewPage from './FileViewPage';
import VaultPage from './VaultPage';
import EventsPage from './EventsPage';
import NotifyPage from './NotifyPage';

const FilesLayout = () => {
  const { namespace } = useParams();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation immediately
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        bgcolor: 'background.default', 
        height: '100vh',
        overflow: 'hidden',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          position: 'relative',
          zIndex: 1001
        }}
      >
        <FilesSidebar namespace={namespace} />
      </Box>
      
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        marginLeft: `${SIZES.sidebar.width}px`,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transitionDelay: '0.1s',
        width: `calc(100% - ${SIZES.sidebar.width}px)`,
        maxWidth: `calc(100vw - ${SIZES.sidebar.width}px)`,
        overflow: 'hidden'
      }}>
        <Routes>
          <Route path="files" element={<FilesPage />} />
          <Route path="file" element={<FileViewPage />} />
          <Route path="vault" element={<VaultPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="notify" element={<NotifyPage />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default FilesLayout;