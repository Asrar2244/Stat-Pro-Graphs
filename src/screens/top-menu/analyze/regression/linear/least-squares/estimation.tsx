import { FC, memo } from 'react';
import {
  Checkbox,
  Divider,
  Input,
  RadioGroup,
  Radio,
  Field,
  mergeClasses,
} from '@fluentui/react-components';
import { Fieldset, ITranslate } from '@libs';
import { useShallow } from 'zustand/react/shallow';
import { useLinearLeastSquares } from './use-squares-hook';
import { useEstimateStyle } from './styles-hook/use-estimate-style';

const EstimationComponent: FC<ITranslate> = ({ t }) => {
  const classes = useEstimateStyle();
  const { estimate, setEstimate } = useLinearLeastSquares(
    useShallow((state) => ({ estimate: state.estimate, setEstimate: state.setEstimate })),
  );
  const onChangeHandler = (e: any): void => {
    const { name, value, checked, type } = e.target;
    const estimateDetails = { [name]: value };
    if (type === 'checkbox') {
      estimateDetails[name] = checked;
    }
    setEstimate(estimateDetails);
  };
  return (
    <div className={classes.estimateLayout}>
      <div className={classes.estimateWrapper}>
        <Fieldset>
          <Field label={t('confidence', { ns: 'regLinearLeastSquare' })}>
            <Input
              name="confidence"
              type="number"
              onChange={onChangeHandler}
              defaultValue={estimate.confidence}
            />
          </Field>
          <Field label={t('tolerance', { ns: 'regLinearLeastSquare' })}>
            <Input name="tolerance" defaultValue={estimate.tolerance} onChange={onChangeHandler} />
          </Field>
          <Divider className="pad-divider" />
          <Field label={t('estimation', { ns: 'regLinearLeastSquare' })}>
            <RadioGroup
              layout="vertical"
              name="estimation"
              onChange={onChangeHandler}
              defaultValue={estimate.estimation}
            >
              <Radio value="complete" label={t('complete', { ns: 'regLinearLeastSquare' })} />
              <Radio value="stepwise" label={t('stepwise', { ns: 'regLinearLeastSquare' })} />
            </RadioGroup>
          </Field>
          <Divider className="pad-divider" />
          <Checkbox
            defaultChecked={estimate.mixModel}
            name="mixModel"
            onChange={onChangeHandler}
            label={t('mixModel', { ns: 'regLinearLeastSquare' })}
          />
        </Fieldset>
      </div>
      <div className={mergeClasses(classes.estimateWrapper, classes.optionsWrapper)}>
        <Fieldset
          title={t('stepwiseOpt', { ns: 'regLinearLeastSquare' })}
          disabled={estimate.estimation === 'complete'}
        >
          <div className="separation">
            <Field label={t('direction', { ns: 'regLinearLeastSquare' })}>
              <RadioGroup name="direction" defaultValue={estimate.direction} layout="horizontal">
                <Radio value="backward" label={t('backward', { ns: 'regLinearLeastSquare' })} />
                <Radio value="forward" label={t('forward', { ns: 'regLinearLeastSquare' })} />
              </RadioGroup>
            </Field>
            <Divider vertical />
            <Field label={t('control', { ns: 'regLinearLeastSquare' })}>
              <RadioGroup layout="horizontal" name="control" defaultValue={estimate.control}>
                <Radio value="automatic" label={t('automatic', { ns: 'regLinearLeastSquare' })} />
                <Radio
                  value="interactive"
                  label={t('interactive', { ns: 'regLinearLeastSquare' })}
                />
              </RadioGroup>
            </Field>
          </div>
          <Divider />
          <div className="separation">
            <Field className="sep-text" label={t('maxStep', { ns: 'regLinearLeastSquare' })}>
              <Input name="maxStep" defaultValue={estimate.maxStep} type="number" />
            </Field>

            <Field className="sep-text" label={t('force', { ns: 'regLinearLeastSquare' })}>
              <Input name="force" defaultValue={estimate.force} />
            </Field>
          </div>
          <Divider className="pad-divider" />
          <div className={classes.equalDivide}>
            <Field label={''}>
              <Radio
                className="align-radio"
                value="probability"
                defaultChecked={estimate.probability}
                label={t('probability', { ns: 'regLinearLeastSquare' })}
              />
            </Field>
            <Field label={t('enter', { ns: 'regLinearLeastSquare' })}>
              <Input name="propEnter" defaultValue={estimate.propEnter} />
            </Field>
            <Field label={t('remove', { ns: 'regLinearLeastSquare' })}>
              <Input name="propRemove" defaultValue={estimate.propRemove} />
            </Field>
          </div>
          <Divider className="pad-divider" />
          <div className={classes.equalDivide}>
            <Field label={''}>
              <Radio
                className="align-radio"
                value="fStatistic"
                defaultChecked={estimate.fStatistic}
                label={t('fStatistic', { ns: 'regLinearLeastSquare' })}
              />
            </Field>
            <Field label={t('enter', { ns: 'regLinearLeastSquare' })}>
              <Input name="fStatisticEnter" defaultValue={estimate.fStatisticEnter} />
            </Field>
            <Field label={t('remove', { ns: 'regLinearLeastSquare' })}>
              <Input name="fStatisticRemove" defaultValue={estimate.fStatisticRemove} />
            </Field>
          </div>
        </Fieldset>
      </div>
    </div>
  );
};

export const Estimation = memo(EstimationComponent);
