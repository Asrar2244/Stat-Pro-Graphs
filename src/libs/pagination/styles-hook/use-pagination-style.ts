import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const usePaginationStyles = makeStyles({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    justifyItems: 'center',
    width: '100%',
    ...shorthands.padding(0, tokens.spacingHorizontalS),
  },
  navigation: {
    display: 'flex',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalXS,
    alignItems: 'center',
    justifyContent: 'center',
    justifyItems: 'center',
    rowGap: 0,
    height: '40px',
    '& div, button': {
      height: '98%',
      padding: tokens.spacingHorizontalXXS,
      ...shorthands.borderRight('1px', 'solid', `${tokens.colorNeutralForeground1} `),
    },
  },
  jump: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    justifyItems: 'center',
    width: '120px',
    '& input': {
      width: '50%',
      textAlign: 'right',
    },
    '& small': {
      width: '50%',
    },
  },
  select: {
    backgroundColor: 'transparent',
    appearance: 'initial',
    ...shorthands.border('none'),
    color: tokens.colorNeutralForeground1,
    padding: tokens.spacingHorizontalS,
  },
  pageSize: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.borderLeft('1px', 'solid', `${tokens.colorNeutralForeground1}`),
  },
  internalPageSize: {
    display: 'flex',
    justifyContent: 'center',
    ...shorthands.borderRight(`0`),
  },
  selectOptions: {
    backgroundColor: tokens.colorNeutralBackground6,
    '& page': {
      display: 'flex',
      width: '100%',
      height: '30px',
    },
  },
});
