import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { setNotificationHandler } from '../services/api';
import { COLORS, SIZES } from '../theme/colors';
import { UI_CONSTANTS } from '../constants';
import { useNamespaces } from '../hooks/useNamespaces';
import { useDialog } from '../hooks/useDialog';
import { validateNamespace } from '../utils/validation';
import NamespaceCard from './common/NamespaceCard';
import EmptyState from './common/EmptyState';

const Dashboard = ({ searchQuery = '' }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  // Custom hooks for state management
  const { 
    namespaces, 
    loading, 
    error, 
    usingMockData, 
    createNamespace 
  } = useNamespaces();
  
  const {
    isOpen: createDialogOpen,
    formData: { namespaceName = '' } = {},
    isSubmitting: creating,
    openDialog: openCreateDialog,
    closeDialog: closeCreateDialog,
    updateFormData,
    handleSubmit: handleDialogSubmit
  } = useDialog({ namespaceName: '' });

  // Set up notification handler
  useEffect(() => {
    setNotificationHandler(enqueueSnackbar);
  }, [enqueueSnackbar]);

  // Handle namespace creation
  const handleCreateNamespace = async (formData) => {
    const validation = validateNamespace(formData.namespaceName);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    await createNamespace(formData.namespaceName);
  };

  // Handle card clicks
  const handleCardClick = (namespace) => {
    navigate(`/namespace/${namespace}/files`);
  };

  // Filter namespaces based on search query
  const filteredNamespaces = useMemo(() => {
    if (!searchQuery.trim()) return namespaces;
    return namespaces.filter(namespace =>
      namespace.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [namespaces, searchQuery]);

  // Memoized components
  const namespaceCards = useMemo(() => 
    filteredNamespaces.map((namespace) => (
      <Grid item xs={12} sm={6} md={4} key={namespace}>
        <NamespaceCard 
          namespace={namespace}
          onClick={() => handleCardClick(namespace)}
        />
      </Grid>
    )), [filteredNamespaces, handleCardClick]
  );

  if (loading) {
    return (
      <Box sx={{ p: SIZES.spacing.lg }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: SIZES.spacing.lg }}>
        <Box mt={SIZES.spacing.lg}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: SIZES.spacing.lg, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box mb={SIZES.spacing.lg} sx={{ 
        bgcolor: COLORS.background.paper, 
        p: SIZES.spacing.md, 
        borderLeft: `4px solid ${COLORS.primary.main}` 
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 1, color: 'text.primary' }}>
          Configuration Server Dashboard
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Manage your configuration namespaces
        </Typography>
      </Box>

      {usingMockData && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: SIZES.spacing.lg,
            bgcolor: COLORS.warning.background,
            borderLeft: `4px solid ${COLORS.warning.border}`,
            color: 'text.primary',
            '& .MuiAlert-icon': { color: COLORS.warning.border }
          }}
        >
          {UI_CONSTANTS.MESSAGES.MOCK_DATA_WARNING}
        </Alert>
      )}


      <Grid container spacing={SIZES.spacing.md}>
        {namespaceCards}
      </Grid>

      {namespaces.length === 0 && (
        <EmptyState 
          title={UI_CONSTANTS.MESSAGES.EMPTY_NAMESPACES}
          description={UI_CONSTANTS.MESSAGES.EMPTY_NAMESPACES_DESC}
        />
      )}

      {namespaces.length > 0 && filteredNamespaces.length === 0 && searchQuery && (
        <EmptyState 
          title={UI_CONSTANTS.MESSAGES.NO_SEARCH_RESULTS}
          description={`No namespaces found matching "${searchQuery}"`}
        />
      )}

      {/* Floating Action Button for Create */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          bgcolor: COLORS.primary.main,
          '&:hover': {
            bgcolor: COLORS.primary.dark
          }
        }}
        onClick={openCreateDialog}
      >
        <AddIcon />
      </Fab>

      {/* Create Namespace Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={closeCreateDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: COLORS.background.paper,
            border: `1px solid ${COLORS.grey[300]}`,
            borderRadius: 0,
            boxShadow: 'none',
            m: 2
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: COLORS.text.primary, 
          fontSize: '1.25rem', 
          fontWeight: 500,
          borderBottom: `1px solid ${COLORS.grey[300]}`,
          px: 3,
          py: 2
        }}>
          {UI_CONSTANTS.DIALOG.CREATE_NAMESPACE.TITLE}
        </DialogTitle>
        <DialogContent sx={{ 
          px: 3,
          py: 3,
          '&.MuiDialogContent-root': {
            paddingTop: 3
          }
        }}>
          <TextField
            autoFocus
            margin="none"
            label="Namespace Name"
            placeholder={UI_CONSTANTS.DIALOG.CREATE_NAMESPACE.PLACEHOLDER}
            type="text"
            fullWidth
            variant="outlined"
            value={namespaceName}
            onChange={(e) => updateFormData({ namespaceName: e.target.value })}
            disabled={creating}
            inputProps={{
              autoComplete: 'off',
              tabIndex: 0,
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !creating && namespaceName.trim()) {
                e.preventDefault();
                handleDialogSubmit(handleCreateNamespace);
              }
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                '& fieldset': {
                  borderColor: COLORS.grey[300],
                },
                '&:hover fieldset': {
                  borderColor: COLORS.grey[400],
                },
                '&.Mui-focused fieldset': {
                  borderColor: COLORS.primary.main,
                  borderWidth: 2
                }
              },
              '& .MuiInputLabel-root': {
                color: COLORS.text.secondary,
                '&.Mui-focused': {
                  color: COLORS.primary.main
                }
              },
              '& .MuiOutlinedInput-input': {
                padding: '14px 12px'
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          py: 2, 
          borderTop: `1px solid ${COLORS.grey[300]}`,
          gap: 1
        }}>
          <Button 
            onClick={closeCreateDialog} 
            disabled={creating}
            sx={{ 
              color: COLORS.text.secondary,
              borderRadius: 0,
              px: 3,
              py: 1,
              '&:hover': {
                bgcolor: COLORS.grey[100]
              },
              '&:disabled': {
                color: COLORS.grey[400]
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleDialogSubmit(handleCreateNamespace)} 
            variant="contained"
            disabled={creating || !namespaceName.trim()}
            sx={{ 
              bgcolor: COLORS.primary.main,
              borderRadius: 0,
              px: 3,
              py: 1,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: COLORS.primary.dark,
                boxShadow: 'none'
              },
              '&:disabled': {
                bgcolor: COLORS.grey[300],
                color: COLORS.grey[500]
              }
            }}
          >
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;