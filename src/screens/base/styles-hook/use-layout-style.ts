import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useLayout = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'row',
    scrollbarWidth: 'thin',
    height: '100vh',
    '& .flexlayout__layout': {
      top: '42px',
      backgroundColor: tokens.colorNeutralForegroundInverted,
    },
    '& .flexlayout__tab_button--selected': {
      ...shorthands.borderTop('3px', 'solid', tokens.colorNeutralForeground3BrandSelected),
      backgroundColor: tokens.colorNeutralStroke2, //colorNeutralForegroundStaticInverted
      color: tokens.colorStrokeFocus2,
    },
    '& .flexlayout__border_button--selected': {
      ...shorthands.borderTop('3px', 'solid', tokens.colorNeutralForeground3BrandSelected),
      backgroundColor: tokens.colorNeutralStroke2, //colorNeutralForegroundStaticInverted
      color: tokens.colorStrokeFocus2,
    },
    '& .flexlayout__tab': {
      overflow: 'hidden',
      backgroundColor: tokens.colorNeutralForegroundInverted,
      color: tokens.colorNeutralForeground1,
    },
    '& .flexlayout__border': {
      backgroundColor: tokens.colorNeutralForegroundInverted,
      color: tokens.colorNeutralForeground1,
    },
    '& .flexlayout__tabset_tabbar_inner_tab_container': {
      backgroundColor: tokens.colorNeutralForegroundInverted,
      color: tokens.colorNeutralForeground1,
    },
    '& .flexlayout__splitter_border': {
      backgroundColor: tokens.colorNeutralStencil2Alpha,
    },
    '& .flexlayout__border_left': {
      borderRightColor: tokens.colorNeutralStroke1,
    },
    '& .flexlayout__tabset': {
      backgroundColor: tokens.colorNeutralForegroundStaticInverted,
    },
    '& .flexlayout__tab_toolbar': {
      ...shorthands.padding(0),
      gap: 0,
    },
    '& .flexlayout__tabset_tabbar_outer_top': {
      borderBottomColor: tokens.colorNeutralStroke1,
    },
    '& .flexlayout__border_bottom ': {
      borderTopColor: tokens.colorNeutralStroke1,
    },
    '& .flexlayout__border_button--unselected': {
      backgroundColor: tokens.colorNeutralStencil2Alpha,
    },
    '& *[data-show-scroll]:hover ::-webkit-scrollbar-thumb': {
      backgroundColor: tokens.colorNeutralBackgroundStatic,
    },
    '& *[data-show-scroll]': {
      overflow: 'auto',
    },
    '& ::-webkit-scrollbar': {
      width: '8px',
      border: `1px solid ${tokens.colorNeutralBackgroundStatic}`,
      backgroundColor: 'transparent',
    },
    '& ::-webkit-scrollbar-thumb': {
      borderRadius: '8px',
      backgroundClip: 'padding-box',
    },
    '& ::-webkit-scrollbar-thumb:hover': {
      backgroundColor: tokens.colorNeutralBackgroundStatic,
    },
  },
  titleLayout: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '14px',
    minWidth: '100px',
    fontWeight: 600,
    gap: 0,
    overflow: 'hidden',
    textAlign: 'center',
  },
  titleOptions: {
    '& div': {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      width: '150px',
      textOverflow: 'ellipsis',
    },
  },
  subTitle: {
    fontSize: '8px',
    fontWeight: 100,
    textTransform: 'uppercase',
    marginTop: '-4px',
  },
  suppressOverFlow: {
    overflow: 'hidden',
    width: '100%',
    height: 'calc(100vh - 118px)',
  },
});
