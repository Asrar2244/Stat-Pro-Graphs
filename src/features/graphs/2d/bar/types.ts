
export type BarPlotSubType =
    | 'Simple Vertical Bar'
    | 'Grouped Vertical Bar'
    | 'Simple Vertical Error Bar'
    | 'Grouped Vertical Error Bar'
    | 'Stacked Vertical Bar'
    | 'Simple Horizontal Bar'
    | 'Grouped Horizontal Bar'
    | 'Simple Horizontal Error Bar'
    | 'Grouped Horizontal Error Bar'
    | 'Stacked Horizontal Bar';

export type DataFormat =
    | 'XY Pair'
    | 'XY Pairs'
    | 'Single X'
    | 'Single Y'
    | 'X Many Y'
    | 'Y Many X'
    | 'Many X'
    | 'Many Y'
    | 'XY Category'
    | 'X Category'
    | 'Y Category'
    | 'X Many Y Replicates'
    | 'Many Y Replicates'
    | 'X Many X Replicates' // Typo in user request? "X Many X Replicates"? No user said "X Many Y Replicates" for Bar.
    | 'Y Many X Replicates'
    | 'Many X Replicates'
    | 'Y Replicate'
    | 'X Replicate'
    | 'X Single Y Replicate' // Possible mapping for "X, Y Replicate"
    | 'Y Single X Replicate' // Possible mapping for "Y, X Replicate" (if needed) -> User said "Y, Many X Replicates"
    | 'YX Pair' // User said 'YX pair'
    // Add others as needed from scatter/types
    ;

export interface Variable {
    name: string;
    type: 'numeric' | 'categorical';
    selected?: boolean;
}

export interface ValidationError {
    field: string;
    message: string;
    severity: 'error' | 'warning';
}

export class BarPlotValidationError extends Error {
    public errors: ValidationError[];
    constructor(errors: ValidationError[]) {
        super('Bar Plot validation failed');
        this.name = 'BarPlotValidationError';
        this.errors = errors;
    }
}
