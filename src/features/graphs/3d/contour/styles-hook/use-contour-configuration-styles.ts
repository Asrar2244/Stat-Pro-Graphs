import { useMemo } from 'react';

/**
 * Hook for managing ContourConfiguration styles
 */
export const useContourConfigurationStyles = () => {
    const contourConfigurationStyles = useMemo(() => ({
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px',
    }), []);

    return {
        contourConfigurationStyles,
    };
};
