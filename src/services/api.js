import { API_CONFIG, UI_CONSTANTS, PERFORMANCE_CONFIG } from '../constants';
import { makeApiRequest, extractResponseMessage, createConnectionErrorMessage } from '../utils/apiUtils';
import { tokenManager, createAuthHeaders, handleAuthError, userManager } from '../utils/authUtils';

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

// Enhanced authentication service with better error handling and performance
const authService = {
  async login(credentials) {
    if (!credentials?.username || !credentials?.password) {
      throw new Error('Username and password are required');
    }

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`;
      console.log('🔐 Login Request:', { url, credentials: { username: credentials.username, password: '[HIDDEN]' } });
      
      // Create form data for Spring Security
      const formData = new URLSearchParams();
      formData.append('username', credentials.username.trim());
      formData.append('password', credentials.password);
      
      console.log('📤 Request payload (form):', `username=${credentials.username.trim()}&password=[HIDDEN]`);
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        timeout: API_CONFIG.TIMEOUT
      });
      
      console.log('📥 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Login failed:', errorData);
        throw new Error(errorData.message || handleAuthError({ status: response.status }));
      }
      
      const data = await response.json();
      console.log('✅ Login success:', { ...data, token: data.token ? '[PRESENT]' : '[MISSING]' });
      
      // Validate response structure
      if (!data.token) {
        throw new Error('Invalid server response: missing token');
      }
      
      // Store token and user data
      tokenManager.set(data.token);
      if (data.user) {
        userManager.set(data.user);
      }
      
      return data;
    } catch (error) {
      console.error('🚨 Login error:', error.message);
      
      // Clean up any partial state
      tokenManager.remove();
      
      // Check for network/CORS issues
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check if the server is running.');
      }
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        throw new Error('Cannot connect to server. Please check if the server is running on http://localhost:8080');
      }
      
      throw new Error(handleAuthError(error));
    }
  },

  async logout() {
    const token = tokenManager.get();
    
    try {
      if (token && tokenManager.isValid(token)) {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT}`;
        
        // Don't await this - logout should be fast even if server fails
        makeApiRequest(url, {
          method: 'POST',
          headers: createAuthHeaders(),
          timeout: 3000 // Shorter timeout for logout
        }).catch(error => {
          console.warn('Logout request failed:', error);
        });
      }
    } finally {
      // Always clear local state regardless of server response
      tokenManager.remove();
      userManager.remove();
    }
  },

  async verifyToken() {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.VERIFY}`;
      console.log('🔍 Verifying authentication with:', url);
      
      const response = await makeApiRequest(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session-based auth
        timeout: 5000
      });
      
      console.log('📥 Verify response status:', response.status, response.statusText);
      
      if (response.ok) {
        // Try to extract user info from response if available
        try {
          const data = await response.json();
          console.log('✅ Verification successful:', data);
          
          // Store user data if provided by server
          if (data.user) {
            userManager.set(data.user);
          }
          
          return true;
        } catch (jsonError) {
          // If no JSON response, just return true for successful status
          console.log('✅ Verification successful (no JSON response)');
          return true;
        }
      } else {
        console.log('❌ Verification failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('🚨 Verification error:', error);
      
      // Network error or server down
      if (error.name === 'AbortError' || error.message?.includes('fetch')) {
        console.warn('Token verification failed due to network error:', error);
        return false;
      }
      
      // Other errors indicate invalid authentication
      return false;
    }
  },

  // Check if user is authenticated without server round-trip
  isAuthenticated() {
    const token = tokenManager.get();
    const user = userManager.get();
    return !!(token && user && tokenManager.isValid(token));
  }
};

export const apiService = {
  // Expose auth methods
  ...authService,
  async getNamespaces() {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NAMESPACES.LIST}`;
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: createAuthHeaders()
      });
      
      // Handle response status and extract message
      await handleApiResponse(response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error fetching namespaces:', error);
      
      // Only show connection errors, not HTTP errors (which are already handled by handleApiResponse)
      if (error.name === 'AbortError' || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed') ||
          error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT') {
        const friendlyMessage = createConnectionErrorMessage(error, 'fetch namespaces');
        
        if (showNotification) {
          showNotification(friendlyMessage, { 
            variant: 'error',
            preventDuplicate: true,
            autoHideDuration: PERFORMANCE_CONFIG.NOTIFICATION_DURATION.ERROR,
            key: `connection-error-${Date.now()}`
          });
        }
        
        throw new Error(friendlyMessage);
      }
      
      // For HTTP errors, just re-throw without additional notifications
      throw error;
    }
  },

  async createNamespace(namespace) {
    try {
      
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
        // Don't show additional error - handleApiResponse already handled it
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
      
    } catch (error) {
      console.error('Error creating namespace:', error);
      
      // Only show connection errors, not HTTP errors (which are already handled by handleApiResponse)
      if (error.name === 'AbortError' || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed') ||
          error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT') {
        const friendlyMessage = createConnectionErrorMessage(error, 'create namespace');
        
        if (showNotification) {
          showNotification(friendlyMessage, { 
            variant: 'error',
            preventDuplicate: true,
            autoHideDuration: PERFORMANCE_CONFIG.NOTIFICATION_DURATION.ERROR,
            key: `connection-error-${Date.now()}`
          });
        }
        
        throw new Error(friendlyMessage);
      }
      
      // For HTTP errors, just re-throw without additional notifications
      // The error message from handleApiResponse is already shown
      throw error;
    }
  },

  async getNamespaceFiles(namespace, path = '/') {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NAMESPACES.FILES}`;
      
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
      return data;
      
    } catch (error) {
      console.error('Error fetching namespace files:', error);
      
      // Only show connection errors, not HTTP errors (which are already handled by handleApiResponse)
      if (error.name === 'AbortError' || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed') ||
          error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT') {
        const friendlyMessage = createConnectionErrorMessage(error, 'fetch files');
        
        if (showNotification) {
          showNotification(friendlyMessage, { 
            variant: 'error',
            preventDuplicate: true,
            autoHideDuration: PERFORMANCE_CONFIG.NOTIFICATION_DURATION.ERROR,
            key: `connection-error-${Date.now()}`
          });
        }
        
        throw new Error(friendlyMessage);
      }
      
      // For HTTP errors, just re-throw without additional notifications
      throw error;
    }
  },


  async getFileContent(namespace, path, fileName) {
    try {
      // Path contains folder structure only, filename is separate
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONFIG.FETCH}`;
      
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
      
      // Return both content and commitId for update operations
      return {
        content: data.content || data || `# ${fileName}`,
        commitId: data.commitId
      };

      
    } catch (error) {
      console.error('Error getting file content:', error);
      
      // Only show connection errors, not HTTP errors (which are already handled by handleApiResponse)
      if (error.name === 'AbortError' || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed') ||
          error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT') {
        const friendlyMessage = createConnectionErrorMessage(error, 'fetch file content');
        
        if (showNotification) {
          showNotification(friendlyMessage, { 
            variant: 'error',
            preventDuplicate: true,
            autoHideDuration: PERFORMANCE_CONFIG.NOTIFICATION_DURATION.ERROR,
            key: `connection-error-${Date.now()}`
          });
        }
        
        throw new Error(friendlyMessage);
      }
      
      // For HTTP errors, just re-throw without additional notifications
      throw error;
    }
  },

  async createFile(namespace, path, fileName) {
    try {
      const url = `${API_CONFIG.BASE_URL}/file/create`;
      
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
      
      return true;
      
    } catch (error) {
      console.error('Error creating file:', error);
      const friendlyMessage = createConnectionErrorMessage(error, 'create file');
      throw new Error(friendlyMessage);
    }
  },

  async createConfigFile(namespace, path, fileName, email = 'user@example.com') {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONFIG.CREATE}`;
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'create',
          appName: fileName,
          namespace: namespace,
          path: path,
          email: email
        })
      });
      
      await handleApiResponse(response, `Config file "${fileName}" created successfully`);
      
      if (!response.ok) {
        // Don't show additional error - handleApiResponse already handled it
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
      
    } catch (error) {
      console.error('Error creating config file:', error);
      
      // Only show connection errors, not HTTP errors (which are already handled by handleApiResponse)
      if (error.name === 'AbortError' || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed') ||
          error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT') {
        const friendlyMessage = createConnectionErrorMessage(error, 'create config file');
        
        if (showNotification) {
          showNotification(friendlyMessage, { 
            variant: 'error',
            preventDuplicate: true,
            autoHideDuration: PERFORMANCE_CONFIG.NOTIFICATION_DURATION.ERROR,
            key: `connection-error-${Date.now()}`
          });
        }
        
        throw new Error(friendlyMessage);
      }
      
      // For HTTP errors, just re-throw without additional notifications
      // The error message from handleApiResponse is already shown
      throw error;
    }
  },

  async createFolder(namespace, path, folderName) {
    try {
      const url = `${API_CONFIG.BASE_URL}/folder/create`;
      
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
      
      return true;
      
    } catch (error) {
      console.error('Error creating folder:', error);
      const friendlyMessage = createConnectionErrorMessage(error, 'create folder');
      throw new Error(friendlyMessage);
    }
  },

  async updateFileContent(namespace, path, fileName, content, commitId, message) {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONFIG.UPDATE}`;
      
      const requestBody = {
        action: 'update',
        appName: fileName,
        namespace: namespace,
        path: path,
        content: content,
        commitId: commitId,
        message: message,
        email: 'user@example.com'
      };
      
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      // Handle response for both success and error cases
      await handleApiResponse(response, `File "${fileName}" updated successfully`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Return the new commitId from the update response
      // Check different possible field names for commitId
      const newCommitId = responseData.commitId || responseData.commit_id || responseData.id;
      
      return {
        success: true,
        commitId: newCommitId
      };
      
    } catch (error) {
      console.error('Error updating file:', error);
      
      // Only show connection errors, not HTTP errors (which are already handled by handleApiResponse)
      if (error.name === 'AbortError' || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed') ||
          error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT') {
        const friendlyMessage = createConnectionErrorMessage(error, 'update file');
        
        if (showNotification) {
          showNotification(friendlyMessage, { 
            variant: 'error',
            preventDuplicate: true,
            autoHideDuration: PERFORMANCE_CONFIG.NOTIFICATION_DURATION.ERROR,
            key: `connection-error-${Date.now()}`
          });
        }
        
        throw new Error(friendlyMessage);
      }
      
      // For HTTP errors, just re-throw without additional notifications
      // The error message from handleApiResponse is already shown
      throw error;
    }
  },

  async getFileHistory(namespace, path, fileName, email = 'user@example.com') {
    try {
      const url = `${API_CONFIG.BASE_URL}/config/history`;
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'history',
          appName: fileName,
          namespace: namespace,
          path: path,
          email: email
        })
      });
      
      await handleApiResponse(response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        filePath: data.filePath,
        commits: data.commits || []
      };
      
    } catch (error) {
      console.error('Error fetching file history:', error);
      
      // Only show connection errors, not HTTP errors (which are already handled by handleApiResponse)
      if (error.name === 'AbortError' || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed') ||
          error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT') {
        const friendlyMessage = createConnectionErrorMessage(error, 'fetch file history');
        
        if (showNotification) {
          showNotification(friendlyMessage, { 
            variant: 'error',
            preventDuplicate: true,
            autoHideDuration: PERFORMANCE_CONFIG.NOTIFICATION_DURATION.ERROR,
            key: `connection-error-${Date.now()}`
          });
        }
        
        throw new Error(friendlyMessage);
      }
      
      // For HTTP errors, just re-throw without additional notifications
      throw error;
    }
  },

  async getCommitChanges(namespace, path, fileName, commitId, email = 'user@example.com') {
    try {
      const url = `${API_CONFIG.BASE_URL}/config/changes`;
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'changes',
          appName: fileName,
          namespace: namespace,
          path: path,
          email: email,
          commitId: commitId
        })
      });
      
      await handleApiResponse(response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        commitId: data.commitId,
        message: data.commitMessage,
        author: data.author,
        commitTime: data.commitTime,
        changes: data.changes || ''
      };
      
    } catch (error) {
      console.error('Error fetching commit changes:', error);
      
      // Only show connection errors, not HTTP errors (which are already handled by handleApiResponse)
      if (error.name === 'AbortError' || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed') ||
          error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT') {
        const friendlyMessage = createConnectionErrorMessage(error, 'fetch commit changes');
        
        if (showNotification) {
          showNotification(friendlyMessage, { 
            variant: 'error',
            preventDuplicate: true,
            autoHideDuration: PERFORMANCE_CONFIG.NOTIFICATION_DURATION.ERROR,
            key: `connection-error-${Date.now()}`
          });
        }
        
        throw new Error(friendlyMessage);
      }
      
      // For HTTP errors, just re-throw without additional notifications
      throw error;
    }
  },

  async deleteNamespace(namespace) {
    try {
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NAMESPACES.DELETE}`;
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ namespace })
      });
      
      // Handle response status and extract message
      await handleApiResponse(response, UI_CONSTANTS.MESSAGES.NAMESPACE_DELETED(namespace));
      
      if (!response.ok) {
        // Don't show additional error - handleApiResponse already handled it
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
      
    } catch (error) {
      console.error('Error deleting namespace:', error);
      
      // Only show connection errors, not HTTP errors (which are already handled by handleApiResponse)
      if (error.name === 'AbortError' || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed') ||
          error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT') {
        const friendlyMessage = createConnectionErrorMessage(error, 'delete namespace');
        
        if (showNotification) {
          showNotification(friendlyMessage, { 
            variant: 'error',
            preventDuplicate: true,
            autoHideDuration: PERFORMANCE_CONFIG.NOTIFICATION_DURATION.ERROR,
            key: `connection-error-${Date.now()}`
          });
        }
        
        throw new Error(friendlyMessage);
      }
      
      // For HTTP errors, just re-throw without additional notifications
      // The error message from handleApiResponse is already shown
      throw error;
    }
  },

  async deleteFile(namespace, path, fileName, message, email = 'user@example.com') {
    try {
      const url = `${API_CONFIG.BASE_URL}/config/delete`;
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'delete',
          appName: fileName,
          namespace: namespace,
          path: path,
          email: email,
          message: message
        })
      });
      
      await handleApiResponse(response, `File "${fileName}" deleted successfully`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data;
      
    } catch (error) {
      console.error('Error deleting file:', error);
      
      // Only show connection errors, not HTTP errors (which are already handled by handleApiResponse)
      if (error.name === 'AbortError' || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed') ||
          error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT') {
        const friendlyMessage = createConnectionErrorMessage(error, 'delete file');
        
        if (showNotification) {
          showNotification(friendlyMessage, { 
            variant: 'error',
            preventDuplicate: true,
            autoHideDuration: PERFORMANCE_CONFIG.NOTIFICATION_DURATION.ERROR,
            key: `connection-error-${Date.now()}`
          });
        }
        
        throw new Error(friendlyMessage);
      }
      
      // For HTTP errors, just re-throw without additional notifications
      throw error;
    }
  },

  // Vault API functions
  async getVaultSecrets(namespace) {
    try {
      const url = `${API_CONFIG.BASE_URL}/vault/get`;
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          namespace: namespace
        })
      });
      
      await handleApiResponse(response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error fetching vault secrets:', error);
      
      if (error.name === 'AbortError' || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed') ||
          error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT') {
        const friendlyMessage = createConnectionErrorMessage(error, 'fetch vault secrets');
        
        if (showNotification) {
          showNotification(friendlyMessage, { 
            variant: 'error',
            preventDuplicate: true,
            autoHideDuration: PERFORMANCE_CONFIG.NOTIFICATION_DURATION.ERROR,
            key: `connection-error-${Date.now()}`
          });
        }
        
        throw new Error(friendlyMessage);
      }
      
      throw error;
    }
  },

  async updateVaultSecrets(namespace, email, commitMessage, secrets) {
    try {
      const url = `${API_CONFIG.BASE_URL}/vault/update`;
      
      const requestBody = {
        namespace: namespace,
        email: email,
        commitMessage: commitMessage,
        ...secrets
      };
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      await handleApiResponse(response, `Vault secrets updated successfully`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error updating vault secrets:', error);
      
      if (error.name === 'AbortError' || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed') ||
          error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT') {
        const friendlyMessage = createConnectionErrorMessage(error, 'update vault secrets');
        
        if (showNotification) {
          showNotification(friendlyMessage, { 
            variant: 'error',
            preventDuplicate: true,
            autoHideDuration: PERFORMANCE_CONFIG.NOTIFICATION_DURATION.ERROR,
            key: `connection-error-${Date.now()}`
          });
        }
        
        throw new Error(friendlyMessage);
      }
      
      throw error;
    }
  },

  async getVaultHistory(namespace) {
    try {
      const url = `${API_CONFIG.BASE_URL}/vault/history`;
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          namespace: namespace
        })
      });
      
      await handleApiResponse(response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        namespace: data.namespace,
        vaultFile: data.vaultFile,
        commits: data.commits || [],
        totalCommits: data.totalCommits || 0
      };
      
    } catch (error) {
      console.error('Error fetching vault history:', error);
      
      if (error.name === 'AbortError' || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed') ||
          error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT') {
        const friendlyMessage = createConnectionErrorMessage(error, 'fetch vault history');
        
        if (showNotification) {
          showNotification(friendlyMessage, { 
            variant: 'error',
            preventDuplicate: true,
            autoHideDuration: PERFORMANCE_CONFIG.NOTIFICATION_DURATION.ERROR,
            key: `connection-error-${Date.now()}`
          });
        }
        
        throw new Error(friendlyMessage);
      }
      
      throw error;
    }
  },

  async getVaultChanges(namespace, commitId) {
    try {
      const url = `${API_CONFIG.BASE_URL}/vault/changes`;
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          namespace: namespace,
          commitId: commitId
        })
      });
      
      await handleApiResponse(response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        commitId: data.commitId,
        commitMessage: data.commitMessage,
        author: data.author,
        commitTime: data.commitTime,
        changes: data.changes || ''
      };
      
    } catch (error) {
      console.error('Error fetching vault changes:', error);
      
      if (error.name === 'AbortError' || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed') ||
          error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT') {
        const friendlyMessage = createConnectionErrorMessage(error, 'fetch vault changes');
        
        if (showNotification) {
          showNotification(friendlyMessage, { 
            variant: 'error',
            preventDuplicate: true,
            autoHideDuration: PERFORMANCE_CONFIG.NOTIFICATION_DURATION.ERROR,
            key: `connection-error-${Date.now()}`
          });
        }
        
        throw new Error(friendlyMessage);
      }
      
      throw error;
    }
  }
};