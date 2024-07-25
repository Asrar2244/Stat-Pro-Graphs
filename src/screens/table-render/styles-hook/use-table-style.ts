import { shorthands, tokens, makeStyles } from '@fluentui/react-components';

export const useTableStyles = makeStyles({
  completeLayout: {
    height: '100%',
    overflow: 'hidden',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  textBoxCss: {
    ...shorthands.border('none'),

    ...shorthands.padding(tokens.spacingVerticalS),
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    width: '100%',
    '&: last-child': {
      ...shorthands.borderBottom('2px', 'solid', tokens.colorNeutralForeground1),
    },
  },

  rowIndex: {
    display: 'flex',
    minWidth: '60px',
    justifyContent: 'center',
    backgroundColor: tokens.colorNeutralBackground3,
    zIndex: 1,
  },
  columnsColor: {
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.padding(tokens.spacingVerticalS, 0, 0, 0),
  },
  cellStyle: {
    ...shorthands.border('1px', 'solid', tokens.colorNeutralForeground1),
  },
  cellHeaders: {
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStencil2Alpha),
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    '& div': {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      width: '90%',
    },
  },
  footerLayout: {
    position: 'absolute',
    bottom: 0,
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '44px',
    backgroundColor: tokens.colorNeutralBackground3,
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralStroke1),
    overflow: 'hidden !important',
  },
});
