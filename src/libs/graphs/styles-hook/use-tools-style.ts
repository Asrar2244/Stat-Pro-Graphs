import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useToolsStyles = makeStyles({
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  toolsLayout: {
    display: 'flex',
    ...shorthands.padding(0),
    ...shorthands.margin(0),
    gap: tokens.spacingHorizontalXS,
    listStyleType: 'none',
    '& li': {
      ...shorthands.padding(tokens.spacingHorizontalXXS),
    },
  },
  downloadMenu: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding(0),
    ...shorthands.margin(0),
    listStyleType: 'none',
    '& li': {
      cursor: 'pointer',
      textTransform: 'uppercase',
      fontWeight: tokens.fontWeightMedium,
      ...shorthands.padding(tokens.spacingVerticalXXS),
      ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralForegroundDisabled),
    },
    '& li:first-child': {
      ...shorthands.borderTop('none'),
    },
    '& li:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  description: {
    fontSize: '8px',
    fontWeight: 'normal',
  },
});
