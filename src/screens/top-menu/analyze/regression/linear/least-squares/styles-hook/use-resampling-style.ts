import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

export const useResamplingStyle = makeStyles({
  resamplingLayout: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding(tokens.spacingHorizontalM),
    gap: tokens.spacingHorizontalS,
  },
  resamplingWrapper: {
    '& fieldset': {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(40%, 1fr))',
      gap: tokens.spacingHorizontalM,
    },
  },
});
