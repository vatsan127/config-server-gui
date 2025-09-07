/**
 * Authentication utilities for token management and API requests
 */

const TOKEN_KEY = 'config_server_token';
const USER_KEY = 'configserver_user';

/**
 * Token management utilities
 */
export const tokenManager = {
  get: () => localStorage.getItem(TOKEN_KEY),
  
  set: (token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  
  remove: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  
  isValid: (token) => {
    if (!token) return false;
    
    try {
      // Basic JWT validation - check if it has proper structure
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp ? payload.exp > now : true;
    } catch {
      return false;
    }
  }
};

/**
 * Create authenticated request headers
 */
export const createAuthHeaders = (additionalHeaders = {}) => {
  const token = tokenManager.get();
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('📋 Request headers:', headers);
  
  return headers;
};

/**
 * User data management
 */
export const userManager = {
  get: () => {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },
  
  set: (user) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },
  
  remove: () => {
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Enhanced error handler for authentication errors
 */
export const handleAuthError = (error) => {
  // Common authentication error patterns
  const authErrors = {
    401: 'Invalid credentials or session expired',
    403: 'Access denied',
    429: 'Too many login attempts. Please try again later.',
    500: 'Server error. Please try again.',
    'network': 'Network error. Please check your connection.'
  };
  
  if (error.status && authErrors[error.status]) {
    return authErrors[error.status];
  }
  
  if (error.message?.includes('fetch')) {
    return authErrors.network;
  }
  
  return error.message || 'Authentication failed';
};

/**
 * Debounced function utility
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};