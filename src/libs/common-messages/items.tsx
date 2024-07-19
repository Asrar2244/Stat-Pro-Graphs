import { PresenceBadge, Caption2, Tooltip, Button } from '@fluentui/react-components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommonLayout } from './styles-hook/use-common-style';
import { NOTIFICATION_ICON_STATUS } from '@constants';
import { useFormatter } from '@hooks';
import { PiBrowsersFill, PiTrashFill } from 'react-icons/pi';

export type IStatus = 'available' | 'away' | 'offline' | 'blocked' | 'do-not-disturb';
interface IItem {
  id: string;
  status: 'PROCESSING' | 'COMPLETED' | 'ERROR';
  description?: string;
  createdDateTime?: string;
}

export const ContentItem: FC<IItem> = ({ id, status, description, createdDateTime }) => {
  const { t } = useTranslation('success', { useSuspense: true });
  const classes = useCommonLayout();
  const { dateTimeFormat } = useFormatter();
  const stat: IStatus = NOTIFICATION_ICON_STATUS[status] as IStatus;
  return (
    <div key={id} className={classes.statusList}>
      <div>
        <PresenceBadge
          status={stat}
          outOfOffice={stat !== NOTIFICATION_ICON_STATUS.PROCESSING}
          size="large"
        />
        <Caption2 className={classes.caption}>{t('completed')}</Caption2>
      </div>
      <div className={classes.badge}>
        <Tooltip
          relationship="label"
          positioning="before-top"
          withArrow
          content={description as string}
        >
          <label className="label">{description}</label>
        </Tooltip>
        <div>
          <small>{dateTimeFormat(createdDateTime as string)}</small>

          <ul>
            <li>
              <Button size="small" appearance="transparent" icon={<PiBrowsersFill />} />
            </li>
            <li>
              <Button size="small" appearance="transparent" icon={<PiTrashFill />} />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
