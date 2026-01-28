import { useMemo } from 'react';
import { tokens } from '@fluentui/react-components';

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
