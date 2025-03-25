import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useGraphPropertyLayout = makeStyles({
  propsLayout: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralCardBackgroundPressed,
  },
  projectSelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalS,
    alignItems: 'self-start',
    width: '100%',
    padding: tokens.spacingVerticalM,
    '& div': {
      width: '99%',
      paddingLeft: '2px',
      // paddingRight: '4px',
    },
  },
  propertySelector: {
    width: '97%',
    paddingBottom: tokens.spacingVerticalM,
  },
  propertyField: {
    backgroundColor: tokens.colorNeutralStencil2Alpha,
  },
  propertyBody: {
    height: '100%',
  },
  addTraces: {
    width: '100%',
  },
  addTraceField: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '80% 20%',
    gap: tokens.spacingHorizontalM,
    '& input': {
      borderRadius: 0,
    },
  },
});
