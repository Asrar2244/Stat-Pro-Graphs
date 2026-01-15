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
    WebkitAppRegion: 'drag',
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Roboto", "Helvetica Neue", Arial, sans-serif',
    fontSize: '12px',
    fontWeight: 400,
  },
  layout: {
    // width: '65%',
    display: 'inline-flex',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag',
    // ...shorthands.flex(1),
    '& span': {
      wordSpacing: 'nowrap',
    },
  },
  menuText: {
    ...shorthands.padding(tokens.spacingHorizontalS),
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Roboto", "Helvetica Neue", Arial, sans-serif',
    fontSize: '12px',
    fontWeight: 400,
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
    WebkitAppRegion: 'no-drag',
  },
  menuWrapper: {
    position: 'relative' as const,
    display: 'inline-flex',
    alignItems: 'center',
    height: '36px',
  },
  activeMenuWrapper: {
    position: 'relative' as const,
    display: 'inline-flex',
    alignItems: 'center',
    height: '28px',
    marginTop: '4px',
    background: `linear-gradient(to bottom, ${tokens.colorNeutralBackground3}, ${tokens.colorNeutralBackground2})`,
    borderRadius: `${tokens.borderRadiusMedium} ${tokens.borderRadiusMedium} 0 0`,
    marginBottom: '0px',
    zIndex: 10,
    paddingLeft: '4px',
    paddingRight: '4px',
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    borderLeft: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    borderBottom: 'none',
  },
  curvedBorder: {
    display: 'none',
  },
});
