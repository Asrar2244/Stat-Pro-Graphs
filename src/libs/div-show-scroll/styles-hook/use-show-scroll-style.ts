import { makeStyles } from '@fluentui/react-components';
export const useShowScrollHover = makeStyles({
  strollerBox: {
    width: '100%',
    height: '100%',
    '::-webkit-scrollbar': {
      height: '8px' /* Changes the height of horizontal scrollbar */,
    },
  },
});
