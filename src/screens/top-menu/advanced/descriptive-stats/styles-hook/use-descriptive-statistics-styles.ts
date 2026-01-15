import { makeStyles, tokens } from '@fluentui/react-components';

export const useCommonStyles = makeStyles({
  commonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalM,
    width: '55em',
    maxHeight: '90vh',
    '& .details': {
      height: '70vh',
      display: 'flex',
      flexDirection: 'column',
    },
    '& .select-size': {
      width: 'max-content',
    },
    '& .section-available': {
      paddingTop: '12px',
      marginLeft: 0,
      flex: 1,
    },
    '& .title': {
      display: 'flex',
      flex: 1,
    },
  },
});
