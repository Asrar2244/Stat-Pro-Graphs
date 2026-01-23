import { useMemo } from 'react';

/**
 * Hook for managing ScatterConfiguration styles
 */
export const useScatterConfigurationStyles = () => {
    const scatterConfigurationStyles = useMemo(() => ({
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px',
    }), []);

    return {
        scatterConfigurationStyles,
    };
};
