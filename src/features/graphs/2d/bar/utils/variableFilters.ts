import { Variable } from '../types';

/**
 * Checks if a variable is valid for a particular slot
 */
export const isVariableValidForSlot = (variable: Variable, slot: 'x' | 'y' | 'errorBar' | 'category'): boolean => {
    if (slot === 'category') {
        // Only categorical variables for Category slot
        return variable.type === 'categorical';
    } else {
        // Only numeric variables for X, Y, and ErrorBar slots
        return variable.type === 'numeric';
    }
};
