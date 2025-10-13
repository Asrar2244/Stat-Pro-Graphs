import { makeStyles } from '@fluentui/react-components';

export const useGraphBodyLayout = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  toolbar: {
    flexShrink: 0,
  },
  // Additional missing classes
  graphBodyLayout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
});
