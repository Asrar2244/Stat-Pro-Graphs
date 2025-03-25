import { makeStyles, tokens } from '@fluentui/react-components';
export const useOpenDevToolsLayout = makeStyles({
  card: {
    margin: 'auto',
    width: '400px',
    maxWidth: '100%',
  },
  details: {
    display: 'flex!important',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    textTransform: 'uppercase',
    gap: tokens.spacingHorizontalL,
  },
  description: {
    width: '100%',
  },
  license: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'end',
    width: '40%',
  },
  footerButton: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  small: {
    fontWeight: 'lighter',
  },
  activateLicense: {
    display: 'flex',
    flexDirection: 'column',
    width: '60%',
    gap: tokens.spacingVerticalXS,
  },

  activeButton: {
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    width: '98%',
  },
  maskInputButton: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
});
