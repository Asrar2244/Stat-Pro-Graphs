import { FC, memo, ChangeEvent } from 'react';
import { Button, Input, Field } from '@fluentui/react-components';
import { Fieldset } from '@libs';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { useSampleSizeStore } from '../use-sample-size-store';
import { useSampleSizeStyles } from '../styles-hook/use-sample-size-styles';
import { SampleSizeTestType, IAnovaForm, ISampleSizeResult } from '../types';

interface IAnovaComponentProps {
  executeCalculation: (testType: SampleSizeTestType, formData: IAnovaForm) => Promise<ISampleSizeResult>;
}

const AnovaComponentBase: FC<IAnovaComponentProps> = ({ executeCalculation }) => {
  const { t } = useTranslation('sampleSize');
  const classes = useSampleSizeStyles();
  
  const { 
    anovaForm, 
    isLoading, 
    sampleSize, 
    error,
    setAnovaForm, 
    setLoading, 
    setSampleSize, 
    setError 
  } = useSampleSizeStore(
    useShallow((state) => ({
      anovaForm: state.anovaForm,
      isLoading: state.isLoading,
      sampleSize: state.sampleSize,
      error: state.error,
      setAnovaForm: state.setAnovaForm,
      setLoading: state.setLoading,
      setSampleSize: state.setSampleSize,
      setError: state.setError,
    }))
  );

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;
    setAnovaForm({ [name]: numericValue });
  };

  const handleCalculate = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      const result = await executeCalculation('anova-sample-size', anovaForm);
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
      anovaForm.minimum_detectable_difference > 0 &&
      anovaForm.expected_std_dev_residuals > 0 &&
      anovaForm.num_groups > 1 &&
      anovaForm.desired_power > 0 &&
      anovaForm.desired_power < 1 &&
      anovaForm.alpha > 0 &&
      anovaForm.alpha < 1
    );
  };

  return (
    <div className={classes.formSection}>
      <Fieldset title={t('anovaParameters', { ns: 'sampleSize' })}>
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
            <Field label={t('minimumDetectableDifference', { ns: 'sampleSize' })}>
              <Input
                name="minimum_detectable_difference"
                type="number"
                placeholder="5"
                value={String(anovaForm.minimum_detectable_difference)}
                onChange={onChangeHandler}
                className={classes.input}
              />
            </Field>
          </div>
          <div className={classes.inputField}>
            <Field label={t('expectedStdDevResiduals', { ns: 'sampleSize' })}>
              <Input
                name="expected_std_dev_residuals"
                type="number"
                placeholder="8"
                value={String(anovaForm.expected_std_dev_residuals)}
                onChange={onChangeHandler}
                className={classes.input}
              />
            </Field>
          </div>
        </div>

        <div className={classes.inputRow}>
          <div className={classes.inputField}>
            <Field label={t('numberOfGroups', { ns: 'sampleSize' })}>
              <Input
                name="num_groups"
                type="number"
                placeholder="3"
                value={String(anovaForm.num_groups)}
                onChange={onChangeHandler}
                className={classes.input}
              />
            </Field>
          </div>
          <div className={classes.inputField}>
            <Field label={t('desiredPower', { ns: 'sampleSize' })}>
              <Input
                name="desired_power"
                type="number"
                step="0.01"
                placeholder="0.8"
                value={String(anovaForm.desired_power)}
                onChange={onChangeHandler}
                className={classes.input}
              />
            </Field>
          </div>
        </div>

        <div className={classes.inputRow}>
          <div className={classes.inputField}>
            <Field label={t('alpha', { ns: 'sampleSize' })}>
              <Input
                name="alpha"
                type="number"
                step="0.01"
                placeholder="0.05"
                value={String(anovaForm.alpha)}
                onChange={onChangeHandler}
                className={classes.input}
              />
            </Field>
          </div>
          <div className={classes.inputField}>
            {/* Empty for grid alignment */}
          </div>
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

export const AnovaComponent = memo(AnovaComponentBase); 