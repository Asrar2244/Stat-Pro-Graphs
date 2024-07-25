import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useExplorerLayout = makeStyles({
  explorerLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalM,
    '& .selected': {
      backgroundColor: tokens.colorNeutralStencil2Alpha, //colorBrandBackgroundInvertedSelected
    },
    '& .tree-comp': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  workspace: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground1,
    width: '100%',
    height: '40px',
    alignItem: 'center',
    fontWeight: 600,
    fontSize: 'small',
    textTransform: 'uppercase',
  },
  treeItemLayout: {
    display: 'flex',
    flexDirection: 'column',

    color: tokens.colorNeutralForeground1,
    '& .project-name': {
      textTransform: 'uppercase',
      fontSize: 'small',
    },
    '& .date-file': {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'end',
      gap: tokens.spacingHorizontalS,
    },
  },
  leafLayout: {
    gap: '0px',
    '& .leaf': {
      ...shorthands.border(tokens.strokeWidthThick),
    },
  },
});
