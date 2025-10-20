import { makeStyles } from '@fluentui/react-components';

export const useGraphTabLayout = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  tabList: {
    display: 'flex',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    borderBottom: '1px solid #e1e1e1',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  tabItem: {
    flexShrink: 0,
    padding: '8px 16px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'border-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
    '&.active': {
      borderBottomColor: '#0078d4',
      backgroundColor: '#f0f8ff',
    },
  },
  tabContent: {
    flex: 1,
    padding: '16px',
  },
  // Additional missing classes
  historyTab: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  ul: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  docIndex: {
    padding: '8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
});
