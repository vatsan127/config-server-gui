import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

/**
 * Custom hook for managing namespace data and operations
 */
export const useNamespaces = () => {
  const [namespaces, setNamespaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNamespaces = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.getNamespaces();
      
      // Only update state if request wasn't aborted
      if (!signal?.aborted) {
        setNamespaces(data);
      }
      
    } catch (err) {
      if (!signal?.aborted) {
        setError('Failed to load namespaces. Please ensure the config server is running.');
        setNamespaces([]);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const createNamespace = useCallback(async (namespaceName) => {
    if (!namespaceName?.trim()) {
      throw new Error('Namespace name is required');
    }
    
    try {
      await apiService.createNamespace(namespaceName.trim());
      // Refresh the namespace list after creation
      const data = await apiService.getNamespaces();
      setNamespaces(data);
      return true;
    } catch (error) {
      console.error('Failed to create namespace:', error);
      throw error;
    }
  }, []);

  const deleteNamespace = useCallback(async (namespaceName) => {
    if (!namespaceName?.trim()) {
      throw new Error('Namespace name is required');
    }
    
    try {
      await apiService.deleteNamespace(namespaceName.trim());
      // Refresh the namespace list after deletion
      const data = await apiService.getNamespaces();
      setNamespaces(data);
      return true;
    } catch (error) {
      console.error('Failed to delete namespace:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    fetchNamespaces(abortController.signal);
    
    return () => {
      abortController.abort();
    };
  }, [fetchNamespaces]);

  return {
    namespaces,
    loading,
    error,
    fetchNamespaces,
    createNamespace,
    deleteNamespace
  };
};