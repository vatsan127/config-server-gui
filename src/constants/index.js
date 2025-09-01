// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/config-server',
  TIMEOUT: 5000,
  ENDPOINTS: {
    NAMESPACES: {
      LIST: '/namespace/list',
      CREATE: '/namespace/create',
      FILES: '/namespace/files'
    },
    CONFIG: {
      FETCH: '/config/fetch',
      UPDATE: '/config/update'
    }
  }
};


// UI Constants
export const UI_CONSTANTS = {
  SEARCH: {
    PLACEHOLDER: 'Search namespaces... (Ctrl+K)',
    KEYBOARD_SHORTCUT: 'Ctrl+K'
  },
  DIALOG: {
    CREATE_NAMESPACE: {
      TITLE: 'Create New Namespace',
      PLACEHOLDER: 'e.g., production-v1'
    }
  },
  MESSAGES: {
    EMPTY_NAMESPACES: 'No namespaces found',
    EMPTY_NAMESPACES_DESC: 'Get started by creating your first namespace',
    NO_SEARCH_RESULTS: 'No matching namespaces',
    NAMESPACE_CREATED: (name) => `Namespace "${name}" created successfully`
  }
};

// Validation Rules
export const VALIDATION = {
  NAMESPACE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9\-_]+$/,
    ERROR_MESSAGES: {
      REQUIRED: 'Namespace name is required',
      INVALID_FORMAT: 'Only letters, numbers, hyphens, and underscores are allowed',
      TOO_SHORT: 'Namespace name must be at least 1 character',
      TOO_LONG: 'Namespace name must be less than 50 characters'
    }
  }
};

// Performance & UI Constants
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300,
  API_TIMEOUT: 5000,
  NOTIFICATION_DURATION: {
    SUCCESS: 4000,
    ERROR: 6000
  }
};

// DOM Element IDs
export const DOM_IDS = {
  GLOBAL_SEARCH: 'global-search'
};