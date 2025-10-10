import { FC, memo, ChangeEvent } from 'react';
import { Button, Input, Field, Checkbox } from '@fluentui/react-components';
import { Fieldset } from '@libs';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { useSampleSizeStore } from '../use-sample-size-store';
import { useSampleSizeStyles } from '../styles-hook/use-sample-size-styles';
import { SampleSizeTestType, IProportionForm, ISampleSizeResult } from '../types';

interface IProportionComponentProps {
  executeCalculation: (testType: SampleSizeTestType, formData: IProportionForm) => Promise<ISampleSizeResult>;
}

const ProportionComponentBase: FC<IProportionComponentProps> = ({ executeCalculation }) => {
  const { t } = useTranslation('sampleSize');
  const classes = useSampleSizeStyles();
  
  const { 
    proportionForm, 
    isLoading, 
    sampleSize, 
    error,
    setProportionForm, 
    setLoading, 
    setSampleSize, 
    setError 
  } = useSampleSizeStore(
    useShallow((state) => ({
      proportionForm: state.proportionForm,
      isLoading: state.isLoading,
      sampleSize: state.sampleSize,
      error: state.error,
      setProportionForm: state.setProportionForm,
      setLoading: state.setLoading,
      setSampleSize: state.setSampleSize,
      setError: state.setError,
    }))
  );

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, checked, type } = e.target;
    const formValue = type === 'checkbox' ? checked : (parseFloat(value) || 0);
    setProportionForm({ [name]: formValue });
  };

  const handleCalculate = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      const result = await executeCalculation('proportion-sample-size', proportionForm);
      setSampleSize(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Calculation failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      proportionForm.group1_proportion > 0 &&
      proportionForm.group1_proportion < 1 &&
      proportionForm.group2_proportion > 0 &&
      proportionForm.group2_proportion < 1 &&
      proportionForm.desired_power > 0 &&
      proportionForm.desired_power < 1 &&
      proportionForm.alpha > 0 &&
      proportionForm.alpha < 1
    );
  };

  return (
    <div className={classes.formSection}>
      <Fieldset title={t('proportionParameters', { ns: 'sampleSize' })}>
        {sampleSize && (
          <div className={classes.resultCard}>
            <div className={classes.resultLabel}>
              {t('calculatedSampleSize', { ns: 'sampleSize' })}
            </div>
            <div className={classes.resultValue}>
              {sampleSize.sample_size}
            </div>
            <div className={classes.resultSubtext}>
              {t('perGroup', { ns: 'sampleSize' })}
            </div>
          </div>
        )}

        {error && (
          <div className={classes.errorCard}>
            <div className={classes.errorLabel}>
              {t('error', { ns: 'common' })}
            </div>
            <div className={classes.errorValue}>
              {error}
            </div>
          </div>
        )}

        <div className={classes.inputRow}>
          <div className={classes.inputField}>
            <Field label={t('group1Proportion', { ns: 'sampleSize' })}>
              <Input
                name="group1_proportion"
                type="number"
                step="0.01"
                placeholder="0.5"
                value={String(proportionForm.group1_proportion)}
                onChange={onChangeHandler}
                className={classes.input}
              />
            </Field>
          </div>
          <div className={classes.inputField}>
            <Field label={t('group2Proportion', { ns: 'sampleSize' })}>
              <Input
                name="group2_proportion"
                type="number"
                step="0.01"
                placeholder="0.7"
                value={String(proportionForm.group2_proportion)}
                onChange={onChangeHandler}
                className={classes.input}
              />
            </Field>
          </div>
        </div>

        <div className={classes.inputRow}>
          <div className={classes.inputField}>
            <Field label={t('desiredPower', { ns: 'sampleSize' })}>
              <Input
                name="desired_power"
                type="number"
                step="0.01"
                placeholder="0.8"
                value={String(proportionForm.desired_power)}
                onChange={onChangeHandler}
                className={classes.input}
              />
            </Field>
          </div>
          <div className={classes.inputField}>
            <Field label={t('alpha', { ns: 'sampleSize' })}>
              <Input
                name="alpha"
                type="number"
                step="0.01"
                placeholder="0.05"
                value={String(proportionForm.alpha)}
                onChange={onChangeHandler}
                className={classes.input}
              />
            </Field>
          </div>
        </div>

        <div className={classes.checkboxContainer}>
          <Checkbox
            name="yates_correction"
            label={t('yatesCorrection', { ns: 'sampleSize' })}
            checked={proportionForm.yates_correction}
            onChange={onChangeHandler}
          />
        </div>

        <div className={classes.calculateButtonContainer}>
          <Button
            type="button"
            appearance="subtle"
            className={classes.calculateButton}
            onClick={handleCalculate}
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? t('calculating', { ns: 'sampleSize' }) : t('calculate', { ns: 'sampleSize' })}
          </Button>
        </div>
      </Fieldset>
    </div>
  );
};

export const ProportionComponent = memo(ProportionComponentBase); 