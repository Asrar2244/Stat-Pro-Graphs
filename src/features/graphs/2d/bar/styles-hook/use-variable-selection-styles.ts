import { useMemo } from 'react';
import { tokens } from '@fluentui/react-components';

/**
 * Hook for managing VariableSelection component styles
 * Centralizes all variable selection related styling logic
 */
export const useVariableSelectionStyles = () => {
    const variableSelectionContainerStyles = useMemo(() => ({
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr', // Four-column layout for Category/Error Bar
        gap: 0,
        minHeight: '300px'
    }), []);

    const columnStyles = useMemo(() => ({
        backgroundColor: tokens.colorNeutralBackground3,
        padding: tokens.spacingVerticalM,
        borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
        display: 'flex',
        flexDirection: 'column'
    }), []);

    const disabledSelectionStyles = useMemo(() => ({
        padding: tokens.spacingVerticalM,
        textAlign: 'center',
        color: tokens.colorNeutralForeground2,
        fontSize: '14px',
        fontStyle: 'italic',
        background: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusSmall,
        border: `1px dashed ${tokens.colorNeutralStroke2}`
    }), []);

    const removeButtonStyles = useMemo(() => ({
        color: tokens.colorPaletteRedForeground1,
        borderColor: tokens.colorPaletteRedBorder1,
        backgroundColor: tokens.colorPaletteRedBackground1,
        transition: 'all 0.2s ease'
    }), []);

    const removeButtonHoverStyles = useMemo(() => ({
        color: tokens.colorPaletteRedForeground1,
        borderColor: tokens.colorPaletteRedBorder1,
        backgroundColor: tokens.colorPaletteRedBackground2
    }), []);

    const removeButtonLeaveStyles = useMemo(() => ({
        color: tokens.colorPaletteRedForeground1,
        borderColor: tokens.colorPaletteRedBorder1,
        backgroundColor: tokens.colorPaletteRedBackground1
    }), []);

    return {
        variableSelectionContainerStyles,
        columnStyles,
        disabledSelectionStyles,
        removeButtonStyles,
        removeButtonHoverStyles,
        removeButtonLeaveStyles
    };
};
