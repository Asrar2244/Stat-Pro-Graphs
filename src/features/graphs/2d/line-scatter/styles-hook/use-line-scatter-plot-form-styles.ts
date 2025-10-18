import { useMemo } from 'react';
import { tokens } from '@fluentui/react-components';

/**
 * Hook for managing LineScatterPlotForm component styles
 * Centralizes all form related styling logic
 */
export const useLineScatterPlotFormStyles = () => {
  const errorBarValidationStyles = useMemo(() => ({
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    marginTop: tokens.spacingVerticalS
  }), []);

  const errorBarValidationTextStyles = useMemo(() => ({
    color: tokens.colorNeutralForeground2
  }), []);

  return {
    errorBarValidationStyles,
    errorBarValidationTextStyles
  };
};