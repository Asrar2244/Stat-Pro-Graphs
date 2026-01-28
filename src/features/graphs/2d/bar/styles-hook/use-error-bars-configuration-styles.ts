import { useMemo } from 'react';
import { tokens } from '@fluentui/react-components';

export const useErrorBarsConfigurationStyles = () => {
    const containerStyles = useMemo(() => ({
        marginBottom: tokens.spacingVerticalS,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingVerticalS,
        backgroundColor: tokens.colorNeutralBackground1,
        boxShadow: tokens.shadow2
    }), []);

    const headerStyles = useMemo(() => ({
        marginTop: 0,
        marginBottom: tokens.spacingVerticalS,
        color: tokens.colorNeutralForeground1,
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightSemibold
    }), []);

    return {
        containerStyles,
        headerStyles
    };
};
