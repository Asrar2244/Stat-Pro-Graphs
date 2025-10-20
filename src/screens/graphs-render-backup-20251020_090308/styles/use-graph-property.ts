import { makeStyles } from '@fluentui/react-components';

export const useGraphPropertyLayout = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  accordion: {
    width: '100%',
  },
  content: {
    padding: '8px 0',
  },
  propertyField: {
    marginBottom: '12px',
  },
  propertyBody: {
    padding: '8px 0',
  },
  addTraces: {
    padding: '16px',
    border: '1px solid #e1e1e1',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
  },
  addTraceField: {
    marginBottom: '12px',
  },
  // Additional missing classes
  propsLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  projectSelector: {
    padding: '16px',
    borderBottom: '1px solid #e1e1e1',
  },
  propertySelector: {
    padding: '16px',
    borderBottom: '1px solid #e1e1e1',
  },
});
