import { API_CONFIG } from '../constants';
import { makeApiRequest } from '../utils/apiUtils';

// Authentication service for handling login, logout, and auth status
export const authService = {
  // Login with username and password
  async login(credentials) {
    try {
      const url = `${API_CONFIG.BASE_URL}/auth/api/login`;
      console.log('Attempting login to:', url);
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include' // Include cookies for session management
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Login failed. Please check your credentials.';
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Login successful:', { ...data, user: data.user ? { ...data.user, password: undefined } : undefined });
      
      if (!data.success) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }
      
      // Store user data in localStorage for persistence
      if (data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        localStorage.setItem('auth_authenticated', 'true');
      }
      
      return {
        success: true,
        user: data.user
      };
      
    } catch (error) {
      console.error('Login error:', error);
      // Clear any existing auth data on login failure
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_authenticated');
      throw error;
    }
  },

  // Check current authentication status
  async checkAuthStatus() {
    try {
      const url = `${API_CONFIG.BASE_URL}/auth/api/status`;
      console.log('Checking auth status at:', url);
      
      const response = await makeApiRequest(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies for session management
      });
      
      if (!response.ok) {
        // If status check fails, user is not authenticated
        this.clearAuthData();
        return { authenticated: false, user: null };
      }
      
      const data = await response.json();
      console.log('Auth status check result:', { ...data, user: data.user ? { ...data.user, password: undefined } : undefined });
      
      if (data.authenticated && data.user) {
        // Update localStorage with latest user data
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        localStorage.setItem('auth_authenticated', 'true');
        return {
          authenticated: true,
          user: data.user
        };
      } else {
        this.clearAuthData();
        return { authenticated: false, user: null };
      }
      
    } catch (error) {
      console.error('Auth status check error:', error);
      // On error, assume not authenticated
      this.clearAuthData();
      return { authenticated: false, user: null };
    }
  },

  // Logout user
  async logout() {
    try {
      const url = `${API_CONFIG.BASE_URL}/auth/api/logout`;
      console.log('Attempting logout at:', url);
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies for session management
      });
      
      // Clear local auth data regardless of server response
      this.clearAuthData();
      
      if (!response.ok) {
        console.warn('Logout request failed, but local data cleared');
        return { success: true, message: 'Logged out locally' };
      }
      
      const data = await response.json();
      console.log('Logout successful:', data);
      
      return {
        success: true,
        message: data.message || 'Logout successful'
      };
      
    } catch (error) {
      console.error('Logout error:', error);
      // Always clear local data even if server request fails
      this.clearAuthData();
      return { success: true, message: 'Logged out locally' };
    }
  },

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('auth_user');
      const isAuthenticated = localStorage.getItem('auth_authenticated') === 'true';
      
      if (!isAuthenticated || !userStr) {
        return null;
      }
      
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error getting current user:', error);
      this.clearAuthData();
      return null;
    }
  },

  // Check if user is authenticated (from localStorage)
  isAuthenticated() {
    return localStorage.getItem('auth_authenticated') === 'true' && this.getCurrentUser() !== null;
  },

  // Clear authentication data
  clearAuthData() {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_authenticated');
  },

  // Check if user has admin privileges
  isAdmin(user = null) {
    const currentUser = user || this.getCurrentUser();
    return currentUser?.isAdmin === true || currentUser?.role === 'admin';
  },

  // Check if user has access to a specific namespace
  hasNamespaceAccess(namespace, user = null) {
    const currentUser = user || this.getCurrentUser();
    
    // Admin users have access to all namespaces
    if (this.isAdmin(currentUser)) {
      return true;
    }
    
    // Check if user has specific namespace access
    const allowedNamespaces = currentUser?.allowedNamespaces;
    if (Array.isArray(allowedNamespaces)) {
      return allowedNamespaces.includes(namespace);
    }
    
    // If no specific restrictions, assume access is allowed
    return true;
  }
};

export default authService;