import type { ScatterSubType, DataFormat } from './scatterPlotSlice';

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

// Mapping between scatter plot sub-types and their valid data formats
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
    'X Many Y',
    'Many Y',
    'XY Pairs'
  ],
  
  // L) Horizontal Asymmetric Error Bars
  'Horizontal Asymmetric Error Bars': [
    'Y Many X',
    'Many X',
    'XY Pairs'
  ],
  
  // M) Bi-directional Asymmetric Error Bars
  'Bidirectional Asymmetric Error Bars': [
    'XY Pairs'
  ],
  
  // N) Vertical Point Plot
  'Vertical Point Plot': [
    'Many Y',
    'X Many Y',
    'Many Y Replicates',
    'X Many Y Replicates'
  ],
  
  // O) Horizontal Point Plot
  'Horizontal Point Plot': [
    'Many X',
    'Y Many X',
    'Many X Replicates',
    'Y Many X Replicates'
  ],
  
  // P) Vertical Dot Plot
  'Vertical Dot Plot': [
    'Many Y',
    'X Many Y',
    'XY Pairs',
    'X Category'
  ],
  
  // Q) Horizontal Dot Plot
  'Horizontal Dot Plot': [
    'Many X',
    'Y Many X',
    'YX Pairs'
  ]
};

// Helper function to get valid data formats for a given sub-type
export const getValidDataFormats = (subType: ScatterSubType): DataFormat[] => {
  return SUB_TYPE_DATA_FORMATS[subType] || [];
};

// Helper function to check if a data format is valid for a sub-type
export const isValidDataFormat = (subType: ScatterSubType, dataFormat: DataFormat): boolean => {
  return getValidDataFormats(subType).includes(dataFormat);
};