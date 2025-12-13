import { makeStyles, tokens } from '@fluentui/react-components';

export const usePrintReportStyles = makeStyles({
  printButton: {
    marginLeft: '8px',
  },

  simpleModalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },

  simpleModalContainer: {
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '20px',
    borderRadius: tokens.borderRadiusLarge,
    minWidth: '300px',
    boxShadow: tokens.shadow64,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  simpleModalTitle: {
    margin: 0,
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },

  simpleModalDescription: {
    margin: 0,
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
  },

  simpleModalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },

  refreshContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '16px',
  },
  
  modalContent: {
    minWidth: '500px',
    maxWidth: '700px',
    padding: '0',
  },
  
  selectAllContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  
  selectAllButton: {
    minWidth: 'auto',
  },
  
  sectionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '400px',
    overflowY: 'auto',
    padding: '8px 0',
  },
  
  sectionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  
  sectionItemSelected: {
    backgroundColor: tokens.colorBrandBackground2,
    border: `1px solid ${tokens.colorBrandStroke1}`,
    '&:hover': {
      backgroundColor: tokens.colorBrandBackground2Hover,
    },
  },
  
  sectionTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightMedium,
    color: tokens.colorNeutralForeground1,
    flex: 1,
    minWidth: 0,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  
  sectionMeta: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  
  sectionIcon: {
    fontSize: '16px',
    color: tokens.colorNeutralForeground2,
  },
  
  noSectionsMessage: {
    textAlign: 'center',
    padding: '40px 20px',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase300,
    fontStyle: 'italic',
  },
  
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '20px',
  },
  
  loadingText: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
  },
  
  errorMessage: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase300,
    textAlign: 'center',
    padding: '20px',
    backgroundColor: tokens.colorPaletteRedBackground1,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorPaletteRedBorder1}`,
  },
  
  successMessage: {
    color: tokens.colorPaletteGreenForeground1,
    fontSize: tokens.fontSizeBase300,
    textAlign: 'center',
    padding: '12px',
    backgroundColor: tokens.colorPaletteGreenBackground1,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorPaletteGreenBorder1}`,
    marginBottom: '16px',
  },
  
  sectionCount: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightRegular,
  },
  
  // Print window specific styles
  printWindowStyles: {
    '& body': {
      backgroundColor: 'white !important',
      color: 'black !important',
      margin: '20px',
      fontFamily: 'inherit',
    },
    // Key-Value auto table styling
    '& .kvTable': {
      '& .kv-table': {
        width: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
      },
      '& .kv-th': {
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        backgroundColor: tokens.colorNeutralBackground2,
        padding: '6px',
        textAlign: 'left',
      },
      '& .kv-td': {
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        padding: '6px',
        verticalAlign: 'top',
        wordBreak: 'break-word',
        whiteSpace: 'normal',
      },
    },
    
    '& .printHeader': {
      textAlign: 'center',
      marginBottom: '30px',
      pageBreakAfter: 'avoid',
    },
    
    '& .printTitle': {
      fontSize: '24pt',
      fontWeight: 'bold',
      color: 'black !important',
      marginBottom: '10px',
    },
    
    '& .printDate': {
      fontSize: '12pt',
      color: '#666',
      marginBottom: '20px',
    },
    
    '& .printSection': {
      marginBottom: '40px',
      padding: '20px',
      border: '2px solid #ddd',
      borderRadius: '8px',
      backgroundColor: 'white',
      pageBreakInside: 'avoid',
      overflow: 'hidden',
      clear: 'both',
    },
    
    '& .printSectionTitle': {
      fontSize: '18pt',
      fontWeight: 'bold',
      color: 'black !important',
      margin: '0 0 20px 0',
      paddingBottom: '8px',
      borderBottom: '2px solid #333',
      pageBreakAfter: 'avoid',
    },
    
    '& .printSectionContent': {
      position: 'relative',
      overflow: 'visible',
      backgroundColor: 'white',
      padding: '10px',
      border: '1px solid #eee',
      borderRadius: '4px',
    },
  },
});

// Centralized CSS for the custom right-click context menu (class-based, tokenized)
export const contextMenuCss = `
.sp-context-menu { position: fixed; z-index: 99999; background: ${tokens.colorNeutralBackground1}; border: 1px solid ${tokens.colorNeutralStroke2}; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.16); min-width: 220px; font: 14px system-ui,-apple-system,Segoe UI,Roboto,Arial; color: ${tokens.colorNeutralForeground1}; overflow: hidden; }
.sp-context-title { padding: 8px 12px; font-weight: 600; font-size: 12px; opacity: .7; }
.sp-context-item { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; cursor:pointer; color: ${tokens.colorNeutralForeground1}; }
.sp-context-item:hover { background: ${tokens.colorNeutralBackground1Hover}; }
.sp-context-shortcut { font-size:12px; color: ${tokens.colorNeutralForeground3}; margin-left:16px; }
.sp-context-divider { height:1px; background: ${tokens.colorNeutralStroke2}; margin:4px 0; }
`;