import type { LineScatterSubType, DataFormat, Variable } from '../lineScatterPlotSlice';
import { validateFormatRequirements, requiresX, requiresY, requiresCategory } from './formatRequirements';
import { validateDataFormatCompatibility } from './dataFormatHelpers';

/**
 * Custom error class for line-scatter plot validation errors
 */
export class LineScatterPlotValidationError extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('Line-Scatter Plot validation failed');
    this.name = 'LineScatterPlotValidationError';
    this.errors = errors;
  }
}

/**
 * Validates line-scatter plot requirements
 */
export const validateLineScatterPlotRequirements = (
  subType: LineScatterSubType,
  dataFormat: DataFormat,
  selectedVariables: {
    x?: string[];
    y?: string[];
    category?: string[];
    errorBar?: string[];
  }
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Basic configuration validation
  if (!subType) {
    errors.push({
      field: 'subType',
      message: 'Plot sub-type selection is required',
      severity: 'error',
    });
  }

  if (!dataFormat) {
    errors.push({
      field: 'dataFormat',
      message: 'Data format selection is required',
      severity: 'error',
    });
  }

  // If we don't have basic requirements, skip further validation
  if (!subType || !dataFormat) {
    return { isValid: false, errors, warnings };
  }

  // Data format compatibility validation
  const compatibilityResult = validateDataFormatCompatibility(subType, dataFormat);
  if (!compatibilityResult.isValid) {
    errors.push({
      field: 'dataFormat',
      message: compatibilityResult.message || 'Data format is not compatible with selected sub-type',
      severity: 'error',
    });
  }


  // Variable selection validation
  const formatValidation = validateFormatRequirements(
    dataFormat,
    selectedVariables.x || [],
    selectedVariables.y || [],
    selectedVariables.category || [],
    selectedVariables.errorBar || []
  );

  // Add format validation errors
  formatValidation.errors.forEach(error => {
    errors.push({
      field: 'variables',
      message: error,
      severity: 'error',
    });
  });

  // Add format validation warnings
  formatValidation.warnings.forEach(warning => {
    warnings.push({
      field: 'variables',
      message: warning,
    });
  });

  // Error bar specific validation
  if (subType.includes('Error Bars') || subType.includes('Horizontal Error Bars') || subType.includes('Bi-Directional Error Bars')) {
    // For now, we'll skip symbol value validation since it's handled elsewhere
    // This can be enhanced later if needed
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

/**
 * Comprehensive validation for line-scatter plot configuration
 */
export const validateLineScatterPlotConfiguration = (config: {
  subType?: LineScatterSubType;
  dataFormat?: DataFormat;
  xVariables: string[];
  yVariables: string[];
  categoryVariables?: string[];
  errorBarVariables?: string[];
  symbolValue?: string;
  errorCalculationUpper?: string;
  errorCalculationLower?: string;
  selectedProject?: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Basic configuration validation
  if (!config.selectedProject) {
    errors.push({
      field: 'selectedProject',
      message: 'Project selection is required',
      severity: 'error',
    });
  }

  if (!config.subType) {
    errors.push({
      field: 'subType',
      message: 'Plot sub-type selection is required',
      severity: 'error',
    });
  }

  if (!config.dataFormat) {
    errors.push({
      field: 'dataFormat',
      message: 'Data format selection is required',
      severity: 'error',
    });
  }

  // If we don't have basic requirements, skip further validation
  if (!config.subType || !config.dataFormat) {
    return { isValid: false, errors, warnings };
  }

  // Data format compatibility validation
  const compatibilityResult = validateDataFormatCompatibility(config.subType, config.dataFormat);
  if (!compatibilityResult.isValid) {
    errors.push({
      field: 'dataFormat',
      message: compatibilityResult.message || 'Data format is not compatible with selected sub-type',
      severity: 'error',
    });
  }

  // Variable selection validation
  const formatValidation = validateFormatRequirements(
    config.dataFormat,
    config.xVariables,
    config.yVariables,
    config.categoryVariables || [],
    config.errorBarVariables || []
  );

  // Add format validation errors
  formatValidation.errors.forEach(error => {
    errors.push({
      field: 'variables',
      message: error,
      severity: 'error',
    });
  });

  // Add format validation warnings
  formatValidation.warnings.forEach(warning => {
    warnings.push({
      field: 'variables',
      message: warning,
    });
  });

  // Error bar specific validation
  if (config.subType.includes('Error Bars') || config.subType.includes('Horizontal Error Bars') || config.subType.includes('Bi-Directional Error Bars')) {
    if (!config.symbolValue) {
      errors.push({
        field: 'symbolValue',
        message: 'Symbol value configuration is required for error bar plots',
        severity: 'error',
      });
    }

    if (config.symbolValue === 'Asymmetric Error Bar Column') {
      if (!config.errorCalculationUpper && !config.errorCalculationLower) {
        errors.push({
          field: 'errorCalculation',
          message: 'At least one error calculation method must be specified for asymmetric error bars',
          severity: 'error',
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validates variable types for the selected data format
 */
export const validateVariableTypes = (
  dataFormat: DataFormat,
  variables: Variable[],
  xVariables: string[],
  yVariables: string[],
  categoryVariables: string[] = []
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Create a map for quick variable lookup
  const variableMap = new Map(variables.map(v => [v.name, v]));

  // Validate X variables
  xVariables.forEach(varName => {
    const variable = variableMap.get(varName);
    if (variable && variable.type !== 'numeric') {
      if (dataFormat === 'X Category') {
        warnings.push({
          field: 'xVariables',
          message: `Variable "${varName}" is not numeric but is being used as X variable`,
          suggestion: 'Consider using categorical variables for category-based formats',
        });
      } else {
        errors.push({
          field: 'xVariables',
          message: `Variable "${varName}" must be numeric for X-axis`,
          severity: 'error',
        });
      }
    }
  });

  // Validate Y variables
  yVariables.forEach(varName => {
    const variable = variableMap.get(varName);
    if (variable && variable.type !== 'numeric') {
      if (dataFormat === 'Y Category') {
        warnings.push({
          field: 'yVariables',
          message: `Variable "${varName}" is not numeric but is being used as Y variable`,
          suggestion: 'Consider using categorical variables for category-based formats',
        });
      } else {
        errors.push({
          field: 'yVariables',
          message: `Variable "${varName}" must be numeric for Y-axis`,
          severity: 'error',
        });
      }
    }
  });

  // Validate category variables
  categoryVariables.forEach(varName => {
    const variable = variableMap.get(varName);
    if (variable && variable.type !== 'categorical') {
      warnings.push({
        field: 'categoryVariables',
        message: `Variable "${varName}" is not categorical but is being used as category variable`,
        suggestion: 'Consider using numeric variables as categories if appropriate',
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validates error bar configuration
 */
export const validateErrorBarConfiguration = (config: {
  symbolValue?: string;
  errorCalculationUpper?: string;
  errorCalculationLower?: string;
  errorBarVariables: string[];
}): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!config.symbolValue) {
    errors.push({
      field: 'symbolValue',
      message: 'Symbol value must be specified for error bar plots',
      severity: 'error',
    });
  }

  if (config.symbolValue === 'Asymmetric Error Bar Column') {
    if (!config.errorCalculationUpper && !config.errorCalculationLower) {
      errors.push({
        field: 'errorCalculation',
        message: 'At least one error calculation method (upper or lower) must be specified',
        severity: 'error',
      });
    }

    if (config.errorBarVariables.length === 0) {
      errors.push({
        field: 'errorBarVariables',
        message: 'Error bar variables must be specified for asymmetric error bars',
        severity: 'error',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Quick validation for UI state changes
 */
export const quickValidate = (field: string, value: any, config: any): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  switch (field) {
    case 'subType':
      if (!value) {
        errors.push({
          field: 'subType',
          message: 'Sub-type selection is required',
          severity: 'error',
        });
      }
      break;

    case 'dataFormat':
      if (!value) {
        errors.push({
          field: 'dataFormat',
          message: 'Data format selection is required',
          severity: 'error',
        });
      }
      break;

    case 'selectedProject':
      if (!value) {
        errors.push({
          field: 'selectedProject',
          message: 'Project selection is required',
          severity: 'error',
        });
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};