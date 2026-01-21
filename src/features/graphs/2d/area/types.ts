// AreaPlot Types
export type AreaSubType =
    | 'Simple Area'
    | 'Multiple Area'
    | 'Vertical Area'
    | 'Multiple Vertical Area'
    | 'Complex Area Plot';

export type AreaPlotSubType = AreaSubType; // Alias for backward compatibility if needed

export type DataFormat =
    | 'XY Pair'
    | 'XY Pairs'
    | 'Single X'
    | 'Single Y'
    | 'X Many Y'
    | 'Y Many X'
    | 'Many X'
    | 'Many Y'
    | 'YX Pair'
    | 'YX Pairs';

export interface Variable {
    id: string;
    name: string;
    type: 'numeric' | 'categorical';
    selected?: boolean;
}

export interface ValidationError {
    field: string;
    message: string;
    severity: 'error' | 'warning';
}

export class AreaPlotValidationError extends Error {
    public errors: ValidationError[];
    constructor(errors: ValidationError[]) {
        super('Area Plot validation failed');
        this.name = 'AreaPlotValidationError';
        this.errors = errors;
    }
}
