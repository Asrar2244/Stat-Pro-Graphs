import { FC, memo } from 'react';
import { Divider, Input, Field, mergeClasses, Dropdown, Option } from '@fluentui/react-components';
import { Fieldset, ITranslate } from '@libs';
import { useShallow } from 'zustand/react/shallow';
import { useBestSubset } from './use-best-subset-hook';
import { useEstimateStyle } from '../forward-stepwise/styles-hook/use-estimate-style';

const EstimationComponent: FC<ITranslate> = ({ t }) => {
  const classes = useEstimateStyle();
  const { estimate, setEstimate } = useBestSubset(
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
  
  const onMetricChange = (ev: any, data: any) => {
    setEstimate({ metric: data.optionValue });
  };

  return (
    <div className={classes.estimateLayout}>
      <div className={classes.estimateWrapper}>
        <Fieldset>
          <Field label={t('confidence', { ns: 'regLinearLeastSquare' })}>
            <Input name="confidence" type="number" onChange={onChangeHandler} value={estimate.confidence} />
          </Field>
          <Field label={t('maxFeatures', { ns: 'regLinearBestSubset' })}>
            <Input name="maxFeatures" type="number" onChange={onChangeHandler} value={estimate.maxFeatures} />
          </Field>
          <Field label={t('vifThreshold', { ns: 'regLinearBestSubset' })}>
            <Input name="vifThreshold" type="number" onChange={onChangeHandler} value={estimate.vifThreshold} />
          </Field>
        </Fieldset>
      </div>
      <div className={mergeClasses(classes.estimateWrapper, classes.optionsWrapper)}>
        <Fieldset title={t('bestSubsetOpt', { ns: 'regLinearBestSubset' })}>
          <div className="separation">
            <Field label={t('metric', { ns: 'regLinearBestSubset' })}>
              <Dropdown 
                value={estimate.metric}
                selectedOptions={[estimate.metric]}
                onOptionSelect={onMetricChange}
              >
                <Option value="aic">{t('aic', { ns: 'regLinearBestSubset' })}</Option>
                <Option value="bic">{t('bic', { ns: 'regLinearBestSubset' })}</Option>
                <Option value="adj_r2">{t('adjR2', { ns: 'regLinearBestSubset' })}</Option>
              </Dropdown>
            </Field>
            <Divider vertical />
          </div>
          <Divider />
          <div className="separation">
            <Field className="sep-text" label={t('forceFeatures', { ns: 'regLinearBestSubset' })}>
              <Input 
                name="forceFeatures" 
                value={estimate.forceFeatures} 
                onChange={onChangeHandler}
                placeholder={t('forceFeaturesPlaceholder', { ns: 'regLinearBestSubset' })}
              />
            </Field>
          </div>
        </Fieldset>
      </div>
    </div>
  );
};

export const Estimation = memo(EstimationComponent);