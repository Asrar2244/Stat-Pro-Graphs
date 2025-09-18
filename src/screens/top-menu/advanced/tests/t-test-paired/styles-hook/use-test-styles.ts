import { makeStyles, tokens } from '@fluentui/react-components';

export const useCommonStyles = makeStyles({
  commonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalXL,
    '& .details': {
      height: '53vh',
    },
    '& .align-radio': {
      alignItems: 'center',
    },
    '& .test-table': {
      border: "none"
    },
    '& .fui-CardFooter': {
      display: "none"
    },
    '& .fui-TableBody': {
      height: "max-content"
    },
    '> div': {
      borderRadius: 0
    },
    '> div>div': {
      boxShadow: 'none'
    }
  },
  selectedData: {
    display: 'flex',
    flexDirection: 'column',
    width: "max-content",
    minWidth: "150px",
    minHeight: "100px",
    gap: "16px",
    ">div": {
      ">p:first-child": {
        minWidth: "150px"
      }
    }
  },
  optionsGroup: {
    display: 'flex',
    flexDirection: 'column',
    width: "max-content",
    // flex: 1,
  },
  options: {
    display: 'grid',
    paddingTop: tokens.spacingVerticalM,
  },
  postHocTestWrapper: { display: "flex", gap: "48px" },
  postHocTestAlphaInputWrapper: { display: "flex", alignContent: "center", alignItems: "center", gap: "8px" },
  input: { width: "90px" },
  pValInput: { display: "flex", gap: "8px" },
  valInput: { display: "flex", gap: "16px" },
  dataformatWrapper: { display: "flex", alignContent: "center", alignItems: "center", gap: "32px", minHeight: "100px" },
  checkboxWrapper: { display: "flex", alignContent: "center", alignItems: "center", gap: "8px" },
  dataSelectionWrapper: { display: "flex", alignContent: "flex-start", alignItems: "flex-start", gap: "32px", marginBottom: "32px" },
  dataWrapper: { display: "flex", flexDirection: "column", alignContent: "flex-start", alignItems: "flex-start", gap: "8px" },
  selectedColWrapper: { display: "flex", flexDirection: "column", alignContent: "flex-start", alignItems: "flex-start", gap: "16px" }
});