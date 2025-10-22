import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Text, tokens } from '@fluentui/react-components';
import { MdError, MdRefresh } from 'react-icons/md';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  graphType?: string; // e.g., "Line Plot", "Scatter Plot", "3D Mesh"
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Generic Error Boundary component for all graph types
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 * 
 * @example
 * ```tsx
 * <GraphErrorBoundary graphType="Line Plot">
 *   <LinePlotForm />
 * </GraphErrorBoundary>
 * ```
 */
export class GraphErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { graphType = 'Graph', onError } = this.props;
    
    // Log error details
    console.error(`${graphType} Error Boundary caught an error:`, error, errorInfo);
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    const { graphType = 'Graph' } = this.props;

    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div style={{
          padding: '24px',
          margin: '16px',
          border: `1px solid ${tokens.colorPaletteRedBorder2}`,
          borderRadius: '8px',
          backgroundColor: tokens.colorPaletteRedBackground2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center'
        }}>
          <MdError size={48} color={tokens.colorPaletteRedForeground1} />
          
          <div>
            <Text size={500} weight="semibold" style={{ color: tokens.colorPaletteRedForeground1 }}>
              Something went wrong with the {graphType}
            </Text>
            <br />
            <Text size={300} style={{ color: tokens.colorPaletteRedForeground2 }}>
              An unexpected error occurred while rendering the {graphType.toLowerCase()} configuration.
            </Text>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              width: '100%',
              textAlign: 'left',
              backgroundColor: tokens.colorNeutralBackground2,
              padding: '12px',
              borderRadius: '4px',
              border: `1px solid ${tokens.colorNeutralStroke1}`
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                Error Details (Development)
              </summary>
              <pre style={{
                marginTop: '8px',
                fontSize: '12px',
                color: tokens.colorPaletteRedForeground1,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {this.state.error.stack}
              </pre>
            </details>
          )}

          <Button
            appearance="primary"
            icon={<MdRefresh />}
            onClick={this.handleRetry}
            style={{
              backgroundColor: tokens.colorPaletteRedBackground1,
              color: tokens.colorPaletteRedForeground1
            }}
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error handler for functional components
 * Note: This is a simplified version - full error boundaries require class components
 * 
 * @example
 * ```tsx
 * const { handleError } = useGraphErrorHandler('Line Plot');
 * 
 * try {
 *   // ... code that might throw
 * } catch (error) {
 *   handleError(error as Error);
 * }
 * ```
 */
export const useGraphErrorHandler = (graphType: string = 'Graph') => {
  const handleError = (error: Error, errorInfo?: any) => {
    console.error(`${graphType} Error:`, error, errorInfo);
    
    // In a real app, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: { graphType, ...errorInfo } });
  };

  return { handleError };
};


