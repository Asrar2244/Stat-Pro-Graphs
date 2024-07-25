import { makeStyles, tokens } from '@fluentui/react-components';

export const useOutputRender = makeStyles({
  outputLayout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  'output-area': {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
  },
  caption: {
    color: tokens.colorNeutralForeground3,
  },
});
