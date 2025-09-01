import { useEffect } from 'react';

/**
 * Custom hook for handling keyboard shortcuts
 * @param {string} key - The key to listen for 
 * @param {Function} callback - Function to call when key is pressed
 * @param {Object} options - Modifier keys {ctrl, meta, alt, shift}
 */
export const useKeyboardShortcut = (key, callback, options = {}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const { ctrl = false, meta = false, alt = false, shift = false } = options;
      
      if (
        e.key === key &&
        (ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey) &&
        (alt ? e.altKey : !e.altKey) &&
        (shift ? e.shiftKey : !e.shiftKey)
      ) {
        e.preventDefault();
        callback(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, options]);
};

/**
 * Hook for universal search functionality (Ctrl/Cmd+K)
 * Automatically focuses the active search input on the page
 */
export const useSearchShortcut = (callback) => {
  const universalSearchHandler = callback || (() => {
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
  });
  
  return useKeyboardShortcut('k', universalSearchHandler, { ctrl: true });
};

/**
 * Hook for universal escape key functionality
 * Automatically blurs any focused search input
 */
export const useEscapeKey = (callback) => {
  const universalEscapeHandler = callback || (() => {
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
  });
  
  return useKeyboardShortcut('Escape', universalEscapeHandler);
};

/**
 * Universal keyboard shortcuts hook
 * Sets up Ctrl+K and Escape shortcuts globally
 */
export const useUniversalKeyboardShortcuts = () => {
  useSearchShortcut();
  useEscapeKey();
};