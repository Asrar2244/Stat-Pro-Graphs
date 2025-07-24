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
      gridTemplateColumns: '1fr',
      gap: tokens.spacingHorizontalM,
      '@media (min-width: 700px)': {
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
    },
  },
});
