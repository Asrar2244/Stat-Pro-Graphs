import { makeStyles, tokens } from '@fluentui/react-components';

export const usePrintReportStyles = makeStyles({
  printButton: {
    marginLeft: '8px',
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
    borderColor: tokens.colorBrandStroke1 as unknown as undefined,
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
    body: {
      backgroundColor: 'white !important',
      color: 'black !important',
      margin: '20px',
      fontFamily: 'inherit',
    },
    
    printHeader: {
      textAlign: 'center',
      marginBottom: '30px',
      pageBreakAfter: 'avoid',
    },
    
    printTitle: {
      fontSize: '24pt',
      fontWeight: 'bold',
      color: 'black !important',
      marginBottom: '10px',
    },
    
    printDate: {
      fontSize: '12pt',
      color: '#666',
      marginBottom: '20px',
    },
    
    printSection: {
      marginBottom: '40px',
      padding: '20px',
      border: '2px solid #ddd',
      borderRadius: '8px',
      backgroundColor: 'white',
      pageBreakInside: 'avoid',
      overflow: 'hidden',
      clear: 'both',
    },
    
    printSectionTitle: {
      fontSize: '18pt',
      fontWeight: 'bold',
      color: 'black !important',
      margin: '0 0 20px 0',
      paddingBottom: '8px',
      borderBottom: '2px solid #333',
      pageBreakAfter: 'avoid',
    },
    
    printSectionContent: {
      position: 'relative',
      overflow: 'visible',
      backgroundColor: 'white',
      padding: '10px',
      border: '1px solid #eee',
      borderRadius: '4px',
    },
  },
});