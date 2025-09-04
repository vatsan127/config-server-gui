import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Fade,
  Collapse,
  alpha
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Dashboard as DashboardIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { COLORS, SIZES, BUTTON_STYLES } from '../theme/colors';
import { InlineSpinner } from './common/ProgressIndicator';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const usernameRef = useRef(null);

  const handleChange = useCallback((field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (error) setError('');
  }, [error]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call the onLogin prop with the form data
      await onLogin(formData);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, onLogin, error]);

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter' && !loading) {
      handleSubmit(event);
    }
  }, [loading, handleSubmit]);

  const containerStyles = useMemo(() => ({
    minHeight: '100vh',
    bgcolor: COLORS.background.default,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        radial-gradient(circle at 30% 20%, ${alpha(COLORS.primary.main, 0.08)} 0%, transparent 50%),
        radial-gradient(circle at 70% 80%, ${alpha(COLORS.accent.purple, 0.08)} 0%, transparent 50%),
        linear-gradient(135deg, ${alpha(COLORS.primary.main, 0.03)}, ${alpha(COLORS.accent.purple, 0.03)})
      `,
      zIndex: 0,
      animation: 'backgroundShift 20s ease-in-out infinite alternate'
    },
    '@keyframes backgroundShift': {
      '0%': {
        transform: 'scale(1) rotate(0deg)'
      },
      '100%': {
        transform: 'scale(1.1) rotate(1deg)'
      }
    },
    '@media (max-width: 768px)': {
      p: 1,
      alignItems: 'flex-start',
      pt: 4
    }
  }), []);

  const paperStyles = useMemo(() => ({
    maxWidth: 420,
    width: '100%',
    p: 4,
    borderRadius: `${SIZES.borderRadius.xl}px`,
    bgcolor: alpha(COLORS.background.paper, 0.95),
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(COLORS.grey[200], 0.3)}`,
    boxShadow: `
      0 8px 32px ${alpha(COLORS.grey[900], 0.08)},
      0 4px 16px ${alpha(COLORS.grey[900], 0.04)},
      inset 0 1px 0 ${alpha('#ffffff', 0.1)}
    `,
    position: 'relative',
    zIndex: 1,
    transform: 'translateY(0) scale(1)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: `
        0 16px 48px ${alpha(COLORS.grey[900], 0.12)},
        0 8px 24px ${alpha(COLORS.grey[900], 0.08)},
        inset 0 1px 0 ${alpha('#ffffff', 0.15)}
      `
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${COLORS.primary.main}, ${COLORS.accent.purple})`,
      borderRadius: `${SIZES.borderRadius.xl}px ${SIZES.borderRadius.xl}px 0 0`,
      boxShadow: `0 2px 8px ${alpha(COLORS.primary.main, 0.3)}`
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '120%',
      height: '120%',
      background: `radial-gradient(circle, ${alpha(COLORS.primary.main, 0.02)} 0%, transparent 70%)`,
      transform: 'translate(-50%, -50%)',
      zIndex: -1,
      pointerEvents: 'none'
    },
    '@media (max-width: 768px)': {
      p: 3,
      mx: 1,
      '&:hover': {
        transform: 'translateY(-2px) scale(1.01)'
      }
    },
    '@media (max-width: 480px)': {
      p: 2.5,
      borderRadius: `${SIZES.borderRadius.large}px`
    }
  }), []);

  return (
    <Fade in timeout={800}>
      <Box sx={containerStyles}>
        <Paper elevation={0} sx={paperStyles}
      >
        {/* Header */}
        <Fade in timeout={1200}>
          <Box sx={{ 
            textAlign: 'center', 
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            '@media (max-width: 768px)': {
              mb: 3,
              gap: 1.5
            }
          }}>
          <Box sx={{
            width: 64,
            height: 64,
            borderRadius: `${SIZES.borderRadius.xl}px`,
            bgcolor: alpha(COLORS.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${alpha(COLORS.primary.main, 0.2)}`,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05) rotate(5deg)',
              bgcolor: alpha(COLORS.primary.main, 0.15),
              borderColor: alpha(COLORS.primary.main, 0.4)
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: `conic-gradient(from 0deg, transparent, ${alpha(COLORS.primary.main, 0.1)}, transparent)`,
              animation: 'iconGlow 3s linear infinite'
            },
            '@keyframes iconGlow': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            },
            '@media (max-width: 768px)': {
              width: 56,
              height: 56
            }
          }}>
            <DashboardIcon sx={{ 
              fontSize: 32, 
              color: COLORS.primary.main,
              position: 'relative',
              zIndex: 1,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              '@media (max-width: 768px)': {
                fontSize: 28
              }
            }} />
          </Box>
          
          <Box>
            <Typography variant="h4" sx={{ 
              color: COLORS.text.primary,
              fontWeight: 700,
              mb: 0.5,
              fontSize: '1.8rem',
              background: `linear-gradient(135deg, ${COLORS.text.primary}, ${alpha(COLORS.primary.main, 0.8)})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              '@media (max-width: 768px)': {
                fontSize: '1.6rem'
              },
              '@media (max-width: 480px)': {
                fontSize: '1.4rem'
              }
            }}>
              Welcome Back
            </Typography>
            <Typography variant="body1" sx={{ 
              color: COLORS.text.secondary,
              fontSize: '1rem',
              fontWeight: 400,
              letterSpacing: '0.01em',
              '@media (max-width: 768px)': {
                fontSize: '0.9rem'
              }
            }}>
              Sign in to your Configuration Dashboard
            </Typography>
          </Box>
          </Box>
        </Fade>

        {/* Error Alert */}
        <Collapse in={!!error}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: `${SIZES.borderRadius.large}px`,
              bgcolor: alpha(COLORS.error.background, 0.8),
              border: `1px solid ${alpha(COLORS.error.border, 0.3)}`,
              '& .MuiAlert-icon': {
                color: COLORS.error.border
              }
            }}
          >
            {error}
          </Alert>
        </Collapse>

        {/* Login Form */}
        <Fade in timeout={1000}>
          <Box component="form" onSubmit={handleSubmit} sx={{ 
            width: '100%',
            '& > *': {
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }
          }}>
          {/* Username Field */}
          <TextField
            ref={usernameRef}
            fullWidth
            label="Username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange('username')}
            onKeyPress={handleKeyPress}
            disabled={loading}
            autoFocus
            autoComplete="username"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: COLORS.text.muted, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: `${SIZES.borderRadius.large}px`,
                bgcolor: alpha(COLORS.grey[50], 0.5),
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(10px)',
                '& fieldset': {
                  borderColor: alpha(COLORS.grey[300], 0.6),
                  transition: 'all 0.3s ease'
                },
                '&:hover fieldset': {
                  borderColor: alpha(COLORS.primary.main, 0.5),
                  boxShadow: `0 0 0 1px ${alpha(COLORS.primary.main, 0.1)}`,
                  transform: 'scale(1.005)'
                },
                '&.Mui-focused': {
                  bgcolor: COLORS.background.paper,
                  transform: 'scale(1.02)',
                  '& fieldset': {
                    borderColor: COLORS.primary.main,
                    borderWidth: 2,
                    boxShadow: `0 0 0 3px ${alpha(COLORS.primary.main, 0.1)}`,
                    background: `linear-gradient(90deg, ${alpha(COLORS.primary.main, 0.05)}, transparent)`
                  }
                },
                '& .MuiInputBase-input': {
                  fontSize: '1rem',
                  py: 1.5,
                  '&::placeholder': {
                    color: alpha(COLORS.text.secondary, 0.7),
                    opacity: 1
                  }
                }
              },
              '& .MuiInputLabel-root': {
                color: COLORS.text.secondary,
                fontSize: '1rem',
                fontWeight: 500,
                '&.Mui-focused': {
                  color: COLORS.primary.main,
                  fontWeight: 600
                }
              },
              '@media (max-width: 768px)': {
                mb: 2.5
              }
            }}
          />

          {/* Password Field */}
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange('password')}
            onKeyPress={handleKeyPress}
            disabled={loading}
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: COLORS.text.muted, fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    size="small"
                    sx={{
                      color: COLORS.text.muted,
                      '&:hover': {
                        color: COLORS.text.primary,
                        bgcolor: alpha(COLORS.grey[100], 0.5)
                      }
                    }}
                  >
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 4,
              '& .MuiOutlinedInput-root': {
                borderRadius: `${SIZES.borderRadius.large}px`,
                bgcolor: alpha(COLORS.grey[50], 0.5),
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(10px)',
                '& fieldset': {
                  borderColor: alpha(COLORS.grey[300], 0.6),
                  transition: 'all 0.3s ease'
                },
                '&:hover fieldset': {
                  borderColor: alpha(COLORS.primary.main, 0.5),
                  boxShadow: `0 0 0 1px ${alpha(COLORS.primary.main, 0.1)}`,
                  transform: 'scale(1.005)'
                },
                '&.Mui-focused': {
                  bgcolor: COLORS.background.paper,
                  transform: 'scale(1.02)',
                  '& fieldset': {
                    borderColor: COLORS.primary.main,
                    borderWidth: 2,
                    boxShadow: `0 0 0 3px ${alpha(COLORS.primary.main, 0.1)}`,
                    background: `linear-gradient(90deg, ${alpha(COLORS.primary.main, 0.05)}, transparent)`
                  }
                },
                '& .MuiInputBase-input': {
                  fontSize: '1rem',
                  py: 1.5,
                  '&::placeholder': {
                    color: alpha(COLORS.text.secondary, 0.7),
                    opacity: 1
                  }
                }
              },
              '& .MuiInputLabel-root': {
                color: COLORS.text.secondary,
                fontSize: '1rem',
                fontWeight: 500,
                '&.Mui-focused': {
                  color: COLORS.primary.main,
                  fontWeight: 600
                }
              },
              '@media (max-width: 768px)': {
                mb: 3
              }
            }}
          />

          {/* Remember Me */}
          <Fade in timeout={1000}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  size="small"
                  sx={{
                    color: COLORS.text.secondary,
                    transition: 'all 0.2s ease',
                    '&.Mui-checked': {
                      color: COLORS.primary.main,
                      transform: 'scale(1.1)'
                    },
                    '&:hover': {
                      bgcolor: alpha(COLORS.primary.main, 0.05)
                    }
                  }}
                />
              }
              label="Remember me"
              sx={{
                mb: 3,
                userSelect: 'none',
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.9rem',
                  color: COLORS.text.secondary,
                  fontWeight: 500,
                  transition: 'color 0.2s ease'
                },
                '&:hover .MuiFormControlLabel-label': {
                  color: COLORS.text.primary
                },
                '@media (max-width: 768px)': {
                  mb: 2.5
                }
              }}
            />
          </Fade>

          {/* Login Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !formData.username.trim() || !formData.password.trim()}
            startIcon={loading ? null : <SecurityIcon />}
            sx={{
              ...BUTTON_STYLES.primary,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: `${SIZES.borderRadius.large}px`,
              boxShadow: SIZES.shadow.md,
              position: 'relative',
              overflow: 'hidden',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, ${alpha('#ffffff', 0.2)}, transparent)`,
                opacity: 0,
                transition: 'opacity 0.2s ease',
              },
              '&:hover:not(:disabled)': {
                boxShadow: SIZES.shadow.floating,
                transform: 'translateY(-2px) scale(1.02)',
                '&:before': {
                  opacity: 1
                }
              },
              '&:disabled': {
                bgcolor: COLORS.grey[300],
                color: COLORS.grey[500],
                transform: 'none',
                boxShadow: 'none'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                <InlineSpinner size={20} color={COLORS.text.white} />
                <Typography component="span" sx={{ 
                  fontSize: 'inherit',
                  fontWeight: 'inherit'
                }}>
                  Signing In...
                </Typography>
              </Box>
            ) : (
              <Typography component="span" sx={{ 
                fontSize: 'inherit',
                fontWeight: 'inherit',
                letterSpacing: '0.5px'
              }}>
                Sign In
              </Typography>
            )}
          </Button>
          </Box>
        </Fade>

        {/* Footer */}
        <Fade in timeout={1400}>
          <Box sx={{ 
            textAlign: 'center', 
            mt: 4,
            pt: 3,
            borderTop: `1px solid ${alpha(COLORS.grey[200], 0.4)}`,
            '@media (max-width: 768px)': {
              mt: 3,
              pt: 2.5
            }
          }}>
            <Typography variant="caption" sx={{ 
              color: COLORS.text.muted,
              fontSize: '0.85rem',
              fontWeight: 500,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              '@media (max-width: 768px)': {
                fontSize: '0.8rem'
              }
            }}>
              Configuration Server Dashboard v1.0
            </Typography>
          </Box>
        </Fade>
        </Paper>
      </Box>
    </Fade>
  );
};

export default Login;