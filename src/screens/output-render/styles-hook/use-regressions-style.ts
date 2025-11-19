import { makeStyles, shorthands, tokens } from '@fluentui/react-components';

export const useRegressions = makeStyles({
  regressionsLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalL,
    '& table': {
      borderCollapse: 'collapse',
      '& th': {
        backgroundColor: tokens.colorBrandStroke1,
        color: tokens.colorNeutralStrokeOnBrand2,
        ...shorthands.padding(tokens.spacingHorizontalXS),
        ...shorthands.border('1px', 'solid'),
      },
      '& td': {
        ...shorthands.padding(tokens.spacingHorizontalXS),
        ...shorthands.border('1px', 'solid'),
      },
    },
    '& .fullscreen-enabled': {
      '& .fui-Card': {
        height: '100%',
      },
    },
  },
  errorContainer: {
    ...shorthands.padding('24px'),
    color: '#b71c1c',
    background: '#fff3e0',
    ...shorthands.borderRadius('8px'),
  },
  errorHeading: {
    margin: 0,
    marginBottom: tokens.spacingVerticalM,
  },
  errorParagraph: {
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  errorPre: {
    fontSize: '18px',
    color: '#263238',
    background: '#eceff1',
    ...shorthands.padding('16px'),
    ...shorthands.borderRadius('4px'),
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
  errorFooter: {
    marginTop: '16px',
    color: '#b71c1c',
    marginBottom: 0,
  },
});
