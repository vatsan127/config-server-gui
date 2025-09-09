import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/optimized.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Patch ResizeObserver to prevent the error from occurring
if (typeof ResizeObserver !== 'undefined') {
  const OriginalResizeObserver = ResizeObserver;
  window.ResizeObserver = class extends OriginalResizeObserver {
    constructor(callback) {
      super((entries, observer) => {
        try {
          callback(entries, observer);
        } catch (error) {
          if (error.message && error.message.includes('ResizeObserver loop')) {
            // Silently ignore ResizeObserver loop errors
            return;
          }
          throw error;
        }
      });
    }
  };
}

// Suppress ResizeObserver errors specifically
const originalConsoleError = console.error;
console.error = function(...args) {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver loop')) {
    return; // Suppress ResizeObserver errors
  }
  originalConsoleError.apply(console, args);
};

// Global error handlers to prevent runtime error alerts
window.addEventListener('error', (event) => {
  // Suppress ResizeObserver errors which are harmless
  if (event.error && event.error.message && 
      (event.error.message.includes('ResizeObserver loop') || 
       event.error.message.includes('ResizeObserver loop completed with undelivered notifications'))) {
    event.preventDefault();
    return;
  }
  console.error('Global error caught:', event.error);
  event.preventDefault(); // Prevent default browser error dialog
});

window.addEventListener('unhandledrejection', (event) => {
  // Suppress ResizeObserver promise rejections
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('ResizeObserver loop') ||
       event.reason.message.includes('ResizeObserver loop completed with undelivered notifications'))) {
    event.preventDefault();
    return;
  }
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent default browser error dialog
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Temporarily disable StrictMode to debug duplicate API calls
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
