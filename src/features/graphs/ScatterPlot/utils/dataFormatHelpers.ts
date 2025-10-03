import type { DataFormat, ScatterSubType } from '../scatterPlotSlice';

/**
 * Gets valid data formats based on the selected Symbol Value option and subplot type
 * @param symbolValue - The selected symbol value option
 * @param subType - The selected scatter plot subtype
 * @returns Array of valid data formats for the symbol value and subplot type
 */
export const getDataFormatsBySymbolValue = (symbolValue: string, subType?: string): DataFormat[] => {
  // For Worksheet and Asymmetric symbol values, return specific formats based on subplot type
  if (symbolValue === 'Worksheet Columns' || symbolValue === 'Asymmetric Error Bar') {
    switch (subType) {
      case 'Simple Scatter Error Bar and Regression':
        return ['XY Pair', 'Single Y'];
      case 'Multiple Scatter Error Bar and Regression':
        return ['XY Pair', 'X Many Y', 'Many Y'];
      case 'Simple Scatter Horizontal Error Bar':
        return ['XY Pair', 'Y Many X', 'Many X'];
      case 'Simple Scatter Bidirectional Error Bars':
        return ['XY Pair'];
      case 'Simple Scatter Error Bar':
        return ['XY Pair', 'Single Y'];
      case 'Multiple Scatter Error Bar':
        return ['XY Pair', 'X Many Y', 'Many Y'];
      default:
        return ['XY Pair', 'Single Y'];
    }
  }
  
  // For other symbol values, return formats based on symbol value and subplot type
  switch (symbolValue) {
    case 'Column Means':
      // For column-based calculations, prefer formats with multiple Y variables
      switch (subType) {
        case 'Simple Scatter Horizontal Error Bar':
          return ['Y Many X', 'Many X'];
        case 'Simple Scatter Bidirectional Error Bars':
          return ['XY Pair']; // Limited for bidirectional
        default:
          return ['X Many Y', 'Many Y'];
      }
      
    case 'Row Means':
      // For row-based calculations, prefer replicate formats
      switch (subType) {
        case 'Simple Scatter Horizontal Error Bar':
          return ['Y Single X Replicates', 'Many X Replicates', 'Y Many X Replicates'];
        case 'Simple Scatter Bidirectional Error Bars':
          return ['XY Replicate'];
        default:
          return ['XY Replicate'];
      }
      
    case 'By Category Mean':
      // For category-based calculations
      switch (subType) {
        case 'Simple Scatter Horizontal Error Bar':
          return ['Category Many X'];
        default:
          return ['Category Y', 'Category Many Y'];
      }
      
    case 'Column Median':
      // Similar to Column Means but for median calculations
      switch (subType) {
        case 'Simple Scatter Horizontal Error Bar':
          return ['Y Many X', 'Many X'];
        case 'Simple Scatter Bidirectional Error Bars':
          return ['XY Pair'];
        default:
          return ['X Many Y', 'Many Y'];
      }
      
    case 'Row Median':
      // Similar to Row Means but for median calculations
      switch (subType) {
        case 'Simple Scatter Horizontal Error Bar':
          return ['Y Single X Replicates', 'Many X Replicates', 'Y Many X Replicates'];
        case 'Simple Scatter Bidirectional Error Bars':
          return ['X Replicate', 'Y Replicate'];
        default:
          return ['X Replicate', 'Y Replicate'];
      }
      
    case 'By Category Median':
      // Similar to By Category Mean but for median calculations
      switch (subType) {
        case 'Simple Scatter Horizontal Error Bar':
          return ['Category Many X'];
        default:
          return ['Category Y', 'Category Many Y'];
      }
      
    case 'First Column Entry':
      // For first column entry calculations
      switch (subType) {
        case 'Simple Scatter Horizontal Error Bar':
          return ['Y Many X', 'Many X'];
        case 'Simple Scatter Bidirectional Error Bars':
          return ['XY Pair'];
        default:
          return ['X Many Y', 'Many Y'];
      }
      
    case 'First Row Entry':
      // For first row entry calculations
      switch (subType) {
        case 'Simple Scatter Horizontal Error Bar':
          return ['Y Single X Replicates', 'Many X Replicates', 'Y Many X Replicates'];
        case 'Simple Scatter Bidirectional Error Bars':
          return ['X Replicate', 'Y Replicate'];
        default:
          return ['X Replicate', 'Y Replicate'];
      }
      
    case 'Last Column Entry':
      // For last column entry calculations
      switch (subType) {
        case 'Simple Scatter Horizontal Error Bar':
          return ['Y Many X', 'Many X'];
        case 'Simple Scatter Bidirectional Error Bars':
          return ['XY Pair'];
        default:
          return ['X Many Y', 'Many Y'];
      }
      
    case 'Last Row Entry':
      // For last row entry calculations
      switch (subType) {
        case 'Simple Scatter Horizontal Error Bar':
          return ['Y Single X Replicates', 'Many X Replicates', 'Y Many X Replicates'];
        case 'Simple Scatter Bidirectional Error Bars':
          return ['X Replicate', 'Y Replicate'];
        default:
          return ['X Replicate', 'Y Replicate'];
      }
      
    default:
      return [];
  }
};

