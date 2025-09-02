import React from 'react';
import { Box, Typography } from '@mui/material';
import { COLORS, SIZES } from '../../theme/colors';

const DiffViewer = ({ diffText }) => {
  if (!diffText) {
    return (
      <Box sx={{ 
        p: 2, 
        textAlign: 'center',
        color: COLORS.text.secondary 
      }}>
        <Typography variant="body2">No changes available</Typography>
      </Box>
    );
  }

  const cleanAndParseDiff = (diffText) => {
    const lines = diffText.split('\n');
    const cleanedLines = [];
    let currentOldLineNumber = 0;
    let currentNewLineNumber = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip unwanted git metadata
      if (line.startsWith('diff --git') ||
          line.startsWith('index ') ||
          line.match(/^--- a\//) ||
          line.match(/^\+\+\+ b\//) ||
          line.match(/^--- \/dev\/null/) ||
          line.match(/^\+\+\+ \/dev\/null/) ||
          line.includes('No newline at end of file')) {
        continue;
      }
      
      // Parse hunk headers to extract line numbers but don't display them
      if (line.startsWith('@@')) {
        const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (match) {
          currentOldLineNumber = parseInt(match[1]);
          currentNewLineNumber = parseInt(match[2]);
          // Don't add hunk headers to display - just parse for line numbers
        }
        continue;
      }
      
      // Process content lines
      if (line.startsWith('+')) {
        cleanedLines.push({
          type: 'added',
          content: line.substring(1),
          oldLineNumber: null,
          newLineNumber: currentNewLineNumber
        });
        currentNewLineNumber++;
      } else if (line.startsWith('-')) {
        cleanedLines.push({
          type: 'removed',
          content: line.substring(1),
          oldLineNumber: currentOldLineNumber,
          newLineNumber: null
        });
        currentOldLineNumber++;
      } else if (line.startsWith(' ') || line === '') {
        cleanedLines.push({
          type: 'context',
          content: line.substring(1),
          oldLineNumber: currentOldLineNumber,
          newLineNumber: currentNewLineNumber
        });
        currentOldLineNumber++;
        currentNewLineNumber++;
      }
    }
    
    return cleanedLines;
  };

  const formatDiffLine = (lineData, index) => {
    let backgroundColor = 'transparent';
    let color = COLORS.text.primary;
    let fontWeight = 400;
    let borderLeft = 'none';

    switch (lineData.type) {
      case 'added':
        backgroundColor = '#e6ffed';
        color = '#28a745';
        borderLeft = `3px solid #28a745`;
        break;
      case 'removed':
        backgroundColor = '#ffebee';
        color = '#dc3545';
        borderLeft = `3px solid #dc3545`;
        break;
      case 'context':
        color = COLORS.text.primary;
        break;
    }

    const getLineNumberDisplay = (lineData) => {
      const oldNum = lineData.oldLineNumber !== null ? lineData.oldLineNumber.toString() : '';
      const newNum = lineData.newLineNumber !== null ? lineData.newLineNumber.toString() : '';
      
      if (lineData.type === 'added') {
        return `+${newNum}`;
      } else if (lineData.type === 'removed') {
        return `-${oldNum}`;
      } else {
        return ` ${oldNum}`;
      }
    };

    return (
      <Box
        key={index}
        sx={{
          display: 'flex',
          fontFamily: 'Monaco, "Lucida Console", "Courier New", monospace',
          fontSize: '0.75rem',
          lineHeight: 1.4,
          backgroundColor,
          color,
          fontWeight,
          px: 1,
          py: 0.2,
          borderLeft,
          whiteSpace: 'pre',
          overflow: 'hidden'
        }}
      >
        <Typography
          component="span"
          sx={{
            minWidth: '50px',
            color: COLORS.text.muted,
            fontSize: 'inherit',
            fontFamily: 'inherit',
            userSelect: 'none',
            mr: 1,
            textAlign: 'right'
          }}
        >
          {getLineNumberDisplay(lineData)}
        </Typography>
        
        <Typography
          component="span"
          sx={{
            fontSize: 'inherit',
            fontFamily: 'inherit',
            color: 'inherit',
            fontWeight: 'inherit',
            flex: 1,
            overflow: 'hidden',
            pl: 1
          }}
        >
          {lineData.content || ' '}
        </Typography>
      </Box>
    );
  };

  const parsedLines = cleanAndParseDiff(diffText);

  return (
    <Box sx={{ 
      border: `1px solid ${COLORS.grey[200]}`,
      borderRadius: `${SIZES.borderRadius.small}px`,
      backgroundColor: COLORS.background.paper,
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      {parsedLines.map((lineData, index) => formatDiffLine(lineData, index))}
    </Box>
  );
};

export default DiffViewer;