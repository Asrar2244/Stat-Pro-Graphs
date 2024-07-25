import { shorthands, tokens, makeStyles } from '@fluentui/react-components';

export const useSearchStyles = makeStyles({
  dataLayout: {
    display: 'flex',
    flexDirection: 'row',
    width: '99%',
    zIndex: 1,
    gap: tokens.spacingHorizontalS,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.padding(tokens.spacingVerticalS),
    justifyContent: 'space-between',
    '& div:first-child': {
      width: '60%',
    },
    '& div:last-child': {
      width: '40%',
    },
  },
  detailsStyle: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: 'x-small',
    fontWeight: 400,
  },
});
