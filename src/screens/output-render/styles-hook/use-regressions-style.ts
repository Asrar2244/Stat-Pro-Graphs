import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
export const useRegressions = makeStyles({
  regressionsLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalL,
    '& table': {
      borderCollapse: 'collapse',
      '& th': {
        backgroundColor: tokens.colorBrandStroke1,
        color: tokens.colorNeutralStrokeOnBrand2,
        ...shorthands.padding(tokens.spacingHorizontalXS),
        ...shorthands.border('1px', 'solid'),
      },
      '& td': {
        ...shorthands.padding(tokens.spacingHorizontalXS),
        ...shorthands.border('1px', 'solid'),
      },
    },
    '& .fullscreen-enabled': {
      '& .fui-Card': {
        height: '100%',
      },
    },
  },
});
