import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useToolStripLayout = makeStyles({
  layoutToolStrip: {
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralForegroundDisabled),
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralForegroundDisabled),
    paddingRight: tokens.spacingHorizontalS,
    justifyContent: 'space-between',
  },
  listToolStrip: {
    display: 'flex',
    // alignItems: 'center',
    // justifyContent: 'center',
    flexDirection: 'row-reverse',
    listStyle: 'none',
    padding: 0,
    margin: 0,
    '& li': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      height: '30px',
      padding: tokens.spacingVerticalXS,
      ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralForeground1),
      ':first-child': {
        ...shorthands.borderLeft('1px', 'solid', tokens.colorNeutralForeground1),
      },
      ':last-child': {
        ...shorthands.borderLeft('1px', 'solid', tokens.colorNeutralForeground1),
      },
    },
  },
  itemWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  rowColumnLayout: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '280px',
    gap: tokens.spacingHorizontalS,
  },
  popOverTitle: {
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
  },
  noOfRowsColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalS,
    '& > div': {
      '& label': {
        color: tokens.colorNeutralForegroundStaticInverted,
      },
      '& input': {
        width: '100px',
      },
    },
  },
  dataStatus: {
    paddingLeft: tokens.spacingHorizontalS,
    color: tokens.colorPaletteDarkOrangeBackground3,
  },
});
