// ScatterPlot Types
export type ScatterPlotSubType = 
  | 'Simple Scatter'
  | 'Multiple Scatter'
  | 'Simple Scatter Error Bar'
  | 'Multiple Scatter Error Bar';

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
  | 'Category Many X'
  | 'Category Many Y';

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

export class ScatterPlotValidationError extends Error {
  public errors: ValidationError[];
  constructor(errors: ValidationError[]) {
    super('Scatter Plot validation failed');
    this.name = 'ScatterPlotValidationError';
    this.errors = errors;
  }
}

