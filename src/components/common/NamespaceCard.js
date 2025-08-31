import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { COLORS, SIZES } from '../../theme/colors';

const NamespaceCard = ({ namespace, onClick }) => {
  const getNamespaceWord = (namespace) => {
    const firstWord = namespace.split('-')[0];
    return firstWord.toUpperCase();
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        bgcolor: COLORS.background.paper,
        border: `1px solid ${COLORS.grey[200]}`,
        borderRadius: '0px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'translateY(0px)',
        '&:hover': {
          borderColor: COLORS.primary.light,
          boxShadow: '0 12px 32px rgba(33, 150, 243, 0.15)',
          transform: 'translateY(-4px)',
          bgcolor: '#fbfdff'
        },
        '&:active': {
          transform: 'translateY(-1px)',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)'
        }
      }}
      elevation={0}
      onClick={onClick}
    >
      <CardContent sx={{ 
        flexGrow: 1, 
        textAlign: 'center',
        p: SIZES.spacing.md,
        '&:last-child': { pb: SIZES.spacing.md }
      }}>
        <Box
          sx={{
            minWidth: SIZES.icon.namespace,
            height: SIZES.icon.namespace,
            background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: SIZES.spacing.sm,
            borderRadius: '0px',
            boxShadow: '0 4px 16px rgba(33, 150, 243, 0.25)',
            position: 'relative',
            px: 2,
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: '2px',
              borderRadius: '0px',
              background: 'rgba(255, 255, 255, 0.1)',
              zIndex: 1
            }
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              color: COLORS.text.white, 
              fontWeight: 700,
              fontSize: '1rem',
              position: 'relative',
              zIndex: 2,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
              lineHeight: 1,
              letterSpacing: '0.02em',
              padding: '2px'
            }}
          >
            {getNamespaceWord(namespace)}
          </Typography>
        </Box>
        <Typography 
          variant="h6" 
          component="h2"
          sx={{ 
            fontWeight: 600,
            color: COLORS.text.primary,
            fontSize: '1.125rem',
            mb: 1,
            letterSpacing: '-0.01em'
          }}
        >
          {namespace}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: COLORS.text.secondary,
            fontSize: '0.875rem',
            opacity: 0.8
          }}
        >
          Configuration namespace
        </Typography>
      </CardContent>
    </Card>
  );
};

export default React.memo(NamespaceCard);