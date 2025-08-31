import { API_CONFIG, MOCK_DATA, UI_CONSTANTS } from '../constants';

// Global notification function (will be set by components)
let showNotification = null;

export const setNotificationHandler = (handler) => {
  showNotification = handler;
};

const getStatusCodeVariant = (statusCode) => {
  if (statusCode >= 200 && statusCode < 300) {
    return 'success';
  } else {
    return 'error';
  }
};

const handleApiResponse = async (response, successMessage = null) => {
  if (showNotification) {
    const variant = getStatusCodeVariant(response.status);
    let message = '';
    
    try {
      // Try to extract message from response JSON
      const responseClone = response.clone();
      const jsonData = await responseClone.json();
      
      // Check various possible message fields that servers might use
      if (jsonData) {
        message = jsonData.message || jsonData.error || jsonData.details || jsonData.description || '';
      }
    } catch (jsonError) {
      // JSON parsing failed - try to get response as text
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
    
    // Always show notification for error responses, even if no server message
    if (response.status >= 400) {
      const finalMessage = message || response.statusText || 'Request failed';
      showNotification(finalMessage, { 
        variant,
        preventDuplicate: true,
        autoHideDuration: 6000,
        key: `error-${Date.now()}-${Math.random()}`
      });
    } else if (successMessage || message) {
      // Show success notifications only if explicitly requested or server provides message
      const finalMessage = successMessage || message;
      showNotification(finalMessage, { 
        variant,
        preventDuplicate: true,
        autoHideDuration: 4000,
        key: `success-${Date.now()}-${Math.random()}`
      });
    }
  }
  return response;
};

export const apiService = {
  async getNamespaces() {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NAMESPACES.LIST}`;
      console.log('Attempting to fetch from:', url);
      
      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Handle response status and extract message
      await handleApiResponse(response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Successfully fetched namespaces:', data);
      return data;
      
    } catch (error) {
      console.error('Error fetching namespaces:', error);
      
      // Return mock data as fallback when network fails  
      console.log('Using mock namespaces:', MOCK_DATA.NAMESPACES);
      return MOCK_DATA.NAMESPACES;
    }
  },

  async createNamespace(namespace) {
    try {
      console.log('Creating namespace:', namespace);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NAMESPACES.CREATE}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ namespace }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Handle response status and extract message
      await handleApiResponse(response, UI_CONSTANTS.MESSAGES.NAMESPACE_CREATED(namespace));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Successfully created namespace:', namespace);
      return true;
      
    } catch (error) {
      console.error('Error creating namespace:', error);
      throw error;
    }
  }
};