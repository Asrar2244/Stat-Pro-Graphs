import { tokens } from '@fluentui/react-components';

export const useHelpStyles = () => {
  return {
    backdrop: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      backgroundColor: 'transparent',
      pointerEvents: 'auto' as const,
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
      borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
      padding: '6px 10px',
      fontFamily: tokens.fontFamilyBase,
      minHeight: '120px',
      overflow: 'visible' as const,
      transition: 'all 0.2s ease-in-out',
      boxSizing: 'border-box' as const,
    },
    
    content: {
      display: 'flex',
      flexDirection: 'row' as const,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      gap: tokens.spacingHorizontalM,
      padding: '8px 12px',
      background: 'transparent',
      minHeight: '100px',
      overflowY: 'visible' as const,
      overflowX: 'visible' as const,
      position: 'relative' as const,
      flexWrap: 'nowrap' as const,
    },
    
    section: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: tokens.spacingVerticalXS,
      width: 'auto',
      minWidth: 'auto',
      maxWidth: 'none',
      flexShrink: 0,
    },
    
    sectionTitle: {
      fontSize: tokens.fontSizeBase200,
      fontWeight: tokens.fontWeightSemibold,
      color: tokens.colorNeutralForeground1,
      marginBottom: tokens.spacingVerticalXXS,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.3px',
      fontFamily: tokens.fontFamilyBase,
      textShadow: `0 1px 2px ${tokens.colorNeutralShadowAmbient}`,
      borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
      paddingBottom: tokens.spacingVerticalXXS,
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacingHorizontalXXS,
    },
    
    sectionTitleDot: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      backgroundColor: tokens.colorNeutralForeground1,
      boxShadow: `0 0 4px ${tokens.colorNeutralForeground1}`,
    },
    
    buttonContainer: {
      display: 'flex',
      flexDirection: 'row' as const,
      gap: tokens.spacingHorizontalXS,
      padding: tokens.spacingVerticalXS,
      background: `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`,
      border: `1px solid ${tokens.colorNeutralStroke2}`,
      borderRadius: tokens.borderRadiusSmall,
      boxShadow: tokens.shadow2,
      minHeight: '60px',
      flexWrap: 'nowrap',
      overflowX: 'visible',
      overflowY: 'visible',
      width: 'fit-content',
    },
    
    helpButton: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacingVerticalXXS,
      width: '100px',
      minWidth: '100px',
      height: '50px',
      borderRadius: tokens.borderRadiusSmall,
      border: `1px solid ${tokens.colorNeutralStroke2}`,
      background: `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`,
      boxShadow: tokens.shadow2,
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      position: 'relative' as const,
      flexShrink: 0,
    },
    
    buttonIcon: {
      fontSize: '20px',
      color: tokens.colorNeutralForeground1,
    },
    
    buttonLabel: {
      fontSize: tokens.fontSizeBase100,
      fontWeight: tokens.fontWeightSemibold,
      color: tokens.colorNeutralForeground1,
      textAlign: 'center' as const,
    },
  };
};

