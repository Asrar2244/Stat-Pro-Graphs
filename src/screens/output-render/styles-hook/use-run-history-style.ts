import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

export const useRunHistoryClasses = makeStyles({
  card: {
    listStyleType: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalXXS,
    ...shorthands.padding(0),
    ...shorthands.margin(0),
  },
  cardList: {
    display: 'flex',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalSNudge,
    borderRadius: tokens.borderRadiusMedium,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStencil2Alpha),
  },
  caption: {
    color: tokens.colorNeutralForeground3,
  },
  horizontalCardImage: {
    ...shorthands.borderColor(tokens.colorNeutralForegroundDisabled),
    '& .calender': {
      width: '55px',
    },
  },
  headerTitle: {
    '& .header-label': {
      overflow: 'hidden',
      fontSize: tokens.fontSizeBase200,
      fontWeight: tokens.fontWeightMedium,
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      lineHeight: 'normal',
      width: '100%',
      WebkitLineClamp: 2,
      minHeight: '20px',
      '::after': {
        content: '...',
        display: 'inline-block',
      },
    },
  },
  drawerHeader: {
    ...shorthands.padding(tokens.spacingHorizontalXXS),
    ...shorthands.borderBottom('6px', 'solid', tokens.colorNeutralStencil2Alpha),
    backgroundColor: tokens.colorNeutralStencil2Alpha,
  },
  drawerBody: {
    ...shorthands.borderLeft('1px', 'solid', tokens.colorNeutralStencil2Alpha),
  },
  runHistoryTitle: {
    ...shorthands.padding(tokens.spacingHorizontalS),
  },
  drawerContainer: {
    position: 'absolute',
    height: '100%',
  },
});
