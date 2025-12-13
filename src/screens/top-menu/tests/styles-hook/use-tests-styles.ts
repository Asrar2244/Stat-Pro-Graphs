import { tokens } from '@fluentui/react-components';

export const useTestsStyles = () => {
  return {
    backdrop: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
      backgroundColor: 'transparent',
    },
    
    container: {
      position: 'relative' as const,
      width: '100%',
      background: `linear-gradient(to bottom, ${tokens.colorNeutralBackground3}, ${tokens.colorNeutralBackground2})`,
      color: tokens.colorNeutralForeground1,
      zIndex: 1000000,
      boxShadow: tokens.shadow4,
      borderLeft: 'none',
      borderRight: 'none',
      borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
      borderTop: 'none',
      padding: '6px 10px',
      fontFamily: tokens.fontFamilyBase,
      minHeight: '120px',
      maxHeight: 'calc(100vh - 42px)',
      overflow: 'visible' as const,
      transition: 'all 0.3s ease-in-out',
      boxSizing: 'border-box' as const,
    },
    
    tabContainer: {
      display: 'flex',
      justifyContent: 'center',
      borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
      background: tokens.colorNeutralBackground1,
      marginLeft: '-10px',
      marginRight: '-10px',
      marginTop: '-6px',
      paddingTop: '3px',
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
      gap: 10,
      padding: '8px 12px',
      background: 'transparent',
      minHeight: '100px',
      maxHeight: 'calc(100vh - 200px)',
      overflowY: 'auto' as const,
      overflowX: 'hidden' as const,
      position: 'relative' as const,
    },
    
    bottomLine: {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      width: '100%',
      height: '1px',
      background: tokens.colorNeutralStroke2,
      borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
      boxShadow: 'none',
      zIndex: 10,
    },
    
    card: {
      background: tokens.colorNeutralBackground1,
      borderRadius: tokens.borderRadiusMedium,
      minWidth: 300,
      maxWidth: 480,
      padding: 6,
      boxShadow: tokens.shadow2,
      border: `1px solid ${tokens.colorNeutralStroke2}`,
      position: 'relative' as const,
      zIndex: 2,
      margin: '0',
    },
    
    cardInner: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 4,
      padding: '6px',
      background: tokens.colorNeutralBackground2,
      borderRadius: tokens.borderRadiusSmall,
      border: `1px solid ${tokens.colorNeutralStroke2}`,
      width: '100%',
      boxSizing: 'border-box' as const,
    },
    
    fieldContainer: {
      marginBottom: 0,
      width: '100%',
      minWidth: 0,
      padding: '2px 0',
    },
    
    label: {
      color: tokens.colorNeutralForeground1,
      fontWeight: 600,
      fontSize: 11,
      marginBottom: 4,
      display: 'block',
    },
    
    dropdownTrigger: {
      width: '100%',
      background: tokens.colorNeutralBackground1,
      color: tokens.colorNeutralForeground1,
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      fontSize: 10,
      padding: '4px 8px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: tokens.borderRadiusSmall,
      boxSizing: 'border-box' as const,
      boxShadow: tokens.shadow2,
      transition: 'all 0.2s ease',
      minHeight: 24,
    },
    
    dropdownContent: {
      position: 'fixed' as const,
      background: tokens.colorNeutralBackground1,
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      borderTop: 'none',
      maxHeight: 'unset',
      overflowY: 'visible' as const,
      zIndex: 1000002,
      borderRadius: `0 0 ${tokens.borderRadiusSmall} ${tokens.borderRadiusSmall}`,
      boxSizing: 'border-box' as const,
      boxShadow: tokens.shadow16,
      paddingBottom: 4,
      pointerEvents: 'auto' as const,
      display: 'block' as const,
      visibility: 'visible' as const,
      opacity: 1,
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