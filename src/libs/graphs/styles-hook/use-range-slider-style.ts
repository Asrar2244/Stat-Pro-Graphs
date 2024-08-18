import { makeStyles, tokens } from '@fluentui/react-components';

export const useRangeSliderStyle = makeStyles({
  rangeSlider: {
    width: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalS,
    '& span:first-child': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    '& div': {
      '& div, button': {
        border: 'none',
      },
    },
  },
});
