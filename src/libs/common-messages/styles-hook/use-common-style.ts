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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacingVerticalS,
    '& div:first-child': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: tokens.spacingVerticalXS,
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
    flex: 1,
    // alignItems: 'end ',
    gap: tokens.spacingVerticalXS,
    '& div': {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    '& .label': {
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 2,
    },
  },
  trash: {
    borderLeft: '1px solid gray',
  },
  licenseStatus: {
    paddingRight: tokens.spacingVerticalS,
    paddingLeft: tokens.spacingVerticalS,
  },
});
