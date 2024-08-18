import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useOutputSelection = makeStyles({
  selectionLayout: {
    display: 'flex',
    flexDirection: 'column',
    width: '90%',
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
  outputContainer: {
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
    width: '84%',
  },
});
