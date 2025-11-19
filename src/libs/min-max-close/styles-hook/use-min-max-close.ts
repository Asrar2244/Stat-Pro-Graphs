import { makeStyles, tokens } from '@fluentui/react-components';

export const useMinMaxCloseStyles = makeStyles({
  minMaxClose: {
    display: 'flex',
    flexDirection: 'row',
    // gap: tokens.spacingHorizontalS,
    //window.electron.process.platform === 'darwin'
    // ? tokens.spacingHorizontalM
    // : tokens.spacingHorizontalXL,
    WebkitAppRegion: 'no-drag',
  },
  ul: {
    display: 'contents',
    listStyle: 'none',
    '& li': {
      padding: tokens.spacingHorizontalS,
      WebkitAppRegion: 'no-drag',
      cursor: 'pointer',
      pointerEvents: 'auto',
      userSelect: 'none',
      '& svg': {
        fill: tokens.colorNeutralBackgroundInverted,
        pointerEvents: 'none',
      },
      ':hover': {
        backgroundColor: tokens.colorNeutralBackground1Selected,
      },
      ':last-child[data-close-window]:hover': {
        backgroundColor: tokens.colorPaletteRedBackground3,
        '& svg': {
          fill: tokens.colorNeutralForegroundStaticInverted,
        },
      },
    },
  },
  liCloseMaxMin: {
    borderLeft: `1px solid ${tokens.colorNeutralStroke1}`,
  },
});
