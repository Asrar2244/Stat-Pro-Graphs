import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

export const useMainStyles = makeStyles({
  mainLayout: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding(tokens.spacingHorizontalM),
    gap: tokens.spacingHorizontalM,
    // gap: tokens.spacingHorizontalM,
  },
  availability: {
    display: 'flex',
    flexDirection: 'row',
  },
  list: {
    height: '90%',
  },
  applyButton: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    '& button': {
      backgroundColor: tokens.colorPaletteGreenBackground3,
      color: tokens.colorNeutralStrokeInvertedDisabled,
    },
  },
  removeButton: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
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
  optionsGroup: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  options: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    paddingTop: tokens.spacingVerticalM,
  },
  meanGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
  },
  meanItem: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalM,
  },
  meanTypes: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding(tokens.spacingHorizontalL, 0, 0, 0),
  },
  ciOfAm: {
    display: 'flex',
    flexDirection: 'row',
    '& input[type="text"]': {
      width: '80px',
    },
  },
  frame: {
    width: '100%',
    ...shorthands.padding(0),
    ...shorthands.margin(0),
    ...shorthands.border(0),
  },
});
