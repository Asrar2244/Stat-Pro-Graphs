import { tokens } from '@fluentui/react-components';

export const useTestsStyles = () => {
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
      padding: '8px 12px',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      minHeight: '140px',
      overflow: 'visible' as const,
      transition: 'all 0.3s ease-in-out',
    },
    
    tabContainer: {
      display: 'flex',
      justifyContent: 'center',
      borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    
    tabList: {
      background: 'transparent',
      color: tokens.colorNeutralForeground1,
      width: 400,
    },
    
    tab: (isActive: boolean) => ({
      color: isActive ? tokens.colorNeutralForeground1 : tokens.colorNeutralForeground3,
      fontWeight: 600,
      fontSize: 14,
      width: 200,
    }),
    
    content: {
      display: 'flex',
      justifyContent: 'flex-start',
      gap: 12,
      padding: '12px 16px',
      background: tokens.colorNeutralBackground1,
      minHeight: '110px',
      overflow: 'visible' as const,
      position: 'relative' as const,
    },
    
    bottomLine: {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      width: '100%',
      height: 2,
      background: 'linear-gradient(90deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.05) 100%)',
      zIndex: 1,
    },
    
    card: {
      background: `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`,
      borderRadius: 8,
      minWidth: 320,
      maxWidth: 520,
      padding: 10,
      boxShadow: `0 2px 6px rgba(0,0,0,0.1)`,
      border: `1px solid ${tokens.colorNeutralStroke2}`,
      position: 'relative' as const,
      zIndex: 2,
      margin: '0',
    },
    
    cardInner: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 8,
      padding: '10px',
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
      minWidth: 0,
    },
    
    label: {
      color: tokens.colorNeutralForeground1,
      fontWeight: 600,
      fontSize: 12,
      marginBottom: 6,
      display: 'block',
    },
    
    dropdownTrigger: {
      width: '100%',
      background: `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`,
      color: tokens.colorNeutralForeground1,
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      fontSize: 11,
      padding: '6px 10px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: '4px',
      boxSizing: 'border-box' as const,
      boxShadow: `0 1px 3px rgba(0,0,0,0.1)` ,
      transition: 'all 0.2s ease',
      minHeight: 28,
    },
    
    dropdownContent: {
      position: 'absolute' as const,
      top: '100%',
      left: 0,
      right: 0,
      background: tokens.colorNeutralBackground1,
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      borderTop: 'none',
      // allow overflow beyond panel, draw above siblings, and keep compact
      maxHeight: 'unset',
      overflowY: 'visible' as const,
      zIndex: 1000001,
      borderRadius: '0 0 2px 2px',
      boxSizing: 'border-box' as const,
      boxShadow: `0 4px 12px rgba(0,0,0,0.25)`,
      paddingBottom: 4,
      pointerEvents: 'auto' as const,
    },
    
    searchContainer: {
      padding: '6px 10px',
      borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
      background: tokens.colorNeutralBackground1,
      position: 'sticky' as const,
      top: 0,
      zIndex: 1,
    },
    
    searchInput: {
      width: '100%',
      padding: '4px 6px',
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      borderRadius: '3px',
      fontSize: 11,
      background: tokens.colorNeutralBackground1,
      color: tokens.colorNeutralForeground1,
      outline: 'none',
    },
    
    option: {
      padding: '8px 12px',
      cursor: 'pointer',
      borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
      fontSize: 11,
      lineHeight: '16px',
    },
  };
}; 