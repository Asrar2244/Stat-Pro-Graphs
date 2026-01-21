import { useMemo } from 'react';
import { tokens } from '@fluentui/react-components';

export const useAreaPlotFormStyles = () => {
    const errorBarValidationStyles = useMemo(() => ({
        padding: tokens.spacingVerticalS,
        marginBottom: tokens.spacingVerticalS,
        backgroundColor: tokens.colorNeutralBackground2,
        borderRadius: tokens.borderRadiusMedium,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS
    }), []);

    const errorBarValidationTextStyles = useMemo(() => ({
        color: tokens.colorNeutralForeground2,
        fontWeight: 600
    }), []);

    return { errorBarValidationStyles, errorBarValidationTextStyles };
};
