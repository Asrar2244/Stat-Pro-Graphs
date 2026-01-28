import { useMemo } from 'react';
import { tokens } from '@fluentui/react-components';

/**
 * Hook for managing BarPlotModal styles
 * Centralizes all modal-related styling logic
 */
export const useBarPlotModalStyles = () => {
    const modalContentStyles = useMemo(() => ({
        maxHeight: '80vh',
        minHeight: 0, // Prevents flex items from overflowing parent
        display: 'flex',
        flexDirection: 'column' as const,
        gap: tokens.spacingVerticalS,
        overflowY: 'auto' as const
    }), []);

    return {
        modalContentStyles
    };
};
