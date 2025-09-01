import { VALIDATION } from '../constants';

/**
 * Validates a namespace name
 * @param {string} name - The namespace name to validate
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateNamespace = (name) => {
  const { MIN_LENGTH, MAX_LENGTH, PATTERN, ERROR_MESSAGES } = VALIDATION.NAMESPACE;

  if (!name || !name.trim()) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED };
  }

  const trimmed = name.trim();

  if (trimmed.length < MIN_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.TOO_SHORT };
  }

  if (trimmed.length > MAX_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.TOO_LONG };
  }

  if (!PATTERN.test(trimmed)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_FORMAT };
  }

  return { isValid: true, error: null };
};


/**
 * Debounce function for search input
 * @param {Function} func 
 * @param {number} delay 
 * @returns {Function}
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Normalizes a file path to ensure it starts and ends with '/'
 * @param {string} path - The path to normalize
 * @returns {string} - The normalized path (always starts and ends with '/')
 */
export const normalizePath = (path) => {
  if (!path || path === '/') return '/';
  
  // Ensure path starts with '/'
  let normalized = path.startsWith('/') ? path : '/' + path;
  
  // Ensure path ends with '/' (unless it's just '/')
  if (normalized !== '/' && !normalized.endsWith('/')) {
    normalized = normalized + '/';
  }
  
  return normalized;
};