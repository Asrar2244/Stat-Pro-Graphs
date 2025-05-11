import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useContainerLayout = makeStyles({
  layoutContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    // alignItems: 'center',
    // padding: tokens.spacingVerticalS,
  },
});
