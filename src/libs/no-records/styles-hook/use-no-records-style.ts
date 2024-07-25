import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useNotFound = makeStyles({
  layout: {},
  notFound: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: 'xxx-large',
    justifyContent: 'center',
    justifyItems: 'center',
    alignItems: 'center',
    ...shorthands.padding(tokens.spacingHorizontalMNudge),
  },
});
