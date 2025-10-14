import type { LineSubType, DataFormat } from './linePlotSlice';
import type { LinePlotSubType } from './types';

/**
 * Available line plot sub-types
 */
export const SUB_TYPES: LineSubType[] = [
  // A) Simple Straight Line
  'Simple Straight Line',
  // B) Multiple Straight Lines
  'Multiple Straight Lines',
  // C) Simple Spline Curve
  'Simple Spline Curve',
  // D) Multiple Spline Curves
  'Multiple Spline Curves',
  // E) Simple Vertical Mid Point Step Plot
  'Simple Vertical Mid Point Step Plot',
  // F) Simple Vertical Step Plot
  'Simple Vertical Step Plot',
  // G) Multiple Vertical Step Plot
  'Multiple Vertical Step Plot',
  // H) Multiple Horizontal Step Plot
  'Multiple Horizontal Step Plot',
  // I) Multiple Vertical Mid Point Step Plot
  'Multiple Vertical Mid Point Step Plot',
  // J) Simple Horizontal Mid Point Step Plot
  'Simple Horizontal Mid Point Step Plot',
  // K) Simple Horizontal Step Plot
  'Simple Horizontal Step Plot',
  // L) Multiple Horizontal Mid Point Step Plot
  'Multiple Horizontal Mid Point Step Plot',
];

/**
 * Available data formats for line plots
 */
export const DATA_FORMATS: DataFormat[] = [
  // Basic formats
  'XY Pairs',
  'Single X',
  'Single Y',
  // Multiple formats
  'Many X',
  'Many Y',
  'X Many Y',
  'Y Many X',
];

/**
 * Data format requirements for each subplot type
 */
export const SUB_TYPE_DATA_FORMATS: Record<LineSubType, DataFormat[]> = {
  // A) Simple Straight Line
  'Simple Straight Line': ['XY Pairs', 'Single X', 'Single Y'],
  
  // B) Multiple Straight Lines
  'Multiple Straight Lines': ['XY Pairs', 'Many X', 'Many Y', 'X Many Y', 'Y Many X'],
  
  // C) Simple Spline Curve
  'Simple Spline Curve': ['XY Pairs', 'Single X', 'Single Y'],
  
  // D) Multiple Spline Curves
  'Multiple Spline Curves': ['XY Pairs', 'Many X', 'Many Y', 'X Many Y', 'Y Many X'],
  
  // E) Simple Vertical Mid Point Step Plot
  'Simple Vertical Mid Point Step Plot': ['XY Pairs', 'Single X', 'Single Y'],
  
  // F) Simple Vertical Step Plot
  'Simple Vertical Step Plot': ['XY Pairs', 'Single X', 'Single Y'],
  
  // G) Multiple Vertical Step Plot
  'Multiple Vertical Step Plot': ['XY Pairs', 'Many X', 'Many Y', 'X Many Y', 'Y Many X'],
  
  // H) Multiple Horizontal Step Plot
  'Multiple Horizontal Step Plot': ['XY Pairs', 'Many X', 'Many Y', 'X Many Y', 'Y Many X'],
  
  // I) Multiple Vertical Mid Point Step Plot
  'Multiple Vertical Mid Point Step Plot': ['XY Pairs', 'Many X', 'Many Y', 'X Many Y', 'Y Many X'],
  
  // J) Simple Horizontal Mid Point Step Plot
  'Simple Horizontal Mid Point Step Plot': ['XY Pairs', 'Single X', 'Single Y'],
  
  // K) Simple Horizontal Step Plot
  'Simple Horizontal Step Plot': ['XY Pairs', 'Single X', 'Single Y'],
  
  // L) Multiple Horizontal Mid Point Step Plot
  'Multiple Horizontal Mid Point Step Plot': ['XY Pairs', 'Many X', 'Many Y', 'X Many Y', 'Y Many X'],
};

/**
 * Get valid data formats for a given subplot type
 */
export const getValidDataFormats = (subType: LineSubType): DataFormat[] => {
  return SUB_TYPE_DATA_FORMATS[subType] || [];
};

/**
 * Check if a data format is valid for a given subplot type
 */
export const isValidDataFormat = (subType: LineSubType, dataFormat: DataFormat): boolean => {
  const validFormats = getValidDataFormats(subType);
  return validFormats.includes(dataFormat);
};

/**
 * Line plot specific configuration options
 */
export const LINE_PLOT_OPTIONS = {
  // Line styles
  lineStyles: ['solid', 'dashed', 'dotted', 'dashdot'] as const,
  
  // Line widths
  lineWidths: [1, 2, 3, 4, 5] as const,
  
  // Marker styles
  markerStyles: ['circle', 'square', 'diamond', 'triangle-up', 'triangle-down', 'cross', 'x'] as const,
  
  // Step plot directions
  stepDirections: ['vertical', 'horizontal', 'vertical-midpoint', 'horizontal-midpoint'] as const,
  
  // Spline curve options
  splineOptions: {
    smoothing: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    tension: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
  },
} as const;