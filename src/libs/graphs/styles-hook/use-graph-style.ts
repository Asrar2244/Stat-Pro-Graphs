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
    maxHeight: '550px',
    height: 'auto',
    position: 'relative',
    display: 'block',
    '&:not(.fullscreen-enabled)': {
      height: 'auto !important',
      maxHeight: '550px !important',
      position: 'relative !important',
      top: 'auto !important',
      left: 'auto !important',
      right: 'auto !important',
      bottom: 'auto !important',
    },
    '&.fullscreen-enabled': {
      height: '100vh',
      maxHeight: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
    },
    '& .fui-Card': {
      display: 'block',
      '&:not(.fullscreen-enabled)': {
        maxHeight: '550px',
        height: 'auto',
      },
      '&.fullscreen-enabled': {
        height: '100%',
        maxHeight: '100%',
      },
    },
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
