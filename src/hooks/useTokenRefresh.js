/**
 * Custom hook for automatic token refresh and session management
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { tokenManager, userManager } from '../utils/authUtils';
import { API_CONFIG } from '../constants';
import { makeApiRequest } from '../utils/apiUtils';

export const useTokenRefresh = (onAuthExpired) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Configuration
  const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry
  const ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity
  const CHECK_INTERVAL = 60 * 1000; // Check every minute

  /**
   * Extract token expiration time
   */
  const getTokenExpiry = useCallback((token) => {
    try {
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }, []);

  /**
   * Check if token needs refresh
   */
  const shouldRefreshToken = useCallback((token) => {
    const expiry = getTokenExpiry(token);
    if (!expiry) return false;
    
    const now = Date.now();
    const timeUntilExpiry = expiry - now;
    
    return timeUntilExpiry <= TOKEN_REFRESH_BUFFER;
  }, [getTokenExpiry, TOKEN_REFRESH_BUFFER]);

  /**
   * Attempt to refresh the token
   */
  const refreshToken = useCallback(async () => {
    if (isRefreshing) return null;

    const currentToken = tokenManager.get();
    if (!currentToken) return null;

    try {
      setIsRefreshing(true);

      // Only attempt refresh if your backend supports it
      // For now, we'll just verify the current token
      const response = await makeApiRequest(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.VERIFY}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      if (response.ok) {
        // Token is still valid
        return currentToken;
      } else {
        // Token is invalid
        tokenManager.remove();
        userManager.remove();
        onAuthExpired?.();
        return null;
      }
    } catch (error) {
      console.warn('Token refresh failed:', error);
      
      // On network error, don't immediately invalidate
      if (error.name === 'AbortError' || error.message?.includes('fetch')) {
        return currentToken; // Keep current token, user can retry
      }
      
      // On other errors, invalidate token
      tokenManager.remove();
      userManager.remove();
      onAuthExpired?.();
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, onAuthExpired]);

  /**
   * Update last activity timestamp
   */
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  /**
   * Check for inactivity timeout
   */
  const checkInactivity = useCallback(() => {
    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;
    
    if (timeSinceActivity >= ACTIVITY_TIMEOUT) {
      console.log('Session expired due to inactivity');
      tokenManager.remove();
      userManager.remove();
      onAuthExpired?.();
      return true;
    }
    
    return false;
  }, [ACTIVITY_TIMEOUT, onAuthExpired]);

  /**
   * Periodic token and activity check
   */
  const performPeriodicCheck = useCallback(async () => {
    // Check for inactivity first
    if (checkInactivity()) {
      return;
    }

    const token = tokenManager.get();
    if (!token) return;

    // Check if token needs refresh
    if (shouldRefreshToken(token)) {
      console.log('Token approaching expiry, attempting refresh...');
      await refreshToken();
    }
  }, [checkInactivity, shouldRefreshToken, refreshToken]);

  /**
   * Setup activity listeners
   */
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => updateActivity();
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [updateActivity]);

  /**
   * Setup periodic checks
   */
  useEffect(() => {
    const interval = setInterval(performPeriodicCheck, CHECK_INTERVAL);
    
    return () => {
      clearInterval(interval);
    };
  }, [performPeriodicCheck, CHECK_INTERVAL]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    isRefreshing,
    refreshToken,
    updateActivity,
    shouldRefreshToken: (token) => shouldRefreshToken(token || tokenManager.get())
  };
};