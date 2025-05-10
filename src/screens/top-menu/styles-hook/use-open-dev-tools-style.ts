import { makeStyles, tokens } from '@fluentui/react-components';
export const useOpenDevToolsLayout = makeStyles({
  card: {
    margin: 'auto',
    width: '400px',
    maxWidth: '100%',
  },
  details: {
    display: 'flex!important',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    textTransform: 'uppercase',
    gap: tokens.spacingVerticalXS,
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
  },
  maskInputButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'end',
    width: '100%',
    gap: tokens.spacingVerticalXS,
  },
  textArea: {
    width: '100%',
  },
  informationList: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeBtn: {
    width: '20%',
  },
  ulInfo: {
    display: 'flex',
    flexDirection: 'row',
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
});
