import { Caption1, Avatar } from '@fluentui/react-components';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDoNotTouch } from 'react-icons/md';
import { useNoIdSelectedStyles } from './styles-hook/use-no-id-selected-msg';

const NoIdSelectedComp: FC = () => {
  const { t } = useTranslation('common');
  const classes = useNoIdSelectedStyles();
  return (
    <div className={classes.wrapper}>
      <Avatar icon={<MdDoNotTouch />} aria-label="noAccess" size={96} color="cranberry" />
      <Caption1 className={classes.message}>{t('pleaseSelectWorkspace')}</Caption1>
    </div>
  );
};

export const NoIdSelected = memo(NoIdSelectedComp);
