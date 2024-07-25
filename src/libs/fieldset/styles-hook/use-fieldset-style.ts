import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

export const useFieldSetStyles = makeStyles({
  fieldsetLayout: {
    position: 'relative',
    ...shorthands.borderColor(tokens.colorNeutralBackground2),
    borderRadius: tokens.borderRadiusMedium,
    ':disabled': {
      opacity: '0.6',
    },
  },
  labelFields: {
    position: 'absolute',
    top: '-10px',
    backgroundColor: tokens.colorNeutralBackground1,
    textTransform: 'uppercase',
  },
  elementFields: {
    position: 'absolute',
    top: '-14px',
    backgroundColor: tokens.colorNeutralBackground1,
    textTransform: 'uppercase',
  },
});
