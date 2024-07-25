import {
    makeStyles,
    shorthands,
    tokens,
  } from '@fluentui/react-components';

  export const useClassCalender = makeStyles({
    calender: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: tokens.colorNeutralBackground1Pressed,
      alignItems: 'center',
      textTransform: 'uppercase',
      color: tokens.colorNeutralForeground1,
      '& .inner-calender': {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        ...shorthands.padding('2px'),
      },
    },
  });