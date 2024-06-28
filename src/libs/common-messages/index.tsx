import { tokens, Spinner, makeStyles, shorthands } from '@fluentui/react-components';
import { FC } from 'react';
import { useTasks } from '@store';
import { useShallow } from 'zustand/react/shallow';
import { useExecuteTask } from '@hooks';
const useCommonLayout = makeStyles({
  loaderBox: {
    width: '80%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'end',
    '& label': {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: tokens.fontSizeBase100,
      overflow: 'hidden',
    },
  },
  popoverWrapper: {
    listStyleType: 'none',
    ...shorthands.padding(0),
    ...shorthands.margin(0),
    minWidth: '180px',
    maxHeight: '320px',
    '& li': {
      cursor: 'pointer',
      ...shorthands.padding(tokens.spacingVerticalSNudge),
      ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralForegroundDisabled),
      '& div': {
        cursor: 'pointer',
        display: 'inline-flex',
        gap: tokens.spacingHorizontalS,
        '& label': {
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          cursor: 'pointer',
          maxWidth: '150px',
        },
        '& label::after': {
          content: '...',
          display: 'inline-block',
        },
      },
    },
  },
});

export const CommonMessages: FC = () => {
  const classes = useCommonLayout();
  useExecuteTask();
  const { common } = useTasks(useShallow((state) => ({ common: state.commonMsg })));
  return (
    <div className={classes.loaderBox}>
      {common?.spinner && <Spinner size="extra-tiny" />}
      &nbsp; <label>{common?.message}</label>
    </div>
  );
};
