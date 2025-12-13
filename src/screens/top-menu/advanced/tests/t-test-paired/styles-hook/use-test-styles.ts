import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

export const useCommonStyles = makeStyles({
  commonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalM,
    '& .details': {
      height: '53vh',
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: `${tokens.colorNeutralStroke1} transparent`,
      '&::-webkit-scrollbar': {
        width: '8px',
        backgroundColor: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: '8px',
        backgroundColor: tokens.colorNeutralStroke1,
        backgroundClip: 'padding-box',
        border: '2px solid transparent',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: tokens.colorNeutralStroke2,
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
      },
    },
    '& .align-radio': {
      alignItems: 'center',
    },
    '& .test-table': {
      border: "none"
    },
    '& .fui-CardFooter': {
      display: "none"
    },
    '& .fui-TableBody': {
      height: "max-content"
    },
    '> div': {
      borderRadius: 0
    },
    '> div>div': {
      boxShadow: 'none'
    }
  },
  selectedData: {
    display: 'flex',
    flexDirection: 'column',
    width: "max-content",
    minWidth: "150px",
    minHeight: "100px",
    gap: "16px",
    ">div": {
      ">p:first-child": {
        minWidth: "150px"
      }
    }
  },
  optionsGroup: {
    display: 'flex',
    flexDirection: 'column',
    width: "max-content",
    // flex: 1,
  },
  options: {
    display: 'grid',
    paddingTop: tokens.spacingVerticalM,
  },
  postHocTestWrapper: { display: "flex", gap: "48px" },
  postHocTestAlphaInputWrapper: { display: "flex", alignContent: "center", alignItems: "center", gap: "8px" },
  input: { width: "90px" },
  pValInput: { display: "flex", gap: "8px" },
  valInput: { display: "flex", gap: "16px" },
  dataformatWrapper: { display: "flex", alignContent: "center", alignItems: "center", gap: "32px", minHeight: "100px" },
  checkboxWrapper: { display: "flex", alignContent: "center", alignItems: "center", gap: "8px" },
  dataSelectionWrapper: { 
    display: "flex", 
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "flex-start", 
    alignItems: "flex-start", 
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalS,
    width: "100%",
    '& > fieldset:first-child': {
      flex: 0.7,
      minWidth: 0,
    },
    '& fieldset': {
      flex: 1,
      minWidth: 0,
    },
  },
  selectedFieldsWrapper: {
    display: "flex",
    flexDirection: "row",
    gap: tokens.spacingHorizontalS,
    flex: 1,
    alignItems: 'flex-start',
    '& fieldset': {
      flex: 1,
      minWidth: 0,
      '& .section-available': {
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        gap: tokens.spacingHorizontalS,
        '& .dependent-list': {
          display: 'flex',
          flexDirection: 'column',
          height: '340px',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: `${tokens.colorNeutralStroke1} transparent`,
          ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralBackground1Pressed),
          '&::-webkit-scrollbar': {
            width: '8px',
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: '8px',
            backgroundColor: tokens.colorNeutralStroke1,
            backgroundClip: 'padding-box',
            border: '2px solid transparent',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: tokens.colorNeutralStroke2,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
        },
        '& .select-size': {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
      },
    },
  },
  sectionAvailable: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalS,
    '& .dependent-list': {
      display: 'flex',
      flexDirection: 'column',
      height: '340px',
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: `${tokens.colorNeutralStroke1} transparent`,
      ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralBackground1Pressed),
      '&::-webkit-scrollbar': {
        width: '8px',
        backgroundColor: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: '8px',
        backgroundColor: tokens.colorNeutralStroke1,
        backgroundClip: 'padding-box',
        border: '2px solid transparent',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: tokens.colorNeutralStroke2,
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
      },
    },
    '& .select-size': {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  },
  sendButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    width: '100%',
    '& button': {
      width: '100%',
    },
  },
  removeButtonClass: {
    backgroundColor: tokens.colorPaletteRedBorder1,
    width: '100%',
  },
  dataWrapper: { display: "flex", flexDirection: "column", alignContent: "flex-start", alignItems: "flex-start", gap: "8px" },
  selectedColWrapper: { display: "flex", flexDirection: "column", alignContent: "flex-start", alignItems: "flex-start", gap: "16px" }
});