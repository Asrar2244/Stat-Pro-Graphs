import { useMemo } from 'react';
import { tokens } from '@fluentui/react-components';

export const useVariableListStyles = () => {
    const listHeaderStyles = useMemo(() => ({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacingVerticalS,
        padding: tokens.spacingVerticalXS,
        background: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusSmall,
        border: `1px solid ${tokens.colorNeutralStroke2}`
    }), []);

    const selectAllCheckboxStyles = useMemo(() => ({
        fontWeight: '500',
        color: tokens.colorNeutralForeground1
    }), []);

    const variableCountBadgeStyles = useMemo(() => ({
        fontSize: '12px',
        color: tokens.colorNeutralForeground2,
        fontWeight: '600',
        background: tokens.colorNeutralBackground2,
        padding: '2px 8px',
        borderRadius: tokens.borderRadiusCircular
    }), []);

    const listContainerStyles = useMemo(() => ({
        maxHeight: '280px',
        overflowY: 'auto',
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        borderRadius: tokens.borderRadiusSmall,
        padding: tokens.spacingVerticalXS,
        background: tokens.colorNeutralBackground1
    }), []);

    const listItemStyles = useMemo(() => ({
        marginBottom: tokens.spacingVerticalXS,
        padding: tokens.spacingVerticalXS,
        borderRadius: tokens.borderRadiusSmall,
        background: 'transparent',
        border: `1px solid transparent`,
        transition: 'all 0.2s ease'
    }), []);

    const listItemSelectedStyles = useMemo(() => ({
        marginBottom: tokens.spacingVerticalXS,
        padding: tokens.spacingVerticalXS,
        borderRadius: tokens.borderRadiusSmall,
        background: tokens.colorBrandBackground2,
        border: `1px solid ${tokens.colorBrandStroke1}`,
        transition: 'all 0.2s ease'
    }), []);

    const checkboxStyles = useMemo(() => ({
        fontWeight: '400',
        color: tokens.colorNeutralForeground1
    }), []);

    const checkboxSelectedStyles = useMemo(() => ({
        fontWeight: '600',
        color: tokens.colorBrandForeground1
    }), []);

    const emptyListStyles = useMemo(() => ({
        textAlign: 'center',
        padding: tokens.spacingVerticalM,
        color: tokens.colorNeutralForeground2,
        fontStyle: 'italic',
        fontSize: '14px'
    }), []);

    return {
        listHeaderStyles,
        selectAllCheckboxStyles,
        variableCountBadgeStyles,
        listContainerStyles,
        listItemStyles,
        listItemSelectedStyles,
        checkboxStyles,
        checkboxSelectedStyles,
        emptyListStyles
    };
};
