import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useBrowseLayout = makeStyles({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalXXS,
    overflow: 'hidden',
    width: '400px',
  },
  fieldset: {
    ...shorthands.border('none'),
    ...shorthands.padding('0'),
  },
  iconHover: {
    cursor: 'pointer',
  },
  processor: {
    display: 'flex',
    flexDirection: 'row',
  },
});
