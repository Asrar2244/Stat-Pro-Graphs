import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useLineScatterPlotStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    ...shorthands.padding(0), // Changed from tokens.spacingVerticalM to match line plot
  },
  header: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorBrandBackgroundInverted,
    borderRadius: tokens.borderRadiusMedium,
    ...shorthands.padding(tokens.spacingVerticalM),
    marginBottom: tokens.spacingVerticalXS,
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalXS,
    '& *': { color: tokens.colorBrandBackgroundInverted },
  },
  headerSubtitle: {
    color: tokens.colorBrandBackgroundInverted,
    opacity: 0.9,
  },
  sectionCard: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow2,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2), // Added border like line plot
    ...shorthands.padding(tokens.spacingVerticalS),
  },
  dropdown: {
    minHeight: '40px',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  simpleCard: {
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow2,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.padding(tokens.spacingVerticalM),
  },
  variableContainer: {
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow2,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.padding(tokens.spacingVerticalM),
  },
  variableHeader: {
    marginBottom: tokens.spacingVerticalM,
  },
  variableHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalXS,
  },
  variableHeaderTitle: {
    color: tokens.colorNeutralForeground1,
  },
  variableHeaderSubtitle: {
    color: tokens.colorNeutralForeground2,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusSmall,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    ...shorthands.padding(tokens.spacingVerticalS),
  },
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalXS,
  },
  columnHeaderTitle: {
    color: tokens.colorNeutralForeground1,
  },
  columnHeaderBadge: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorBrandBackgroundInverted,
    borderRadius: tokens.borderRadiusCircular,
    ...shorthands.padding('2px', '8px'),
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    marginTop: tokens.spacingVerticalM,
  },
  actionBtn: {
    width: '100%',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    color: tokens.colorNeutralForeground1,
  },
  actionButton: {
    width: '100%',
  },
});