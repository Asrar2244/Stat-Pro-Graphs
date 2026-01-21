import { useMemo } from 'react';
import { tokens } from '@fluentui/react-components';

export const useAreaPlotModalStyles = () => {
    const modalContentStyles = useMemo(() => ({
        display: 'flex',
        flexDirection: 'column' as const,
        gap: tokens.spacingVerticalM,
        padding: tokens.spacingVerticalS
    }), []);

    return { modalContentStyles };
};