/**
 * Checks if the subtype is an error bar type that needs variable selection
 * @param subType - The scatter plot subtype
 * @returns True if the subtype requires error bars
 */
export const isErrorBarSubType = (subType: string): boolean => {
  return [
    'Simple Scatter Error Bar',
    'Multiple Scatter Error Bar',
    'Simple Scatter Error Bar and Regression',
    'Multiple Scatter Error Bar and Regression',
    'Simple Scatter Horizontal Error Bar',
    'Simple Scatter Bidirectional Error Bars',
    'Vertical Asymmetric Error Bars',
    'Horizontal Asymmetric Error Bars',
    'Bidirectional Asymmetric Error Bars'
  ].includes(subType);
};

/**
 * Checks if the subtype needs Error Bars Configuration dropdowns
 * @param subType - The scatter plot subtype
 * @returns True if the subtype needs error bars configuration
 */
export const needsErrorBarsConfiguration = (subType: string): boolean => {
  return [
    'Simple Scatter Error Bar',
    'Multiple Scatter Error Bar',
    'Simple Scatter Error Bar and Regression',
    'Multiple Scatter Error Bar and Regression',
    'Simple Scatter Horizontal Error Bar',
    'Simple Scatter Bidirectional Error Bars'
  ].includes(subType);
};

/**
 * Determines what type of scatter plot based on subtype
 * @param subType - The scatter plot subtype
 * @returns Object with boolean flags for plot type
 */
export const getPlotTypeFlags = (subType?: ScatterSubType) => {
  const isSimple = subType === 'Simple Scatter' || subType === 'Simple Scatter Regression';
  const isMulti = subType === 'Multiple Scatter' || subType === 'Multiple Scatter Regression';
  const isErrorBar = subType ? isErrorBarSubType(subType) : false;
  const isPointPlot = subType === 'Vertical Point Plot' || subType === 'Horizontal Point Plot';
  const isDotPlot = subType === 'Vertical Dot Plot' || subType === 'Horizontal Dot Plot';
  
  return {
    isSimple,
    isMulti,
    isErrorBar,
    isPointPlot,
    isDotPlot,
    showVariableSelection: isSimple || isMulti || isErrorBar || isPointPlot || isDotPlot
  };
};

/**
 * Checks if the subtype is an asymmetric error bar type
 * @param subType - The scatter plot subtype
 * @returns True if the subtype is asymmetric error bars
 */
export const isAsymmetricErrorBar = (subType?: ScatterSubType): boolean => {
  if (!subType) return false;
  
  return [
    'Vertical Asymmetric Error Bars',
    'Horizontal Asymmetric Error Bars',
    'Bidirectional Asymmetric Error Bars'
  ].includes(subType);
};


