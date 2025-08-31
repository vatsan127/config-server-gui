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
 * Checks if two arrays are equal (used for mock data detection)
 * @param {Array} arr1 
 * @param {Array} arr2 
 * @returns {boolean}
 */
export const arraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  return JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort());
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