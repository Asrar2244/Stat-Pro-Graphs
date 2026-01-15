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
    backgroundColor: tokens.colorNeutralBackground1,
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
    // Style Fluent UI Table components for dark mode
    '& .fui-TableRow': {
      backgroundColor: tokens.colorNeutralBackground1,
      '&:hover': {
        backgroundColor: tokens.colorNeutralBackground2,
      },
    },
    '& .fui-TableCell': {
      backgroundColor: tokens.colorNeutralBackground1,
        color: tokens.colorNeutralForeground1,
      borderColor: tokens.colorNeutralStroke1,
    },
    '& .fui-TableHeaderCell': {
      backgroundColor: tokens.colorCompoundBrandForeground1,
      color: tokens.colorNeutralForegroundStaticInverted,
      borderColor: tokens.colorNeutralStroke1,
    },
  },
  tbody: {
    overflow: 'auto',
  },
  tbodyHeight: {
    height: '300px',
  },
});
