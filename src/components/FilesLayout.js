import React, { useEffect, useState } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { SIZES } from '../theme/colors';
import FilesSidebar from './common/FilesSidebar';
import FilesPage from './FilesPage';
import FileViewPage from './FileViewPage';

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
        minHeight: '100vh',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(20px)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      <Box
        sx={{
          transform: isVisible ? 'translateX(0)' : 'translateX(-50px)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          transitionDelay: '0.05s'
        }}
      >
        <FilesSidebar namespace={namespace} />
      </Box>
      
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        marginLeft: `${SIZES.sidebar.width}px`,
        transform: isVisible ? 'translateX(0)' : 'translateX(30px)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transitionDelay: '0.1s'
      }}>
        <Routes>
          <Route path="files" element={<FilesPage />} />
          <Route path="file" element={<FileViewPage />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default FilesLayout;