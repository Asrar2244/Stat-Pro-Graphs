import { useMemo } from 'react';
import { tokens } from '@fluentui/react-components';

/**
 * Hook for managing LineScatterPlotModal styles
 * Centralizes all modal-related styling logic
 */
export const useLineScatterPlotModalStyles = () => {
  const modalContentStyles = useMemo(() => ({
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: tokens.spacingVerticalS,
    overflowY: 'auto' as const
  }), []);

  return {
    modalContentStyles
  };
};
