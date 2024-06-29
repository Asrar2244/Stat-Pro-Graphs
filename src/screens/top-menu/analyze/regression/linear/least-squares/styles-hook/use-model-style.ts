import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

export const useModelStyle = makeStyles({
  modelLayout: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding(tokens.spacingHorizontalM),
    gap: tokens.spacingHorizontalS,
  },
  modelWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalS,
    '& fieldset': {
      width: '50%',
    },
    '& .section-available': {
      display: 'flex',
      width: '100%',
      flexDirection: 'column',
      gap: tokens.spacingHorizontalS,
      '& .send-buttons': {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: tokens.spacingHorizontalM,
      },
      '& .available-list': {
        display: 'flex',
        flexDirection: 'column',
        height: '340px',
        overflowY: 'auto',
        ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralBackground1Pressed),
      },
      '& .dependent-list': {
        display: 'flex',
        flexDirection: 'column',
        height: '340px',
        overflowY: 'auto',
        ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralBackground1Pressed),
      },
    },
  },

  removeButtons: {
    backgroundColor: tokens.colorPaletteRedBorder1,
  },
});
