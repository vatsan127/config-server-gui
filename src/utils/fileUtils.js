import React from 'react';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Code as CodeIcon,
  DataObject as JsonIcon,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
  Article as ArticleIcon,
  TextFields as TextFieldsIcon,
  Receipt as ReceiptIcon,
  TableChart as TableChartIcon,
  Web as WebIcon,
  Palette as PaletteIcon,
  Javascript as JavascriptIcon
} from '@mui/icons-material';
import { COLORS } from '../theme/colors';

/**
 * Get the appropriate file icon component for a file
 * @param {string} fileName - The name of the file
 * @param {boolean} isFolder - Whether this is a folder
 * @returns {React.Component} - Material-UI icon component
 */
export const getFileIconComponent = (fileName, isFolder = false) => {
  if (isFolder) {
    return <FolderIcon sx={{ color: COLORS.primary.main }} />;
  }
  
  if (!fileName) return <FileIcon sx={{ color: COLORS.text.secondary }} />;
  
  const extension = fileName.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'javascript':
      return <JavascriptIcon sx={{ color: COLORS.accent.blue }} />;
    case 'json':
      return <JsonIcon sx={{ color: COLORS.accent.orange }} />;
    case 'yml':
    case 'yaml':
      return <SettingsIcon sx={{ color: COLORS.accent.green }} />;
    case 'xml':
      return <CodeIcon sx={{ color: COLORS.accent.purple }} />;
    case 'properties':
    case 'config':
    case 'conf':
      return <TuneIcon sx={{ color: COLORS.accent.teal }} />;
    case 'md':
    case 'markdown':
    case 'readme':
      return <ArticleIcon sx={{ color: COLORS.accent.green }} />;
    case 'txt':
      return <TextFieldsIcon sx={{ color: COLORS.text.secondary }} />;
    case 'log':
      return <ReceiptIcon sx={{ color: COLORS.text.secondary }} />;
    case 'csv':
      return <TableChartIcon sx={{ color: COLORS.accent.green }} />;
    case 'html':
    case 'htm':
      return <WebIcon sx={{ color: COLORS.accent.orange }} />;
    case 'css':
      return <PaletteIcon sx={{ color: COLORS.accent.pink }} />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
    case 'gif':
    case 'webp':
      return <ImageIcon sx={{ color: COLORS.accent.pink }} />;
    default:
      return <FileIcon sx={{ color: COLORS.text.secondary }} />;
  }
};

/**
 * Get the icon name string for a file (for non-React contexts)
 * @param {string} fileName - The name of the file
 * @param {boolean} isFolder - Whether this is a folder
 * @returns {string} - Material-UI icon name
 */
export const getFileIconName = (fileName, isFolder = false) => {
  if (isFolder) return 'Folder';
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
 * Get file type color for consistent styling
 * @param {string} fileName - The name of the file
 * @param {boolean} isFolder - Whether this is a folder
 * @returns {string} - Hex color code
 */
export const getFileTypeColor = (fileName, isFolder = false) => {
  if (isFolder) return COLORS.accent.blue;
  if (!fileName) return COLORS.accent.blue;
  
  const extension = fileName.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'javascript':
      return COLORS.accent.blue;
    case 'json':
      return COLORS.accent.orange;
    case 'yml':
    case 'yaml':
      return COLORS.accent.green;
    case 'xml':
      return COLORS.accent.purple;
    case 'properties':
    case 'config':
    case 'conf':
      return COLORS.accent.teal;
    case 'md':
    case 'markdown':
    case 'readme':
      return COLORS.accent.green;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
    case 'gif':
    case 'webp':
      return COLORS.accent.pink;
    case 'css':
      return COLORS.accent.pink;
    case 'html':
    case 'htm':
      return COLORS.accent.orange;
    default:
      return COLORS.accent.purple;
  }
};

/**
 * Check if a file is an image based on its extension
 * @param {string} fileName - The name of the file
 * @returns {boolean} - True if file is an image
 */
export const isImageFile = (fileName) => {
  if (!fileName) return false;
  const extension = fileName.toLowerCase().split('.').pop();
  const imageExtensions = ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'bmp', 'ico'];
  return imageExtensions.includes(extension);
};

/**
 * Check if a file is a configuration file
 * @param {string} fileName - The name of the file
 * @returns {boolean} - True if file is a configuration file
 */
export const isConfigFile = (fileName) => {
  if (!fileName) return false;
  const extension = fileName.toLowerCase().split('.').pop();
  const configExtensions = ['yml', 'yaml', 'json', 'xml', 'properties', 'config', 'conf'];
  return configExtensions.includes(extension);
};

/**
 * Get environment type from namespace name
 * @param {string} namespace - The namespace name
 * @returns {Object} - Environment type with label and color
 */
export const getEnvironmentType = (namespace) => {
  if (!namespace) return { label: 'OTHER', color: COLORS.grey[500] };
  
  const lower = namespace.toLowerCase();
  if (lower.includes('prod')) return { label: 'PROD', color: COLORS.error.border };
  if (lower.includes('staging') || lower.includes('stage')) return { label: 'STAGE', color: COLORS.warning.border };
  if (lower.includes('dev') || lower.includes('development')) return { label: 'DEV', color: COLORS.accent.blue };
  if (lower.includes('test')) return { label: 'TEST', color: COLORS.accent.purple };
  return { label: 'OTHER', color: COLORS.grey[500] };
};