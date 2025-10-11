export { ScatterPlotModal } from './ScatterPlotModal';
export { ScatterPlotForm } from './ScatterPlotForm';
export { useScatterPlotStore } from './scatterPlotSlice';

// Error handling exports
export { ScatterPlotErrorBoundary, useErrorHandler } from './components/ErrorBoundary';
export { logScatterPlotError, logPerformanceIssue, logValidationFailure, getRecentErrors, clearErrorLog } from './utils/errorLogger';
export { useOfflineState, useNetworkOperation } from './hooks/useOfflineState';

// Validation exports
export { ValidationErrors, FieldValidationIndicator } from './components/ValidationErrors';
export { ValidationErrorModal } from './components/ValidationErrorModal';
export { AdvancedValidationModal } from './components/AdvancedValidationModal';
export { validateScatterPlotRequirements, ScatterPlotValidationError } from './utils/validationUtils';