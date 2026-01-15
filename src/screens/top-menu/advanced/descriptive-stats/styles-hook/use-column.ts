import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

export const useMainStyles = makeStyles({
  mainLayout: {
    gap: tokens.spacingHorizontalS,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    justifyItems: 'center',
    marginTop: '1em',
    width: '100%',
    height: '100%',
    '& fieldset': {
      width: '50%',
      height: '100%',
      marginBottom: 0,
      display: 'flex',
      flexDirection: 'column',
    },
  },
  sectionAvailable: {
    display: 'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    paddingBottom: '40px',
    boxSizing: 'border-box',
    gap: tokens.spacingHorizontalS,

    // Target the wrapper div rendered by ListCheckboxWithSelectAll
    '& > div:first-child': {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
    },

    '& .select-size': {
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    '& .dependent-list': {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      marginBottom: tokens.spacingVerticalS,
      overflowY: 'auto',
      ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralBackground1Pressed),
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
    marginBottom: '10px',
  },
  list: {
    height: '90%',
  },
  applyButton: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: '1em',
    '& button': {
      backgroundColor: tokens.colorPaletteGreenBackground3,
      color: tokens.colorNeutralStrokeInvertedDisabled,
    },
  },
  removeButton: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: '1em',
    '& button': {
      backgroundColor: tokens.colorPaletteRedBackground3,
      color: tokens.colorNeutralStrokeInvertedDisabled,
    },
  },
  selector: {
    width: '5%',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    '& div': {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: tokens.colorNeutralForeground2BrandHover,
      height: '50%',
      cursor: 'pointer',
      fontWeight: '100',
      ':hover': {
        backgroundColor: tokens.colorBrandBackgroundHover,
      },
      '& span': {
        color: tokens.colorBrandBackgroundInverted,
        display: 'inline-block',
        transform: 'rotate(-90deg)',
      },
    },
    '& .selected': {
      backgroundColor: tokens.colorNeutralForeground3BrandPressed,
      fontWeight: '400',
    },
    '& div:nth-child(1)': {
      ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
    },
  },
  fieldSet: { marginLeft: '16px' },
  item: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    ...shorthands.padding(tokens.spacingHorizontalM, 0, tokens.spacingHorizontalS, 0),
    // ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
  },
  addRemoveButtons: {
    display: 'flex',
    flexDirection: 'column',
    width: '20%',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalM,
  },
  options: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    paddingTop: tokens.spacingVerticalM,
  },

  frame: {
    width: '100%',
    ...shorthands.padding(0),
    ...shorthands.margin(0),
    ...shorthands.border(0),
  },
  selectorWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignContent: 'center',
    justifyItems: 'center',
  },
  availableList: {
    flex: 1,
    minHeight: 0,
  },
  removeButtons: {
    backgroundColor: tokens.colorPaletteRedBorder1,
  },
});
