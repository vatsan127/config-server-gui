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
      FETCH: '/config/fetch'
    }
  }
};

// Mock data
export const MOCK_DATA = {
  NAMESPACES: [
    "production",
    "staging", 
    "development",
    "test"
  ],
  FILES: [
    "rt/",
    "rtsample3",
    "sample1",
    "sample2",
    "sample3"
  ]
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
    MOCK_DATA_WARNING: 'Using mock data - config server at localhost:8080 is not accessible',
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