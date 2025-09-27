import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useToolsStyle = makeStyles({
  fontSizePanel: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  historyCounter: {
    position: 'relative',
    '& .counter': {
      position: 'absolute',
      right: 0,
      top: 0,
    },
  },
  'output-band': {
    width: '100%',
    backgroundColor: tokens.colorNeutralStencil2Alpha,
    ...shorthands.padding(tokens.spacingHorizontalSNudge),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
    fontWeight: 600,
    fontSize: 'small',
    textTransform: 'uppercase',
    justifyContent: 'space-between',
    '& .output-tools': {
      ...shorthands.padding(0, tokens.spacingHorizontalM),
      '& ul': {
        listStyleType: 'none',
        ...shorthands.padding(0),
        ...shorthands.margin(0),
        display: 'inline-flex',
        '& .selected': {
          ...shorthands.border('1px', 'solid', tokens.colorNeutralStrokeAccessibleSelected),
          borderRadius: tokens.borderRadiusMedium,
        },
        '& li': {
          ...shorthands.border('1px', 'solid', tokens.colorNeutralStencil2Alpha),
        },
      },
      '& .color-picker': {
        position: 'relative',
        '& input[type="color"]': {
          opacity: 0,
          cursor: 'pointer',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '30px',
          height: '30px',
        },
      },
    },
  },
  title: {
    display: 'flex',
    flexDirection: 'column',
    '& small': {
      fontSize: 'x-small',
      fontWeight: 400,
    },
  },
});






