import { useEffect, useCallback, useMemo } from 'react';

/**
 * Custom hook for handling keyboard shortcuts
 * @param {string} key - The key to listen for 
 * @param {Function} callback - Function to call when key is pressed
 * @param {Object} options - Modifier keys {ctrl, meta, alt, shift}
 */
export const useKeyboardShortcut = (key, callback, options = {}) => {
  const memoizedOptions = useMemo(() => options, [JSON.stringify(options)]);
  const stableCallback = useCallback(callback, [callback]);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      const { ctrl = false, meta = false, alt = false, shift = false } = memoizedOptions;
      
      if (
        e.key === key &&
        (ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey) &&
        (alt ? e.altKey : !e.altKey) &&
        (shift ? e.shiftKey : !e.shiftKey)
      ) {
        e.preventDefault();
        stableCallback(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, stableCallback, memoizedOptions]);
};

/**
 * Hook for universal search functionality (Ctrl/Cmd+K)
 * Automatically focuses the active search input on the page
 */
const CTRL_OPTIONS = { ctrl: true };

export const useSearchShortcut = (callback) => {
  const universalSearchHandler = useCallback(callback || (() => {
    // Find any search input on the page and focus it
    const searchInputs = document.querySelectorAll('input[type="text"], input[placeholder*="search" i], input[id*="search" i], input[class*="search" i]');
    if (searchInputs.length > 0) {
      // Focus the first visible search input
      for (const input of searchInputs) {
        if (input.offsetParent !== null) { // Check if element is visible
          input.focus();
          break;
        }
      }
    }
  }), [callback]);
  
  return useKeyboardShortcut('k', universalSearchHandler, CTRL_OPTIONS);
};

/**
 * Hook for universal escape key functionality
 * Automatically blurs any focused search input
 */
const EMPTY_OPTIONS = {};

export const useEscapeKey = (callback) => {
  const universalEscapeHandler = useCallback(callback || (() => {
    const activeElement = document.activeElement;
    if (activeElement && (
      activeElement.type === 'text' || 
      activeElement.type === 'search' ||
      activeElement.placeholder?.toLowerCase().includes('search') ||
      activeElement.id?.toLowerCase().includes('search') ||
      activeElement.className?.toLowerCase().includes('search')
    )) {
      activeElement.blur();
    }
  }), [callback]);
  
  return useKeyboardShortcut('Escape', universalEscapeHandler, EMPTY_OPTIONS);
};

/**
 * Universal keyboard shortcuts hook
 * Sets up Ctrl+K and Escape shortcuts globally
 */
export const useUniversalKeyboardShortcuts = () => {
  useSearchShortcut();
  useEscapeKey();
};