import { makeStyles, shorthands } from '@fluentui/react-components';

export const useSuspenseClasses = makeStyles({
  suspense: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding(0),
    width: '100%',
    height: '100vh',
    justifyContent: 'center',
    opacity: '0.8',
  },
});
