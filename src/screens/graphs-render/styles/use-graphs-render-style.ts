import { makeStyles, tokens } from '@fluentui/react-components';

export const useGraphsRender = makeStyles({
  graphsLayout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  'graphs-area': {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  caption: {
    color: tokens.colorNeutralForeground3,
  },
});



