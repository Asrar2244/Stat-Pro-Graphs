import { tokens, makeStyles, shorthands } from '@fluentui/react-components';
export const useCommonLayout = makeStyles({
  loaderBox: {
    width: '80%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'end',
    position: 'absolute',
    bottom: tokens.spacingVerticalS,
    zIndex: 9,
    right: tokens.spacingVerticalS,
    '& label': {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: tokens.fontSizeBase100,
      overflow: 'hidden',
    },
  },
  popoverWrapper: {
    listStyleType: 'none',
    ...shorthands.padding(0),
    ...shorthands.margin(0),
    minWidth: '180px',
    maxHeight: '320px',
    '& li': {
      cursor: 'pointer',
      ...shorthands.padding(tokens.spacingVerticalSNudge),
      ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralForegroundDisabled),
      '& div': {
        cursor: 'pointer',
        display: 'inline-flex',
        gap: tokens.spacingHorizontalS,
        '& label': {
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
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
  statusList: {
    display: 'grid',
    gridTemplateColumns: '0.5fr 3fr',
    alignItems: 'center',
    '& div:first-child': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  },
  internal: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& .status-detail': {
      display: 'flex',
      flexDirection: 'row',
      fontSize: tokens.fontSizeBase100,
    },
  },
  caption: {
    paddingTop: tokens.spacingVerticalS,
    fontSize: '6px',
    textTransform: 'uppercase',
  },
  badge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'end ',
    '& div': {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    '& .label': {
      width: '220px',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
    '& ul': {
      padding: 0,
      margin: 0,
      paddingLeft: tokens.spacingVerticalS,
      listStyle: 'none',
      display: 'inline-flex',
      '& li': {
        padding: 0,
        margin: 0,
        border: 'none',
        '& svg': {
          width: '15px',
          height: '15px',
        },
      },
    },
  },
});
