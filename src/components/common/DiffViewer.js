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
    let currentOldLineNumber = 1;
    let currentNewLineNumber = 1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Parse hunk headers to extract line numbers but don't display them
      if (line.startsWith('@@')) {
        const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (match) {
          currentOldLineNumber = parseInt(match[1]);
          currentNewLineNumber = parseInt(match[2]);
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
        color = '#22863a';
        borderLeft = `3px solid #28a745`;
        break;
      case 'removed':
        backgroundColor = '#ffeaea';
        color = '#d73a49';
        borderLeft = `3px solid #d73a49`;
        break;
      case 'context':
        color = COLORS.text.primary;
        backgroundColor = 'transparent';
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
          fontSize: '0.7rem',
          lineHeight: 1.3,
          backgroundColor,
          color,
          fontWeight,
          px: 0.5,
          py: 0.1,
          borderLeft,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          overflow: 'hidden',
          maxWidth: '100%',
          transition: 'background-color 0.1s ease',
          '&:hover': {
            backgroundColor: lineData.type === 'added' ? '#d4edda' :
                            lineData.type === 'removed' ? '#f8d7da' :
                            COLORS.grey[50],
          }
        }}
      >
        <Typography
          component="span"
          sx={{
            minWidth: '40px',
            maxWidth: '40px',
            width: '40px',
            color: COLORS.text.muted,
            fontSize: 'inherit',
            fontFamily: 'inherit',
            userSelect: 'none',
            mr: 1,
            textAlign: 'right',
            flexShrink: 0
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
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            pl: 1,
            minWidth: 0,
            overflow: 'hidden'
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
      background: '#f8f9fa',
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      position: 'relative',
      border: `1px solid ${COLORS.grey[200]}`,
      borderRadius: '4px',
      '&::-webkit-scrollbar': {
        width: 0,
        background: 'transparent',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-corner': {
        background: 'transparent',
      },
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      {parsedLines.map((lineData, index) => formatDiffLine(lineData, index))}
    </Box>
  );
};

export default DiffViewer;