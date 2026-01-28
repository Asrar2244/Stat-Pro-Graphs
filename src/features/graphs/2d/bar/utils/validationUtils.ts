import { logValidationFailure } from './errorLogger';
import { BarPlotSubType, DataFormat } from '../types';
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

export const validateBarPlotRequirements = (
    subType: BarPlotSubType | undefined,
    dataFormat: DataFormat | undefined,
    selectedVariables: {
        x?: string[];
        y?: string[];
        category?: string[];
        errorBar?: string[];
    }
): ValidationResult => {
    const errors: ValidationError[] = [];

    if (!subType) {
        errors.push({
            field: 'subType',
            message: 'Please select a bar plot type',
            severity: 'error'
        });
    }

    if (!dataFormat) {
        errors.push({
            field: 'dataFormat',
            message: 'Please select a data format',
            severity: 'error'
        });
    } else if (subType && !isValidDataFormat(subType, dataFormat)) {
        errors.push({
            field: 'dataFormat',
            message: `The selected data format "${dataFormat}" is not valid for "${subType}"`,
            severity: 'error'
        });
    }

    if (!subType) {
        return { isValid: false, errors };
    }

    // Basic variable checks if data format is valid
    if (dataFormat) {
        if (!selectedVariables.x && !selectedVariables.y && !selectedVariables.category && !selectedVariables.errorBar) {
            // Only if specific format requirements aren't met below... 
            // But wait, we should check specifically.
        }

        // Check specific format requirements
        // This logic can be quite complex, adapting from scatter

        // Check for error bar requirements
        const requiresErrorBar = subType.toLowerCase().includes('error bar');
        if (requiresErrorBar) {
            if (!selectedVariables.errorBar || selectedVariables.errorBar.length === 0) {
                errors.push({
                    field: 'errorBarVariables',
                    message: 'Please select error bar variables for error bar plots',
                    severity: 'error'
                });
            }
        }

        // Check data format specifics
        switch (dataFormat) {
            case 'XY Pair':
            case 'XY Pairs':
                if (!selectedVariables.x?.length || !selectedVariables.y?.length) {
                    errors.push({ field: 'variables', message: 'XY Pair requires both X and Y variables', severity: 'error' });
                }
                if (selectedVariables.x?.length !== selectedVariables.y?.length) {
                    errors.push({ field: 'variables', message: 'XY Pair requires equal number of X and Y variables', severity: 'error' });
                }
                break;
            case 'Single Y':
                if (!selectedVariables.y?.length) {
                    errors.push({ field: 'yVariables', message: 'Please select at least one Y variable', severity: 'error' });
                }
                break;
            case 'Many Y':
                if (!selectedVariables.y?.length) {
                    errors.push({ field: 'yVariables', message: 'Please select at least one Y variable', severity: 'error' });
                }
                break;
            case 'Single X':
                if (!selectedVariables.x?.length) {
                    errors.push({ field: 'xVariables', message: 'Please select at least one X variable', severity: 'error' });
                }
                break;
            case 'Many X':
                if (!selectedVariables.x?.length) {
                    errors.push({ field: 'xVariables', message: 'Please select at least one X variable', severity: 'error' });
                }
                break;
            case 'X Many Y':
                if (!selectedVariables.x?.length || !selectedVariables.y?.length) {
                    errors.push({ field: 'variables', message: 'X Many Y requires both X and Y variables', severity: 'error' });
                }
                if (selectedVariables.x?.length !== 1) {
                    errors.push({ field: 'xVariables', message: 'X Many Y requires exactly one X variable', severity: 'error' });
                }
                break;
            case 'Y Many X':
                if (!selectedVariables.x?.length || !selectedVariables.y?.length) {
                    errors.push({ field: 'variables', message: 'Y Many X requires both X and Y variables', severity: 'error' });
                }
                if (selectedVariables.y?.length !== 1) {
                    errors.push({ field: 'yVariables', message: 'Y Many X requires exactly one Y variable', severity: 'error' });
                }
                break;
            case 'XY Category':
                if (!selectedVariables.x?.length || !selectedVariables.y?.length) {
                    errors.push({ field: 'variables', message: 'XY Category requires both X and Y variables', severity: 'error' });
                }
                if (!selectedVariables.category?.length) {
                    errors.push({ field: 'categoryVariables', message: 'Please select a category variable', severity: 'error' });
                }
                break;
            case 'X Category':
                if (!selectedVariables.x?.length) {
                    errors.push({ field: 'xVariables', message: 'Please select at least one X variable', severity: 'error' });
                }
                if (!selectedVariables.category?.length) {
                    errors.push({ field: 'categoryVariables', message: 'Please select a category variable', severity: 'error' });
                }
                break;
            case 'Y Category':
                if (!selectedVariables.y?.length) {
                    errors.push({ field: 'yVariables', message: 'Please select at least one Y variable', severity: 'error' });
                }
                if (!selectedVariables.category?.length) {
                    errors.push({ field: 'categoryVariables', message: 'Please select a category variable', severity: 'error' });
                }
                break;
            default:
                // For any unhandled format, check if at least one variable is selected
                if (!selectedVariables.x?.length && !selectedVariables.y?.length && !selectedVariables.category?.length) {
                    errors.push({ field: 'variables', message: 'Please select at least one variable', severity: 'error' });
                }
                break;
        }
    }

    if (errors.length > 0) {
        errors.forEach(error => {
            logValidationFailure(error.message, {
                component: 'BarPlotValidation',
                action: 'validateRequirements',
                additionalData: { subType, dataFormat, selectedVariables, error }
            });
        });
    }

    return {
        isValid: errors.filter(e => e.severity === 'error').length === 0,
        errors
    };
};

export class BarPlotValidationError extends Error {
    public errors: ValidationError[];
    public field: string;

    constructor(errors: ValidationError[]) {
        const errorMessages = errors.map(e => e.message).join('; ');
        super(`Validation failed: ${errorMessages}`);
        this.name = 'BarPlotValidationError';
        this.errors = errors;
        this.field = errors[0]?.field || 'unknown';
    }
}
