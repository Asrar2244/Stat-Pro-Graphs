/**
 * Shared validation types for all graph types
 */

export interface ValidationError {
  field?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationRule {
  validate: () => boolean;
  message: string;
  severity: ValidationSeverity;
  field?: string;
}




















