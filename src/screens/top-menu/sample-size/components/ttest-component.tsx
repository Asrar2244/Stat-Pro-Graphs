import { FC, memo, ChangeEvent } from 'react';
import { Button, Input, Field } from '@fluentui/react-components';
import { Fieldset } from '@libs';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { useSampleSizeStore } from '../use-sample-size-store';
import { useSampleSizeStyles } from '../styles-hook/use-sample-size-styles';
import { SampleSizeTestType, ITTestForm, ISampleSizeResult } from '../types';

interface ITTestComponentProps {
  executeCalculation: (testType: SampleSizeTestType, formData: ITTestForm) => Promise<ISampleSizeResult>;
}

const TTestComponentBase: FC<ITTestComponentProps> = ({ executeCalculation }) => {
  const { t } = useTranslation('sampleSize');
  const classes = useSampleSizeStyles();
  
  const { 
    ttestForm, 
    isLoading, 
    sampleSize, 
    error,
    setTTestForm, 
    setLoading, 
    setSampleSize, 
    setError 
  } = useSampleSizeStore(
    useShallow((state) => ({
      ttestForm: state.ttestForm,
      isLoading: state.isLoading,
      sampleSize: state.sampleSize,
      error: state.error,
      setTTestForm: state.setTTestForm,
      setLoading: state.setLoading,
      setSampleSize: state.setSampleSize,
      setError: state.setError,
    }))
  );

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;
    setTTestForm({ [name]: numericValue });
  };

  const handleCalculate = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      const result = await executeCalculation('ttest-sample-size', ttestForm);
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
      ttestForm.expected_difference > 0 &&
      ttestForm.expected_std_dev > 0 &&
      ttestForm.desired_power > 0 &&
      ttestForm.desired_power < 1 &&
      ttestForm.alpha > 0 &&
      ttestForm.alpha < 1
    );
  };

  return (
    <div className={classes.formSection}>
      <Fieldset title={t('ttestParameters', { ns: 'sampleSize' })}>
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
            <Field label={t('expectedDifference', { ns: 'sampleSize' })}>
              <Input
                name="expected_difference"
                type="number"
                placeholder="5"
                value={String(ttestForm.expected_difference)}
                onChange={onChangeHandler}
                className={classes.input}
              />
            </Field>
          </div>
          <div className={classes.inputField}>
            <Field label={t('expectedStdDev', { ns: 'sampleSize' })}>
              <Input
                name="expected_std_dev"
                type="number"
                placeholder="8"
                value={String(ttestForm.expected_std_dev)}
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
                value={String(ttestForm.desired_power)}
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
                value={String(ttestForm.alpha)}
                onChange={onChangeHandler}
                className={classes.input}
              />
            </Field>
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

export const TTestComponent = memo(TTestComponentBase); 