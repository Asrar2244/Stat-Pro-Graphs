export interface ErrorContext {
    component?: string;
    action?: string;
    userId?: string;
    timestamp?: string;
    additionalData?: Record<string, any>;
}

export interface BarPlotError {
    message: string;
    stack?: string;
    context: ErrorContext;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export const logBarPlotError = (error: Error, context: ErrorContext, severity: BarPlotError['severity'] = 'medium') => {
    const errorData: BarPlotError = {
        message: error.message,
        stack: error.stack,
        context: {
            ...context,
            timestamp: new Date().toISOString()
        },
        severity
    };

    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            const existingErrors = JSON.parse(localStorage.getItem('barPlotErrors') || '[]');
            const recentErrors = existingErrors.slice(-9);
            recentErrors.push(errorData);
            localStorage.setItem('barPlotErrors', JSON.stringify(recentErrors));
        } catch (e) {
            // Ignore
        }
    }
};

export const logValidationFailure = (message: string, context: ErrorContext) => {
    logBarPlotError(new Error(`Validation failed: ${message}`), context, 'low');
};
