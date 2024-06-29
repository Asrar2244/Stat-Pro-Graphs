import { FC } from 'react';
import {
  tokens,
  makeStyles,
  shorthands,
  Badge,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Caption1Stronger,
} from '@fluentui/react-components';
import { useTasks } from '../../store/common-msg-store';
import { useShallow } from 'zustand/react/shallow';
import { ContentItem } from './items';
import { IoNotificationsSharp } from 'react-icons/io5';

import { useTranslation } from 'react-i18next';
const useCommonLayout = makeStyles({
  popoverWrapper: {
    listStyleType: 'none',
    ...shorthands.padding(0),
    ...shorthands.margin(0),
    minWidth: '280px',
    maxHeight: '320px',
    '& li': {
      ...shorthands.padding(tokens.spacingVerticalSNudge),
      ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralBackground3Hover),
      '& div': {
        display: 'inline-flex',
        width: '100%',
        justifyContent: 'start',
        gap: tokens.spacingHorizontalS,
        '& div[role="img"]:first-child': {
          width: '8%',
        },
        '& .internal': {
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
          ...shorthands.padding(0),
          ...shorthands.margin(0),
          '& .status-detail': {
            display: 'flex',
            flexDirection: 'row-reverse',
            justifyContent: 'end',
            height: '14px',
            ...shorthands.margin('-4px'),
            fontSize: tokens.fontSizeBase100,
          },
        },
        '& label': {
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 1,
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
  title: {
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
  },
  noTasks: {
    color: tokens.colorNeutralForegroundDisabled,
  },
  caption: {
    fontSize: '10px',
    textTransform: 'uppercase',
  },
});
export const StatusList: FC = () => {
  const classes = useCommonLayout();
  const { tasks } = useTasks(useShallow((state) => ({ tasks: state.tasks })));
  const { t } = useTranslation('common');
  return (
    <Popover withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <Badge
          // appearance={window.electron.process.platform !== 'darwin' ? 'ghost' : 'tint'}
          color="informative"
          icon={<IoNotificationsSharp />}
        />
      </PopoverTrigger>
      <PopoverSurface tabIndex={-1}>
        <div className={classes.title}>
          <Caption1Stronger>{t('tasks')}</Caption1Stronger>
        </div>
        <ul className={classes.popoverWrapper}>
          {(tasks === undefined || tasks?.length === 0) && (
            <li className={classes.noTasks}>
              <label className={classes.caption}> {t('noTaskRunning')}</label>
            </li>
          )}
          {tasks?.map((task, index) => (
            <li key={index}>
              <ContentItem
                id={index.toString()}
                status={task.status}
                description={task.description}
              />
            </li>
          ))}
        </ul>
      </PopoverSurface>
    </Popover>
  );
};
