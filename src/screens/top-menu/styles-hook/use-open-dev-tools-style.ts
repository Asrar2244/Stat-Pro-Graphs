import { makeStyles } from '@fluentui/react-components';
export const useOpenDevToolsLayout = makeStyles({
  card: {
    margin: 'auto',
    width: '400px',
    maxWidth: '100%',
  },
  details: {
    display: 'flex!important',
    flexDirection: 'row',
    alignItems: 'center',
    textTransform: 'uppercase',
    gap: '2px',
    '& > div': {
      width: '50%',
    },
  },
  description: {
    width: '100%',
  },
  license: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  footerButton: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  small: {
    fontWeight: 'lighter',
  },
});
