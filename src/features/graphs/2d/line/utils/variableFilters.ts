import type { Variable } from '../linePlotSlice';

/**
 * Filters variables to only include numeric types
 * @param variables - Array of variables to filter
 * @returns Array of numeric variables
 */
export const getNumericVariables = (variables: Variable[]): Variable[] => {
  return variables.filter(v => v.type === 'numeric');
};

/**
 * Filters variables to only include categorical types
 * @param variables - Array of variables to filter
 * @returns Array of categorical variables
 */
export const getCategoricalVariables = (variables: Variable[]): Variable[] => {
  return variables.filter(v => v.type === 'categorical');
};

/**
 * Gets the appropriate variables for a specific variable type
 * @param variables - Array of all variables
 * @param variableType - The type of variable slot ('x', 'y', 'errorBar', 'category')
 * @returns Filtered variables appropriate for the slot
 */
export const getVariablesForSlot = (
  variables: Variable[],
  variableType: 'x' | 'y' | 'errorBar' | 'category'
): Variable[] => {
  switch (variableType) {
    case 'category':
      // Category variables must be categorical (text/words)
      return getCategoricalVariables(variables);
    case 'x':
    case 'y':
    case 'errorBar':
      // X, Y, and error bar variables should be numeric
      return getNumericVariables(variables);
    default:
      return variables;
  }
};

/**
 * Checks if a variable is valid for a specific slot
 * @param variable - The variable to check
 * @param variableType - The type of variable slot
 * @returns True if the variable is valid for the slot
 */
export const isVariableValidForSlot = (
  variable: Variable,
  variableType: 'x' | 'y' | 'errorBar' | 'category'
): boolean => {
  switch (variableType) {
    case 'category':
      return variable.type === 'categorical';
    case 'x':
    case 'y':
    case 'errorBar':
      return variable.type === 'numeric';
    default:
      return true;
  }
};


