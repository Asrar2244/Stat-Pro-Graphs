export { LinePlotModal } from './LinePlotModal';
export { LinePlotForm } from './LinePlotForm';
export { useLinePlotStore } from './linePlotSlice';

// Error handling exports
export { LinePlotErrorBoundary, useErrorHandler } from './components/ErrorBoundary';
export { logLinePlotError, logPerformanceIssue, logValidationFailure, getRecentErrors, clearErrorLog } from './utils/errorLogger';
export { useOfflineState, useNetworkOperation } from './hooks/useOfflineState';

// Validation exports
export { ValidationErrors, FieldValidationIndicator } from './components/ValidationErrors';
export { ValidationErrorModal } from './components/ValidationErrorModal';
export { AdvancedValidationModal } from './components/AdvancedValidationModal';
export { validateLinePlotRequirements, LinePlotValidationError } from './utils/validationUtils';