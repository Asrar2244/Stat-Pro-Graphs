import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useGraphSelection = makeStyles({
  selectionLayout: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    wordWrap: 'break-word',
    ...shorthands.padding(tokens.spacingHorizontalS),
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  lastRunAt: {
    position: 'fixed',
    zIndex: 1,
    borderRadius: `0 ${tokens.borderRadiusXLarge} ${tokens.borderRadiusXLarge} 0`,
    ...shorthands.padding(tokens.spacingHorizontalS),
    width: 'fit-content',
    backgroundColor: tokens.colorBrandForegroundOnLight,
    color: tokens.colorNeutralForegroundInvertedLinkSelected,
  },
  graphContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    alignItems: 'baseline',
    ...shorthands.padding(tokens.spacingHorizontalS),
    overflow: 'hidden',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    width: '99%',
    flex: 1,
    minHeight: 0,
  },
});



