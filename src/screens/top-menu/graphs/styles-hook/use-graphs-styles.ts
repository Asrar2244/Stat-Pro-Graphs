import { tokens } from '@fluentui/react-components';

export const useGraphsStyles = () => {
  return {
    backdrop: {
      position: 'fixed' as const,
      top: '42px',
      left: 0,
      width: '100vw',
      height: 'calc(100vh - 42px)',
      zIndex: 999,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    
    container: {
      position: 'relative' as const,
      width: '100%',
      background: tokens.colorNeutralBackground1,
      color: tokens.colorNeutralForeground1,
      zIndex: 1000000,
      boxShadow: `0 4px 12px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1)`,
      border: `1px solid ${tokens.colorNeutralStroke2}`,
      borderTop: 'none',
      padding: '0',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      minHeight: '160px',
      overflow: 'visible' as const,
      transition: 'all 0.2s ease-in-out',
    },
    
    tabContainer: {
      display: 'flex',
      justifyContent: 'center',
      borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    
    tabList: {
      background: 'transparent',
      color: tokens.colorNeutralForeground1,
      width: 500,
    },
    
    tab: (isActive: boolean) => ({
      color: isActive ? tokens.colorNeutralForeground1 : tokens.colorNeutralForeground3,
      fontWeight: 600,
      fontSize: 14,
      width: 160,
    }),
    
    content: {
      display: 'flex',
      justifyContent: 'flex-start',
      gap: 12,
      padding: '12px 16px',
      background: tokens.colorNeutralBackground1,
      minHeight: '140px',
      overflow: 'visible' as const,
      position: 'relative' as const,
    },
    
    bottomLine: {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      width: '100%',
      height: 1,
      background: tokens.colorNeutralStroke1,
      zIndex: 1,
    },
    
    card: {
      background: 'transparent',
      borderRadius: 8,
      minWidth: 300,
      maxWidth: 520,
      padding: 2,
      border: 'none',
      position: 'relative' as const,
      zIndex: 2,
      margin: '0',
    },
    
    cardInner: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 2,
      padding: '1px 4px 2px 4px',
      background: 'transparent',
      borderRadius: 6,
      border: 'none',
      width: '100%',
      boxSizing: 'border-box' as const,
      boxShadow: 'none',
    },
    
    fieldContainer: {
      marginBottom: 0,
      width: '100%',
    },
    
    label: {
      color: tokens.colorNeutralForeground1,
      fontWeight: 600,
      fontSize: 9,
      marginBottom: 0,
      display: 'block',
    },
    
    dropdownTrigger: {
      width: '100%',
      background: `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`,
      color: tokens.colorNeutralForeground1,
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      fontSize: 9,
      padding: '2px 5px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: '4px',
      boxSizing: 'border-box' as const,
      boxShadow: `0 1px 2px rgba(0,0,0,0.08)`,
      transition: 'all 0.2s ease',
      minHeight: 20,
    },
    
    dropdownContent: {
      position: 'absolute' as const,
      top: '100%',
      left: 0,
      right: 0,
      background: tokens.colorNeutralBackground1,
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      borderTop: 'none',
      maxHeight: 'unset',
      overflowY: 'visible' as const,
      zIndex: 1000001,
      borderRadius: '0 0 2px 2px',
      boxSizing: 'border-box' as const,
      boxShadow: `0 4px 12px rgba(0,0,0,0.25)`,
      paddingBottom: 2,
      pointerEvents: 'auto' as const,
    },
    
    searchContainer: {
      padding: '3px 6px',
      borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
      background: tokens.colorNeutralBackground1,
    },
    
    searchInput: {
      width: '100%',
      padding: '2px 4px',
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      borderRadius: '3px',
      fontSize: 9,
      background: tokens.colorNeutralBackground1,
      color: tokens.colorNeutralForeground1,
      outline: 'none',
    },
    
    category: {
      padding: '1px 4px',
      fontWeight: 600,
      fontSize: 9,
      color: tokens.colorNeutralForeground2,
      background: 'transparent',
      borderBottom: 'none',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.35px',
    },
    
    option: {
      padding: '3px 6px 3px 12px',
      cursor: 'pointer',
      borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
      fontSize: 9,
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      transition: 'background-color 0.2s ease',
      lineHeight: '13px',
    },
    
    optionIcon: {
      fontSize: 13,
      color: tokens.colorNeutralForeground2,
    },
  };
};
