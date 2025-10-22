export { LinePlotModal } from './LinePlotModal';
export { LinePlotForm } from './LinePlotForm';
export { useLinePlotStore } from './linePlotSlice';

// Error handling exports (now using shared components)
export { logLinePlotError, logPerformanceIssue, logValidationFailure, getRecentErrors, clearErrorLog } from './utils/errorLogger';
export { useOfflineState, useNetworkOperation } from './hooks/useOfflineState';

// Validation exports
export { ValidationErrors, FieldValidationIndicator } from './components/ValidationErrors';
export { validateLinePlotRequirements, LinePlotValidationError } from './utils/validationUtils';

// Re-export shared components for backward compatibility
export { GraphErrorBoundary as LinePlotErrorBoundary, useGraphErrorHandler as useErrorHandler } from '../../shared/components';
export { ValidationErrorModal } from '../../shared/components';
export { AdvancedValidationModal } from '../../shared/components';