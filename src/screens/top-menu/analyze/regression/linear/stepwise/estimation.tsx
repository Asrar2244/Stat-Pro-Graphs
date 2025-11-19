import { FC, memo } from 'react';
import { Divider, Input, Field, mergeClasses, RadioGroup, Radio } from '@fluentui/react-components';
import { Fieldset, ITranslate } from '@libs';
import { useShallow } from 'zustand/react/shallow';
import { useLinearLeastSquares } from './use-squares-hook';
import { useEstimateStyle } from '../forward-stepwise/styles-hook/use-estimate-style';

const EstimationComponent: FC<ITranslate> = ({ t }) => {
  const classes = useEstimateStyle();
  const { estimate, setEstimate } = useLinearLeastSquares(
    useShallow((state) => ({ estimate: state.estimate, setEstimate: state.setEstimate })),
  );
  const onChangeHandler = (e: any): void => {
    const { name, value, checked, type } = e.target;
    const estimateDetails: any = { [name]: value };
    if (type === 'checkbox') {
      estimateDetails[name] = checked;
    }
    setEstimate(estimateDetails);
  };
  
  const onDirectionChange = (_ev: any, data: any) => {
    setEstimate({ direction: data.value });
  };

  return (
    <div className={classes.estimateLayout}>
      <div className={classes.estimateWrapper}>
        <Fieldset>
          <Field label={t('confidence', { ns: 'regLinearLeastSquare' })}>
            <Input name="confidence" type="number" onChange={onChangeHandler} value={estimate.confidence} />
          </Field>
          <Field label={t('tolerance', { ns: 'regLinearLeastSquare' })}>
            <Input name="tolerance" value={estimate.tolerance} onChange={onChangeHandler} />
          </Field>
        </Fieldset>
      </div>
      <div className={mergeClasses(classes.estimateWrapper, classes.optionsWrapper)}>
        <Fieldset title={t('stepwiseOpt', { ns: 'regLinearLeastSquare' })}>
          <div className="separation">
            <Field label={t('direction', { ns: 'regLinearLeastSquare' })}>
              <RadioGroup value={estimate.direction} onChange={onDirectionChange}>
                <Radio value="forward" label={t('forward', { ns: 'regLinearLeastSquare' })} />
                <Radio value="backward" label={t('backward', { ns: 'regLinearLeastSquare' })} />
                <Radio value="both" label={t('both', { ns: 'regLinearLeastSquare' })} />
              </RadioGroup>
            </Field>
            <Divider vertical />
          </div>
          <Divider />
          <div className="separation">
            <Field className="sep-text" label={t('maxStep', { ns: 'regLinearLeastSquare' })}>
              <Input name="maxStep" value={estimate.maxStep} type="number" onChange={onChangeHandler} />
            </Field>
            <Field className="sep-text" label={t('force', { ns: 'regLinearLeastSquare' })}>
              <Input name="force" value={estimate.force} onChange={onChangeHandler} />
            </Field>
          </div>
          <Divider className="pad-divider" />
          <div className={classes.equalDivide}>
            <div style={{ minWidth: 100, fontWeight: 500, paddingTop: 8 }}>
              {t('probability', { ns: 'regLinearLeastSquare' })}
            </div>
            <Field label={t('enter', { ns: 'regLinearLeastSquare' })}>
              <Input name="propEnter" value={estimate.propEnter} onChange={onChangeHandler} />
            </Field>
            <Field label={t('remove', { ns: 'regLinearLeastSquare' })}>
              <Input name="propRemove" value={estimate.propRemove} onChange={onChangeHandler} />
            </Field>
          </div>
          <Divider className="pad-divider" />
          <div className={classes.equalDivide}>
            <div style={{ minWidth: 100, fontWeight: 500, paddingTop: 8 }}>
              {t('fStatistic', { ns: 'regLinearLeastSquare' })}
            </div>
            <Field label={t('enter', { ns: 'regLinearLeastSquare' })}>
              <Input name="fStatisticEnter" value={estimate.fStatisticEnter} onChange={onChangeHandler} />
            </Field>
            <Field label={t('remove', { ns: 'regLinearLeastSquare' })}>
              <Input name="fStatisticRemove" value={estimate.fStatisticRemove} onChange={onChangeHandler} />
            </Field>
          </div>
        </Fieldset>
      </div>
    </div>
  );
};

export const Estimation = memo(EstimationComponent);