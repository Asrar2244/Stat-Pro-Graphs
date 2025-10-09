import { makeStyles, tokens } from '@fluentui/react-components';

export const useGraphsRender = makeStyles({
  graphsLayout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  'graphs-area': {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
  },
  caption: {
    color: tokens.colorNeutralForeground3,
  },
});



