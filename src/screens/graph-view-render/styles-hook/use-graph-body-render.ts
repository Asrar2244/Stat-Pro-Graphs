import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useGraphBodyLayout = makeStyles({
  graphBodyLayout: {
    display: 'grid',
    gridTemplateColumns: '75% 25%',
    // backgroundColor: tokens.colorNeutralBackground2,
    width: '99%',
    // gridTemplateRows: '100%',
    // alignContent: 'center',
    // alignItems: 'center',
    // justifyContent: 'center',
    gap: tokens.spacingVerticalS,
  },
});
