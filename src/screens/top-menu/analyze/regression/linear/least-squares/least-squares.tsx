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
import { Field, Input, Checkbox } from '@fluentui/react-components';
import { Fieldset } from '@libs';
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
const LeastSquareComponent: FC<IModal> = ({ ...props }) => {
  const { t } = useTranslation('regLinearLeastSquare');
  const classes = useClasses();
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
    queueFor: t('title', { ns: 'regLinearLeastSquare' }),
    queueType: 'regLinearLeastSquare',
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
      cancelLabel={t('close', { ns: 'regLinearLeastSquare' })}
      okLabel={t('ok', { ns: 'regLinearLeastSquare' })}
      title={t('title', { ns: 'regLinearLeastSquare' })}
      size="medium"
      showCancel={!id || id === '' ? false : true}
      closeModal={onCloseModal}
      ok={{ onClick: onOkModal }}
    >
      <div className={classes.leastSqrWrapper}>
        {!id || id === '' ? (
          <NoIdSelected />
        ) : (
          <div>
            <ModelWithConfidence />
          </div>
        )}
      </div>
    </Modal>
  );
};

const ModelWithConfidence: FC = () => {
  const classes = useModelStyle();
  const { t } = useTranslation('regLinearLeastSquare');
  const { includeConst, setModel } = useLinearLeastSquares(
    useShallow((state) => ({
      includeConst: state.model.includeConst,
      setModel: state.setModel,
    }))
  );
  const { confidence, setEstimate } = useLinearLeastSquares(
    useShallow((state) => ({
      confidence: state.estimate.confidence,
      setEstimate: state.setEstimate,
    }))
  );
  return (
    <div className={classes.modelLayout}>
      <div className={classes.modelWrapper}>
        <Model />
      </div>
      <Fieldset>
        <Checkbox
          name="includeConst"
          label={t('includeConst', { ns: 'regLinearLeastSquare' })}
          checked={includeConst}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModel({ [e.target.name]: e.target.checked })}
        />
        <Field label={t('confidence', { ns: 'regLinearLeastSquare' })}>
          <Input
            id="confidence-input"
            name="confidence"
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={confidence}
            onChange={e => setEstimate({ confidence: e.target.value })}
            style={{ width: '100%' }}
            aria-label={t('confidence', { ns: 'regLinearLeastSquare' })}
          />
        </Field>
      </Fieldset>
    </div>
  );
};
export const LeastSquare = LeastSquareComponent;
