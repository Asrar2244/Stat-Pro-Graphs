import { useMemo } from 'react';
import { tokens } from '@fluentui/react-components';

/**
 * Hook for managing VariableSelection component styles
 * Centralizes all variable selection related styling logic
 */
export const useVariableSelectionStyles = () => {
  const variableSelectionContainerStyles = useMemo(() => ({
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
    alignItems: 'flex-start'
  }), []);

  const columnStyles = useMemo(() => ({
    flex: '1',
    minWidth: '200px'
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
    color: '#8a8886',
    borderColor: '#8a8886',
    transition: 'all 0.2s ease'
  }), []);

  const removeButtonHoverStyles = useMemo(() => ({
    color: '#d13438',
    borderColor: '#d13438',
    backgroundColor: '#fdf2f2'
  }), []);

  const removeButtonLeaveStyles = useMemo(() => ({
    color: '#8a8886',
    borderColor: '#8a8886',
    backgroundColor: 'transparent'
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

