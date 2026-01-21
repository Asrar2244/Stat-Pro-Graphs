import { logValidationFailure } from './errorLogger';
import { AreaSubType, DataFormat } from '../areaPlotSlice';
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
export const validateAreaPlotRequirements = (
    subType: AreaSubType | undefined,
    dataFormat: DataFormat | undefined,
    selectedVariables: {
        x?: string[];
        y?: string[];
    }
): ValidationResult => {
    const errors: ValidationError[] = [];

    // Basic requirements
    if (!subType) {
        errors.push({
            field: 'subType',
            message: 'Please select an area plot type',
            severity: 'error'
        });
    }

    // Check if data format is selected
    if (!dataFormat) {
        // If variables are selected but no data format, suggest based on selections
        const hasX = selectedVariables.x && selectedVariables.x.length > 0;
        const hasY = selectedVariables.y && selectedVariables.y.length > 0;

        if (hasX && hasY) {
            errors.push({
                field: 'dataFormat',
                message: 'Please select a data format. Based on your variables, try "XY Pair" format',
                severity: 'error'
            });
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
    if (!dataFormat || dataFormat === 'XY Pair' || dataFormat === 'XY Pairs' || dataFormat === 'YX Pair' || dataFormat === 'YX Pairs') {
        const hasX = selectedVariables.x && selectedVariables.x.length > 0;
        const hasY = selectedVariables.y && selectedVariables.y.length > 0;

        if (!hasX && !hasY) {
            errors.push({
                field: 'variables',
                message: 'Please select X and Y variables for your area plot',
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
    if (dataFormat && !selectedVariables.x && !selectedVariables.y) {
        errors.push({
            field: 'variables',
            message: 'Please select variables for your data format',
            severity: 'error'
        });
    }

    // Data format specific validation
    if (dataFormat) {
        switch (dataFormat) {
            case 'XY Pair':
            case 'YX Pair':
                const hasXForXY = selectedVariables.x && selectedVariables.x.length > 0;
                const hasYForXY = selectedVariables.y && selectedVariables.y.length > 0;

                if (!hasXForXY && !hasYForXY) {
                    errors.push({
                        field: 'variables',
                        message: `${dataFormat} format requires X and Y variables - please select both`,
                        severity: 'error'
                    });
                } else if (!hasXForXY) {
                    errors.push({
                        field: 'xVariables',
                        message: `Please select X variables for ${dataFormat} format`,
                        severity: 'error'
                    });
                } else if (!hasYForXY) {
                    errors.push({
                        field: 'yVariables',
                        message: `Please select Y variables for ${dataFormat} format`,
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
            case 'YX Pairs':
                const hasXForPairs = selectedVariables.x && selectedVariables.x.length > 0;
                const hasYForPairs = selectedVariables.y && selectedVariables.y.length > 0;

                if (!hasXForPairs && !hasYForPairs) {
                    errors.push({
                        field: 'variables',
                        message: `${dataFormat} format requires X and Y variables - please select both`,
                        severity: 'error'
                    });
                } else if (!hasXForPairs) {
                    errors.push({
                        field: 'xVariables',
                        message: `Please select X variables for ${dataFormat} format`,
                        severity: 'error'
                    });
                } else if (!hasYForPairs) {
                    errors.push({
                        field: 'yVariables',
                        message: `Please select Y variables for ${dataFormat} format`,
                        severity: 'error'
                    });
                }
                if (hasXForPairs && hasYForPairs && selectedVariables.x.length !== selectedVariables.y.length) {
                    errors.push({
                        field: 'variables',
                        message: `${dataFormat} format requires equal number of X and Y variables`,
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
        }
    }

    // Log validation failures
    if (errors.length > 0) {
        errors.forEach(error => {
            logValidationFailure(error.message, {
                component: 'AreaPlotValidation',
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

export class AreaPlotValidationError extends Error {
    public errors: ValidationError[];
    public field: string;

    constructor(errors: ValidationError[]) {
        const errorMessages = errors.map(e => e.message).join('; ');
        super(`Validation failed: ${errorMessages}`);
        this.name = 'AreaPlotValidationError';
        this.errors = errors;
        this.field = errors[0]?.field || 'unknown';
    }
}
