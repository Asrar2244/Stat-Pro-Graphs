import { FC } from 'react';
import {
  Badge,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Caption1Stronger,
} from '@fluentui/react-components';
import { useTasks } from '../../store/common-msg-store';
import { useShallow } from 'zustand/react/shallow';
import { ContentItem } from '../common-messages/items';
import { VscBell, VscBellDot } from 'react-icons/vsc';
import { useTranslation } from 'react-i18next';
import { useCommonLayout } from './styles-hook/use-status-list-style';
export const StatusList: FC = () => {
  const classes = useCommonLayout();
  const { tasks } = useTasks(useShallow((state) => ({ tasks: state.tasks })));
  const { t } = useTranslation('common');
  return (
    <Popover withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <Badge appearance="ghost" icon={tasks && tasks.length > 0 ? <VscBellDot /> : <VscBell />} />
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
