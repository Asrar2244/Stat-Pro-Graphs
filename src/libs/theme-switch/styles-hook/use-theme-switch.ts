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
