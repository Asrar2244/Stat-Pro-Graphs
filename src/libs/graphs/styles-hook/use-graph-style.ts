import { makeStyles, shorthands } from '@fluentui/react-components';

export const useGraphStyles = makeStyles({
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
