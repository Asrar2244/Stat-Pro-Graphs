import { makeStyles, tokens } from '@fluentui/react-components';

export const useSizePopoverStyles = makeStyles({
  popoverSurface: {
    padding: '8px 12px',
    minWidth: '180px',
    maxWidth: '220px',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '12px',
  },
  title: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: '12px',
    marginBottom: '2px',
    paddingBottom: '6px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorNeutralForeground1,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  label: {
    color: tokens.colorNeutralForeground2,
    fontSize: '11px',
  },
  valueContainer: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  value: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    fontSize: '12px',
  },
  subValue: {
    fontSize: '10px',
    color: tokens.colorNeutralForeground3,
  },
  totalRow: {
    marginTop: '4px',
    paddingTop: '6px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  trigger: {
    cursor: 'help',
    borderBottom: `1px dotted ${tokens.colorNeutralStroke1}`,
    ':hover': {
      borderBottomColor: tokens.colorBrandForeground1,
    },
  },
});

