import { DataFormat } from '../types';

export interface BoxPlotValidationResult {
    isValid: boolean;
    errors: Array<{
        field: string;
        message: string;
        severity: 'error' | 'warning';
    }>;
}

export const validateBoxPlotRequirements = (
    dataFormat: DataFormat | null,
    variables: { x?: string[], y?: string[] }
): BoxPlotValidationResult => {
    const errors: BoxPlotValidationResult['errors'] = [];
    const xCount = variables.x?.length || 0;
    const yCount = variables.y?.length || 0;

    if (!dataFormat) {
        errors.push({
            field: 'dataFormat',
            message: 'Data Format is required',
            severity: 'error'
        });
        return { isValid: false, errors };
    }

    // Box Plots
    // A) Vertical (Many Y, X Many Y)
    // B) Horizontal (Many X, Y Many X)

    switch (dataFormat) {
        case 'Many Y':
            // Requires at least one Y. X is disabled/ignored (sequence or none)
            if (yCount < 1) {
                errors.push({
                    field: 'y',
                    message: 'At least one Y variable is required for "Many Y" format',
                    severity: 'error'
                });
            }
            break;

        case 'X Many Y':
            // Requires exactly 1 X and at least 1 Y
            if (xCount !== 1) {
                errors.push({
                    field: 'x',
                    message: 'Exactly one X variable is required for "X Many Y" format',
                    severity: 'error'
                });
            }
            if (yCount < 1) {
                errors.push({
                    field: 'y',
                    message: 'At least one Y variable is required for "X Many Y" format',
                    severity: 'error'
                });
            }
            break;

        case 'Many X':
            // Requires at least one X. Y is disabled/ignored
            if (xCount < 1) {
                errors.push({
                    field: 'x',
                    message: 'At least one X variable is required for "Many X" format',
                    severity: 'error'
                });
            }
            break;

        case 'Y Many X':
            // Requires exactly 1 Y and at least 1 X
            if (yCount !== 1) {
                errors.push({
                    field: 'y',
                    message: 'Exactly one Y variable is required for "Y Many X" format',
                    severity: 'error'
                });
            }
            if (xCount < 1) {
                errors.push({
                    field: 'x',
                    message: 'At least one X variable is required for "Y Many X" format',
                    severity: 'error'
                });
            }
            break;

        default:
            errors.push({
                field: 'dataFormat',
                message: 'Unknown Data Format',
                severity: 'error'
            });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export class BoxPlotValidationError extends Error {
    errors: any[];
    constructor(errors: any[]) {
        super('Box Plot Validation Failed');
        this.name = 'BoxPlotValidationError';
        this.errors = errors;
    }
}
