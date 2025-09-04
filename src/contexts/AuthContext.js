import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

// Authentication context
const AuthContext = createContext();

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT_START: 'LOGOUT_START',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
  CHECK_AUTH_START: 'CHECK_AUTH_START',
  CHECK_AUTH_SUCCESS: 'CHECK_AUTH_SUCCESS',
  CHECK_AUTH_FAILURE: 'CHECK_AUTH_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  checking: true, // true when initially checking auth status
  error: null,
  loginLoading: false,
  logoutLoading: false
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loginLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loginLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loginLoading: false,
        error: action.payload.error
      };

    case AUTH_ACTIONS.LOGOUT_START:
      return {
        ...state,
        logoutLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGOUT_SUCCESS:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        logoutLoading: false,
        error: null
      };

    case AUTH_ACTIONS.CHECK_AUTH_START:
      return {
        ...state,
        checking: true,
        error: null
      };

    case AUTH_ACTIONS.CHECK_AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: action.payload.authenticated,
        checking: false,
        error: null
      };

    case AUTH_ACTIONS.CHECK_AUTH_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        checking: false,
        error: action.payload.error
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app start
  useEffect(() => {
    const checkInitialAuth = async () => {
      dispatch({ type: AUTH_ACTIONS.CHECK_AUTH_START });
      
      try {
        // First check localStorage for quick initial state
        const localUser = authService.getCurrentUser();
        const isLocallyAuthenticated = authService.isAuthenticated();
        
        if (isLocallyAuthenticated && localUser) {
          // Set initial state from localStorage
          dispatch({
            type: AUTH_ACTIONS.CHECK_AUTH_SUCCESS,
            payload: {
              authenticated: true,
              user: localUser
            }
          });
          
          // Then verify with server in background
          try {
            const serverStatus = await authService.checkAuthStatus();
            dispatch({
              type: AUTH_ACTIONS.CHECK_AUTH_SUCCESS,
              payload: serverStatus
            });
          } catch (error) {
            console.warn('Server auth check failed, using local state');
          }
        } else {
          // No local auth, check server
          const serverStatus = await authService.checkAuthStatus();
          dispatch({
            type: AUTH_ACTIONS.CHECK_AUTH_SUCCESS,
            payload: serverStatus
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({
          type: AUTH_ACTIONS.CHECK_AUTH_FAILURE,
          payload: { error: error.message }
        });
      }
    };

    checkInitialAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const result = await authService.login(credentials);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: result
      });
      return result;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message }
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT_START });
    
    try {
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT_SUCCESS });
    } catch (error) {
      // Even if server logout fails, we still log out locally
      console.error('Logout error:', error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT_SUCCESS });
    }
  };

  // Check auth status
  const checkAuth = async () => {
    dispatch({ type: AUTH_ACTIONS.CHECK_AUTH_START });
    
    try {
      const result = await authService.checkAuthStatus();
      dispatch({
        type: AUTH_ACTIONS.CHECK_AUTH_SUCCESS,
        payload: result
      });
      return result;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.CHECK_AUTH_FAILURE,
        payload: { error: error.message }
      });
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Helper functions
  const isAdmin = () => {
    return authService.isAdmin(state.user);
  };

  const hasNamespaceAccess = (namespace) => {
    return authService.hasNamespaceAccess(namespace, state.user);
  };

  // Context value
  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    checking: state.checking,
    error: state.error,
    loginLoading: state.loginLoading,
    logoutLoading: state.logoutLoading,
    
    // Actions
    login,
    logout,
    checkAuth,
    clearError,
    
    // Helper functions
    isAdmin,
    hasNamespaceAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;