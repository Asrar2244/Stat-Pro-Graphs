import { FC, memo } from 'react';
import { Modal, NoIdSelected } from '@libs';
import { useActiveNode, IModal } from '@hooks';
import { useTranslation } from 'react-i18next';
import { useModalRidge } from './styles-hook/use-modal-hook';
import { Ridge } from './ridge';
import { useRidgeAnalyzeData } from './use-ridge-analyze-data';
import { useStartProStore } from '@store/main-store';

const RidgeModuleComponent: FC<IModal> = ({ ...props }) => {
  const { t } = useTranslation('regLinearRidge');
  const classes = useModalRidge();
  const { setBlockUI } = useStartProStore();
  const { id, config } = useActiveNode([props.open]);
  const { ridgeAnalyzeData } = useRidgeAnalyzeData();
  const onCloseModal = (): void => {
    props.closeModal();
  };

  const onOkModal = (): void => {
    if (!id && id !== '') { props.closeModal(); return; }
    ridgeAnalyzeData(config.tabName, t('title'), 'regLinearRidge', id);
    props.closeModal();
    setBlockUI({ value: true, msg: "processRequest" });;
  };
  return (
    <Modal
      modalType="alert"
      {...props}
      cancelLabel={t('close')}
      okLabel={t('ok')}
      title={t('title')}
      size="medium"
      showCancel={!id || id === '' ? false : true}
      closeModal={onCloseModal}
      ok={{ onClick: onOkModal }}
    >
      <div className={classes.bodyWrapper}>
        {!id || id === '' ? (
          <NoIdSelected />
        ) : <Ridge />}
      </div>
    </Modal>
  );
};

export const RidgeModule = memo(RidgeModuleComponent);
