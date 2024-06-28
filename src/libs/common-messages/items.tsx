import { PresenceBadge, Caption2, makeStyles, tokens } from '@fluentui/react-components';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
interface IItem {
  id: string;
  status: 'available' | 'away' | 'offline' | 'blocked' | 'do-not-disturb';
  description?: string;
  startDt?: string;
  endDt?: string;
}
const useStyles = makeStyles({
  caption: {
    fontSize: '8px',
    textTransform: 'uppercase',
    color: tokens.colorNeutralStroke1Hover,
  },
});
export const ContentItem: FC<IItem> = ({ id, status, description }) => {
  const [showDelete, setDelete] = useState<boolean>(false);
  const { t } = useTranslation('success', { useSuspense: true });
  const classes = useStyles();
  const onMouseHoverChange = (): void => {
    setDelete(true);
  };
  const onMouseLeaveChange = (): void => {
    setDelete(false);
  };
  return (
    <div key={id}>
      <PresenceBadge
        status={showDelete ? 'do-not-disturb' : status}
        size="large"
        onMouseOver={onMouseHoverChange}
        onMouseLeave={onMouseLeaveChange}
      />
      <div className="internal">
        <label>{description}</label>
        <div className="status-detail">
          <Caption2 className={classes.caption}>{t('completed')}</Caption2>
        </div>
      </div>
    </div>
  );
};
