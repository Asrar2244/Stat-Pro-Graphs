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
    '& fieldset': {
      width: '50%',
    },
  },
  sectionAvailable: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalS,
    '& .select-size': {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    '& .dependent-list': {
      display: 'flex',
      flexDirection: 'column',
      height: '340px',
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
    height: '32vh',
  },
  removeButtons: {
    backgroundColor: tokens.colorPaletteRedBorder1,
  },
});
