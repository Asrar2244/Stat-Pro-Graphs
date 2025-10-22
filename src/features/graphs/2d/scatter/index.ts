export { ScatterPlotModal } from './ScatterPlotModal';
export { ScatterPlotForm } from './ScatterPlotForm';
export { useScatterPlotStore } from './scatterPlotSlice';

// Error handling exports (now using shared components)
export { logScatterPlotError, logPerformanceIssue, logValidationFailure, getRecentErrors, clearErrorLog } from './utils/errorLogger';
export { useOfflineState, useNetworkOperation } from './hooks/useOfflineState';

// Validation exports
export { ValidationErrors, FieldValidationIndicator } from './components/ValidationErrors';
export { validateScatterPlotRequirements, ScatterPlotValidationError } from './utils/validationUtils';

// Re-export shared components for backward compatibility
export { GraphErrorBoundary as ScatterPlotErrorBoundary, useGraphErrorHandler as useErrorHandler } from '../../shared/components';
export { ValidationErrorModal } from '../../shared/components';
export { AdvancedValidationModal } from '../../shared/components';