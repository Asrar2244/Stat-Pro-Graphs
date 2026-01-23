export interface ValidationError {
    field: string;
    message: string;
    severity: 'error' | 'warning';
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings?: ValidationError[];
}

export class ScatterPlotValidationError extends Error {
    constructor(public errors: ValidationError[]) {
        super(`Scatter plot validation failed: ${errors.map(e => e.message).join(', ')}`);
        this.name = 'ScatterPlotValidationError';
    }
}

/**
 * Validate 3D scatter plot requirements
 */
export function validateScatterPlotRequirements(
    dataFormat: string,
    selectedVariables: {
        x?: string[];
        y?: string[];
        z?: string[];
    }
): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate data format
    if (!dataFormat) {
        errors.push({
            field: 'dataFormat',
            message: 'Please select a data format',
            severity: 'error'
        });
        return { isValid: false, errors };
    }

    // Validate based on data format
    switch (dataFormat) {
        case 'XYZ Triplets':
            // Check existence
            if (!selectedVariables.x || selectedVariables.x.length === 0) {
                errors.push({
                    field: 'xVariables',
                    message: 'XYZ Triplets format requires at least one X variable',
                    severity: 'error'
                });
            }
            if (!selectedVariables.y || selectedVariables.y.length === 0) {
                errors.push({
                    field: 'yVariables',
                    message: 'XYZ Triplets format requires at least one Y variable',
                    severity: 'error'
                });
            }
            if (!selectedVariables.z || selectedVariables.z.length === 0) {
                errors.push({
                    field: 'zVariables',
                    message: 'XYZ Triplets format requires at least one Z variable',
                    severity: 'error'
                });
            }

            // Check equal lengths if all present
            if (selectedVariables.x?.length && selectedVariables.y?.length && selectedVariables.z?.length) {
                const xLen = selectedVariables.x.length;
                const yLen = selectedVariables.y.length;
                const zLen = selectedVariables.z.length;

                if (xLen !== yLen || xLen !== zLen) {
                    errors.push({
                        field: 'variables',
                        message: `XYZ Triplets requires equal number of variables. Selected: X(${xLen}), Y(${yLen}), Z(${zLen})`,
                        severity: 'error'
                    });
                }
            }
            break;

        case 'Many Z':
            if (!selectedVariables.z || selectedVariables.z.length !== 2) {
                errors.push({
                    field: 'zVariables',
                    message: 'Many Z format requires exactly 2 Z variables (First and Last)',
                    severity: 'error'
                });
            }
            break;

        case 'XY Many Z':
            if (!selectedVariables.x || selectedVariables.x.length !== 1) {
                errors.push({
                    field: 'xVariables',
                    message: 'XY Many Z format requires exactly one X variable',
                    severity: 'error'
                });
            }
            if (!selectedVariables.y || selectedVariables.y.length !== 1) {
                errors.push({
                    field: 'yVariables',
                    message: 'XY Many Z format requires exactly one Y variable',
                    severity: 'error'
                });
            }
            if (!selectedVariables.z || selectedVariables.z.length !== 2) {
                errors.push({
                    field: 'zVariables',
                    message: 'XY Many Z format requires exactly 2 Z variables (First and Last)',
                    severity: 'error'
                });
            }
            break;

        default:
            errors.push({
                field: 'dataFormat',
                message: `Unknown data format: ${dataFormat}`,
                severity: 'error'
            });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Debug validation function
 */
export function debugScatterPlotValidation(config: any, result: ValidationResult) {
    // Debug function
}
