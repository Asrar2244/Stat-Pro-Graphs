import { useMemo } from 'react';
import { tokens } from '@fluentui/react-components';

/**
 * Hook for managing VariableList styles
 */
export const useVariableListStyles = () => {
    const listHeaderStyles = useMemo(() => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: tokens.spacingVerticalS,
        paddingBottom: tokens.spacingVerticalXS,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    }), []);

    const selectAllCheckboxStyles = useMemo(() => ({
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground1,
    }), []);

    const variableCountBadgeStyles = useMemo(() => ({
        fontSize: tokens.fontSizeBase100,
        color: tokens.colorNeutralForeground2,
        backgroundColor: tokens.colorNeutralBackground1,
        padding: '2px 6px',
        borderRadius: tokens.borderRadiusSmall,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
    }), []);

    const listContainerStyles = useMemo(() => ({
        maxHeight: '200px',
        overflowY: 'auto' as const,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        borderRadius: tokens.borderRadiusSmall,
        backgroundColor: tokens.colorNeutralBackground1,
    }), []);

    const listItemStyles = useMemo(() => ({
        padding: tokens.spacingVerticalS,
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
        backgroundColor: tokens.colorNeutralBackground1,
        transition: 'background-color 0.2s',
        color: tokens.colorNeutralForeground1,
    }), []);

    const listItemSelectedStyles = useMemo(() => ({
        padding: tokens.spacingVerticalS,
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
        backgroundColor: tokens.colorBrandBackground2,
        transition: 'background-color 0.2s',
        color: tokens.colorBrandForeground1,
    }), []);

    const checkboxStyles = useMemo(() => ({
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground1,
    }), []);

    const checkboxSelectedStyles = useMemo(() => ({
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorBrandForeground1,
    }), []);

    const emptyListStyles = useMemo(() => ({
        padding: tokens.spacingVerticalM,
        textAlign: 'center' as const,
        color: tokens.colorNeutralForeground2,
        fontStyle: 'italic',
        backgroundColor: tokens.colorNeutralBackground1,
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
        emptyListStyles,
    };
};
