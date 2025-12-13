import { makeStyles, tokens } from '@fluentui/react-components';

export const useGraphPropertiesClasses = makeStyles({
  drawerContainer: {
    position: 'relative',
    minWidth: '320px',
    maxWidth: '900px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderLeft: `1px solid ${tokens.colorNeutralStroke1}`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  drawerHeader: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    padding: tokens.spacingVerticalM,
  },
  graphPropertiesTitle: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    display: 'flex',
    alignItems: 'center',
  },
  drawerBody: {
    backgroundColor: tokens.colorNeutralBackground1,
    paddingTop: tokens.spacingVerticalM,
    paddingRight: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingVerticalM,
    overflowY: 'auto',
    flexGrow: 1,
    minHeight: 0,
  },
  propertiesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  accordionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground1,
  },
  propertyContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusSmall,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  // Additional missing classes
  propsLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  projectSelector: {
    padding: tokens.spacingVerticalM,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  propertySelector: {
    padding: tokens.spacingVerticalM,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
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
    gap: tokens.spacingVerticalS,
  },
  docIndex: {
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusSmall,
  },
  graphBodyLayout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    zIndex: 1,
  },
});
