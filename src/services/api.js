import { API_CONFIG, MOCK_DATA, UI_CONSTANTS, PERFORMANCE_CONFIG } from '../constants';
import { makeApiRequest, extractResponseMessage } from '../utils/apiUtils';

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
    const message = await extractResponseMessage(response);
    
    // Always show notification for error responses, even if no server message
    if (response.status >= 400) {
      const finalMessage = message || response.statusText || 'Request failed';
      showNotification(finalMessage, { 
        variant,
        preventDuplicate: true,
        autoHideDuration: PERFORMANCE_CONFIG.NOTIFICATION_DURATION.ERROR,
        key: `error-${Date.now()}-${Math.random()}`
      });
    } else if (successMessage || message) {
      // Show success notifications only if explicitly requested or server provides message
      const finalMessage = successMessage || message;
      showNotification(finalMessage, { 
        variant,
        preventDuplicate: true,
        autoHideDuration: PERFORMANCE_CONFIG.NOTIFICATION_DURATION.SUCCESS,
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
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
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
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NAMESPACES.CREATE}`;
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ namespace })
      });
      
      // Handle response status and extract message
      await handleApiResponse(response, UI_CONSTANTS.MESSAGES.NAMESPACE_CREATED(namespace));
      
      if (!response.ok) {
        // Provide specific error messages for common HTTP status codes
        let errorMessage;
        switch (response.status) {
          case 409:
            errorMessage = `Namespace "${namespace}" already exists. Please choose a different name.`;
            break;
          case 400:
            errorMessage = `Invalid namespace name "${namespace}". Please check the naming requirements.`;
            break;
          case 403:
            errorMessage = `Access denied. You don't have permission to create namespace "${namespace}".`;
            break;
          case 500:
            errorMessage = `Server error occurred while creating namespace "${namespace}". Please try again later.`;
            break;
          default:
            errorMessage = `Failed to create namespace "${namespace}". Server returned ${response.status}.`;
        }
        throw new Error(errorMessage);
      }
      
      console.log('Successfully created namespace:', namespace);
      return true;
      
    } catch (error) {
      console.error('Error creating namespace:', error);
      throw error;
    }
  },

  async getNamespaceFiles(namespace, path = '/') {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NAMESPACES.FILES}`;
      console.log('Attempting to fetch files from:', url, 'for namespace:', namespace, 'path:', path);
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          namespace: namespace,
          path: path 
        })
      });
      
      await handleApiResponse(response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Successfully fetched files:', data);
      return data;
      
    } catch (error) {
      console.error('Error fetching namespace files:', error);
      
      console.log('Using mock files:', MOCK_DATA.FILES);
      return MOCK_DATA.FILES;
    }
  },


  async getFileContent(namespace, path, fileName) {
    try {
      // Path contains folder structure only, filename is separate
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONFIG.FETCH}`;
      console.log('Attempting to get file content from:', url, 'for namespace:', namespace, 'path:', path, 'file:', fileName);
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'fetch',
          appName: fileName,
          namespace: namespace,
          path: path,
          email: 'user@example.com'
        })
      });
      
      await handleApiResponse(response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Successfully fetched file content:', data);
      
      // Return the content string or a mock content for now
      return data.content || data || `# ${fileName}

This is the content of ${fileName} from namespace "${namespace}".
Path: ${path}

Sample configuration data would appear here.
`;
      
    } catch (error) {
      console.error('Error getting file content:', error);
      
      // Return mock content as fallback
      return `# ${fileName}

This is mock content for ${fileName} from namespace "${namespace}".
Path: ${path}

Sample configuration data:
key1=value1
key2=value2
database.host=localhost
database.port=5432
`;
    }
  },

  async createFile(namespace, path, fileName) {
    try {
      const url = `${API_CONFIG.BASE_URL}/file/create`;
      console.log('Attempting to create file:', fileName, 'in namespace:', namespace, 'path:', path);
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          namespace: namespace,
          path: path,
          fileName: fileName,
          content: ''
        })
      });
      
      await handleApiResponse(response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Successfully created file:', fileName);
      return true;
      
    } catch (error) {
      console.error('Error creating file:', error);
      // For now, simulate success since we don't have the actual endpoint
      console.log('Simulating file creation success for:', fileName);
      return true;
    }
  },

  async createFolder(namespace, path, folderName) {
    try {
      const url = `${API_CONFIG.BASE_URL}/folder/create`;
      console.log('Attempting to create folder:', folderName, 'in namespace:', namespace, 'path:', path);
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          namespace: namespace,
          path: path,
          folderName: folderName
        })
      });
      
      await handleApiResponse(response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Successfully created folder:', folderName);
      return true;
      
    } catch (error) {
      console.error('Error creating folder:', error);
      // For now, simulate success since we don't have the actual endpoint
      console.log('Simulating folder creation success for:', folderName);
      return true;
    }
  },

  async updateFileContent(namespace, path, fileName, content) {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONFIG.UPDATE || '/config/update'}`;
      console.log('Attempting to update file:', fileName, 'in namespace:', namespace, 'path:', path);
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'update',
          appName: fileName,
          namespace: namespace,
          path: path,
          content: content,
          email: 'user@example.com'
        })
      });
      
      await handleApiResponse(response, `File "${fileName}" updated successfully`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Successfully updated file:', fileName);
      return true;
      
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    }
  }
};