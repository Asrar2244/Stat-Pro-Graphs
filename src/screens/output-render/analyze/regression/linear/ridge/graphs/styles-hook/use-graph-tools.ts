import { makeStyles } from '@fluentui/react-components';

export const useGraphTools = makeStyles({
  notFullScreen: {
    maxHeight: '550px',
  },
  fullScreen: {
    height: '100vh',
  },
  toolsWrapper: {
    display: 'flex',
    flexDirection: 'row-reverse',
    width: '100%',
    justifyContent: 'space-between',
  },
});
