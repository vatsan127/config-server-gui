# Project Architecture

## Folder Structure

```
src/
├── components/           # React components
│   ├── common/          # Reusable components
│   │   ├── ErrorBoundary.js
│   │   ├── EmptyState.js
│   │   └── NamespaceCard.js
│   ├── Dashboard.js     # Main dashboard component
│   └── Layout.js        # App layout with navbar
├── hooks/               # Custom React hooks
│   ├── useNamespaces.js # Namespace data management
│   ├── useSearch.js     # Search functionality
│   ├── useDialog.js     # Dialog state management
│   └── index.js         # Hook exports
├── services/            # API and external services
│   └── api.js           # API service layer
├── utils/               # Utility functions
│   ├── validation.js    # Validation utilities
│   └── index.js         # Utility exports
├── constants/           # Application constants
│   └── index.js         # All constants
├── theme/               # MUI theme configuration
│   ├── colors.js        # Color palette
│   └── theme.js         # MUI theme
├── App.js               # Main app component
└── index.js             # App entry point
```

## Key Optimizations Applied

### 1. Custom Hooks for State Management
- **useNamespaces**: Manages namespace data, loading states, and CRUD operations
- **useSearch**: Handles search functionality with keyboard shortcuts
- **useDialog**: Generic dialog state management with form handling

### 2. Separation of Concerns
- **Components**: Pure presentation logic
- **Hooks**: Business logic and state management
- **Services**: API communication
- **Utils**: Pure utility functions
- **Constants**: Centralized configuration

### 3. Error Handling
- **ErrorBoundary**: Catches React errors and provides fallback UI
- **Proper error states**: Loading, error, and empty states handled consistently

### 4. Performance Optimizations
- **React.memo**: Applied to components that don't need frequent re-renders
- **useMemo**: Applied for expensive calculations (filtering)
- **useCallback**: Applied for stable function references

### 5. Type Safety & Validation
- **Input validation**: Centralized validation logic
- **Prop validation**: Consistent prop handling
- **Error boundaries**: Graceful error handling

### 6. Best Practices
- **Single Responsibility**: Each file has a clear, single purpose
- **Composition over inheritance**: Using hooks for shared logic
- **Centralized constants**: All magic strings and config in one place
- **Consistent naming**: Clear, descriptive names throughout

## Component Architecture

### Dashboard Component
- Uses `useNamespaces` for data management
- Uses `useDialog` for create namespace modal
- Receives search query from parent via props
- Handles user interactions and delegates business logic to hooks

### Layout Component
- Manages global navigation and search bar
- Includes ErrorBoundary for child components
- Uses constants for UI text and configuration
- Handles keyboard shortcuts for search

### Custom Hooks
- **Stateful logic extraction**: Business logic separated from UI
- **Reusability**: Hooks can be shared across components
- **Testing**: Business logic can be tested independently

## Data Flow

1. **App.js**: Top-level state management (search query)
2. **Layout.js**: Global UI elements and error boundaries
3. **Dashboard.js**: Main content with namespace management
4. **Custom Hooks**: Encapsulated business logic
5. **Services**: External API communication

## Future Improvements

1. **TypeScript**: Add type safety throughout the application
2. **Testing**: Add unit tests for hooks and components
3. **Caching**: Implement data caching for better performance
4. **Routing**: Add proper routing for namespace details
5. **State Management**: Consider Redux or Zustand for complex state