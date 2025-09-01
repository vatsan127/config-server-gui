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
    console.log('🔄 fetchNamespaces called', { 
      timestamp: new Date().toISOString(), 
      aborted: signal?.aborted,
      stack: new Error().stack.split('\n').slice(0, 5).join('\n')
    });
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Making API call to getNamespaces');
      const data = await apiService.getNamespaces();
      
      // Only update state if request wasn't aborted
      if (!signal?.aborted) {
        console.log('✅ Setting namespaces data', data);
        setNamespaces(data);
      } else {
        console.log('❌ Request was aborted, not setting data');
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
      await fetchNamespaces();
      return true;
    } catch (error) {
      console.error('Failed to create namespace:', error);
      throw error;
    }
  }, [fetchNamespaces]);

  useEffect(() => {
    console.log('🎯 useNamespaces useEffect triggered', {
      timestamp: new Date().toISOString(),
      fetchNamespaces: !!fetchNamespaces
    });
    
    const abortController = new AbortController();
    fetchNamespaces(abortController.signal);
    
    return () => {
      console.log('🧹 useNamespaces cleanup called');
      abortController.abort();
    };
  }, [fetchNamespaces]);

  return {
    namespaces,
    loading,
    error,
    fetchNamespaces,
    createNamespace
  };
};