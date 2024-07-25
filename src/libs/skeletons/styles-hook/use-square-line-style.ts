import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useSquareLineClasses = makeStyles({
  skeletonWrapper: {
    display: 'flex',
    flexDirection: 'row',
    ...shorthands.padding(tokens.spacingHorizontalMNudge),
    alignItems: 'center',
    gap: tokens.spacingHorizontalMNudge,
    width: '100%',
  },
});
