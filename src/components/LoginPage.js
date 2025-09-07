import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  InputAdornment,
  IconButton,
  Alert,
  Fade,
  Slide
} from '@mui/material';
import {
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { COLORS, SIZES, BUTTON_STYLES } from '../theme/colors';

const LoginPage = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Optimized animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);


  // Memoized handlers for performance
  const handleInputChange = useCallback((field) => (event) => {
    setCredentials(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (error) setError('');
  }, [error]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onLogin(credentials);
      setAttemptCount(0); // Reset on success
    } catch (error) {
      console.error('Login error:', error);
      setAttemptCount(prev => prev + 1);
      
      // Enhanced error messaging based on attempt count
      let errorMessage = error.message || 'Login failed. Please check your credentials.';
      
      if (attemptCount >= 2) {
        errorMessage += ' Having trouble? Please contact support.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [credentials, onLogin, attemptCount]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Memoized style objects for performance
  const containerStyles = useMemo(() => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    background: `
      radial-gradient(circle at 20% 80%, ${COLORS.primary.main}40 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, ${COLORS.primary.dark}40 0%, transparent 50%),
      linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.dark} 100%)
    `,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.spacing.xs,
    zIndex: 9999,
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      backgroundImage: `
        radial-gradient(circle at 25% 25%, ${COLORS.text.white}08 1px, transparent 1px),
        radial-gradient(circle at 75% 75%, ${COLORS.text.white}06 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px, 80px 80px',
      animation: 'float 30s ease-in-out infinite',
      opacity: 0.7
    },
    '@keyframes float': {
      '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
      '33%': { transform: 'translate(-10px, -5px) rotate(0.5deg)' },
      '66%': { transform: 'translate(5px, -10px) rotate(-0.5deg)' }
    }
  }), []);

  const paperStyles = useMemo(() => ({
    p: { xs: 2.5, sm: 3 },
    borderRadius: `${SIZES.borderRadius.xl}px`,
    bgcolor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px) saturate(180%)',
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.12),
      0 2px 8px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.5)
    `,
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    position: 'relative',
    overflow: 'hidden',
    maxWidth: 380,
    mx: 'auto',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: `linear-gradient(90deg, 
        ${COLORS.primary.main}, 
        ${COLORS.primary.dark}, 
        ${COLORS.accent.purple},
        ${COLORS.primary.main}
      )`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 3s ease-in-out infinite'
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: `conic-gradient(from 45deg at 50% 50%, 
        transparent, 
        ${COLORS.primary.main}05, 
        transparent, 
        ${COLORS.primary.dark}05, 
        transparent
      )`,
      borderRadius: 'inherit',
      opacity: 0.3,
      pointerEvents: 'none'
    },
    '@keyframes shimmer': {
      '0%, 100%': { backgroundPosition: '200% 0' },
      '50%': { backgroundPosition: '-200% 0' }
    }
  }), []);

  const inputStyles = useMemo(() => ({
    mb: 1.75,
    '& .MuiOutlinedInput-root': {
      borderRadius: `${SIZES.borderRadius.medium}px`,
      bgcolor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '& fieldset': {
        borderColor: 'rgba(0, 0, 0, 0.12)',
        transition: 'all 0.3s ease'
      },
      '&:hover': {
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        '& fieldset': {
          borderColor: COLORS.primary.main,
          borderWidth: '2px'
        },
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 123, 255, 0.15)'
      },
      '&.Mui-focused': {
        bgcolor: 'rgba(255, 255, 255, 1)',
        '& fieldset': {
          borderColor: COLORS.primary.main,
          borderWidth: '2px',
          boxShadow: `0 0 0 3px ${COLORS.primary.main}20`
        },
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0, 123, 255, 0.2)'
      },
      '&.Mui-disabled': {
        bgcolor: COLORS.grey[50],
        opacity: 0.7
      }
    },
    '& .MuiInputLabel-root': {
      color: COLORS.text.secondary,
      fontWeight: 500,
      '&.Mui-focused': {
        color: COLORS.primary.main,
        fontWeight: 600
      }
    }
  }), []);

  const buttonStyles = useMemo(() => ({
    ...BUTTON_STYLES.gradient,
    py: 1.25,
    fontSize: '1rem',
    fontWeight: 600,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: `${SIZES.borderRadius.medium}px`,
    textTransform: 'none',
    background: `linear-gradient(135deg, 
      ${COLORS.primary.main} 0%, 
      ${COLORS.primary.dark} 50%, 
      ${COLORS.accent.purple} 100%
    )`,
    backgroundSize: '200% 200%',
    animation: 'gradientShift 6s ease infinite',
    boxShadow: `
      0 4px 15px rgba(0, 123, 255, 0.4),
      0 2px 8px rgba(0, 123, 255, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3)
    `,
    '&:hover': {
      transform: 'translateY(-3px) scale(1.02)',
      boxShadow: `
        0 8px 25px rgba(0, 123, 255, 0.5),
        0 4px 12px rgba(0, 123, 255, 0.3)
      `,
      backgroundPosition: '100% 100%'
    },
    '&:active': {
      transform: 'translateY(-1px) scale(1.01)'
    },
    '&:disabled': {
      bgcolor: COLORS.grey[300],
      color: COLORS.grey[500],
      boxShadow: 'none',
      transform: 'none',
      background: COLORS.grey[300],
      animation: 'none'
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: `linear-gradient(90deg, 
        transparent, 
        rgba(255, 255, 255, 0.4), 
        transparent
      )`,
      transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    '&:hover::before': {
      left: '100%'
    },
    '@keyframes gradientShift': {
      '0%, 100%': { backgroundPosition: '0% 0%' },
      '50%': { backgroundPosition: '100% 100%' }
    }
  }), []);

  return (
    <Box sx={containerStyles}>
      <Container maxWidth="xs">
        <Slide direction="up" in={isVisible} timeout={600}>
          <Paper elevation={0} sx={paperStyles} autoComplete="off">
            {/* Header */}
            <Fade in={isVisible} timeout={800} style={{ transitionDelay: '200ms' }}>
              <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    mb: 1,
                    borderRadius: '50%',
                    background: `
                      linear-gradient(135deg, ${COLORS.primary.main}, ${COLORS.primary.dark}),
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent)
                    `,
                    boxShadow: `
                      0 8px 25px ${COLORS.primary.main}40,
                      0 4px 12px ${COLORS.primary.main}30,
                      inset 0 2px 4px rgba(255,255,255,0.3)
                    `,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: -2,
                      background: `conic-gradient(from 45deg, 
                        ${COLORS.primary.main}, 
                        ${COLORS.primary.dark}, 
                        ${COLORS.accent.purple}, 
                        ${COLORS.primary.main}
                      )`,
                      borderRadius: '50%',
                      padding: '2px',
                      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      maskComposite: 'subtract',
                      animation: 'rotate 4s linear infinite',
                      opacity: 0.8
                    },
                    '@keyframes rotate': {
                      to: { transform: 'rotate(360deg)' }
                    }
                  }}
                >
                  <SecurityIcon 
                    sx={{ 
                      fontSize: 24, 
                      color: COLORS.text.white,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                      zIndex: 1
                    }} 
                  />
                </Box>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 0.25,
                    background: `linear-gradient(135deg, 
                      ${COLORS.text.primary}, 
                      ${COLORS.primary.main}, 
                      ${COLORS.primary.dark}
                    )`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    backgroundSize: '200% 200%',
                    animation: 'textGradient 4s ease infinite',
                    '@keyframes textGradient': {
                      '0%, 100%': { backgroundPosition: '0% 50%' },
                      '50%': { backgroundPosition: '100% 50%' }
                    }
                  }}
                >
                  Config Server
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: COLORS.text.secondary,
                    fontSize: '0.85rem',
                    fontWeight: 400,
                    opacity: 0.8
                  }}
                >
                  Secure configuration management
                </Typography>
              </Box>
            </Fade>

            {/* Error Alert */}
            {error && (
              <Fade in={!!error}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 2,
                    borderRadius: `${SIZES.borderRadius.medium}px`,
                    bgcolor: 'rgba(244, 67, 54, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid rgba(244, 67, 54, 0.2)`,
                    animation: 'shake 0.5s ease-in-out',
                    '@keyframes shake': {
                      '0%, 100%': { transform: 'translateX(0)' },
                      '25%': { transform: 'translateX(-8px)' },
                      '75%': { transform: 'translateX(8px)' }
                    }
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Login Form */}
            <Fade in={isVisible} timeout={800} style={{ transitionDelay: '400ms' }}>
              <Box 
                component="form" 
                onSubmit={handleSubmit} 
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              >
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  placeholder="Enter your email address"
                  value={credentials.username}
                  onChange={handleInputChange('username')}
                  disabled={isLoading}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  autoFocus
                  sx={inputStyles}
                  inputProps={{
                    autoComplete: 'new-password', // Trick browsers
                    form: {
                      autoComplete: 'off'
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ 
                          color: COLORS.text.secondary,
                          transition: 'color 0.3s ease'
                        }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleInputChange('password')}
                  disabled={isLoading}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  sx={inputStyles}
                  inputProps={{
                    autoComplete: 'new-password', // Trick browsers
                    form: {
                      autoComplete: 'off'
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ 
                          color: COLORS.text.secondary,
                          transition: 'color 0.3s ease'
                        }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          disabled={isLoading}
                          sx={{
                            color: COLORS.text.secondary,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              color: COLORS.primary.main,
                              bgcolor: `${COLORS.primary.main}15`,
                              transform: 'scale(1.1) rotate(5deg)'
                            }
                          }}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading || !credentials.username || !credentials.password}
                  sx={buttonStyles}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          border: `2px solid ${COLORS.text.white}40`,
                          borderTop: `2px solid ${COLORS.text.white}`,
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' }
                          }
                        }}
                      />
                      Signing In...
                    </Box>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Box>
            </Fade>

            {/* Demo Credentials */}
            <Fade in={isVisible} timeout={800} style={{ transitionDelay: '600ms' }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: COLORS.text.secondary,
                  textAlign: 'center',
                  display: 'block',
                  mt: 1.5,
                  fontSize: '0.75rem',
                  opacity: 0.7,
                  fontFamily: 'monospace',
                  padding: '0.5rem',
                  bgcolor: 'rgba(0, 0, 0, 0.03)',
                  borderRadius: `${SIZES.borderRadius.small}px`,
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  backdropFilter: 'blur(5px)'
                }}
              >
                Please sign in with your account credentials
              </Typography>
            </Fade>
          </Paper>
        </Slide>
      </Container>
    </Box>
  );
};

export default LoginPage;