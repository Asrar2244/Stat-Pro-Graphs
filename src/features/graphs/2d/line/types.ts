// Line Plot Types
export type LinePlotSubType = 
  | 'Simple Straight Line'
  | 'Multiple Straight Lines'
  | 'Simple Spline Curve'
  | 'Multiple Spline Curves'
  | 'Simple Vertical Step Plot'
  | 'Multiple Vertical Step Plot'
  | 'Simple Horizontal Step Plot'
  | 'Multiple Horizontal Step Plot';

export type DataFormat = 
  | 'XY Pairs'
  | 'Single X'
  | 'Single Y'
  | 'Many X'
  | 'Many Y'
  | 'X Many Y'
  | 'Y Many X';

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

export class LinePlotValidationError extends Error {
  public errors: ValidationError[];
  constructor(errors: ValidationError[]) {
    super('Line Plot validation failed');
    this.name = 'LinePlotValidationError';
    this.errors = errors;
  }
}