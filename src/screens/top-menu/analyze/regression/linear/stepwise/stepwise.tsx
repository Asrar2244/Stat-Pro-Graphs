import { FC } from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { Modal, NoIdSelected } from '@libs';
import { IModal, useActiveNode } from '@hooks';
import { Model } from '../forward-stepwise/model';
import { useShallow } from 'zustand/react/shallow';
import { useColumnsRowsCount } from '../../../../../table-render/use-column-count';
import { useLinearLeastSquares } from './use-squares-hook';
import { usePrepareAnalysis } from './use-anayse-hook';
import { useTranslation } from 'react-i18next';
import { useStartProStore } from '@store/main-store';
import { Estimation } from './estimation';
import { useModelStyle } from '../forward-stepwise/styles-hook/use-model-style';

const useClasses = makeStyles({
  leastSqrWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingHorizontalM,
    '& .details': {
      height: '53vh',
    },
  },
});

const StepwiseComponent: FC<IModal> = ({ ...props }) => {
  const { t } = useTranslation('regLinearStepwise');
  const classes = useClasses();
  const modelClasses = useModelStyle();
  const { setReset } = useLinearLeastSquares(
    useShallow((state) => ({
      setReset: state.setReset,
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
    queueFor: t('title', { ns: 'regLinearStepwise' }),
    queueType: 'regLinearStepwise',
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
      key={id}
      modalType="alert"
      {...props}
      cancelLabel={t('close', { ns: 'regLinearStepwise' })}
      okLabel={t('ok', { ns: 'regLinearStepwise' })}
      title={t('title', { ns: 'regLinearStepwise' })}
      size="medium"
      showCancel={!id || id === '' ? false : true}
      closeModal={onCloseModal}
      ok={{ onClick: onOkModal }}
    >
      <div
        className={classes.leastSqrWrapper}
        style={{
          overflowY: 'auto',
          maxHeight: '60vh',
          scrollbarWidth: 'thin',
          scrollbarColor: '#e0e0e0 #fff',
        }}
      >
        <style>{`
          .${classes.leastSqrWrapper}::-webkit-scrollbar { width: 8px; background: #fff; }
          .${classes.leastSqrWrapper}::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 4px; }
        `}</style>
        {!id || id === '' ? (
          <NoIdSelected />
        ) : (
          <div>
            <div className={modelClasses.modelLayout}>
              <div className={modelClasses.modelWrapper}>
                <Model />
              </div>
            </div>
            <div style={{ marginTop: 32 }}>
              <Estimation t={t} />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export { StepwiseComponent };