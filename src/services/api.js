import { API_CONFIG, UI_CONSTANTS, PERFORMANCE_CONFIG } from '../constants';
import { makeApiRequest, extractResponseMessage, createConnectionErrorMessage } from '../utils/apiUtils';

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
        // Don't show additional error - handleApiResponse already handled it
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('Successfully created namespace:', namespace);
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
      const friendlyMessage = createConnectionErrorMessage(error, 'create file');
      throw new Error(friendlyMessage);
    }
  },

  async createConfigFile(namespace, path, fileName, email = 'user@example.com') {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONFIG.CREATE}`;
      console.log('Attempting to create config file:', fileName, 'in namespace:', namespace, 'path:', path);
      
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
      
      console.log('Successfully created config file:', fileName);
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
      const friendlyMessage = createConnectionErrorMessage(error, 'create folder');
      throw new Error(friendlyMessage);
    }
  },

  async updateFileContent(namespace, path, fileName, content, commitId, message) {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONFIG.UPDATE}`;
      console.log('Attempting to update file:', fileName, 'in namespace:', namespace, 'path:', path);
      
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
      
      console.log('Update request body:', JSON.stringify(requestBody, null, 2));
      
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
      console.log('Full update response:', responseData);
      console.log('Successfully updated file:', fileName, 'New commitId:', responseData.commitId);
      
      // Return the new commitId from the update response
      // Check different possible field names for commitId
      const newCommitId = responseData.commitId || responseData.commit_id || responseData.id;
      console.log('Extracted commitId:', newCommitId);
      
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
      console.log('Attempting to fetch file history for:', fileName, 'in namespace:', namespace, 'path:', path);
      
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
      console.log('Successfully fetched file history:', data);
      
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
      console.log('Attempting to fetch commit changes for:', fileName, 'commitId:', commitId);
      
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
      console.log('Successfully fetched commit changes:', data);
      
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

  async deleteFile(namespace, path, fileName, message, email = 'user@example.com') {
    try {
      const url = `${API_CONFIG.BASE_URL}/config/delete`;
      console.log('Attempting to delete file:', fileName, 'in namespace:', namespace, 'path:', path);
      
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
      console.log('Successfully deleted file:', fileName);
      
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
  }
};