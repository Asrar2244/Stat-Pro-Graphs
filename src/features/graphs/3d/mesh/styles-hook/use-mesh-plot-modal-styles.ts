import { useMemo } from 'react';
import { tokens } from '@fluentui/react-components';

/**
 * Hook for managing MeshPlotModal styles
 * Centralizes all modal-related styling logic
 */
export const useMeshPlotModalStyles = () => {
  const modalContentStyles = useMemo(() => ({
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: tokens.spacingVerticalS,
    overflowY: 'auto' as const,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    padding: tokens.spacingVerticalM
  }), []);

  return {
    modalContentStyles
  };
};






