import { tokens, makeStyles, shorthands } from '@fluentui/react-components';

export const useCommonLayout = makeStyles({
  popoverWrapper: {
    listStyleType: 'none',
    ...shorthands.padding(0),
    ...shorthands.margin(0),
    minWidth: '280px',
    maxHeight: '320px',
    '& li': {
      ...shorthands.padding(tokens.spacingVerticalSNudge),
      ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralBackground3Hover),
      '& div': {
        display: 'inline-flex',
        width: '100%',
        justifyContent: 'start',
        gap: tokens.spacingHorizontalS,
        '& div[role="img"]:first-child': {
          width: '8%',
        },
        '& .internal': {
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
          ...shorthands.padding(0),
          ...shorthands.margin(0),
          '& .status-detail': {
            display: 'flex',
            flexDirection: 'row-reverse',
            justifyContent: 'end',
            height: '14px',
            ...shorthands.margin('-4px'),
            fontSize: tokens.fontSizeBase100,
          },
        },
        '& label': {
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 1,
          cursor: 'pointer',
          maxWidth: '150px',
        },
        '& label::after': {
          content: '...',
          display: 'inline-block',
        },
      },
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
