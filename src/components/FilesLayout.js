import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { SIZES } from '../theme/colors';
import FilesSidebar from './common/FilesSidebar';
import FilesPage from './FilesPage';
import FileViewPage from './FileViewPage';

const FilesLayout = () => {
  const { namespace } = useParams();

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <FilesSidebar
        namespace={namespace}
      />
      
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        marginLeft: `${SIZES.sidebar.width}px`,
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