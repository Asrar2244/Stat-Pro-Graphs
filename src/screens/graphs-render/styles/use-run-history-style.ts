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
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    backgroundColor: tokens.colorNeutralBackground1,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      boxShadow: tokens.shadow2,
    },
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
      color: tokens.colorNeutralForeground1,
      '::after': {
        content: '...',
        display: 'inline-block',
      },
    },
  },
  drawerHeader: {
    ...shorthands.padding(tokens.spacingHorizontalS),
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
    backgroundColor: tokens.colorNeutralBackground2,
  },
  drawerBody: {
    ...shorthands.borderLeft('1px', 'solid', tokens.colorNeutralStroke1),
    backgroundColor: tokens.colorNeutralBackground2,
  },
  runHistoryTitle: {
    ...shorthands.padding(tokens.spacingHorizontalS),
    fontWeight: '600',
    color: tokens.colorNeutralForeground1,
  },
  drawerContainer: {
    position: 'relative',
    height: '100%',
    width: '280px',
    minWidth: '280px',
    maxWidth: '280px',
    flexShrink: 0,
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderLeft('1px', 'solid', tokens.colorNeutralStroke1),
  },
  selectedItem: {
    ...shorthands.borderLeft('4px', 'solid', tokens.colorBrandBackground),
    backgroundColor: tokens.colorNeutralBackground1Selected,
  },
});
