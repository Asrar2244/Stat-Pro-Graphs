import type { ScatterSubType, DataFormat } from './scatterPlotSlice';

/**
 * Available scatter plot sub-types
 */
export const SUB_TYPES: ScatterSubType[] = [
  // A) Simple Scatter
  'Simple Scatter',
  // B) Multiple Scatter  
  'Multiple Scatter',
  // C) Simple Scatter - Regression
  'Simple Scatter Regression',
  // D) Multiple Scatter - Regressions
  'Multiple Scatter Regression',
  // E) Simple Scatter Error Bars
  'Simple Scatter Error Bar',
  // F) Multiple Scatter Error Bars
  'Multiple Scatter Error Bar',
  // G) Simple Scatter - Error Bars & Regression
  'Simple Scatter Error Bar and Regression',
  // H) Multiple Scatter - Error Bars & Regressions
  'Multiple Scatter Error Bar and Regression',
  // I) Simple Scatter - Horizontal Error Bars
  'Simple Scatter Horizontal Error Bar',
  // J) Simple Scatter - Bi-directional Error Bars
  'Simple Scatter Bidirectional Error Bars',
  // K) Vertical Asymmetric Error Bars
  'Vertical Asymmetric Error Bars',
  // L) Horizontal Asymmetric Error Bars
  'Horizontal Asymmetric Error Bars',
  // M) Bi-directional Asymmetric Error Bars
  'Bidirectional Asymmetric Error Bars',
  // N) Vertical Point Plot
  'Vertical Point Plot',
  // O) Horizontal Point Plot
  'Horizontal Point Plot',
  // P) Vertical Dot Plot
  'Vertical Dot Plot',
  // Q) Horizontal Dot Plot
  'Horizontal Dot Plot',
];

/**
 * Available data formats for scatter plots
 */
export const DATA_FORMATS: DataFormat[] = [
  // Basic formats
  'XY Pair',
  'Single Y',
  'Single X',
  // Multiple formats
  'XY Pairs',
  'X Many Y',
  'Y Many X',
  'Many X',
  'Many Y',
  // Category formats
  'XY Category',
  'X Category',
  'Y Category',
  // Replicate formats
  'X Single Y Replicate',
  'Y Replicate',
  'X Many Y Replicates',
  'Many Y Replicates',
  'Y Many X Replicates',
  'Many X Replicates',
  'X Replicates',
  'Y Single X Replicates',
  'Y Many X Replicates',
  // Special formats
  'YX Pairs',
  'Category Many Y',
  'Category Many X',
];

/**
 * Mapping between scatter plot sub-types and their valid data formats
 */
export const SUB_TYPE_DATA_FORMATS: Record<ScatterSubType, DataFormat[]> = {
  // A) Simple Scatter
  'Simple Scatter': ['XY Pair', 'Single X', 'Single Y'],
  
  // B) Multiple Scatter
  'Multiple Scatter': [
    'XY Pairs',
    'X Many Y',
    'Y Many X', 
    'Many X',
    'Many Y',
    'XY Category',
    'X Category',
    'Y Category'
  ],
  
  // C) Simple Scatter - Regression
  'Simple Scatter Regression': ['XY Pair', 'Single X', 'Single Y'],
  
  // D) Multiple Scatter - Regressions
  'Multiple Scatter Regression': [
    'XY Pairs',
    'X Many Y',
    'Y Many X',
    'Many X',
    'Many Y',
    'XY Category',
    'X Category',
    'Y Category'
  ],
  
  // E) Simple Scatter Error Bars
  'Simple Scatter Error Bar': [
    'XY Pair',
    'Single Y',
    'Single X',
    'X Many Y',
    'Many Y',
    'X Single Y Replicate',
    'Y Replicate'
  ],
  
  // F) Multiple Scatter Error Bars
  'Multiple Scatter Error Bar': [
    'X Many Y',
    'Many Y',
    'X Many Y Replicates',
    'Many Y Replicates'
  ],
  
  // G) Simple Scatter - Error Bars & Regression
  'Simple Scatter Error Bar and Regression': [
    'XY Pair',
    'Single Y',
    'Single X',
    'X Many Y',
    'Many Y',
    'X Single Y Replicate',
    'Y Replicate',
    'Category Many Y'
  ],
  
  // H) Multiple Scatter - Error Bars & Regressions
  'Multiple Scatter Error Bar and Regression': [
    'XY Pair',
    'X Many Y',
    'Many Y',
    'X Many Y Replicates',
    'Many Y Replicates',
    'Category Many Y'
  ],
  
  // I) Simple Scatter - Horizontal Error Bars
  'Simple Scatter Horizontal Error Bar': [
    'XY Pairs',
    'Single X',
    'Y Many X',
    'Many X',
    'X Replicates',
    'Y Single X Replicates',
    'Many X Replicates',
    'Y Many X Replicates',
    'Category Many X'
  ],
  
  // J) Simple Scatter - Bi-directional Error Bars
  'Simple Scatter Bidirectional Error Bars': [
    'XY Pairs',
    'Single X',
    'Single Y',
    'Y Many X',
    'Many X'
  ],
  
  // K) Vertical Asymmetric Error Bars
  'Vertical Asymmetric Error Bars': [
    'XY Pair',
    'X Many Y',
    'Many Y',
    'XY Pairs'
  ],
  
  // L) Horizontal Asymmetric Error Bars
  'Horizontal Asymmetric Error Bars': [
    'XY Pair',
    'Y Many X',
    'Many X',
    'XY Pairs'
  ],
  
  // M) Bi-directional Asymmetric Error Bars
  'Bidirectional Asymmetric Error Bars': [
    'XY Pair',
    'XY Pairs',
    'X Many Y',
    'Y Many X',
    'Many X',
    'Many Y'
  ],
  
  // N) Vertical Point Plot
  'Vertical Point Plot': [
    'X Many Y Replicates',
    'Many Y Replicates',
    'X Many Y',
    'Many Y',
    'Y Category'
  ],
  
  // O) Horizontal Point Plot
  'Horizontal Point Plot': [
    'Y Many X Replicates',
    'Many X Replicates',
    'Y Many X',
    'Many X',
    'X Category'
  ],
  
  // P) Vertical Dot Plot
  'Vertical Dot Plot': [
    'XY Pair',
    'X Many Y',
    'Many Y'
  ],
  
  // Q) Horizontal Dot Plot
  'Horizontal Dot Plot': [
    'XY Pair',
    'Y Many X',
    'Many X'
  ]
};

/**
 * Gets valid data formats for a given scatter plot sub-type
 * @param subType - The scatter plot sub-type
 * @returns Array of valid data formats for the sub-type
 */
export const getValidDataFormats = (subType?: ScatterSubType): DataFormat[] => {
  if (!subType) return [];
  return SUB_TYPE_DATA_FORMATS[subType] || [];
};

/**
 * Checks if a data format is valid for a scatter plot sub-type
 * @param subType - The scatter plot sub-type
 * @param dataFormat - The data format to validate
 * @returns True if the data format is valid for the sub-type
 */
export const isValidDataFormat = (subType?: ScatterSubType, dataFormat?: DataFormat): boolean => {
  if (!subType || !dataFormat) return false;
  return getValidDataFormats(subType).includes(dataFormat);
};