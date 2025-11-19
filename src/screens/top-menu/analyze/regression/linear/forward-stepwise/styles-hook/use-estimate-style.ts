import { makeStyles, tokens, shorthands } from '@fluentui/react-components';
export const useEstimateStyle = makeStyles({
  estimateLayout: {
    display: 'flex',
    flexDirection: 'row',
    ...shorthands.padding(tokens.spacingHorizontalM),
    gap: tokens.spacingHorizontalS,
  },
  estimateWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalM,
    width: '30%',
    '& fieldset': {
      '& .pad-divider': {
        ...shorthands.padding(tokens.spacingHorizontalS),
      },
    },
  },
  optionsWrapper: {
    width: '70%',
    '& .separation': {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      '& .sep-text': {
        width: '45%',
      },
    },
  },

  equalDivide: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(25%, 1fr))',
    gap: tokens.spacingHorizontalM,
    '& .align-radio': {
      alignItems: 'center',
    },
  },
});
