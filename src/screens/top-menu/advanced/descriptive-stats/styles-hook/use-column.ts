import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

export const useMainStyles = makeStyles({
  mainLayout: {
    display: 'flex',
    flexDirection: 'row',
    // width: "100%",
    flex: 1,
    height: "95%",
    gap: tokens.spacingHorizontalM,
    ...shorthands.padding(tokens.spacingHorizontalM),
    "& .section-available": {
      height: "100%",
      width: "80%",
      marginLeft: "12px",
      "> div:first-child": {
        height: "43vh"
      }
    }
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
  fieldSet: { marginLeft: "16px" },
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
});
