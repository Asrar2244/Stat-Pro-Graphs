import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useGraphStyles = makeStyles({
  fullScreen: {
    height: '100vh',
  },
  notFullScreen: {
    maxHeight: 'calc(100vh - 200px)',
  },
  graph: {
    width: '100%',
    height: 'calc(100% - 80px)',
    maxHeight: 'calc(100% - 80px)',
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column',
  },
  graphCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow4,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.overflow('hidden'),
  },
  graphCanvas: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.overflow('hidden'),
  },
  toolsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '48px',
    minHeight: '48px',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralStroke1),
    boxSizing: 'border-box',
  },
});
