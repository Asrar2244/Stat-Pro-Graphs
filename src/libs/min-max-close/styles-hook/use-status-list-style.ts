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
    },
    overflowY: 'auto',
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
    '& li:hover ::-webkit-scrollbar-thumb': {
      backgroundColor: tokens.colorNeutralBackgroundStatic,
    },
  },

  title: {
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
  },
  noTasks: {
    color: tokens.colorNeutralForegroundDisabled,
  },
  caption: {
    fontSize: '10px',
    textTransform: 'uppercase',
  },
});
