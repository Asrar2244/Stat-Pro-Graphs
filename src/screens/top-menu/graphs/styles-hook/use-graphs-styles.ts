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
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
      transition: 'all 0.2s ease-in-out',
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
      padding: 8,
      border: `1px solid ${tokens.colorNeutralStroke2}`,
      boxShadow: tokens.shadow2,
      position: 'relative' as const,
      zIndex: 2,
      margin: '0',
    },
    
    cardInner: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 6,
      padding: '8px',
      background: tokens.colorNeutralBackground2,
      borderRadius: tokens.borderRadiusSmall,
      border: `1px solid ${tokens.colorNeutralStroke2}`,
      width: '100%',
      boxSizing: 'border-box' as const,
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
      background: tokens.colorNeutralBackground1,
      color: tokens.colorNeutralForeground1,
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      fontSize: 9,
      padding: '2px 5px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: tokens.borderRadiusSmall,
      boxSizing: 'border-box' as const,
      boxShadow: tokens.shadow2,
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
      borderRadius: `0 0 ${tokens.borderRadiusSmall} ${tokens.borderRadiusSmall}`,
      boxSizing: 'border-box' as const,
      boxShadow: tokens.shadow16,
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
      borderRadius: tokens.borderRadiusSmall,
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