import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useThemeSwitchStyles = makeStyles({
  ul: {
    display: 'inline-flex',
    listStyleType: 'none',
    ...shorthands.padding(0),
    ...shorthands.margin(0),
    gap: tokens.spacingHorizontalS,
    justifyContent: 'center',
    alignContent: 'center',
    '& li': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      '& svg': {
        fill: tokens.colorNeutralBackgroundInverted,
      },
      '& button': {
        color: tokens.colorNeutralBackgroundInverted,
      },
      '& :disabled': {
        color: tokens.colorNeutralForegroundDisabled,
        '& button': {
          color: tokens.colorNeutralForegroundDisabled,
        },
        '& svg': {
          fill: tokens.colorNeutralForegroundDisabled,
        },
      },
      '& :hover': {
        '& button': {
          color: tokens.colorNeutralStrokeAccessibleSelected,
        },
        '& svg': {
          fill: tokens.colorNeutralStrokeAccessibleSelected,
        },
      },
    },

    '& li[data-theme-selected="true"]': {
      '& button': {
        color: tokens.colorNeutralStrokeAccessibleSelected,
      },
      '& svg': {
        fill: tokens.colorNeutralStrokeAccessibleSelected,
      },
    },
  },
  title: {
    // textAlign: 'center',
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    minWidth: '280px',
    gap: tokens.spacingHorizontalS,
  },
  themeSelection: {
    display: 'flex',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalS,
    justifyContent: 'center',
    alignContent: 'center',
    '& .radio': {
      alignItems: 'center',
    },
  },
});
