import { useState, useMemo, useCallback } from 'react';
import { useSearchShortcut } from './useKeyboardShortcut';
import { DOM_IDS } from '../constants';

/**
 * Custom hook for managing search functionality
 */
export const useSearch = (items = [], searchKeys = []) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Global keyboard shortcut handler
  const focusSearch = useCallback(() => {
    const searchInput = document.getElementById(DOM_IDS.GLOBAL_SEARCH);
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  useSearchShortcut(focusSearch);

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