import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

export const usePredictStyle = makeStyles({
  predictLayout: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding(tokens.spacingHorizontalM),
    gap: tokens.spacingHorizontalS,
  },
  predictWrapper: {
    width: '100%',
    '& fieldset': {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      '& .align-checkbox': {
        alignItems: 'center',
      },
    },
  },
});
