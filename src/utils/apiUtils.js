import { API_CONFIG } from '../constants';

/**
 * Creates an AbortController with timeout
 * @param {number} timeout - Timeout in milliseconds
 * @returns {AbortController}
 */
export const createTimeoutController = (timeout = API_CONFIG.TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  // Store timeoutId on controller for cleanup
  controller.timeoutId = timeoutId;
  
  return controller;
};

/**
 * Clears the timeout for an AbortController
 * @param {AbortController} controller 
 */
export const clearControllerTimeout = (controller) => {
  if (controller.timeoutId) {
    clearTimeout(controller.timeoutId);
  }
};

/**
 * Makes an API request with automatic timeout handling
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Custom timeout (optional)
 * @returns {Promise<Response>}
 */
export const makeApiRequest = async (url, options = {}, timeout) => {
  const controller = createTimeoutController(timeout);
  
  console.log('🌐 makeApiRequest - URL:', url);
  console.log('🌐 makeApiRequest - Options:', options);
  console.log('🌐 makeApiRequest - Credentials will be included');
  
  try {
    const response = await fetch(url, {
      credentials: 'include', // Include cookies for authentication
      ...options,
      signal: controller.signal
    });
    
    console.log('🌐 makeApiRequest - Response received:', response.status, response.statusText);
    console.log('🌐 makeApiRequest - Response headers:', Object.fromEntries(response.headers.entries()));
    
    clearControllerTimeout(controller);
    return response;
  } catch (error) {
    console.error('🌐 makeApiRequest - Error occurred:', error);
    clearControllerTimeout(controller);
    throw error;
  }
};

/**
 * Extracts error message from API response
 * @param {Response} response 
 * @returns {Promise<string>}
 */
export const extractResponseMessage = async (response) => {
  let message = '';
  
  try {
    const responseClone = response.clone();
    const jsonData = await responseClone.json();
    
    if (jsonData) {
      message = jsonData.message || jsonData.error || jsonData.details || jsonData.description || '';
    }
  } catch (jsonError) {
    try {
      const textClone = response.clone();
      const textData = await textClone.text();
      if (textData && textData.trim()) {
        message = textData;
      }
    } catch (textError) {
      console.log('Could not parse response as JSON or text');
    }
  }
  
  return message;
};

/**
 * Creates a user-friendly error message based on the error type
 * @param {Error} error - The caught error
 * @param {string} operation - Description of what operation failed
 * @returns {string} - User-friendly error message
 */
export const createConnectionErrorMessage = (error, operation = 'request') => {
  console.log('Error details:', error);
  
  // Network/Connection errors
  if (error.name === 'AbortError') {
    return `Connection timeout: The server at ${API_CONFIG.BASE_URL} is not responding. Please check if the config server is running and accessible.`;
  }
  
  if (error.message?.includes('Failed to fetch') || error.message?.includes('Network request failed')) {
    return `Connection failed: Cannot reach the config server at ${API_CONFIG.BASE_URL}. Please verify the server is running and the URL is correct.`;
  }
  
  if (error.message?.includes('ERR_CONNECTION_REFUSED')) {
    return `Connection refused: The config server at ${API_CONFIG.BASE_URL} is not accepting connections. Please start the server and try again.`;
  }
  
  if (error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
    return `DNS error: Cannot resolve the hostname for ${API_CONFIG.BASE_URL}. Please check the server URL configuration.`;
  }
  
  if (error.code === 'ECONNREFUSED') {
    return `Connection refused: The config server is not running on ${API_CONFIG.BASE_URL}. Please start the server and try again.`;
  }
  
  if (error.code === 'ENOTFOUND') {
    return `Server not found: Cannot connect to ${API_CONFIG.BASE_URL}. Please verify the server URL and network connection.`;
  }
  
  if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
    return `Connection timeout: The config server at ${API_CONFIG.BASE_URL} is not responding. Please check the server status.`;
  }
  
  // HTTP errors
  if (error.message?.includes('HTTP error!')) {
    const statusMatch = error.message.match(/status: (\d+)/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1]);
      switch (status) {
        case 500:
          return `Server error: The config server encountered an internal error. Please check the server logs.`;
        case 503:
          return `Service unavailable: The config server is temporarily unavailable. Please try again later.`;
        case 404:
          return `Endpoint not found: The requested API endpoint is not available on the server.`;
        default:
          return `Server returned error ${status}. Please check the server configuration.`;
      }
    }
  }
  
  // Generic fallback
  return `Failed to ${operation}: ${error.message || 'Unknown error occurred'}. Please check your connection to the config server.`;
};