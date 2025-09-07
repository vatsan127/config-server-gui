/**
 * API Request Interceptor for automatic token handling and error management
 */
import { tokenManager, createAuthHeaders } from './authUtils';
import { makeApiRequest } from './apiUtils';

/**
 * Enhanced API request wrapper with automatic token handling
 */
export class ApiRequestInterceptor {
  constructor() {
    this.isRefreshing = false;
    this.refreshPromise = null;
    this.failedQueue = [];
  }

  /**
   * Process failed queue after token refresh
   */
  processQueue(error = null, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  /**
   * Enhanced request method with retry logic and token refresh
   */
  async request(url, options = {}) {
    const token = tokenManager.get();
    
    // Add auth headers if token exists
    if (token && tokenManager.isValid(token)) {
      options.headers = createAuthHeaders(options.headers);
    }

    try {
      const response = await makeApiRequest(url, options);
      
      // Handle successful response
      if (response.ok) {
        return response;
      }
      
      // Handle 401 - Unauthorized (token expired)
      if (response.status === 401 && token) {
        return await this.handleTokenRefresh(url, options);
      }
      
      // Handle other error responses
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      // Network errors or other failures
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      if (error.message?.includes('fetch')) {
        throw new Error('Network error. Please check your connection.');
      }
      
      throw error;
    }
  }

  /**
   * Handle token refresh on 401 errors
   */
  async handleTokenRefresh(originalUrl, originalOptions) {
    if (this.isRefreshing) {
      // If already refreshing, queue this request
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then(() => {
        // Retry with new token
        return this.request(originalUrl, originalOptions);
      });
    }

    this.isRefreshing = true;

    try {
      // Attempt to refresh token (if your backend supports it)
      // For now, just clear invalid token and let user re-authenticate
      tokenManager.remove();
      
      // Process queue with error
      this.processQueue(new Error('Authentication expired. Please log in again.'));
      
      // Return 401 to trigger login flow
      const error = new Error('Authentication expired');
      error.status = 401;
      throw error;
      
    } catch (error) {
      this.processQueue(error);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Convenience methods for common HTTP verbs
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

// Create singleton instance
export const apiInterceptor = new ApiRequestInterceptor();

/**
 * Enhanced makeApiRequest wrapper that uses the interceptor
 */
export const makeAuthenticatedRequest = async (url, options = {}) => {
  return apiInterceptor.request(url, options);
};