import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

export const useEstimateModelStyles = makeStyles({
  modelLayout: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding(tokens.spacingHorizontalM),
    gap: tokens.spacingHorizontalM,
  },
  removeButtons: {
    backgroundColor: tokens.colorPaletteRedBorder1,
  },
  modelWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalS,
    '& fieldset': {
      width: '25%',
    },
    '& .section-available': {
      display: 'flex',
      //   width: '100%',
      flexDirection: 'column',
      gap: tokens.spacingHorizontalS,

      '& .available-list': {
        display: 'flex',
        flexDirection: 'column',
        height: '340px',
        width: '200px',
        overflowY: 'auto',
        ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralBackground1Pressed),
      },
    },
  },
  buttonsFlex: {
    display: 'flex',
    flexDirection: 'row-reverse',
    gap: tokens.spacingHorizontalM,
    '.button-width': {
      width: '20%',
    },
    '@media (max-width: 1024px)': {
      '.button-width': {
        width: '100px',
      },
    },
  },
});
