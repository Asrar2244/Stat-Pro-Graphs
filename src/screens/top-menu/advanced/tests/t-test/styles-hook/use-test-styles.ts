import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

export const useCommonStyles = makeStyles({
  commonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalXL,
    '& .details': {
      height: '53vh',
    },
    '& .align-radio': {
      alignItems: 'center',
    },
    '& .test-table': {
      border: "none"
    },
    '& .test-table div[data-celltype="right"]': {
      display: "none"
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
    width: "min(100%, 32rem)",
    minWidth: "0",
    minHeight: "110px",
    gap: "16px",
    background: `linear-gradient(135deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`,
    ...shorthands.border('1px', 'solid', tokens.colorPaletteBlueBorder2),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    boxShadow: `0 4px 16px ${tokens.colorNeutralStroke1}15`,
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    boxSizing: 'border-box',
    alignSelf: 'flex-start',
    ">div": {
      ">p:first-child": {
        minWidth: "150px",
        fontWeight: 600,
        color: tokens.colorNeutralForeground1,
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
  valInput: { 
    display: "flex", 
    gap: "16px", 
    alignItems: "center",
    width: "100%",
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalS),
    ...shorthands.borderLeft('4px', 'solid', tokens.colorPaletteBlueBorder2),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    boxShadow: `inset 0 1px 3px ${tokens.colorNeutralStroke1}20`,
  },
  dataformatWrapper: { 
    display: "flex", 
    flexDirection: "column",
    alignContent: "flex-start", 
    alignItems: "flex-start", 
    gap: "16px", 
    minHeight: "100px",
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    boxShadow: `0 1px 2px ${tokens.colorNeutralStroke1}20`,
  },
  checkboxWrapper: { display: "flex", alignContent: "center", alignItems: "center", gap: "8px" },
  dataSelectionWrapper: { 
    display: "flex", 
    flexDirection: "row",
    alignContent: "flex-start", 
    alignItems: "flex-start", 
    gap: "16px", 
    width: "100%",
    '& fieldset': {
      width: '50%',
      minWidth: 0,
      boxSizing: 'border-box',
      backgroundColor: tokens.colorNeutralBackground1,
      ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
      ...shorthands.borderRadius(tokens.borderRadiusMedium),
      boxShadow: `0 1px 2px ${tokens.colorNeutralStroke1}20`,
    },
    '& .section-available': {
      display: 'flex',
      width: '100%',
      flexDirection: 'column',
      gap: tokens.spacingHorizontalS,
      '& .send-buttons': {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: tokens.spacingHorizontalS,
        '& button': {
          width: '100%',
        },
      },
      '& .available-list': {
        display: 'flex',
        flexDirection: 'column',
        height: '340px',
        overflowY: 'auto',
        backgroundColor: tokens.colorNeutralBackground2,
        ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
        ...shorthands.borderRadius(tokens.borderRadiusSmall),
        ...shorthands.padding(tokens.spacingVerticalXS),
        marginTop: tokens.spacingVerticalS,
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
      '& .select-size': {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalS),
        backgroundColor: tokens.colorNeutralBackground2,
        ...shorthands.borderRadius(tokens.borderRadiusSmall),
      },
      '& .dependent-list': {
        display: 'flex',
        flexDirection: 'column',
        height: '340px',
        overflowY: 'auto',
        backgroundColor: tokens.colorNeutralBackground2,
        ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
        ...shorthands.borderRadius(tokens.borderRadiusSmall),
        ...shorthands.padding(tokens.spacingVerticalXS),
        marginTop: tokens.spacingVerticalS,
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
      '& .remove-button': {
        backgroundColor: tokens.colorPaletteRedBorder1,
      },
    },
  },
  dataWrapper: { display: "flex", flexDirection: "column", alignContent: "flex-start", alignItems: "flex-start", gap: "8px" },
  selectedColWrapper: { display: "flex", flexDirection: "column", alignContent: "flex-start", alignItems: "flex-start", gap: "16px" },
});