import { FC, Suspense, PropsWithChildren, Component, ReactNode } from 'react';
import { Spinner } from '@fluentui/react-components';
import { useSuspenseClasses } from './styles-hook/use-style';
import { useTranslation } from 'react-i18next';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error in SuspenseLoad:', error, errorInfo);
    // Don't reload - just log the error
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Something went wrong loading this component.</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const SuspenseLoad: FC<PropsWithChildren> = ({ children }) => {
  const classes = useSuspenseClasses();
  const { t } = useTranslation('common', { useSuspense: true });
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className={classes.suspense}>
            <Spinner label={t('pleaseWaitLoading')} size="small" />
          </div>
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};
