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
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearControllerTimeout(controller);
    return response;
  } catch (error) {
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