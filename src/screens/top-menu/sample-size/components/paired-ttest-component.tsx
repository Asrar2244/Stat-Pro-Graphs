import { FC, memo, ChangeEvent } from 'react';
import { Button, Input, Field } from '@fluentui/react-components';
import { Fieldset } from '@libs';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { useSampleSizeStore } from '../use-sample-size-store';
import { useSampleSizeStyles } from '../styles-hook/use-sample-size-styles';
import { SampleSizeTestType, IPairedTTestForm, ISampleSizeResult } from '../types';

interface IPairedTTestComponentProps {
  executeCalculation: (testType: SampleSizeTestType, formData: IPairedTTestForm) => Promise<ISampleSizeResult>;
}

const PairedTTestComponentBase: FC<IPairedTTestComponentProps> = ({ executeCalculation }) => {
  const { t } = useTranslation('sampleSize');
  const classes = useSampleSizeStyles();
  
  const { 
    pairedTTestForm, 
    isLoading, 
    sampleSize, 
    error,
    setPairedTTestForm, 
    setLoading, 
    setSampleSize, 
    setError 
  } = useSampleSizeStore(
    useShallow((state) => ({
      pairedTTestForm: state.pairedTTestForm,
      isLoading: state.isLoading,
      sampleSize: state.sampleSize,
      error: state.error,
      setPairedTTestForm: state.setPairedTTestForm,
      setLoading: state.setLoading,
      setSampleSize: state.setSampleSize,
      setError: state.setError,
    }))
  );

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;
    setPairedTTestForm({ [name]: numericValue });
  };

  const handleCalculate = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      const result = await executeCalculation('paired-ttest-sample-size', pairedTTestForm);
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
      pairedTTestForm.change_to_be_detected > 0 &&
      pairedTTestForm.expected_std_dev_of_change > 0 &&
      pairedTTestForm.desired_power > 0 &&
      pairedTTestForm.desired_power < 1 &&
      pairedTTestForm.alpha > 0 &&
      pairedTTestForm.alpha < 1 &&
      pairedTTestForm.correlation > -1 &&
      pairedTTestForm.correlation < 1
    );
  };

  return (
    <div className={classes.formSection}>
      <Fieldset title={t('pairedTtestParameters', { ns: 'sampleSize' })}>
        {sampleSize && (
          <div className={classes.resultCard}>
            <div className={classes.resultLabel}>
              {t('calculatedSampleSize', { ns: 'sampleSize' })}
            </div>
            <div className={classes.resultValue}>
              {sampleSize.sample_size}
            </div>
            <div className={classes.resultSubtext}>
              {t('pairs', { ns: 'sampleSize' })}
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
            <Field label={t('changeToBeDetected', { ns: 'sampleSize' })}>
              <Input
                name="change_to_be_detected"
                type="number"
                placeholder="5"
                value={String(pairedTTestForm.change_to_be_detected)}
                onChange={onChangeHandler}
                className={classes.input}
              />
            </Field>
          </div>
          <div className={classes.inputField}>
            <Field label={t('expectedStdDevOfChange', { ns: 'sampleSize' })}>
              <Input
                name="expected_std_dev_of_change"
                type="number"
                placeholder="8"
                value={String(pairedTTestForm.expected_std_dev_of_change)}
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
                value={String(pairedTTestForm.desired_power)}
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
                value={String(pairedTTestForm.alpha)}
                onChange={onChangeHandler}
                className={classes.input}
              />
            </Field>
          </div>
        </div>

        <div className={classes.inputRow}>
          <div className={classes.inputField}>
            <Field label={t('correlation', { ns: 'sampleSize' })}>
              <Input
                name="correlation"
                type="number"
                step="0.01"
                placeholder="0.5"
                value={String(pairedTTestForm.correlation)}
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

export const PairedTTestComponent = memo(PairedTTestComponentBase); 