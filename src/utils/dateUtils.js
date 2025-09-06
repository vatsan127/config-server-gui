/**
 * Centralized date utilities for consistent date formatting across the application
 */

/**
 * Format a date string into a human-readable relative time
 * @param {string|Date} dateString - The date to format
 * @returns {string} - Formatted relative time (e.g., "2h ago", "Just now")
 */
export const formatLastModified = (dateString) => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

/**
 * Format file size from bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "1.2 KB", "3.4 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  if (typeof bytes !== 'number' || bytes < 0) return 'Unknown';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = Math.max(0, Math.min(i, sizes.length - 1));
  
  return parseFloat((bytes / Math.pow(k, size)).toFixed(2)) + ' ' + sizes[size];
};

/**
 * Check if a date is within a specific time range
 * @param {string|Date} dateString - The date to check
 * @param {number} hours - Hours to check within
 * @returns {boolean} - True if date is within the specified hours
 */
export const isWithinHours = (dateString, hours) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  
  const now = new Date();
  const diff = now - date;
  const targetHours = hours * 60 * 60 * 1000;
  
  return diff <= targetHours;
};