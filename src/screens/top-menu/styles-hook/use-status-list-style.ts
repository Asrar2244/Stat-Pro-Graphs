import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useMenuLayout = makeStyles({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralForegroundDisabled),
    justifyContent: 'space-between',
    height: '36px',
    width: '100%',
    alignItems: 'center',
  },
  layout: {
    // width: '65%',
    cursor: 'pointer',
    // ...shorthands.flex(1),
  },
  menuText: {
    ...shorthands.padding(tokens.spacingHorizontalS),
  },
  menuItems: {
    minWidth: '200px',
  },
  nonDarwin: {
    minWidth: '140px',
  },
  tools: {
    display: 'flex',
    flexDirection: 'row',
    // justifyContent: window.electron.process.platform === 'darwin' ? 'flex-end' : 'space-between',
    // ...shorthands.padding(0, tokens.spacingHorizontalXS, 0, '0'),
  },
});
