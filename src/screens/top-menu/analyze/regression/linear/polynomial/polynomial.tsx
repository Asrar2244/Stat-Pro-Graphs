import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, NoIdSelected } from '@libs';
import { IModal, useActiveNode } from '@hooks';
import { Model } from './model';
import { Estimation } from './estimation';
import { usePolynomial } from './use-polynomial-hook';
import { usePrepareAnalysis } from './use-anayse-hook';
import { useColumnsRowsCount } from '../../../../../table-render/use-column-count';
import { useShallow } from 'zustand/react/shallow';
import { useStartProStore } from '@store/main-store';

export const PolynomialComponent: FC<IModal> = (props) => {
  const { t } = useTranslation('regLinearPolynomial');
  const { setReset } = usePolynomial(
    useShallow((state) => ({
      setReset: state.reset,
    })),
  );
  
  const { id, config } = useActiveNode([props.open]);
  const { columns } = useColumnsRowsCount({
    ...config,
    noRowCount: true,
  });
  const { setBlockUI } = useStartProStore();

  const { executeAnalysis } = usePrepareAnalysis({
    config,
    columns,
    queueFor: 'Polynomial Regression',
    queueType: 'regLinearPolynomial',
  });

  const onCloseModal = (): void => {
    setReset();
    props.closeModal();
  };

  const onOkModal = (): void => {
    if (!id && id !== '') {
      props.closeModal();
      return;
    }
    executeAnalysis(id);
    props.closeModal();
    setBlockUI({ value: true, msg: 'processRequest', hideOk: true });
  };

  return (
    <Modal
      modalType="alert"
      {...props}
      cancelLabel={t('close', { ns: 'regLinearPolynomial' })}
      okLabel={t('ok', { ns: 'regLinearPolynomial' })}
      title="Polynomial Regression Analysis"
      size="medium"
      showCancel={true}
      closeModal={onCloseModal}
      ok={{ onClick: onOkModal }}
    >
      <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
        {!id || id === '' ? (
          <NoIdSelected />
        ) : (
          <div>
            <div>
              <Model />
            </div>
            <div style={{ marginTop: 32 }}>
              <Estimation />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
