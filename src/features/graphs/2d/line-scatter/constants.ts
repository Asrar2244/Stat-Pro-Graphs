import type { LineScatterSubType, DataFormat } from './lineScatterPlotSlice';

/**
 * Available line-scatter plot sub-types
 */
export const SUB_TYPES: LineScatterSubType[] = [
  // A) Simple Straight Line and Scatter
  'Simple Straight Line and Scatter',
  // B) Multiple Straight Lines and Scatter
  'Multiple Straight Lines and Scatter',
  // C) Simple Spline Curve Line and Scatter
  'Simple Spline Curve Line and Scatter',
  // D) Multiple Spline Curves Lines and Scatter
  'Multiple Spline Curves Lines and Scatter',
  // E) Simple Line and Scatter Error Bars
  'Simple Line and Scatter Error Bars',
  // F) Multiple Line and Scatter Error Bars
  'Multiple Line and Scatter Error Bars',
  // G) Simple Vertical Step Plot
  'Simple Vertical Step Plot',
  // H) Multiple Vertical Step Plot
  'Multiple Vertical Step Plot',
  // I) Simple Vertical Midpoint Step Plot
  'Simple Vertical Midpoint Step Plot',
  // J) Multiple Vertical Midpoint Step Plot
  'Multiple Vertical Midpoint Step Plot',
  // K) Simple Horizontal Step Plot
  'Simple Horizontal Step Plot',
  // L) Multiple Horizontal Step Plot
  'Multiple Horizontal Step Plot',
  // M) Simple Horizontal Midpoint Step Plot
  'Simple Horizontal Midpoint Step Plot',
  // N) Multiple Horizontal Midpoint Step Plot
  'Multiple Horizontal Midpoint Step Plot',
  // O) Horizontal Error Bars
  'Horizontal Error Bars',
  // P) Bi-Directional Error Bars
  'Bi-Directional Error Bars',
];

/**
 * Available data formats for line-scatter plots
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
  // Category formats
  'X Category',
  'Y Category',
];

/**
 * Mapping between line-scatter plot sub-types and their valid data formats
 */
export const SUB_TYPE_DATA_FORMATS: Record<LineScatterSubType, DataFormat[]> = {
  // A) Simple Straight Line and Scatter
  'Simple Straight Line and Scatter': ['XY Pairs', 'Single X', 'Single Y'],
  
  // B) Multiple Straight Lines and Scatter
  'Multiple Straight Lines and Scatter': [
    'XY Pairs',
    'X Many Y',
    'Y Many X',
    'Many X',
    'Many Y',
    'X Category',
    'Y Category'
  ],
  
  // C) Simple Spline Curve Line and Scatter
  'Simple Spline Curve Line and Scatter': ['XY Pairs', 'Single X', 'Single Y'],
  
  // D) Multiple Spline Curves Lines and Scatter
  'Multiple Spline Curves Lines and Scatter': [
    'XY Pairs',
    'X Many Y',
    'Y Many X',
    'Many X',
    'Many Y',
    'X Category',
    'Y Category'
  ],
  
  // E) Simple Line and Scatter Error Bars
  'Simple Line and Scatter Error Bars': [
    'XY Pairs',
    'Single Y',
    'Single X',
    'X Many Y',
    'Many Y'
  ],
  
  // F) Multiple Line and Scatter Error Bars
  'Multiple Line and Scatter Error Bars': [
    'X Many Y',
    'Many Y',
    'XY Pairs'
  ],
  
  // G) Simple Vertical Step Plot
  'Simple Vertical Step Plot': ['XY Pairs', 'Single X', 'Single Y'],
  
  // H) Multiple Vertical Step Plot
  'Multiple Vertical Step Plot': [
    'XY Pairs',
    'X Many Y',
    'Y Many X',
    'Many X',
    'Many Y',
    'X Category',
    'Y Category'
  ],
  
  // I) Simple Vertical Midpoint Step Plot
  'Simple Vertical Midpoint Step Plot': ['XY Pairs', 'Single X', 'Single Y'],
  
  // J) Multiple Vertical Midpoint Step Plot
  'Multiple Vertical Midpoint Step Plot': [
    'XY Pairs',
    'X Many Y',
    'Y Many X',
    'Many X',
    'Many Y',
    'X Category',
    'Y Category'
  ],
  
  // K) Simple Horizontal Step Plot
  'Simple Horizontal Step Plot': ['XY Pairs', 'Single X', 'Single Y'],
  
  // L) Multiple Horizontal Step Plot
  'Multiple Horizontal Step Plot': [
    'XY Pairs',
    'X Many Y',
    'Y Many X',
    'Many X',
    'Many Y',
    'X Category',
    'Y Category'
  ],
  
  // M) Simple Horizontal Midpoint Step Plot
  'Simple Horizontal Midpoint Step Plot': ['XY Pairs', 'Single X', 'Single Y'],
  
  // N) Multiple Horizontal Midpoint Step Plot
  'Multiple Horizontal Midpoint Step Plot': [
    'XY Pairs',
    'X Many Y',
    'Y Many X',
    'Many X',
    'Many Y',
    'X Category',
    'Y Category'
  ],
  
  // O) Horizontal Error Bars
  'Horizontal Error Bars': [
    'Y Many X',
    'Many X'
  ],
  
  // P) Bi-Directional Error Bars
  'Bi-Directional Error Bars': [
    'XY Pairs'
  ]
};

