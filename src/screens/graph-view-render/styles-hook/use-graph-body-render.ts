import { makeStyles, tokens } from '@fluentui/react-components';

export const useGraphBodyLayout = makeStyles({
  graphBodyLayout: {
    display: 'grid',
    gridTemplateColumns: '75% 25%',
    width: '99%',
    gap: tokens.spacingVerticalS,
  },
});
