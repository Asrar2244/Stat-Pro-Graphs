import { useMemo } from 'react';

/**
 * Hook for managing DataFormatSection styles
 */
export const useDataFormatSectionStyles = () => {
  const optionDisplayStyles = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }), []);

  const descriptionTextStyles = useMemo(() => ({
    marginTop: '8px',
    fontStyle: 'italic',
  }), []);

  return {
    optionDisplayStyles,
    descriptionTextStyles,
  };
};