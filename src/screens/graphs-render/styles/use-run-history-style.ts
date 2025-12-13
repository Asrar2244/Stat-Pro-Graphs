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
    ...shorthands.border('1px', 'solid', '#e1e4e8'),
    backgroundColor: '#ffffff',
    ':hover': {
      backgroundColor: '#f6f8fa',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    },
    '@media (prefers-color-scheme: dark)': {
      ...shorthands.border('1px', 'solid', tokens.colorNeutralStencil2Alpha),
      backgroundColor: 'transparent',
      ':hover': {
        backgroundColor: tokens.colorNeutralBackground1Hover,
        boxShadow: 'none',
      },
    },
  },
  caption: {
    color: '#586069',
    '@media (prefers-color-scheme: dark)': {
      color: tokens.colorNeutralForeground3,
    },
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
      color: '#24292e',
      '@media (prefers-color-scheme: dark)': {
        color: tokens.colorNeutralForeground1,
      },
      '::after': {
        content: '...',
        display: 'inline-block',
      },
    },
  },
  drawerHeader: {
    ...shorthands.padding(tokens.spacingHorizontalS),
    ...shorthands.borderBottom('1px', 'solid', '#e1e4e8'),
    backgroundColor: '#f6f8fa',
    '@media (prefers-color-scheme: dark)': {
      ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStencil2Alpha),
      backgroundColor: tokens.colorNeutralStencil2Alpha,
    },
  },
  drawerBody: {
    ...shorthands.borderLeft('1px', 'solid', '#e1e4e8'),
    backgroundColor: '#fafbfc',
    '@media (prefers-color-scheme: dark)': {
      ...shorthands.borderLeft('1px', 'solid', tokens.colorNeutralStencil2Alpha),
      backgroundColor: 'transparent',
    },
  },
  runHistoryTitle: {
    ...shorthands.padding(tokens.spacingHorizontalS),
    fontWeight: '600',
    color: '#24292e',
    '@media (prefers-color-scheme: dark)': {
      color: tokens.colorNeutralForeground1,
    },
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
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: tokens.colorNeutralBackground1,
    },
  },
  selectedItem: {
    ...shorthands.borderLeft('4px', 'solid', tokens.colorBrandBackground),
    backgroundColor: '#f0f7ff',
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: tokens.colorNeutralBackground1Selected,
    },
  },
});
