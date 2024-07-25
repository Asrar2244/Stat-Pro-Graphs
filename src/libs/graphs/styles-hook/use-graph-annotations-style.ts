import { makeStyles } from '@fluentui/react-components';

export const useGraphAnnotationsStyles = makeStyles({
  annotations: {
    '& .ql-container': {
      height: '150px',
      '& .ql-editing': {
        left: '0!important',
        top: '0!important',
      },
    },
  },
});
