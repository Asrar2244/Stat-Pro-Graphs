import { FC } from 'react';
import { Button, Input, Label, Checkbox } from '@fluentui/react-components';
import { useSampleSizeStyles } from './styles-hook/use-sample-size-styles';
import { useSampleSizeEnhanced } from './use-sample-size-enhanced';
import { SampleSizeModalProps, SampleSizeTestType } from './types';

export const SampleSizeModal: FC<SampleSizeModalProps> = ({ selectedTest }) => {
  const classes = useSampleSizeStyles();
  
  const {
    ttestForm,
    proportionForm,
    pairedTTestForm,
    anovaForm,
    chiSquareForm,
    isLoading,
    sampleSize,
    error,
    handleInputChange,
    canUseBackend,
    calculateSampleSize,
  } = useSampleSizeEnhanced();

  // Check if current test can be executed
  const currentTestCanRun = canUseBackend(selectedTest as SampleSizeTestType);

  const renderTTestForm = () => (
    <div className={classes.formContainer}>
      <div className={classes.inputRow}>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="expected_difference">Expected Difference</Label>
          <Input
            className={classes.input}
            id="expected_difference"
            type="number"
            placeholder="10"
            value={String(ttestForm.expected_difference)}
            onChange={(e) => handleInputChange('ttest-sample-size', 'expected_difference', e.target.value)}
          />
        </div>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="expected_std_dev">Expected Standard Deviation</Label>
          <Input
            className={classes.input}
            id="expected_std_dev"
            type="number"
            placeholder="8"
            value={String(ttestForm.expected_std_dev)}
            onChange={(e) => handleInputChange('ttest-sample-size', 'expected_std_dev', e.target.value)}
          />
        </div>
      </div>
      <div className={classes.inputRow}>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="desired_power">Desired Power</Label>
          <Input
            className={classes.input}
            id="desired_power"
            type="number"
            step="0.01"
            placeholder="0.9"
            value={String(ttestForm.desired_power)}
            onChange={(e) => handleInputChange('ttest-sample-size', 'desired_power', e.target.value)}
          />
        </div>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="alpha">Alpha</Label>
          <Input
            className={classes.input}
            id="alpha"
            type="number"
            step="0.01"
            placeholder="0.05"
            value={String(ttestForm.alpha)}
            onChange={(e) => handleInputChange('ttest-sample-size', 'alpha', e.target.value)}
          />
        </div>
      </div>
      <div className={classes.calculateButtonContainer}>
        <Button
          appearance="subtle"
          className={classes.calculateButton}
          onClick={() => calculateSampleSize('ttest-sample-size')}
          disabled={isLoading || !currentTestCanRun || !ttestForm.expected_difference || !ttestForm.expected_std_dev || !ttestForm.desired_power || !ttestForm.alpha}
        >
          {isLoading ? 'Calculating...' : 'Calculate Sample Size'}
        </Button>
      </div>
    </div>
  );

  const renderProportionForm = () => (
    <div className={classes.formContainer}>
      <div className={classes.inputRow}>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="group1_proportion">Group 1 Proportion</Label>
          <Input
            className={classes.input}
            id="group1_proportion"
            type="number"
            step="0.01"
            placeholder="0.5"
            value={String(proportionForm.group1_proportion)}
            onChange={(e) => handleInputChange('proportion-sample-size', 'group1_proportion', e.target.value)}
          />
        </div>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="group2_proportion">Group 2 Proportion</Label>
          <Input
            className={classes.input}
            id="group2_proportion"
            type="number"
            step="0.01"
            placeholder="0.7"
            value={String(proportionForm.group2_proportion)}
            onChange={(e) => handleInputChange('proportion-sample-size', 'group2_proportion', e.target.value)}
          />
        </div>
      </div>
      <div className={classes.inputRow}>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="desired_power">Desired Power</Label>
          <Input
            className={classes.input}
            id="desired_power"
            type="number"
            step="0.01"
            placeholder="0.9"
            value={String(proportionForm.desired_power)}
            onChange={(e) => handleInputChange('proportion-sample-size', 'desired_power', e.target.value)}
          />
        </div>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="alpha">Alpha</Label>
          <Input
            className={classes.input}
            id="alpha"
            type="number"
            step="0.01"
            placeholder="0.05"
            value={String(proportionForm.alpha)}
            onChange={(e) => handleInputChange('proportion-sample-size', 'alpha', e.target.value)}
          />
        </div>
      </div>
      <div className={classes.checkboxContainer}>
        <Checkbox
          id="yates_correction"
          label="Apply Yates Correction"
          checked={proportionForm.yates_correction}
          onChange={(e) => handleInputChange('proportion-sample-size', 'yates_correction', e.target.checked)}
        />
      </div>
      <div className={classes.calculateButtonContainer}>
        <Button
          appearance="subtle"
          className={classes.calculateButton}
          onClick={() => calculateSampleSize('proportion-sample-size')}
          disabled={isLoading || !currentTestCanRun || !proportionForm.group1_proportion || !proportionForm.group2_proportion || !proportionForm.desired_power || !proportionForm.alpha}
        >
          {isLoading ? 'Calculating...' : 'Calculate Sample Size'}
        </Button>
      </div>
    </div>
  );

  const renderPairedTTestForm = () => (
    <div className={classes.formContainer}>
      <div className={classes.inputRow}>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="change_to_be_detected">Change to be Detected</Label>
          <Input
            className={classes.input}
            id="change_to_be_detected"
            type="number"
            placeholder="5"
            value={String(pairedTTestForm.change_to_be_detected)}
            onChange={(e) => handleInputChange('paired-ttest-sample-size', 'change_to_be_detected', e.target.value)}
          />
        </div>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="expected_std_dev_of_change">Expected Std Dev of Change</Label>
          <Input
            className={classes.input}
            id="expected_std_dev_of_change"
            type="number"
            placeholder="8"
            value={String(pairedTTestForm.expected_std_dev_of_change)}
            onChange={(e) => handleInputChange('paired-ttest-sample-size', 'expected_std_dev_of_change', e.target.value)}
          />
        </div>
      </div>
      <div className={classes.inputRow}>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="desired_power">Desired Power</Label>
          <Input
            className={classes.input}
            id="desired_power"
            type="number"
            step="0.01"
            placeholder="0.9"
            value={String(pairedTTestForm.desired_power)}
            onChange={(e) => handleInputChange('paired-ttest-sample-size', 'desired_power', e.target.value)}
          />
        </div>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="alpha">Alpha</Label>
          <Input
            className={classes.input}
            id="alpha"
            type="number"
            step="0.01"
            placeholder="0.05"
            value={String(pairedTTestForm.alpha)}
            onChange={(e) => handleInputChange('paired-ttest-sample-size', 'alpha', e.target.value)}
          />
        </div>
      </div>
      <div className={classes.inputRow}>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="correlation">Correlation</Label>
          <Input
            className={classes.input}
            id="correlation"
            type="number"
            step="0.01"
            placeholder="0.5"
            value={String(pairedTTestForm.correlation)}
            onChange={(e) => handleInputChange('paired-ttest-sample-size', 'correlation', e.target.value)}
          />
        </div>
        <div className={classes.inputField}>
          {/* Empty div for grid alignment */}
        </div>
      </div>
      <div className={classes.calculateButtonContainer}>
        <Button
          appearance="subtle"
          className={classes.calculateButton}
          onClick={() => calculateSampleSize('paired-ttest-sample-size')}
          disabled={isLoading || !currentTestCanRun || !pairedTTestForm.change_to_be_detected || !pairedTTestForm.expected_std_dev_of_change || !pairedTTestForm.desired_power || !pairedTTestForm.alpha || !pairedTTestForm.correlation}
        >
          {isLoading ? 'Calculating...' : 'Calculate Sample Size'}
        </Button>
      </div>
    </div>
  );

  const renderANOVAForm = () => (
    <div className={classes.formContainer}>
      <div className={classes.inputRow}>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="minimum_detectable_difference">Minimum Detectable Difference</Label>
          <Input
            className={classes.input}
            id="minimum_detectable_difference"
            type="number"
            placeholder="5"
            value={String(anovaForm.minimum_detectable_difference)}
            onChange={(e) => handleInputChange('anova-sample-size', 'minimum_detectable_difference', e.target.value)}
          />
        </div>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="expected_std_dev_residuals">Expected Std Dev of Residuals</Label>
          <Input
            className={classes.input}
            id="expected_std_dev_residuals"
            type="number"
            placeholder="8"
            value={String(anovaForm.expected_std_dev_residuals)}
            onChange={(e) => handleInputChange('anova-sample-size', 'expected_std_dev_residuals', e.target.value)}
          />
        </div>
      </div>
      <div className={classes.inputRow}>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="num_groups">Number of Groups</Label>
          <Input
            className={classes.input}
            id="num_groups"
            type="number"
            placeholder="3"
            value={String(anovaForm.num_groups)}
            onChange={(e) => handleInputChange('anova-sample-size', 'num_groups', e.target.value)}
          />
        </div>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="desired_power">Desired Power</Label>
          <Input
            className={classes.input}
            id="desired_power"
            type="number"
            step="0.01"
            placeholder="0.9"
            value={String(anovaForm.desired_power)}
            onChange={(e) => handleInputChange('anova-sample-size', 'desired_power', e.target.value)}
          />
        </div>
      </div>
      <div className={classes.inputRow}>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="alpha">Alpha</Label>
          <Input
            className={classes.input}
            id="alpha"
            type="number"
            step="0.01"
            placeholder="0.05"
            value={String(anovaForm.alpha)}
            onChange={(e) => handleInputChange('anova-sample-size', 'alpha', e.target.value)}
          />
        </div>
        <div className={classes.inputField}>
          {/* Empty div for grid alignment */}
        </div>
      </div>
      <div className={classes.calculateButtonContainer}>
        <Button
          appearance="subtle"
          className={classes.calculateButton}
          onClick={() => calculateSampleSize('anova-sample-size')}
          disabled={isLoading || !currentTestCanRun || !anovaForm.minimum_detectable_difference || !anovaForm.expected_std_dev_residuals || !anovaForm.num_groups || !anovaForm.desired_power || !anovaForm.alpha}
        >
          {isLoading ? 'Calculating...' : 'Calculate Sample Size'}
        </Button>
      </div>
    </div>
  );

  const renderChiSquareForm = () => (
    <div className={classes.formContainer}>
      <div className={classes.inputRow}>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="desired_power">Desired Power</Label>
          <Input
            className={classes.input}
            id="desired_power"
            type="number"
            step="0.01"
            placeholder="0.9"
            value={String(chiSquareForm.desired_power)}
            onChange={(e) => handleInputChange('chi-square-sample-size', 'desired_power', e.target.value)}
          />
        </div>
        <div className={classes.inputField}>
          <Label className={classes.label} htmlFor="alpha">Alpha</Label>
          <Input
            className={classes.input}
            id="alpha"
            type="number"
            step="0.01"
            placeholder="0.05"
            value={String(chiSquareForm.alpha)}
            onChange={(e) => handleInputChange('chi-square-sample-size', 'alpha', e.target.value)}
          />
        </div>
      </div>
      <div className={classes.checkboxContainer}>
        <Checkbox
          id="yates_correction"
          label="Apply Yates Correction"
          checked={chiSquareForm.yates_correction}
          onChange={(e) => handleInputChange('chi-square-sample-size', 'yates_correction', e.target.checked)}
        />
      </div>
      <div className={classes.calculateButtonContainer}>
        <Button
          appearance="subtle"
          className={classes.calculateButton}
          onClick={() => calculateSampleSize('chi-square-sample-size')}
          disabled={isLoading || !currentTestCanRun || !chiSquareForm.desired_power}
        >
          {isLoading ? 'Calculating...' : 'Calculate Sample Size'}
        </Button>
      </div>
    </div>
  );

  const renderForm = () => {
    switch (selectedTest as SampleSizeTestType) {
      case 'ttest-sample-size':
        return renderTTestForm();
      case 'proportion-sample-size':
        return renderProportionForm();
      case 'paired-ttest-sample-size':
        return renderPairedTTestForm();
      case 'anova-sample-size':
        return renderANOVAForm();
      case 'chi-square-sample-size':
        return renderChiSquareForm();
      default:
        return <div>Select a test type</div>;
    }
  };

  return (
    <div className={classes.sampleSizeWrapper}>
      {/* Error Display */}
      {error && (
        <div className={classes.errorCard}>
          <Label className={classes.errorLabel}>
            Error
          </Label>
          <div className={classes.errorValue}>
            {error}
          </div>
        </div>
      )}

      {/* Sample Size Result Display */}
      {sampleSize && (
        <div className={classes.resultCard}>
          <div className={classes.resultLabel}>Sample Size:</div>
          <div className={classes.resultValue}>{typeof sampleSize === 'object' ? sampleSize.sample_size : sampleSize}</div>
        </div>
      )}

      {/* Loading Message */}
      {isLoading && (
        <div className={classes.loadingMessage}>
          Calculating sample size...
        </div>
      )}

      {/* Form */}
      <div className={classes.formSection}>
        {renderForm()}
      </div>
    </div>
  );
}; 