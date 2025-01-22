import { tokens, makeStyles } from '@fluentui/react-components';
export const useCardColumnStyle = makeStyles({
  regressionsLayout: {
    width: '100%',
    "> div": { overflow: "scroll" }
  },
  card: {
    marginBottom: "14px"
  },
  header: { backgroundColor: tokens.colorCompoundBrandForeground1, },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  footer: {
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow4,
    padding: tokens.spacingHorizontalM,
  },
  ul: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    '& li': {
      minHeight: '25px',
      minWidth: "max-content",
      padding: tokens.spacingHorizontalM,
      border: `1px solid ${tokens.colorNeutralStroke1}`,
    },
  },
});
