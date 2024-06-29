import { makeStyles, tokens } from '@fluentui/react-components';

export const useMinMaxCloseStyles = makeStyles({
  minMaxClose: {
    display: 'flex',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalM,
    //window.electron.process.platform === 'darwin'
    // ? tokens.spacingHorizontalM
    // : tokens.spacingHorizontalXL,
  },
  close: {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorPaletteRedBackground3,
      '& svg': {
        fill: tokens.colorNeutralStrokeOnBrand2,
      },
    },
  },
  maximize: {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorPaletteYellowBackground3,
      '& svg': {
        fill: tokens.colorNeutralForeground1Static,
      },
    },
  },
  minimize: {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorPaletteGreenForegroundInverted,
      '& svg': {
        fill: tokens.colorNeutralStrokeOnBrand2,
      },
    },
  },
});
