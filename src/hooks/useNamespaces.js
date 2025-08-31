import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { MOCK_DATA } from '../constants';
import { arraysEqual } from '../utils/validation';

/**
 * Custom hook for managing namespace data and operations
 */
export const useNamespaces = () => {
  const [namespaces, setNamespaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  const fetchNamespaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.getNamespaces();
      setNamespaces(data);
      
      // Check if we got mock data (simple heuristic)
      const isMockData = arraysEqual(data, MOCK_DATA.NAMESPACES);
      setUsingMockData(isMockData);
      
    } catch (err) {
      setError('Failed to load namespaces. Please ensure the config server is running.');
      setUsingMockData(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const createNamespace = useCallback(async (namespaceName) => {
    if (!namespaceName?.trim()) {
      throw new Error('Namespace name is required');
    }
    
    try {
      await apiService.createNamespace(namespaceName.trim());
      // Refresh the namespace list after creation
      await fetchNamespaces();
      return true;
    } catch (error) {
      console.error('Failed to create namespace:', error);
      throw error;
    }
  }, [fetchNamespaces]);

  useEffect(() => {
    fetchNamespaces();
  }, [fetchNamespaces]);

  return {
    namespaces,
    loading,
    error,
    usingMockData,
    fetchNamespaces,
    createNamespace
  };
};