import type { DataFormat } from '../scatterPlotSlice';

/**
 * Determines if X variables are required for the given data format
 * @param dataFormat - The selected data format
 * @returns True if X variables are required
 */
export const requiresX = (dataFormat?: DataFormat): boolean => {
  if (!dataFormat) return false;
  
  switch (dataFormat) {
    // Simple formats
    case 'Single X':
    case 'XY Pair':
      return true;
    
    // Multi formats
    case 'XY Pairs':
    case 'X Many Y':
    case 'Y Many X':
    case 'Many X':
    case 'XY Category':
    case 'X Category':
      return true;
    
    // Replicate formats
    case 'X Single Y Replicate':
    case 'X Many Y Replicates':
    case 'X Replicates':
    case 'Y Single X Replicates':
    case 'Y Many X Replicates':
    case 'Many X Replicates':
      return true;
    
    // Special formats
    case 'YX Pairs':
    case 'Category Many X':
      return true;
    
    default:
      return false;
  }
};

/**
 * Determines if Y variables are required for the given data format
 * @param dataFormat - The selected data format
 * @returns True if Y variables are required
 */
export const requiresY = (dataFormat?: DataFormat): boolean => {
  if (!dataFormat) return false;
  
  switch (dataFormat) {
    // Simple formats
    case 'Single Y':
    case 'XY Pair':
      return true;
    
    // Multi formats
    case 'XY Pairs':
    case 'X Many Y':
    case 'Y Many X':
    case 'Many Y':
    case 'XY Category':
    case 'Y Category':
      return true;
    
    // Replicate formats
    case 'Y Replicate':
    case 'X Many Y Replicates':
    case 'Many Y Replicates':
    case 'Y Many X Replicates':
      return true;
    
    // Special formats
    case 'YX Pairs':
    case 'Category Many Y':
      return true;
    
    default:
      return false;
  }
};

/**
 * Determines if error bar variables are required for the given data format
 * @param dataFormat - The selected data format
 * @returns True if error bar variables are required
 */
export const requiresErrorBar = (dataFormat?: DataFormat): boolean => {
  if (!dataFormat) return false;
  
  // Error bars are required for error bar subtypes, not data formats
  // This will be determined by subType instead
  return false;
};

/**
 * Calculates the required number of error bar variables based on XY pairs
 * @param xCount - Number of X variables
 * @param yCount - Number of Y variables  
 * @param dataFormat - The selected data format
 * @returns Required number of error bar variables
 */
export const getRequiredErrorBarCount = (
  xCount: number, 
  yCount: number, 
  dataFormat?: DataFormat
): number => {
  if (!dataFormat) return 0;
  
  // If user has multiple X or Y variables, allow multiple error bars
  // This provides flexibility for users to assign different error bars to different XY pairs
  if (xCount > 1 || yCount > 1) {
    return Math.max(xCount, yCount);
  }
  
  switch (dataFormat) {
    // Single pair formats - 1 error bar
    case 'XY Pair':
    case 'Single X':
    case 'Single Y':
      return 1;
    
    // Multiple pair formats - number of pairs
    case 'XY Pairs':
      return Math.max(xCount, yCount); // Each pair needs one error bar
    
    case 'X Many Y':
      return yCount; // Each Y needs an error bar (1 X with multiple Y)
    
    case 'Y Many X':  
      return xCount; // Each X needs an error bar (1 Y with multiple X)
    
    case 'Many X':
      return xCount; // Each X needs an error bar
    
    case 'Many Y':
      return yCount; // Each Y needs an error bar
    
    // Category formats - same logic as base format
    case 'XY Category':
      return 1; // One pair with category
    
    case 'X Category':
    case 'Y Category':
      return 1; // One variable with category
    
    default:
      return 0;
  }
};

/**
 * Determines if category variables are required for the given data format
 * @param dataFormat - The selected data format
 * @returns True if category variables are required
 */
export const requiresCategory = (dataFormat?: DataFormat): boolean => {
  if (!dataFormat) return false;
  
  return [
    'XY Category',
    'X Category',
    'Y Category',
    'Category Many Y',
    'Category Many X'
  ].includes(dataFormat);
};

/**
 * Gets the maximum allowed count for X variables based on data format
 * @param dataFormat - The selected data format
 * @returns Maximum count or undefined for unlimited
 */
export const getMaxXCount = (dataFormat?: DataFormat): number | undefined => {
  if (dataFormat === 'X Many Y') return 1;
  if (dataFormat === 'Single X') return 1;
  return undefined;
};

/**
 * Gets the maximum allowed count for Y variables based on data format
 * @param dataFormat - The selected data format
 * @returns Maximum count or undefined for unlimited
 */
export const getMaxYCount = (dataFormat?: DataFormat): number | undefined => {
  if (dataFormat === 'Y Many X') return 1;
  if (dataFormat === 'Single Y') return 1;
  return undefined;
};

/**
 * Determines if variables can be sent to X based on current state
 * @param availableCheckedCount - Number of selected available variables
 * @param xCount - Current X variable count
 * @param dataFormat - The selected data format
 * @returns True if variables can be sent to X
 */
export const canSendToX = (
  availableCheckedCount: number,
  xCount: number,
  dataFormat?: DataFormat
): boolean => {
  if (availableCheckedCount === 0) return false;
  
  const maxX = getMaxXCount(dataFormat);
  if (maxX !== undefined && xCount >= maxX) return false;
  
  return requiresX(dataFormat);
};

/**
 * Determines if variables can be sent to Y based on current state
 * @param availableCheckedCount - Number of selected available variables
 * @param yCount - Current Y variable count
 * @param dataFormat - The selected data format
 * @returns True if variables can be sent to Y
 */
export const canSendToY = (
  availableCheckedCount: number,
  yCount: number,
  dataFormat?: DataFormat
): boolean => {
  if (availableCheckedCount === 0) return false;
  
  const maxY = getMaxYCount(dataFormat);
  if (maxY !== undefined && yCount >= maxY) return false;
  
  return requiresY(dataFormat);
};

/**
 * Determines if variables can be sent to Error Bar based on current state and subtype
 * @param availableCheckedCount - Number of selected available variables
 * @param errorBarCount - Current error bar variable count
 * @param xCount - Current X variable count
 * @param yCount - Current Y variable count
 * @param dataFormat - The selected data format
 * @param subType - The selected sub type
 * @returns True if variables can be sent to Error Bar
 */
export const canSendToErrorBar = (
  availableCheckedCount: number,
  errorBarCount: number,
  xCount: number,
  yCount: number,
  dataFormat?: DataFormat,
  subType?: string
): boolean => {
  if (availableCheckedCount === 0) return false;
  
  // Only allow error bars for error bar subtypes
  const isErrorBarSubType = subType?.toLowerCase().includes('error bar') || false;
  if (!isErrorBarSubType) return false;
  
  const requiredCount = getRequiredErrorBarCount(xCount, yCount, dataFormat);
  if (requiredCount === 0) return false;
  
  // Allow adding error bars if we haven't reached the required count
  return errorBarCount < requiredCount;
};

/**
 * Determines if variables can be sent to Category based on current state
 * @param availableCheckedCount - Number of selected available variables
 * @param categoryCount - Current category variable count
 * @param dataFormat - The selected data format
 * @returns True if variables can be sent to Category
 */
export const canSendToCategory = (
  availableCheckedCount: number,
  categoryCount: number,
  dataFormat?: DataFormat
): boolean => {
  if (availableCheckedCount === 0) return false;
  
  // Category formats typically need only 1 category variable
  if (categoryCount >= 1) return false;
  
  return requiresCategory(dataFormat);
};

