import type { DataFormat, LineSubType } from '../linePlotSlice';

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
 * Determines what type of line plot based on subtype
 * @param subType - The line plot subtype
 * @returns Object with boolean flags for plot type
 */
export const getPlotTypeFlags = (subType?: LineSubType) => {
  const isSimple = subType === 'Simple Straight Line' || subType === 'Simple Spline Curve' || 
                   subType === 'Simple Vertical Mid Point Step Plot' || subType === 'Simple Vertical Step Plot' ||
                   subType === 'Simple Horizontal Mid Point Step Plot' || subType === 'Simple Horizontal Step Plot';
  const isMulti = subType === 'Multiple Straight Lines' || subType === 'Multiple Spline Curves' ||
                  subType === 'Multiple Vertical Step Plot' || subType === 'Multiple Horizontal Step Plot' ||
                  subType === 'Multiple Vertical Mid Point Step Plot' || subType === 'Multiple Horizontal Mid Point Step Plot';
  const isStepPlot = subType?.includes('Step') || false;
  const isSplinePlot = subType?.includes('Spline') || false;
  const isStraightLine = subType?.includes('Straight') || false;
  
  return {
    isSimple,
    isMulti,
    isStepPlot,
    isSplinePlot,
    isStraightLine,
    showVariableSelection: isSimple || isMulti
  };
};

/**
 * Checks if the plot is a step plot
 * @param subType - The line plot subtype
 * @returns True if it's a step plot
 */
export const isStepPlot = (subType?: LineSubType) => {
  return subType?.includes('Step') || false;
};

/**
 * Checks if the plot is a spline plot
 * @param subType - The line plot subtype
 * @returns True if it's a spline plot
 */
export const isSplinePlot = (subType?: LineSubType) => {
  return subType?.includes('Spline') || false;
};

/**
 * Checks if the plot is a multiple plot
 * @param subType - The line plot subtype
 * @returns True if it's a multiple plot
 */
export const isMultiplePlot = (subType?: LineSubType) => {
  return subType?.includes('Multiple') || false;
};

/**
 * Checks if the subtype is an asymmetric error bar type
 * @param subType - The line plot subtype
 * @returns True if the subtype is asymmetric error bars
 */
export const isAsymmetricErrorBar = (subType?: LineSubType): boolean => {
  if (!subType) return false;
  
  // Line plots don't have asymmetric error bars like scatter plots
  // This function is kept for compatibility but returns false for line plots
  return false;
};


