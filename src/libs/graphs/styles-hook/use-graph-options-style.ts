import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useGraphOptionStyles = makeStyles({
  container: {
    height: '100%',
  },
  graphOptions: {
    '& table': {
      width: '100%',
      borderCollapse: 'collapse',
      '& th': {
        minWidth: '180px',
        height: '30px',
        position: 'sticky',
        textAlign: 'center',
        top: 0,
        zIndex: 1,
        backgroundColor: tokens.colorBrandBackground,
        color: tokens.colorBrandBackgroundInvertedHover,
        fontWeight: 'bold',
        ...shorthands.border('1px', 'solid', tokens.colorNeutralForeground1),
      },
      '& td': {
        textAlign: 'center',
        height: '30px',
        ...shorthands.border('1px', 'solid', tokens.colorNeutralForeground1),
      },
    },
    '& select': {
      height: '34px',
      width: '100%',
      textTransform: 'capitalize',
      ...shorthands.padding('8px'),
      '& option': {
        textAlign: 'center',
        textTransform: 'capitalize',
      },
    },
    '& input': {
      width: '27px',
    },
  },
  optionItem: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacingHorizontalXS,
  },
});
