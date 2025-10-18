import { useMemo } from 'react';
import { tokens } from '@fluentui/react-components';

/**
 * Hook for managing ErrorBarsConfiguration component styles
 * Centralizes all error bars configuration related styling logic
 */
export const useErrorBarsConfigurationStyles = () => {
  const containerStyles = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`
  }), []);

  const headerStyles = useMemo(() => ({
    margin: 0,
    marginBottom: tokens.spacingVerticalS,
    color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold
  }), []);

  return {
    containerStyles,
    headerStyles
  };
};
