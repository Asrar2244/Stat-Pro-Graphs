import { logValidationFailure } from './errorLogger';
import { ScatterPlotSubType, DataFormat } from '../types';
import { isValidDataFormat } from '../constants';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates if required variables are selected for graph creation
 */
export const validateScatterPlotRequirements = (
  subType: ScatterPlotSubType | undefined,
  dataFormat: DataFormat | undefined,
  selectedVariables: {
    x?: string[];
    y?: string[];
    category?: string[];
    errorBar?: string[];
  }
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Basic requirements
  if (!subType) {
    errors.push({
      field: 'subType',
      message: 'Please select a scatter plot type',
      severity: 'error'
    });
  }

  // Check if data format is selected
  if (!dataFormat) {
    // If variables are selected but no data format, suggest based on selections
    const hasX = selectedVariables.x && selectedVariables.x.length > 0;
    const hasY = selectedVariables.y && selectedVariables.y.length > 0;
    const hasCategory = selectedVariables.category && selectedVariables.category.length > 0;
    
    if (hasX && hasY) {
      if (hasCategory) {
        errors.push({
          field: 'dataFormat',
          message: 'Please select a data format. Based on your variables, try "XY Category" format',
          severity: 'error'
        });
      } else {
        errors.push({
          field: 'dataFormat',
          message: 'Please select a data format. Based on your variables, try "XY Pair" format',
          severity: 'error'
        });
      }
    } else if (hasX && !hasY) {
      errors.push({
        field: 'dataFormat',
        message: 'Please select a data format. Based on your variables, try "Single X" format',
        severity: 'error'
      });
    } else if (!hasX && hasY) {
      errors.push({
        field: 'dataFormat',
        message: 'Please select a data format. Based on your variables, try "Single Y" format',
        severity: 'error'
      });
    } else {
      errors.push({
        field: 'dataFormat',
        message: 'Please select a data format',
        severity: 'error'
      });
    }
  } else if (!isValidDataFormat(subType, dataFormat)) {
    errors.push({
      field: 'dataFormat',
      message: `The selected data format "${dataFormat}" is not valid for "${subType}"`,
      severity: 'error'
    });
  }

  // If basic requirements are missing, return early
  if (!subType) {
    return { isValid: false, errors };
  }

  // Variable requirements based on subType and data format
  // Only check basic X/Y requirements if data format is not selected or is a general format
  if (!dataFormat || dataFormat === 'XY Pair' || dataFormat === 'XY Pairs') {
    const hasX = selectedVariables.x && selectedVariables.x.length > 0;
    const hasY = selectedVariables.y && selectedVariables.y.length > 0;
    
    if (!hasX && !hasY) {
      errors.push({
        field: 'variables',
        message: 'Please select X and Y variables for your scatter plot',
        severity: 'error'
      });
    } else if (!hasX) {
      errors.push({
        field: 'xVariables',
        message: 'Please select X variables',
        severity: 'error'
      });
    } else if (!hasY) {
      errors.push({
        field: 'yVariables',
        message: 'Please select Y variables',
        severity: 'error'
      });
    }
  }

  // Check if data format is selected but no variables are chosen
  if (dataFormat && !selectedVariables.x && !selectedVariables.y && !selectedVariables.category && !selectedVariables.errorBar) {
    errors.push({
      field: 'variables',
      message: 'Please select variables for your data format',
      severity: 'error'
    });
  }

  // Check for error bar requirements
  const requiresErrorBar = subType.includes('Error Bar');
  if (requiresErrorBar) {
    if (!selectedVariables.errorBar || selectedVariables.errorBar.length === 0) {
      errors.push({
        field: 'errorBarVariables',
        message: 'Please select error bar variables for error bar plots',
        severity: 'error'
      });
    }
  }

  // Check for category requirements based on data format, not just subType
  const requiresCategory = dataFormat && (
    dataFormat === 'XY Category' ||
    dataFormat === 'X Category' ||
    dataFormat === 'Y Category' ||
    dataFormat === 'Category Many X' || 
    dataFormat === 'Category Many Y'
  );
  
  if (requiresCategory) {
    if (!selectedVariables.category || selectedVariables.category.length === 0) {
      errors.push({
        field: 'categoryVariables',
        message: `Please select category variables for ${dataFormat} format`,
        severity: 'error'
      });
    }
  }

  // Additional validation based on data format
  // Check for incompatible combinations
  const isSingleFormat = dataFormat === 'Single X' || dataFormat === 'Single Y';
  const hasCategoryVars = selectedVariables.category && selectedVariables.category.length > 0;
  
  if (isSingleFormat && hasCategoryVars) {
    errors.push({
      field: 'dataFormat',
      message: 'Single data formats cannot be used with category variables',
      severity: 'warning'
    });
  }

  // Warn when category variables are selected but not needed
  if (hasCategoryVars && !requiresCategory) {
    errors.push({
      field: 'categoryVariables',
      message: `${dataFormat} format does not require category variables`,
      severity: 'warning'
    });
  }

  // Data format specific validation
  if (dataFormat) {
    switch (dataFormat) {
      case 'XY Pair':
        const hasXForXY = selectedVariables.x && selectedVariables.x.length > 0;
        const hasYForXY = selectedVariables.y && selectedVariables.y.length > 0;
        
        if (!hasXForXY && !hasYForXY) {
          errors.push({
            field: 'variables',
            message: 'XY Pair format requires X and Y variables - please select both',
            severity: 'error'
          });
        } else if (!hasXForXY) {
          errors.push({
            field: 'xVariables',
            message: 'Please select X variables for XY Pair format',
            severity: 'error'
          });
        } else if (!hasYForXY) {
          errors.push({
            field: 'yVariables',
            message: 'Please select Y variables for XY Pair format',
            severity: 'error'
          });
        }
        break;

      case 'Single X':
        if (!selectedVariables.x || selectedVariables.x.length === 0) {
          errors.push({
            field: 'xVariables',
            message: 'Please select X variables for Single X format',
            severity: 'error'
          });
        }
        if (selectedVariables.y && selectedVariables.y.length > 0) {
          errors.push({
            field: 'yVariables',
            message: 'Single X format should not have Y variables (Y is assumed as index)',
            severity: 'warning'
          });
        }
        break;

      case 'Single Y':
        if (!selectedVariables.y || selectedVariables.y.length === 0) {
          errors.push({
            field: 'yVariables',
            message: 'Please select Y variables for Single Y format',
            severity: 'error'
          });
        }
        if (selectedVariables.x && selectedVariables.x.length > 0) {
          errors.push({
            field: 'xVariables',
            message: 'Single Y format should not have X variables (X is assumed as index)',
            severity: 'warning'
          });
        }
        break;

      case 'XY Pairs':
        const hasXForPairs = selectedVariables.x && selectedVariables.x.length > 0;
        const hasYForPairs = selectedVariables.y && selectedVariables.y.length > 0;
        
        if (!hasXForPairs && !hasYForPairs) {
          errors.push({
            field: 'variables',
            message: 'XY Pairs format requires X and Y variables - please select both',
            severity: 'error'
          });
        } else if (!hasXForPairs) {
          errors.push({
            field: 'xVariables',
            message: 'Please select X variables for XY Pairs format',
            severity: 'error'
          });
        } else if (!hasYForPairs) {
          errors.push({
            field: 'yVariables',
            message: 'Please select Y variables for XY Pairs format',
            severity: 'error'
          });
        }
        if (hasXForPairs && hasYForPairs && selectedVariables.x.length !== selectedVariables.y.length) {
          errors.push({
            field: 'variables',
            message: 'XY Pairs format requires equal number of X and Y variables',
            severity: 'warning'
          });
        }
        break;

      case 'X Many Y':
        const hasXForManyY = selectedVariables.x && selectedVariables.x.length > 0;
        const hasYForManyY = selectedVariables.y && selectedVariables.y.length > 0;
        
        if (!hasXForManyY && !hasYForManyY) {
          errors.push({
            field: 'variables',
            message: 'X Many Y format requires one X variable and multiple Y variables',
            severity: 'error'
          });
        } else if (!hasXForManyY) {
          errors.push({
            field: 'xVariables',
            message: 'Please select one X variable for X Many Y format',
            severity: 'error'
          });
        } else if (hasXForManyY && selectedVariables.x.length !== 1) {
          errors.push({
            field: 'xVariables',
            message: 'X Many Y format requires exactly one X variable (you have ' + (selectedVariables.x?.length || 0) + ')',
            severity: 'error'
          });
        } else if (!hasYForManyY) {
          errors.push({
            field: 'yVariables',
            message: 'Please select Y variables for X Many Y format',
            severity: 'error'
          });
        }
        break;

      case 'Y Many X':
        const hasXForManyX = selectedVariables.x && selectedVariables.x.length > 0;
        const hasYForManyX = selectedVariables.y && selectedVariables.y.length > 0;
        
        if (!hasXForManyX && !hasYForManyX) {
          errors.push({
            field: 'variables',
            message: 'Y Many X format requires one Y variable and multiple X variables',
            severity: 'error'
          });
        } else if (!hasYForManyX) {
          errors.push({
            field: 'yVariables',
            message: 'Please select one Y variable for Y Many X format',
            severity: 'error'
          });
        } else if (hasYForManyX && selectedVariables.y && selectedVariables.y.length !== 1) {
          errors.push({
            field: 'yVariables',
            message: 'Y Many X format requires exactly one Y variable (you have ' + (selectedVariables.y?.length || 0) + ')',
            severity: 'error'
          });
        } else if (!hasXForManyX) {
          errors.push({
            field: 'xVariables',
            message: 'Please select X variables for Y Many X format',
            severity: 'error'
          });
        }
        break;

      case 'Many X':
        if (!selectedVariables.x || selectedVariables.x.length === 0) {
          errors.push({
            field: 'xVariables',
            message: 'Please select X variables for Many X format',
            severity: 'error'
          });
        }
        if (selectedVariables.y && selectedVariables.y.length > 0) {
          errors.push({
            field: 'yVariables',
            message: 'Many X format should not have Y variables (Y is assumed as index)',
            severity: 'warning'
          });
        }
        break;

      case 'Many Y':
        if (!selectedVariables.y || selectedVariables.y.length === 0) {
          errors.push({
            field: 'yVariables',
            message: 'Please select Y variables for Many Y format',
            severity: 'error'
          });
        }
        if (selectedVariables.x && selectedVariables.x.length > 0) {
          errors.push({
            field: 'xVariables',
            message: 'Many Y format should not have X variables (X is assumed as index)',
            severity: 'warning'
          });
        }
        break;

      case 'XY Category':
        const hasXForCategory = selectedVariables.x && selectedVariables.x.length > 0;
        const hasYForCategory = selectedVariables.y && selectedVariables.y.length > 0;
        const hasCategoryForCategory = selectedVariables.category && selectedVariables.category.length > 0;
        
        if (!hasXForCategory && !hasYForCategory && !hasCategoryForCategory) {
          errors.push({
            field: 'variables',
            message: 'XY Category format requires X, Y, and category variables - please select all three',
            severity: 'error'
          });
        } else {
          if (!hasXForCategory) {
            errors.push({
              field: 'xVariables',
              message: 'Please select X variables for XY Category format',
              severity: 'error'
            });
          }
          if (!hasYForCategory) {
            errors.push({
              field: 'yVariables',
              message: 'Please select Y variables for XY Category format',
              severity: 'error'
            });
          }
          if (!hasCategoryForCategory) {
            errors.push({
              field: 'categoryVariables',
              message: 'Please select category variables for XY Category format',
              severity: 'error'
            });
          }
        }
        break;

      case 'X Category':
        const hasXForXCategory = selectedVariables.x && selectedVariables.x.length > 0;
        const hasCategoryForXCategory = selectedVariables.category && selectedVariables.category.length > 0;
        
        if (!hasXForXCategory && !hasCategoryForXCategory) {
          errors.push({
            field: 'variables',
            message: 'X Category format requires X and category variables - please select both',
            severity: 'error'
          });
        } else if (!hasXForXCategory) {
          errors.push({
            field: 'xVariables',
            message: 'Please select X variables for X Category format',
            severity: 'error'
          });
        } else if (!hasCategoryForXCategory) {
          errors.push({
            field: 'categoryVariables',
            message: 'Please select category variables for X Category format',
            severity: 'error'
          });
        }
        break;

      case 'Y Category':
        const hasYForYCategory = selectedVariables.y && selectedVariables.y.length > 0;
        const hasCategoryForYCategory = selectedVariables.category && selectedVariables.category.length > 0;
        
        if (!hasYForYCategory && !hasCategoryForYCategory) {
          errors.push({
            field: 'variables',
            message: 'Y Category format requires Y and category variables - please select both',
            severity: 'error'
          });
        } else if (!hasYForYCategory) {
          errors.push({
            field: 'yVariables',
            message: 'Please select Y variables for Y Category format',
            severity: 'error'
          });
        } else if (!hasCategoryForYCategory) {
          errors.push({
            field: 'categoryVariables',
            message: 'Please select category variables for Y Category format',
            severity: 'error'
          });
        }
        break;

      case 'X Many Y Replicates':
        const hasXForReplicates = selectedVariables.x && selectedVariables.x.length > 0;
        const hasYForReplicates = selectedVariables.y && selectedVariables.y.length > 0;
        
        if (!hasXForReplicates && !hasYForReplicates) {
          errors.push({
            field: 'variables',
            message: 'X Many Y Replicates format requires one X variable and multiple Y variables in sets of 2',
            severity: 'error'
          });
        } else if (!hasXForReplicates) {
          errors.push({
            field: 'xVariables',
            message: 'Please select one X variable for X Many Y Replicates format',
            severity: 'error'
          });
        } else if (hasXForReplicates && selectedVariables.x.length !== 1) {
          errors.push({
            field: 'xVariables',
            message: 'X Many Y Replicates format requires exactly one X variable (you have ' + (selectedVariables.x?.length || 0) + ')',
            severity: 'error'
          });
        } else if (!hasYForReplicates) {
          errors.push({
            field: 'yVariables',
            message: 'Please select Y variables for X Many Y Replicates format',
            severity: 'error'
          });
        } else if (hasYForReplicates && selectedVariables.y && selectedVariables.y.length % 2 !== 0) {
          errors.push({
            field: 'yVariables',
            message: `X Many Y Replicates format requires Y variables in complete sets of 2. You have ${selectedVariables.y.length} Y variables (${Math.floor(selectedVariables.y.length / 2)} complete sets + 1 incomplete). Please select one more Y variable to complete the set.`,
            severity: 'error'
          });
        }
        break;

      case 'Many Y Replicates':
        const hasYForManyReplicates = selectedVariables.y && selectedVariables.y.length > 0;
        
        if (!hasYForManyReplicates) {
          errors.push({
            field: 'yVariables',
            message: 'Please select Y variables for Many Y Replicates format',
            severity: 'error'
          });
        } else if (hasYForManyReplicates && selectedVariables.y && selectedVariables.y.length % 2 !== 0) {
          errors.push({
            field: 'yVariables',
            message: `Many Y Replicates format requires Y variables in complete sets of 2. You have ${selectedVariables.y.length} Y variables (${Math.floor(selectedVariables.y.length / 2)} complete sets + 1 incomplete). Please select one more Y variable to complete the set.`,
            severity: 'error'
          });
        }
        if (selectedVariables.x && selectedVariables.x.length > 0) {
          errors.push({
            field: 'xVariables',
            message: 'Many Y Replicates format should not have X variables (X is assumed as index)',
            severity: 'warning'
          });
        }
        break;

      case 'Y Many X Replicates':
        const hasYForYReplicates = selectedVariables.y && selectedVariables.y.length > 0;
        const hasXForYReplicates = selectedVariables.x && selectedVariables.x.length > 0;
        
        if (!hasYForYReplicates && !hasXForYReplicates) {
          errors.push({
            field: 'variables',
            message: 'Y Many X Replicates format requires one Y variable and multiple X variables in sets of 2',
            severity: 'error'
          });
        } else if (!hasYForYReplicates) {
          errors.push({
            field: 'yVariables',
            message: 'Please select one Y variable for Y Many X Replicates format',
            severity: 'error'
          });
        } else if (hasYForYReplicates && selectedVariables.y.length !== 1) {
          errors.push({
            field: 'yVariables',
            message: 'Y Many X Replicates format requires exactly one Y variable (you have ' + (selectedVariables.y?.length || 0) + ')',
            severity: 'error'
          });
        } else if (!hasXForYReplicates) {
          errors.push({
            field: 'xVariables',
            message: 'Please select X variables for Y Many X Replicates format',
            severity: 'error'
          });
        } else if (hasXForYReplicates && selectedVariables.x && selectedVariables.x.length % 2 !== 0) {
          errors.push({
            field: 'xVariables',
            message: `Y Many X Replicates format requires X variables in complete sets of 2. You have ${selectedVariables.x.length} X variables (${Math.floor(selectedVariables.x.length / 2)} complete sets + 1 incomplete). Please select one more X variable to complete the set.`,
            severity: 'error'
          });
        }
        break;

      case 'Many X Replicates':
        const hasXForManyXReplicates = selectedVariables.x && selectedVariables.x.length > 0;
        
        if (!hasXForManyXReplicates) {
          errors.push({
            field: 'xVariables',
            message: 'Please select X variables for Many X Replicates format',
            severity: 'error'
          });
        } else if (hasXForManyXReplicates && selectedVariables.x && selectedVariables.x.length % 2 !== 0) {
          errors.push({
            field: 'xVariables',
            message: `Many X Replicates format requires X variables in complete sets of 2. You have ${selectedVariables.x.length} X variables (${Math.floor(selectedVariables.x.length / 2)} complete sets + 1 incomplete). Please select one more X variable to complete the set.`,
            severity: 'error'
          });
        }
        if (selectedVariables.y && selectedVariables.y.length > 0) {
          errors.push({
            field: 'yVariables',
            message: 'Many X Replicates format should not have Y variables (Y is assumed as index)',
            severity: 'warning'
          });
        }
        break;
    }
  }

  // Log validation failures
  if (errors.length > 0) {
    errors.forEach(error => {
      logValidationFailure(error.message, {
        component: 'ScatterPlotValidation',
        action: 'validateRequirements',
        additionalData: {
          subType,
          dataFormat,
          selectedVariables,
          error
        }
      });
    });
  }

  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors
  };
};

/**
 * Gets user-friendly error messages grouped by field
 */
export const getValidationErrorMessages = (errors: ValidationError[]): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {};
  
  errors.forEach(error => {
    if (!grouped[error.field]) {
      grouped[error.field] = [];
    }
    grouped[error.field].push(error.message);
  });

  return grouped;
};

/**
 * Throws a validation error with detailed information
 */
export class ScatterPlotValidationError extends Error {
  public errors: ValidationError[];
  public field: string;

  constructor(errors: ValidationError[]) {
    const errorMessages = errors.map(e => e.message).join('; ');
    super(`Validation failed: ${errorMessages}`);
    this.name = 'ScatterPlotValidationError';
    this.errors = errors;
    this.field = errors[0]?.field || 'unknown';
  }
}
