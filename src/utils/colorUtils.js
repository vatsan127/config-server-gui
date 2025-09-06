import { COLORS } from '../theme/colors';

/**
 * Generate a consistent color for a namespace based on its name
 * @param {string} namespaceName - The name of the namespace
 * @returns {string} - The hex color code
 */
export const getNamespaceColor = (namespaceName) => {
  if (!namespaceName) return COLORS.accent.blue;
  
  // Enhanced vibrant color palette for better visual distinction
  const namespaceColors = [
    '#3B82F6', // Bright Blue
    '#10B981', // Emerald Green
    '#8B5CF6', // Violet Purple
    '#F59E0B', // Amber Orange
    '#EC4899', // Rose Pink
    '#14B8A6', // Teal
    '#F97316', // Vivid Orange
    '#8B5A2B', // Brown
    '#6366F1', // Indigo
    '#84CC16', // Lime Green
    '#06B6D4', // Sky Blue
    '#D946EF', // Fuchsia
    '#EF4444', // Red
    '#22C55E', // Green
    '#A855F7', // Purple
    '#F472B6', // Hot Pink
    '#0EA5E9', // Blue
    '#16A34A', // Dark Green
    '#DC2626', // Dark Red
    '#7C3AED', // Deep Purple
  ];

  // Improved hash function for better color distribution
  let hash = 0;
  for (let i = 0; i < namespaceName.length; i++) {
    const char = namespaceName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Add secondary hash for better distribution
  let secondaryHash = 0;
  for (let i = namespaceName.length - 1; i >= 0; i--) {
    const char = namespaceName.charCodeAt(i);
    secondaryHash = ((secondaryHash << 3) - secondaryHash) + char;
  }
  
  // Combine hashes for better color selection
  const combinedHash = Math.abs(hash + secondaryHash);
  const colorIndex = combinedHash % namespaceColors.length;
  const selectedColor = namespaceColors[colorIndex];
  
  return selectedColor;
};

/**
 * Get a color for a file based on its extension
 * @param {string} fileName - The name of the file
 * @param {boolean} isFolder - Whether this is a folder
 * @returns {string} - The hex color code
 */
export const getFileTypeColor = (fileName, isFolder = false) => {
  if (isFolder) {
    return COLORS.accent.blue;
  }
  
  if (!fileName) return COLORS.accent.blue;
  
  // Since files will always be yml, return the yml color
  return COLORS.accent.purple;
};

/**
 * Get appropriate file icon based on file type
 * @param {string} fileName - The name of the file
 * @param {boolean} isFolder - Whether this is a folder
 * @returns {string} - The icon name for Material-UI
 */
export const getFileIcon = (fileName, isFolder = false) => {
  if (isFolder) {
    return 'Folder';
  }
  
  if (!fileName) return 'Description';
  
  const extension = fileName.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'json':
      return 'DataObject';
    case 'yaml':
    case 'yml':
      return 'Settings';
    case 'xml':
      return 'Code';
    case 'properties':
    case 'config':
    case 'conf':
      return 'Tune';
    case 'md':
    case 'markdown':
    case 'readme':
      return 'Article';
    case 'txt':
      return 'TextFields';
    case 'log':
      return 'Receipt';
    case 'csv':
      return 'TableChart';
    case 'html':
    case 'htm':
      return 'Web';
    case 'css':
      return 'Palette';
    case 'js':
    case 'javascript':
      return 'Javascript';
    default:
      return 'Description';
  }
};

/**
 * Generate a set of distinct colors for multiple namespaces
 * @param {string[]} namespaces - Array of namespace names
 * @returns {Object} - Object mapping namespace names to colors
 */
export const generateNamespaceColorMap = (namespaces) => {
  const colorMap = {};
  namespaces.forEach(namespace => {
    colorMap[namespace] = getNamespaceColor(namespace);
  });
  return colorMap;
};