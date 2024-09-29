import { makeStyles, tokens } from '@fluentui/react-components';

export const useCreateTableStyles = makeStyles({
  tableLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    width: '100%',
    overflow: 'hidden',
  },
  pagingList: {
    '& div': {
      '& div, button': {
        border: 'none',
      },
    },
  },
  table: {
    overflow: 'hidden',
    '& .table-header': {
      height: '35px',
      overflow: 'auto',
      backgroundColor: tokens.colorCompoundBrandForeground1,
      '& .cell': {
        color: tokens.colorNeutralForegroundStaticInverted,
      },
      '& .header': {
        textTransform: 'uppercase',
        fontWeight: tokens.fontWeightBold,
      },
    },
  },
  tbody: {
    overflow: 'auto',
  },
  tbodyHeight: {
    height: '300px',
  },
});
