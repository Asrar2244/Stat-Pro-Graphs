/**
 * Error logging utilities for ScatterPlot feature
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: string;
  additionalData?: Record<string, any>;
}

export interface ScatterPlotError {
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Logs errors with context for better debugging
 */
export const logScatterPlotError = (error: Error, context: ErrorContext, severity: ScatterPlotError['severity'] = 'medium') => {
  const errorData: ScatterPlotError = {
    message: error.message,
    stack: error.stack,
    context: {
      ...context,
      timestamp: new Date().toISOString()
    },
    severity
  };

  // Console logging removed

  // In production, you would send this to an error reporting service
  // Example: Sentry.captureException(error, { extra: errorData.context });
  
  // You could also store errors locally for offline debugging
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const existingErrors = JSON.parse(localStorage.getItem('scatterPlotErrors') || '[]');
      const recentErrors = existingErrors.slice(-9); // Keep last 10 errors
      recentErrors.push(errorData);
      localStorage.setItem('scatterPlotErrors', JSON.stringify(recentErrors));
    } catch (e) {
      // Ignore localStorage errors
    }
  }
};

/**
 * Logs performance issues
 */
export const logPerformanceIssue = (message: string, duration: number, context: ErrorContext) => {
  const issue = {
    type: 'performance',
    message,
    duration,
    context: {
      ...context,
      timestamp: new Date().toISOString()
    }
  };


  // In production, you might want to track this differently
  // Example: Analytics.track('scatter_plot_performance_issue', issue);
};

/**
 * Logs validation failures
 */
export const logValidationFailure = (message: string, context: ErrorContext) => {
  logScatterPlotError(new Error(`Validation failed: ${message}`), context, 'low');
};

/**
 * Gets recent errors from localStorage (for debugging)
 */
export const getRecentErrors = (): ScatterPlotError[] => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem('scatterPlotErrors') || '[]');
  } catch {
    return [];
  }
};

/**
 * Clears error log (for debugging)
 */
export const clearErrorLog = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('scatterPlotErrors');
  }
};
