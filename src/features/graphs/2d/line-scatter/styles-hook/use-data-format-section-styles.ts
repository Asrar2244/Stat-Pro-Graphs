import { useMemo } from 'react';
import { tokens } from '@fluentui/react-components';

/**
 * Hook for managing DataFormatSection component styles
 * Centralizes all data format section related styling logic
 */
export const useDataFormatSectionStyles = () => {
  const optionDisplayStyles = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS
  }), []);

  const descriptionTextStyles = useMemo(() => ({
    marginTop: tokens.spacingVerticalXS
  }), []);

  return {
    optionDisplayStyles,
    descriptionTextStyles
  };
};
