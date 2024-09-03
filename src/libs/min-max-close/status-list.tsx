import { FC } from 'react';
import {
  Badge,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Caption1Stronger,
  Button,
} from '@fluentui/react-components';
import { ContentItem } from '../common-messages/items';
import { VscBell, VscBellDot } from 'react-icons/vsc';
import { useTranslation } from 'react-i18next';
import { useCommonLayout } from './styles-hook/use-status-list-style';
import { useFetchNotifications } from './notification-hook/use-fetch-notification';

export const StatusList: FC = () => {
  const classes = useCommonLayout();
  const notifications = useFetchNotifications();
  const { t } = useTranslation('common');
  return (
    <Popover withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <Badge appearance="ghost" icon={notifications.length > 0 ? <VscBellDot /> : <VscBell />} />
      </PopoverTrigger>
      <PopoverSurface className={classes.popoverStyle} tabIndex={-1}>
        <div className={classes.title}>
          <Caption1Stronger>{t('tasks')}</Caption1Stronger>
          <Button appearance="transparent" size="small">
            {t('showAll')}
          </Button>
        </div>

        <ul data-show-scroll className={classes.popoverWrapper}>
          {notifications.length === 0 && (
            <li className={classes.noTasks}>
              <label className={classes.caption}> {t('noTaskRunning')}</label>
            </li>
          )}
          {notifications.map((notification) => (
            <li key={notification.id}>
              <ContentItem
                id={notification.id.toString()}
                status={notification.status as any}
                description={notification.message}
                createdDateTime={notification.createdDateTime}
              />
            </li>
          ))}
        </ul>
      </PopoverSurface>
    </Popover>
  );
};
