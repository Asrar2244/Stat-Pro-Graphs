import React, { Component, ReactNode } from 'react';
import { Text, tokens } from '@fluentui/react-components';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component for Line-Scatter Plot
 */
export class LineScatterPlotErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LineScatterPlot Error Boundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: tokens.spacingVerticalL,
          textAlign: 'center',
          backgroundColor: tokens.colorPaletteRedBackground2,
          borderRadius: tokens.borderRadiusMedium,
          border: `1px solid ${tokens.colorPaletteRedBorder1}`
        }}>
          <Text color={tokens.colorPaletteRedForeground1} size={400} weight="semibold">
            Something went wrong with the Line-Scatter Plot configuration.
          </Text>
          <Text color={tokens.colorPaletteRedForeground1} size={200} style={{ marginTop: tokens.spacingVerticalS }}>
            Please try refreshing the page or contact support if the issue persists.
          </Text>
        </div>
      );
    }

    return this.props.children;
  }
}
