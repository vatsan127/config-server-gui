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


  async getNamespaceEvents(namespace) {
    try {
      const url = `${API_CONFIG.BASE_URL}/namespace/events`;
      
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
        totalCommits: data.totalCommits || 0,
        commits: data.commits || []
      };
      
    } catch (error) {
      console.error('Error fetching namespace events:', error);
      
      if (error.name === 'AbortError' || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed') ||
          error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT') {
        const friendlyMessage = createConnectionErrorMessage(error, 'fetch namespace events');
        
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

  async getNamespaceNotifications(namespace) {
    try {
      const url = `${API_CONFIG.BASE_URL}/namespace/notify`;
      
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
        notifications: data.notifications || [],
        totalNotifications: data.totalNotifications || 0,
        maxNotifications: data.maxNotifications || 0
      };
      
    } catch (error) {
      console.error('Error fetching namespace notifications:', error);
      
      if (error.name === 'AbortError' || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed') ||
          error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT') {
        const friendlyMessage = createConnectionErrorMessage(error, 'fetch namespace notifications');
        
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

  async retryNotification(namespace, commitId) {
    try {
      const url = `${API_CONFIG.BASE_URL}/namespace/trigger-notify`;
      
      const response = await makeApiRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          namespace: namespace,
          commitid: commitId
        })
      });
      
      await handleApiResponse(response, 'Notification retry triggered successfully');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Error retrying notification:', error);
      
      if (error.name === 'AbortError' || 
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network request failed') ||
          error.code === 'ECONNREFUSED' || 
          error.code === 'ENOTFOUND' || 
          error.code === 'ETIMEDOUT') {
        const friendlyMessage = createConnectionErrorMessage(error, 'retry notification');
        
        if (showNotification) {
          showNotification(friendlyMessage, { 
            variant: 'error',
            preventDuplicate: true,
            autoHideDuration: PERFORMANCE_CONFIG.NOTIFICATION_DURATION.ERROR,
          });
        }
        
        throw new Error(friendlyMessage);
      }
      
      throw error;
    }
  }
};