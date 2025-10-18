import { useMemo } from 'react';
import { tokens } from '@fluentui/react-components';

/**
 * Hook for managing VariableSelection component styles
 * Centralizes all variable selection related styling logic
 */
export const useVariableSelectionStyles = () => {
  const variableSelectionContainerStyles = useMemo(() => ({
    display: 'grid', // Changed from flex to grid like line plot
    gridTemplateColumns: '1fr 1fr 1fr 1fr', // Four-column layout for Category/Error Bar
    gap: 0, // Changed from tokens.spacingHorizontalM to 0 like line plot
    minHeight: '300px'
  }), []);

  const columnStyles = useMemo(() => ({
    backgroundColor: tokens.colorNeutralBackground3, // Added background color like line plot
    padding: tokens.spacingVerticalM, // Added padding like line plot
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`, // Added border like line plot
    display: 'flex', // Added display flex like line plot
    flexDirection: 'column' // Added flex direction like line plot
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
    color: tokens.colorPaletteRedForeground1, // Updated to use Fluent UI tokens like line plot
    borderColor: tokens.colorPaletteRedBorder1, // Updated to use Fluent UI tokens like line plot
    backgroundColor: tokens.colorPaletteRedBackground1, // Updated to use Fluent UI tokens like line plot
    transition: 'all 0.2s ease'
  }), []);

  const removeButtonHoverStyles = useMemo(() => ({
    color: tokens.colorPaletteRedForeground1, // Updated to use Fluent UI tokens like line plot
    borderColor: tokens.colorPaletteRedBorder1, // Updated to use Fluent UI tokens like line plot
    backgroundColor: tokens.colorPaletteRedBackground2 // Updated to use Fluent UI tokens like line plot
  }), []);

  const removeButtonLeaveStyles = useMemo(() => ({
    color: tokens.colorPaletteRedForeground1, // Updated to use Fluent UI tokens like line plot
    borderColor: tokens.colorPaletteRedBorder1, // Updated to use Fluent UI tokens like line plot
    backgroundColor: tokens.colorPaletteRedBackground1 // Updated to use Fluent UI tokens like line plot
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
