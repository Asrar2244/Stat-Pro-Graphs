import { makeStyles, tokens, shorthands } from '@fluentui/react-components';

export const useIndexStyles = makeStyles({
  tTestWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalM,
    width: '65em',
    maxHeight: '60vh',
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: `${tokens.colorNeutralStroke1} transparent`,
    '&::-webkit-scrollbar': {
      width: '8px',
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: '8px',
      backgroundColor: tokens.colorNeutralStroke1,
      backgroundClip: 'padding-box',
      border: '2px solid transparent',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: tokens.colorNeutralStroke2,
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '& fieldset': {
      backgroundColor: tokens.colorNeutralBackground1,
      ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
      ...shorthands.borderRadius(tokens.borderRadiusMedium),
      ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
      boxShadow: `0 1px 2px ${tokens.colorNeutralStroke1}20`,
    },
    '& .details': {
      maxHeight: '42vh',
      overflowY: 'auto',
      backgroundColor: tokens.colorNeutralBackground1,
      ...shorthands.borderRadius(tokens.borderRadiusSmall),
      ...shorthands.padding(tokens.spacingVerticalM),
      marginTop: tokens.spacingVerticalS,
      scrollbarWidth: 'thin',
      scrollbarColor: `${tokens.colorNeutralStroke1} transparent`,
      '&::-webkit-scrollbar': {
        width: '8px',
        backgroundColor: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: '8px',
        backgroundColor: tokens.colorNeutralStroke1,
        backgroundClip: 'padding-box',
        border: '2px solid transparent',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: tokens.colorNeutralStroke2,
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
      },
    },
  },
});

