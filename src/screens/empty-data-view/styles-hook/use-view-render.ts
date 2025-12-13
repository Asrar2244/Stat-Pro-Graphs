import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
export const useViewRenderLayout = makeStyles({
  layoutToolStrip: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    position: 'relative',
    userSelect: 'none',
    '& .Spreadsheet--dark-mode': {
      backgroundColor: tokens.colorNeutralBackground3,
      color: tokens.colorNeutralForeground1,
      '& .Spreadsheet__cell': {
        ...shorthands.border('1px', 'solid', tokens.colorNeutralForeground1),
      },

      '& .Spreadsheet__header': {
        position: 'sticky',
        zIndex: 11,
        top: 0,
        backgroundColor: tokens.colorNeutralBackground3,
        ...shorthands.border('1px', 'solid', tokens.colorNeutralStencil2Alpha),
        ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralForeground1),
        color: tokens.colorNeutralForeground1,
        height: '35px',
        width: '180px',
        textTransform: 'uppercase',
        ':first-child': {
          position: 'sticky',
          left: 0,
          zIndex: 10,
          width: '60px',
          borderBottom: 'none',
          ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralForeground1),
        },
      },
      '& table': {
        '& tbody': {
          backgroundColor: tokens.colorNeutralBackground1,
          '& tr:first-child': {
            ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralStencil2Alpha),
            '& th:first-child': {
              ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralStencil2Alpha),
            },
          },
        },
      },
    },
  },
});
