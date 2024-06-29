import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

export const useOptionsStyle = makeStyles({
  optionsLayout: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding(tokens.spacingHorizontalM),
    gap: tokens.spacingHorizontalS,
  },
  optionsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalM,
    '& fieldset': {
      width: '100%',
      '& .pad-divider': {
        ...shorthands.padding(tokens.spacingHorizontalS),
      },
      '& .normality': {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
    },
  },
});
