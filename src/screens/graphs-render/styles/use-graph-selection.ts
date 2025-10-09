import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useGraphSelection = makeStyles({
  selectionLayout: {
    display: 'flex',
    flexDirection: 'column',
    width: '76%',
    wordWrap: 'break-word',
    ...shorthands.padding(tokens.spacingHorizontalS),
    overflow: 'hidden',
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
    height: '92%',
    alignItems: 'baseline',
    ...shorthands.padding(tokens.spacingHorizontalS),
    overflow: 'auto',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    width: '99%',
  },
});



