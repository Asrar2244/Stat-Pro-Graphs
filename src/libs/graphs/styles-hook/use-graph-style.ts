import { makeStyles, shorthands } from '@fluentui/react-components';

export const useGraphStyles = makeStyles({
  fullScreen: {
    height: '100vh',
  },
  notFullScreen: {
    maxHeight: '550px',
  },
  toolsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  graph: {
    width: '100%',
    height: '100%',
    '& svg': {
      '& g': {
        '& g': {
          '& .annotation-text': {
            ...shorthands.border('1px', 'solid'),
          },
        },
      },
    },
  },
});
