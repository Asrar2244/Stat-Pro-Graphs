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
    display: 'contents',
    cursor: 'pointer',
    // ...shorthands.flex(1),
    '& span': {
      wordSpacing: 'nowrap',
    },
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
  },
});
