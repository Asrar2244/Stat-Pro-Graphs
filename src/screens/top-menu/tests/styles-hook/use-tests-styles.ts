import { tokens } from '@fluentui/react-components';

export const useTestsStyles = () => {
  return {
    backdrop: {
      position: 'fixed' as const,
      top: 36,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 999,
    },
    
    container: {
      position: 'fixed' as const,
      top: 36,
      left: 0,
      width: '100vw',
      background: `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`,
      color: tokens.colorNeutralForeground1,
      zIndex: 1000,
      boxShadow: `0 8px 32px ${tokens.colorNeutralShadowAmbient}, 0 4px 16px rgba(0,0,0,0.1)`,
      borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
      padding: 0,
      fontFamily: 'Segoe UI, Arial, sans-serif',
      height: '280px',
      overflow: 'visible' as const,
      transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
      justifyContent: 'center',
      gap: 32,
      padding: '16px 0',
      background: `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`,
      height: '220px',
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
      background: `linear-gradient(145deg, ${tokens.colorNeutralBackground2} 0%, ${tokens.colorNeutralBackground1} 100%)`,
      borderRadius: 8,
      minWidth: 320,
      padding: 16,
      boxShadow: `0 4px 20px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05)`,
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      position: 'relative' as const,
      zIndex: 2,
    },
    
    cardInner: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 16,
      padding: '16px 16px 16px 24px',
      background: `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`,
      borderRadius: 6,
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      width: '100%',
      boxSizing: 'border-box' as const,
      boxShadow: `inset 0 1px 3px rgba(0,0,0,0.05)`,
    },
    
    fieldContainer: {
      marginBottom: 0,
      width: '100%',
    },
    
    label: {
      color: tokens.colorNeutralForeground1,
      fontWeight: 500,
      fontSize: 14,
      marginBottom: 4,
      display: 'block',
    },
    
    dropdownTrigger: {
      width: '100%',
      background: `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`,
      color: tokens.colorNeutralForeground1,
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      fontSize: 14,
      padding: '8px 12px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: '4px',
      boxSizing: 'border-box' as const,
      boxShadow: `0 1px 3px rgba(0,0,0,0.1)`,
      transition: 'all 0.2s ease',
    },
    
    dropdownContent: {
      position: 'absolute' as const,
      top: '100%',
      left: 0,
      right: 0,
      background: tokens.colorNeutralBackground1,
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      borderTop: 'none',
      maxHeight: '200px',
      overflowY: 'auto' as const,
      zIndex: 1001,
      borderRadius: '0 0 2px 2px',
      boxSizing: 'border-box' as const,
    },
    
    searchContainer: {
      padding: '8px 12px',
      borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
      background: tokens.colorNeutralBackground1,
    },
    
    searchInput: {
      width: '100%',
      padding: '6px 8px',
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      borderRadius: '3px',
      fontSize: 13,
      background: tokens.colorNeutralBackground1,
      color: tokens.colorNeutralForeground1,
      outline: 'none',
    },
    
    option: {
      padding: '6px 10px',
      cursor: 'pointer',
      borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
      fontSize: 13,
    },
  };
}; 