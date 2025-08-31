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
 * Hook specifically for search functionality (Ctrl/Cmd+K)
 */
export const useSearchShortcut = (callback) => {
  return useKeyboardShortcut('k', callback, { ctrl: true });
};