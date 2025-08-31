import { useState, useMemo, useEffect } from 'react';

/**
 * Custom hook for managing search functionality
 */
export const useSearch = (items = [], searchKeys = []) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Global keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    return items.filter(item => {
      if (typeof item === 'string') {
        return item.toLowerCase().includes(searchQuery.toLowerCase());
      }

      // If item is an object, search in specified keys
      if (searchKeys.length > 0) {
        return searchKeys.some(key => {
          const value = item[key];
          return value && value.toString().toLowerCase().includes(searchQuery.toLowerCase());
        });
      }

      // Default: search in all string values of the object
      return Object.values(item).some(value => 
        value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [items, searchQuery, searchKeys]);

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    hasResults: filteredItems.length > 0,
    isSearching: searchQuery.trim().length > 0
  };
};