import { useMemo } from 'react';

/**
 * Hook for managing MeshConfiguration styles
 */
export const useMeshConfigurationStyles = () => {
  const meshConfigurationStyles = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  }), []);

  return {
    meshConfigurationStyles,
  };
};