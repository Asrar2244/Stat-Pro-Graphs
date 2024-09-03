import { tokens, makeStyles, shorthands } from '@fluentui/react-components';

export const useCommonLayout = makeStyles({
  popoverWrapper: {
    listStyleType: 'none',
    ...shorthands.padding(0),
    ...shorthands.margin(0),
    width: '280px',
    maxHeight: '320px',
    '& li': {
      ...shorthands.padding(tokens.spacingVerticalSNudge),
      ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralBackground3Hover),
      maxHeight: '80px',
    },
    overflowY: 'auto',
    scrollbarWidth: 'thin',

    scrollbarColor: `${tokens.colorNeutralStroke1} transparent`,
    '& ::-webkit-scrollbar': {
      width: '8px',
      border: `1px solid ${tokens.colorNeutralBackgroundStatic}`,
      backgroundColor: 'transparent',
    },
    '& ::-webkit-scrollbar-thumb': {
      borderRadius: '8px',
      backgroundClip: 'padding-box',
    },
    '& ::-webkit-scrollbar-thumb:hover': {
      width: '8px',
      border: `1px solid ${tokens.colorNeutralBackgroundStatic}`,

      backgroundColor: tokens.colorNeutralBackgroundStatic,
    },
  },

  title: {
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noTasks: {
    color: tokens.colorNeutralForegroundDisabled,
  },
  caption: {
    fontSize: '10px',
    textTransform: 'uppercase',
  },
  popoverStyle: {
    padding: tokens.spacingHorizontalS,
  },
});
