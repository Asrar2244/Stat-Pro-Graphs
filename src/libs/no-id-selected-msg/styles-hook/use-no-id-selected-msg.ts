import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

export const useNoIdSelectedStyles = makeStyles({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalM,
    minHeight: '300px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    ...shorthands.padding(tokens.spacingHorizontalM),
    ...shorthands.border('1px', 'dashed', tokens.colorNeutralForegroundDisabled),
  },
});
