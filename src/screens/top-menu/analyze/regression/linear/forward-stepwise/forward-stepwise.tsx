import { FC } from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { Modal, NoIdSelected } from '@libs';
import { IModal, useActiveNode } from '@hooks';
import { Model } from './model';
import { useShallow } from 'zustand/react/shallow';
import { useColumnsRowsCount } from '../../../../../table-render/use-column-count';
import { useLinearLeastSquares } from './use-squares-hook';
import { usePrepareAnalysis } from './use-anayse-hook';
import { useTranslation } from 'react-i18next';
import { useStartProStore } from '@store/main-store';
import { Estimation } from './estimation';
import { useModelStyle } from './styles-hook/use-model-style';
// import { OUTPUT } from '@libs/constants/query-const';

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
const ForwardStepwiseComponent: FC<IModal> = ({ ...props }) => {
  const { t } = useTranslation('regLinearForwardStepwise');
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
    queueFor: t('title', { ns: 'regLinearForwardStepwise' }),
    queueType: 'regLinearForwardStepwise',
  });

  const onCloseModal = (): void => {
    setReset();
    props.closeModal();
  };

  const onOkModal = async (): Promise<void> => {
    if (!id && id !== '') {
      props.closeModal();
      return;
    }
    
    try {
      props.closeModal();
      setBlockUI({ value: true, msg: 'processRequest', hideOk: true });
      await executeAnalysis(id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start analysis. Please try again.';
      setBlockUI({ value: true, msg: errorMessage, hideOk: false });
    }
  };
  return (
    <Modal
      key={id}
      modalType="alert"
      {...props}
      cancelLabel={t('close', { ns: 'regLinearForwardStepwise' })}
      okLabel={t('ok', { ns: 'regLinearForwardStepwise' })}
      title={t('title', { ns: 'regLinearForwardStepwise' })}
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
          scrollbarWidth: 'thin', // Firefox
          scrollbarColor: '#e0e0e0 #fff', // Firefox
        }}
      >
        <style>{`
          .${classes.leastSqrWrapper}::-webkit-scrollbar {
            width: 8px;
            background: #fff;
          }
          .${classes.leastSqrWrapper}::-webkit-scrollbar-thumb {
            background: #e0e0e0;
            border-radius: 4px;
          }
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

// ModelWithConfidence removed
export const ForwardStepwise = ForwardStepwiseComponent; 
export { ForwardStepwiseComponent };
