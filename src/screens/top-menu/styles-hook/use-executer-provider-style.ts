import { makeStyles, tokens } from '@fluentui/react-components';
export const useExecuterProviderLayout = makeStyles({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    justifyItems: 'center',
    position: 'absolute',
    width: '100%',
    height: '10vh',
    zIndex: 12,
    padding: tokens.spacingVerticalXS,
    gap: tokens.spacingVerticalXS,
    backgroundColor: tokens.colorNeutralBackground1,
  },
});
