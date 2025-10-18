/**
 * Line-scatter plot properties and configuration utilities
 */

import { LineScatterPlotProperties, LINE_SCATTER_SUB_TYPE_CONFIGS } from './types';

/**
 * Get default plot properties for line-scatter plots
 */
export const getDefaultLineScatterPlotProperties = (): LineScatterPlotProperties => {
  return {
    showMarkers: true,
    showLines: true,
    markerSize: 8,
    lineWidth: 2,
    lineStyle: 'solid',
    markerSymbol: 'circle',
    markerColor: '#1f77b4',
    lineColor: '#1f77b4',
    opacity: 1.0
  };
};

/**
 * Get plot properties based on sub-type
 */
export const getLineScatterPlotPropertiesForSubType = (subType: string): LineScatterPlotProperties => {
  const defaultProps = getDefaultLineScatterPlotProperties();
  const subTypeConfig = LINE_SCATTER_SUB_TYPE_CONFIGS[subType];
  
  if (!subTypeConfig) {
    return defaultProps;
  }
  
  return {
    ...defaultProps,
    showMarkers: subTypeConfig.showMarkers,
    showLines: subTypeConfig.showLines,
    markerSize: subTypeConfig.defaultMarkerSize,
    lineWidth: subTypeConfig.defaultLineWidth,
    lineStyle: subTypeConfig.lineStyle
  };
};

/**
 * Apply plot properties to a trace
 */
export const applyLineScatterPlotProperties = (
  trace: any,
  properties: LineScatterPlotProperties
): any => {
  const updatedTrace = { ...trace };
  
  // Apply marker properties
  if (properties.showMarkers && updatedTrace.marker) {
    updatedTrace.marker = {
      ...updatedTrace.marker,
      size: properties.markerSize,
      color: properties.markerColor,
      symbol: properties.markerSymbol,
      opacity: properties.opacity
    };
  }
  
  // Apply line properties
  if (properties.showLines && updatedTrace.line) {
    updatedTrace.line = {
      ...updatedTrace.line,
      width: properties.lineWidth,
      color: properties.lineColor,
      opacity: properties.opacity
    };
  }
  
  // Update mode based on showMarkers and showLines
  if (properties.showMarkers && properties.showLines) {
    updatedTrace.mode = 'lines+markers';
  } else if (properties.showMarkers) {
    updatedTrace.mode = 'markers';
  } else if (properties.showLines) {
    updatedTrace.mode = 'lines';
  }
  
  return updatedTrace;
};

/**
 * Get color palette for line-scatter plots
 */
export const getLineScatterColorPalette = (): string[] => {
  return [
    '#1f77b4', // Blue
    '#ff7f0e', // Orange
    '#2ca02c', // Green
    '#d62728', // Red
    '#9467bd', // Purple
    '#8c564b', // Brown
    '#e377c2', // Pink
    '#7f7f7f', // Gray
    '#bcbd22', // Olive
    '#17becf'  // Cyan
  ];
};

/**
 * Get symbol palette for line-scatter plots
 */
export const getLineScatterSymbolPalette = (): string[] => {
  return [
    'circle',
    'square',
    'diamond',
    'triangle-up',
    'triangle-down',
    'triangle-left',
    'triangle-right',
    'pentagon',
    'hexagon',
    'star'
  ];
};

/**
 * Get line style options for line-scatter plots
 */
export const getLineScatterLineStyles = (): Array<{ value: string; label: string }> => {
  return [
    { value: 'solid', label: 'Solid' },
    { value: 'dash', label: 'Dashed' },
    { value: 'dot', label: 'Dotted' },
    { value: 'dashdot', label: 'Dash-Dot' }
  ];
};

/**
 * Validate plot properties
 */
export const validateLineScatterPlotProperties = (properties: LineScatterPlotProperties): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  // Validate marker size
  if (properties.markerSize < 1 || properties.markerSize > 50) {
    errors.push('Marker size must be between 1 and 50');
  }
  
  // Validate line width
  if (properties.lineWidth < 1 || properties.lineWidth > 20) {
    errors.push('Line width must be between 1 and 20');
  }
  
  // Validate opacity
  if (properties.opacity < 0 || properties.opacity > 1) {
    errors.push('Opacity must be between 0 and 1');
  }
  
  // Validate line style
  const validLineStyles = ['solid', 'dash', 'dot', 'dashdot'];
  if (!validLineStyles.includes(properties.lineStyle)) {
    errors.push(`Line style must be one of: ${validLineStyles.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Merge plot properties with defaults
 */
export const mergeLineScatterPlotProperties = (
  userProperties: Partial<LineScatterPlotProperties>,
  defaultProperties?: LineScatterPlotProperties
): LineScatterPlotProperties => {
  const defaults = defaultProperties || getDefaultLineScatterPlotProperties();
  
  return {
    ...defaults,
    ...userProperties
  };
};

/**
 * Get plot properties for specific data format
 */
export const getLineScatterPlotPropertiesForDataFormat = (
  dataFormat: string,
  subType: string
): LineScatterPlotProperties => {
  const baseProperties = getLineScatterPlotPropertiesForSubType(subType);
  
  // Adjust properties based on data format
  switch (dataFormat) {
    case 'XY Pair':
    case 'Single X':
    case 'Single Y':
      // Simple formats - use default properties
      return baseProperties;
    
    case 'XY Pairs':
    case 'X Many Y':
    case 'Y Many X':
    case 'Many X':
    case 'Many Y':
      // Multiple formats - slightly smaller markers for better visibility
      return {
        ...baseProperties,
        markerSize: Math.max(baseProperties.markerSize - 1, 6)
      };
    
    case 'XY Category':
    case 'X Category':
    case 'Y Category':
      // Category formats - different styling for groups
      return {
        ...baseProperties,
        markerSize: Math.max(baseProperties.markerSize - 1, 6),
        lineWidth: Math.max(baseProperties.lineWidth - 1, 1)
      };
    
    default:
      return baseProperties;
  }
};
