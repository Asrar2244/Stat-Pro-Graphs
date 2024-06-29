import { makeStyles, tokens } from '@fluentui/react-components';

export const useModalRidge = makeStyles({
  bodyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalM,
    '& .details': {
      height: '53vh',
    },
  },
});
