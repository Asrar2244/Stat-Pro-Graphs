import type { DataFormat, LineScatterSubType } from '../lineScatterPlotSlice';
import { SUB_TYPE_DATA_FORMATS } from '../constants';

/**
 * Determines if a line-scatter subplot is a simple (single) or multiple plot
 * @param subType - The line-scatter plot sub-type
 * @returns true if it's a simple plot, false if it's a multiple plot
 */
export const isSimplePlot = (subType?: LineScatterSubType): boolean => {
  if (!subType) return true;
  return subType.toLowerCase().includes('simple');
};

/**
 * Determines if a line-scatter subplot is a multiple plot
 * @param subType - The line-scatter plot sub-type
 * @returns true if it's a multiple plot, false if it's a simple plot
 */
export const isMultiplePlot = (subType?: LineScatterSubType): boolean => {
  if (!subType) return false;
  return subType.toLowerCase().includes('multiple');
};

/**
 * Gets valid data formats based on the selected Symbol Value option and subplot type
 * @param symbolValue - The selected symbol value option
 * @param subType - The selected line-scatter plot subtype
 * @returns Array of valid data formats for the symbol value and subplot type
 */
export const getDataFormatsBySymbolValue = (symbolValue: string, subType?: string): DataFormat[] => {
  // For Worksheet and Asymmetric symbol values, return specific formats based on subplot type
  if (symbolValue === 'Worksheet Columns' || symbolValue === 'Asymmetric Error Bar') {
    switch (subType) {
      case 'Simple Line and Scatter Error Bars':
        return ['XY Pairs', 'Single Y'];
      case 'Multiple Line and Scatter Error Bars':
        return ['XY Pairs', 'X Many Y', 'Many Y'];
      case 'Horizontal Error Bars':
        return ['XY Pairs', 'Y Many X', 'Many X'];
      case 'Bi-Directional Error Bars':
        return ['XY Pairs'];
      default:
        return ['XY Pairs', 'Single Y'];
    }
  }
  
  // For other symbol values, return formats based on symbol value and subplot type
  switch (symbolValue) {
    case 'Column Means':
      // For column-based calculations, prefer formats with multiple Y variables
      switch (subType) {
        case 'Horizontal Error Bars':
          return ['Y Many X', 'Many X'];
        case 'Bi-Directional Error Bars':
          return ['XY Pair']; // Limited for bidirectional
        default:
          return ['X Many Y', 'Many Y'];
      }
      
    case 'Row Means':
      // For row-based calculations, prefer replicate formats
      switch (subType) {
        case 'Horizontal Error Bars':
          return ['Y Single X Replicates', 'Many X Replicates', 'Y Many X Replicates'];
        case 'Bi-Directional Error Bars':
          return ['XY Replicate'];
        default:
          return ['XY Replicate'];
      }
      
    case 'By Category Mean':
      // For category-based calculations
      switch (subType) {
        case 'Horizontal Error Bars':
          return ['Category Many X'];
        default:
          return ['Category Y', 'Category Many Y'];
      }
      
    case 'Column Median':
      // Similar to Column Means but for median calculations
      switch (subType) {
        case 'Horizontal Error Bars':
          return ['Y Many X', 'Many X'];
        case 'Bi-Directional Error Bars':
          return ['XY Pair'];
        default:
          return ['X Many Y', 'Many Y'];
      }
      
    case 'Row Median':
      // Similar to Row Means but for median calculations
      switch (subType) {
        case 'Horizontal Error Bars':
          return ['Y Single X Replicates', 'Many X Replicates', 'Y Many X Replicates'];
        case 'Bi-Directional Error Bars':
          return ['X Replicate', 'Y Replicate'];
        default:
          return ['X Replicate', 'Y Replicate'];
      }
      
    case 'By Category Median':
      // Similar to By Category Mean but for median calculations
      switch (subType) {
        case 'Horizontal Error Bars':
          return ['Category Many X'];
        default:
          return ['Category Y', 'Category Many Y'];
      }
      
    case 'First Column Entry':
      // For first column entry calculations
      switch (subType) {
        case 'Horizontal Error Bars':
          return ['Y Many X', 'Many X'];
        case 'Bi-Directional Error Bars':
          return ['XY Pair'];
        default:
          return ['X Many Y', 'Many Y'];
      }
      
    case 'First Row Entry':
      // For first row entry calculations
      switch (subType) {
        case 'Horizontal Error Bars':
          return ['Y Single X Replicates', 'Many X Replicates', 'Y Many X Replicates'];
        case 'Bi-Directional Error Bars':
          return ['X Replicate', 'Y Replicate'];
        default:
          return ['X Replicate', 'Y Replicate'];
      }
      
    case 'Last Column Entry':
      // For last column entry calculations
      switch (subType) {
        case 'Horizontal Error Bars':
          return ['Y Many X', 'Many X'];
        case 'Bi-Directional Error Bars':
          return ['XY Pair'];
        default:
          return ['X Many Y', 'Many Y'];
      }
      
    case 'Last Row Entry':
      // For last row entry calculations
      switch (subType) {
        case 'Horizontal Error Bars':
          return ['Y Single X Replicates', 'Many X Replicates', 'Y Many X Replicates'];
        case 'Bi-Directional Error Bars':
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
 * @param subType - The line-scatter plot subtype
 * @returns True if the subtype requires error bars
 */
export const isErrorBarSubType = (subType: string): boolean => {
  return [
    'Simple Line and Scatter Error Bars',
    'Multiple Line and Scatter Error Bars',
    'Horizontal Error Bars',
    'Bi-Directional Error Bars'
  ].includes(subType);
};

/**
 * Checks if the subtype needs Error Bars Configuration dropdowns
 * @param subType - The line-scatter plot subtype
 * @returns True if the subtype needs error bars configuration
 */
export const needsErrorBarsConfiguration = (subType: string): boolean => {
  return [
    'Simple Line & Scatter - Error Bars',
    'Multiple Line & Scatter - Error Bars',
    'Horizontal Error Bars',
    'Bi-Directional Error Bars'
  ].includes(subType);
};

/**
 * Determines what type of line-scatter plot based on subtype
 * @param subType - The line-scatter plot subtype
 * @returns Object with boolean flags for plot type
 */
export const getPlotTypeFlags = (subType?: LineScatterSubType) => {
  const isSimple = subType === 'Simple Straight Line and Scatter' || 
                   subType === 'Simple Spline Curve Line and Scatter' ||
                   subType === 'Simple Vertical Step Plot' ||
                   subType === 'Simple Vertical Midpoint Step Plot' ||
                   subType === 'Simple Horizontal Step Plot' ||
                   subType === 'Simple Horizontal Midpoint Step Plot';
  const isMulti = subType === 'Multiple Straight Lines and Scatter' ||
                  subType === 'Multiple Spline Curves Lines and Scatter' ||
                  subType === 'Multiple Vertical Step Plot' ||
                  subType === 'Multiple Vertical Midpoint Step Plot' ||
                  subType === 'Multiple Horizontal Step Plot' ||
                  subType === 'Multiple Horizontal Midpoint Step Plot';
  const isErrorBar = subType ? isErrorBarSubType(subType) : false;
  
  return {
    isSimple,
    isMulti,
    isErrorBar,
    showVariableSelection: isSimple || isMulti || isErrorBar
  };
};

/**
 * Checks if the subtype is an asymmetric error bar type
 * @param subType - The line-scatter plot subtype
 * @returns True if the subtype is asymmetric error bars
 */
export const isAsymmetricErrorBar = (subType?: LineScatterSubType): boolean => {
  if (!subType) return false;
  
  // Bidirectional error bars are not necessarily asymmetric
  // Asymmetric error bars would have "asymmetric" in the name
  return subType.toLowerCase().includes('asymmetric');
};


/**
 * Validates data format compatibility with sub-type
 * @param subType - The line-scatter plot sub-type
 * @param dataFormat - The data format to validate
 * @returns Validation result with isValid flag and optional message
 */
export const validateDataFormatCompatibility = (
  subType: LineScatterSubType,
  dataFormat: DataFormat
): { isValid: boolean; message?: string } => {
  // Get valid data formats for the sub-type
  const validFormats = getValidDataFormats(subType);
  
  if (validFormats.length === 0) {
    return {
      isValid: false,
      message: `No valid data formats found for sub-type: ${subType}`
    };
  }
  
  if (!validFormats.includes(dataFormat)) {
    return {
      isValid: false,
      message: `Data format "${dataFormat}" is not compatible with sub-type "${subType}". Valid formats: ${validFormats.join(', ')}`
    };
  }
  
  return {
    isValid: true
  };
};

/**
 * Gets valid data formats for a sub-type
 * @param subType - The line-scatter plot sub-type
 * @returns Array of valid data formats
 */
export const getValidDataFormats = (subType: LineScatterSubType): DataFormat[] => {
  return SUB_TYPE_DATA_FORMATS[subType] || [];
};