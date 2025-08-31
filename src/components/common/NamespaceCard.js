import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { COLORS, SIZES } from '../../theme/colors';

const NamespaceCard = ({ namespace, onClick }) => {
  const getNamespaceIcon = (namespace) => {
    const firstWord = namespace.split('-')[0];
    return firstWord.toUpperCase();
  };

  const getNamespaceInitials = (namespace) => {
    const words = namespace.split(/[-_\s]+/).filter(word => word.length > 0);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return namespace.substring(0, 2).toUpperCase();
  };

  return (
    <Card 
      sx={{ 
        width: 150,
        height: 120,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        bgcolor: COLORS.background.paper,
        border: `1px solid ${COLORS.grey[200]}`,
        borderRadius: `${SIZES.borderRadius.large}px`,
        boxShadow: SIZES.shadow.base,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: COLORS.primary.main,
          boxShadow: SIZES.shadow.lg,
          transform: 'translateY(-2px)',
          bgcolor: COLORS.grey[25],
          '& .namespace-icon': {
            transform: 'scale(1.1)',
            color: COLORS.primary.main,
          }
        },
        '&:active': {
          transform: 'translateY(-1px)',
          boxShadow: SIZES.shadow.md,
        }
      }}
      elevation={0}
      onClick={onClick}
    >
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 1.5,
        '&:last-child': { pb: 1.5 }
      }}>
        <Box
          sx={{
            minWidth: 40,
            height: 30,
            px: 1,
            background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1,
            borderRadius: `${SIZES.borderRadius.xl}px`,
            boxShadow: SIZES.shadow.md,
            fontSize: SIZES.icon.large,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="namespace-icon"
        >
          <Box sx={{ 
            color: COLORS.text.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: 600
          }}>
            {getNamespaceIcon(namespace)}
          </Box>
        </Box>
        <Typography 
          variant="h6" 
          component="h2"
          sx={{ 
            fontWeight: 600,
            color: COLORS.text.primary,
            fontSize: '0.9rem',
            mb: 0.5,
            letterSpacing: '-0.01em'
          }}
        >
          {namespace}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default React.memo(NamespaceCard);