/**
 * Gets valid data formats for a given line-scatter plot sub-type
 * @param subType - The line-scatter plot sub-type
 * @returns Array of valid data formats for the sub-type
 */
export const getValidDataFormats = (subType?: LineScatterSubType): DataFormat[] => {
  if (!subType) return [];
  return SUB_TYPE_DATA_FORMATS[subType] || [];
};

/**
 * Checks if a data format is valid for a line-scatter plot sub-type
 * @param subType - The line-scatter plot sub-type
 * @param dataFormat - The data format to validate
 * @returns True if the data format is valid for the sub-type
 */
export const isValidDataFormat = (subType?: LineScatterSubType, dataFormat?: DataFormat): boolean => {
  if (!subType || !dataFormat) return false;
  return getValidDataFormats(subType).includes(dataFormat);
};

/**
 * Symbol value options for error bar configuration
 */
export const SYMBOL_VALUE_OPTIONS = [
  'Worksheet Columns',
  'Asymmetric Error Bar',
  'Column Means',
  'Row Means',
  'By Category Mean',
  'Column Median',
  'Row Median',
  'By Category Median',
  'First Column Entry',
  'First Row Entry',
  'Last Column Entry',
  'Last Row Entry'
] as const;

/**
 * Error calculation options
 */
export const ERROR_CALCULATION_OPTIONS = [
  'Mean',
  'Median',
  'Standard Deviation',
  '2 Standard Deviations',
  '3 Standard Deviations',
  'Standard Error',
  '2 Standard Errors',
  '3 Standard Errors',
  '95% Confidence',
  '99% Confidence',
  '95% Prediction Interval',
  '99% Prediction Interval',
  '95% Tolerance Interval',
  '99% Tolerance Interval',
  'Robust Standard Deviation',
  '2 Robust Standard Deviations',
  'Interquartile Range',
  '1.5 IQR',
  '75th Percentile',
  '90th Percentile',
  '95th Percentile',
  '99th Percentile',
  'Maximum',
  'Minimum',
  'Range',
  'Last Entry',
  'First Entry',
  'Dynamic (Data-driven)',
  'None'
] as const;

/**
 * Descriptions for data formats
 */
export const DATA_FORMAT_DESCRIPTIONS: Record<DataFormat, string> = {
  'XY Pairs': 'Multiple X and Y variable pairs',
  'Single X': 'One X variable with multiple Y variables',
  'Single Y': 'One Y variable with multiple X variables',
  'Many X': 'Multiple X variables',
  'Many Y': 'Multiple Y variables',
  'X Many Y': 'One X variable with many Y variables',
  'Y Many X': 'One Y variable with many X variables',
  'X Category': 'X variables with category grouping',
  'Y Category': 'Y variables with category grouping',
};