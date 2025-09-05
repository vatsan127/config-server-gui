import { useCallback } from 'react';

/**
 * Custom hook that provides comprehensive keyboard shortcuts for text inputs
 * Supports all essential text editing shortcuts across platforms
 */
export const useTextInputKeyboard = (onChange, onEscape, onEnter) => {
  
  const handleKeyDown = useCallback((event) => {
    const input = event.target;
    const isTextInput = ['INPUT', 'TEXTAREA'].includes(input.tagName);
    
    if (!isTextInput) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        if (onEscape) {
          onEscape(input.value, input);
        } else {
          // Default behavior: clear if has content, blur if empty
          if (input.value) {
            onChange?.('');
          } else {
            input.blur();
          }
        }
        break;
      
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter(input.value, input);
        }
        break;
      
      case 'Home':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          input.setSelectionRange(0, 0);
        }
        // Normal Home behavior is handled by browser
        break;
      
      case 'End':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const length = input.value.length;
          input.setSelectionRange(length, length);
        }
        // Normal End behavior is handled by browser
        break;
      
      case 'a':
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+A - select all
          event.preventDefault();
          input.select();
        }
        break;
      
      case 'Backspace':
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+Backspace - delete word
          event.preventDefault();
          const start = input.selectionStart;
          const end = input.selectionEnd;
          const value = input.value;
          
          if (start !== end) {
            // If there's a selection, just delete it
            const newValue = value.slice(0, start) + value.slice(end);
            onChange?.(newValue);
            setTimeout(() => input.setSelectionRange(start, start), 0);
            return;
          }
          
          // Find the start of the current word
          let wordStart = start - 1;
          while (wordStart > 0 && !/\s/.test(value[wordStart - 1])) {
            wordStart--;
          }
          
          const newValue = value.slice(0, wordStart) + value.slice(start);
          onChange?.(newValue);
          
          setTimeout(() => input.setSelectionRange(wordStart, wordStart), 0);
        }
        break;
      
      case 'Delete':
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+Delete - delete word forward
          event.preventDefault();
          const start = input.selectionStart;
          const end = input.selectionEnd;
          const value = input.value;
          
          if (start !== end) {
            // If there's a selection, just delete it
            const newValue = value.slice(0, start) + value.slice(end);
            onChange?.(newValue);
            setTimeout(() => input.setSelectionRange(start, start), 0);
            return;
          }
          
          // Find the end of the current word
          let wordEnd = start;
          while (wordEnd < value.length && !/\s/.test(value[wordEnd])) {
            wordEnd++;
          }
          // Skip whitespace
          while (wordEnd < value.length && /\s/.test(value[wordEnd])) {
            wordEnd++;
          }
          
          const newValue = value.slice(0, start) + value.slice(wordEnd);
          onChange?.(newValue);
          
          setTimeout(() => input.setSelectionRange(start, start), 0);
        }
        break;

      case 'ArrowLeft':
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+Left - move cursor to previous word
          event.preventDefault();
          const start = input.selectionStart;
          const end = input.selectionEnd;
          const value = input.value;
          
          let newPos = start - 1;
          // Skip current word
          while (newPos > 0 && !/\s/.test(value[newPos])) {
            newPos--;
          }
          // Skip whitespace
          while (newPos > 0 && /\s/.test(value[newPos])) {
            newPos--;
          }
          // Go to start of previous word
          while (newPos > 0 && !/\s/.test(value[newPos - 1])) {
            newPos--;
          }
          
          if (event.shiftKey) {
            input.setSelectionRange(newPos, end);
          } else {
            input.setSelectionRange(newPos, newPos);
          }
        }
        break;

      case 'ArrowRight':
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+Right - move cursor to next word
          event.preventDefault();
          const start = input.selectionStart;
          const end = input.selectionEnd;
          const value = input.value;
          
          let newPos = end;
          // Skip current word
          while (newPos < value.length && !/\s/.test(value[newPos])) {
            newPos++;
          }
          // Skip whitespace
          while (newPos < value.length && /\s/.test(value[newPos])) {
            newPos++;
          }
          
          if (event.shiftKey) {
            input.setSelectionRange(start, newPos);
          } else {
            input.setSelectionRange(newPos, newPos);
          }
        }
        break;

      case 'ArrowUp':
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+Up - move to beginning
          event.preventDefault();
          if (event.shiftKey) {
            input.setSelectionRange(0, input.selectionEnd);
          } else {
            input.setSelectionRange(0, 0);
          }
        }
        break;

      case 'ArrowDown':
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+Down - move to end
          event.preventDefault();
          const length = input.value.length;
          if (event.shiftKey) {
            input.setSelectionRange(input.selectionStart, length);
          } else {
            input.setSelectionRange(length, length);
          }
        }
        break;

      case 'x':
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+X - cut (browser handles this, but we ensure it works)
          const start = input.selectionStart;
          const end = input.selectionEnd;
          if (start !== end) {
            const selectedText = input.value.slice(start, end);
            navigator.clipboard?.writeText(selectedText);
            const newValue = input.value.slice(0, start) + input.value.slice(end);
            onChange?.(newValue);
            setTimeout(() => input.setSelectionRange(start, start), 0);
          }
        }
        break;

      case 'v':
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+V - paste (let browser handle, but ensure onChange is called)
          setTimeout(() => {
            if (onChange && input.value !== event.target.defaultValue) {
              onChange(input.value);
            }
          }, 0);
        }
        break;
    }
  }, [onChange, onEscape, onEnter]);

  return { handleKeyDown };
};

/**
 * Hook for dialog-specific keyboard shortcuts - optimized to prevent re-renders
 */
export const useDialogKeyboard = (onClose, onSubmit, onEscape) => {
  const handleKeyDown = useCallback((event) => {
    // Check if we're in a text input
    const isTextInput = ['INPUT', 'TEXTAREA'].includes(event.target.tagName);
    
    switch (event.key) {
      case 'Escape':
        if (!isTextInput || !event.target.value) {
          // Only close dialog if not in a text input, or if text input is empty
          event.preventDefault();
          event.stopPropagation();
          if (onEscape) {
            onEscape();
          } else if (onClose) {
            onClose();
          }
        }
        break;
      
      case 'Enter':
        if (event.ctrlKey || event.metaKey) {
          // Ctrl+Enter to submit
          event.preventDefault();
          event.stopPropagation();
          if (onSubmit) {
            onSubmit();
          }
        }
        break;
    }
  }, [onClose, onSubmit, onEscape]);

  return { handleKeyDown };
};

export default useTextInputKeyboard;