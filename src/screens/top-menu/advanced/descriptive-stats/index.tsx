import { FC, memo } from 'react';
import { IModal, useActiveNode, useColumnsRowsCount } from '@hooks';
import { Modal } from '@libs';
import { useTranslation } from 'react-i18next';
import { useCommonStyles } from './styles-hook/use-descriptive-statistics-styles';
import { Main } from './main';
import { NoIdSelected } from '@libs/no-id-selected-msg';
import { useDescriptiveStatistics } from './use-descriptive-statistics';
import { useShallow } from 'zustand/react/shallow';
import { usePrepareAnalysis } from './use-prep-analysis';
import { useStartProStore } from '@store/main-store';

const CommonStatisticsComponent: FC<IModal> = ({ ...props }) => {
  const classes = useCommonStyles();
  const { t } = useTranslation(['descriptiveStatistics', 'common']);
  const { setBlockUI } = useStartProStore()

  const { id, config } = useActiveNode([props.open]);
  const { columns } = useColumnsRowsCount({
    ...config,
    noRowCount: true,
  });


  const { executeAnalysis } = usePrepareAnalysis({
    config,
    columns,
    queueFor: t('title', { ns: 'descriptiveStatistics' }),
    queueType: 'descriptiveStatistics',
  });
  const { setReset } = useDescriptiveStatistics(useShallow((state) => ({
    setReset: state.setReset
  })));
  const onCloseModal = (): void => {
    setReset();

    props.closeModal();
  };
  const onOkModal = async (): Promise<void> => {
    setBlockUI({ value: true, msg: "processRequest", hideOk: true })
    executeAnalysis(id as string)

    onCloseModal();
  };
  return (
    <Modal
      modalType="alert"
      {...props}
      cancelLabel={t('close')}
      okLabel={t('ok')}
      title={t('title')}
      size="medium"
      closeModal={onCloseModal}
      ok={{ onClick: onOkModal }}
      showCancel={!id || id === '' ? false : true}
    >
      <div className={classes.commonWrapper}>
        {!id || id === '' ? (
          <NoIdSelected />
        ) : (
          <div className="details">
            <Main />
          </div>
        )}
      </div>
    </Modal>
  );
};

export const DescriptiveStatistics = memo(CommonStatisticsComponent);
