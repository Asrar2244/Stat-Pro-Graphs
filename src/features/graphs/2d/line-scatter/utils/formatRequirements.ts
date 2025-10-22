import type { DataFormat } from '../lineScatterPlotSlice';

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
 * @param subType - The selected sub type (for bidirectional error bars)
 * @returns Required number of error bar variables
 */
export const getRequiredErrorBarCount = (
  xCount: number, 
  yCount: number, 
  dataFormat?: DataFormat,
  subType?: string
): number => {
  if (!dataFormat) return 0;
  
  // Check if this is a bidirectional error bar - requires 2 error bar variables per X-Y pair
  const isBidirectionalErrorBar = subType?.toLowerCase().includes('bidirectional') && 
                                  subType?.toLowerCase().includes('error bar');
  
  // Check if this is an asymmetric error bar - requires 2 error bar variables per direction
  const isAsymmetricErrorBar = subType?.toLowerCase().includes('asymmetric') && 
                               subType?.toLowerCase().includes('error bar');
  
  if (isBidirectionalErrorBar && isAsymmetricErrorBar) {
    // For bidirectional asymmetric error bars, require 4 error bar variables per X-Y pair
    // Each X-Y pair needs: upper X + lower X + upper Y + lower Y = 4 total
    const pairCount = Math.max(xCount, yCount);
    return pairCount * 4;
  } else if (isBidirectionalErrorBar) {
    // For bidirectional symmetric error bars, require 2 error bar variables per X-Y pair
    // Each X-Y pair needs: 1 for X direction + 1 for Y direction = 2 total
    const pairCount = Math.max(xCount, yCount);
    return pairCount * 2;
  } else if (isAsymmetricErrorBar) {
    // For asymmetric error bars, require 2 error bar variables per X-Y pair
    // Each X-Y pair needs: 1 for upper + 1 for lower = 2 total
    const pairCount = Math.max(xCount, yCount);
    return pairCount * 2;
  }
  
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
  
  const requiredCount = getRequiredErrorBarCount(xCount, yCount, dataFormat, subType);
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

/**
 * Validates format requirements for variable selection
 * @param dataFormat - The selected data format
 * @param xVariables - Selected X variables
 * @param yVariables - Selected Y variables
 * @param categoryVariables - Selected category variables
 * @param errorBarVariables - Selected error bar variables
 * @returns Validation result with errors and warnings
 */
export const validateFormatRequirements = (
  dataFormat: DataFormat,
  xVariables: string[],
  yVariables: string[],
  categoryVariables: string[],
  errorBarVariables: string[]
): { errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const xCount = xVariables.length;
  const yCount = yVariables.length;
  const hasX = xCount > 0;
  const hasY = yCount > 0;

  // Check X variable requirements with context-aware messages
  if (requiresX(dataFormat) && xVariables.length === 0) {
    if (hasY) {
      errors.push(`Missing X variable: You have ${yCount} Y variable(s) selected, but "${dataFormat}" format requires X variables too`);
    } else {
      errors.push(`No variables selected: "${dataFormat}" format requires both X and Y variables`);
    }
  }

  // Check Y variable requirements with context-aware messages
  if (requiresY(dataFormat) && yVariables.length === 0) {
    if (hasX) {
      errors.push(`Missing Y variable: You have ${xCount} X variable(s) selected, but "${dataFormat}" format requires Y variables too`);
    } else if (!hasX && requiresX(dataFormat)) {
      // Already handled above - don't duplicate the message
    } else {
      errors.push(`No Y variables selected: "${dataFormat}" format requires Y variables`);
    }
  }

  // Check category variable requirements
  if (requiresCategory(dataFormat) && categoryVariables.length === 0) {
    errors.push(`Category variable required: "${dataFormat}" format requires a category variable to group data`);
  }

  // Check maximum counts
  const maxX = getMaxXCount(dataFormat);
  if (maxX !== undefined && xVariables.length > maxX) {
    errors.push(`Maximum ${maxX} X variable(s) allowed for this data format`);
  }

  const maxY = getMaxYCount(dataFormat);
  if (maxY !== undefined && yVariables.length > maxY) {
    errors.push(`Maximum ${maxY} Y variable(s) allowed for this data format`);
  }

  // Check for minimum requirements with specific guidance
  if (dataFormat === 'XY Pair' && (xVariables.length !== 1 || yVariables.length !== 1)) {
    if (xCount === 0 && yCount === 0) {
      errors.push('XY Pair format requires exactly 1 X and 1 Y variable (none selected yet)');
    } else if (xCount === 0) {
      errors.push(`XY Pair format requires exactly 1 X and 1 Y variable (you have ${yCount} Y, but no X)`);
    } else if (yCount === 0) {
      errors.push(`XY Pair format requires exactly 1 X and 1 Y variable (you have ${xCount} X, but no Y)`);
    } else if (xCount > 1 || yCount > 1) {
      errors.push(`XY Pair format requires exactly 1 X and 1 Y variable (you have ${xCount} X and ${yCount} Y - too many)`);
    }
  }

  if (dataFormat === 'Single X' && xVariables.length !== 1) {
    if (xCount === 0) {
      errors.push('Single X format requires exactly 1 X variable (none selected)');
    } else {
      errors.push(`Single X format requires exactly 1 X variable (you have ${xCount} - please select only one)`);
    }
  }

  if (dataFormat === 'Single Y' && yVariables.length !== 1) {
    if (yCount === 0) {
      errors.push('Single Y format requires exactly 1 Y variable (none selected)');
    } else {
      errors.push(`Single Y format requires exactly 1 Y variable (you have ${yCount} - please select only one)`);
    }
  }

  // Add warnings for potential issues
  if (xVariables.length > 10) {
    warnings.push('Large number of X variables may affect performance');
  }

  if (yVariables.length > 10) {
    warnings.push('Large number of Y variables may affect performance');
  }

  return { errors, warnings };
};