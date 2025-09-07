import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '../services/api';
import { tokenManager, userManager, debounce } from '../utils/authUtils';
import { useTokenRefresh } from '../hooks/useTokenRefresh';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Handle authentication expiry
  const handleAuthExpired = useCallback(() => {
    setUser(null);
    setAuthError('Your session has expired. Please log in again.');
  }, []);

  // Setup token refresh hook
  const { isRefreshing, updateActivity } = useTokenRefresh(handleAuthExpired);

  // Optimized authentication check with debouncing
  const debouncedAuthCheck = useMemo(
    () => debounce(async () => {
      try {
        setAuthError(null);
        
        // Quick local check first
        if (apiService.isAuthenticated()) {
          const storedUser = userManager.get();
          if (storedUser) {
            setUser(storedUser);
            setIsLoading(false);
            
            // Verify token in background without blocking UI
            apiService.verifyToken().then(isValid => {
              if (!isValid) {
                setUser(null);
                setAuthError('Session expired. Please log in again.');
              }
            }).catch(error => {
              console.warn('Background token verification failed:', error);
            });
            return;
          }
        }
        
        // If no local auth, try server verification
        const isValid = await apiService.verifyToken();
        if (isValid) {
          const storedUser = userManager.get();
          setUser(storedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setUser(null);
        // Only show error for network issues, not auth failures
        if (error.message?.includes('Network') || error.name === 'AbortError') {
          setAuthError('Network error. Please check your connection.');
        }
      } finally {
        setIsLoading(false);
      }
    }, 100), // 100ms debounce
    []
  );

  // Check authentication on mount and after potential redirects
  useEffect(() => {
    const checkAuthAfterRedirect = async () => {
      try {
        console.log('🔍 Checking authentication status after potential redirect...');
        
        // Use /verify endpoint to check if backend authentication was successful
        const isAuthenticated = await apiService.verifyToken();
        
        if (isAuthenticated) {
          console.log('✅ Authentication verified via /verify endpoint');
          
          // Create user data since backend authentication was successful
          const userData = {
            isAuthenticated: true,
            loginTime: Date.now()
          };
          
          setUser(userData);
          userManager.set(userData);
          setIsLoading(false);
        } else {
          console.log('❌ No valid authentication found');
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('🚨 Auth verification error:', error);
        setUser(null);
        setIsLoading(false);
      }
    };
    
    checkAuthAfterRedirect();
  }, []);

  // Optimized login with better error handling
  const login = useCallback(async (credentials) => {
    try {
      setAuthError(null);
      setIsLoading(true);
      
      const response = await apiService.login(credentials);
      const userData = {
        username: credentials.username,
        isAuthenticated: true,
        loginTime: Date.now(),
        ...response.user
      };
      
      setUser(userData);
      userManager.set(userData);
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      setAuthError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Optimized logout
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw logout errors - always complete logout locally
    } finally {
      setUser(null);
      setAuthError(null);
      setIsLoading(false);
    }
  }, []);

  // Force refresh authentication state
  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    await debouncedAuthCheck();
  }, [debouncedAuthCheck]);

  // Clear any authentication errors
  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    login,
    logout,
    refreshAuth,
    clearError,
    updateActivity,
    isAuthenticated: !!user,
    isLoading: isLoading || isRefreshing,
    authError
  }), [user, login, logout, refreshAuth, clearError, updateActivity, isLoading, isRefreshing, authError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};