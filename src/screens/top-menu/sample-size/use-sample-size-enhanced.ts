import { useSampleSizeStore } from './use-sample-size-store';
import { SampleSizeTestType } from './types';

export const useSampleSizeEnhanced = () => {
  // Zustand selectors and actions
  const {
    ttestForm,
    setTTestForm,
    proportionForm,
    setProportionForm,
    pairedTTestForm,
    setPairedTTestForm,
    anovaForm,
    setAnovaForm,
    chiSquareForm,
    setChiSquareForm,
    isLoading,
    sampleSize,
    error,
    setLoading,
    setSampleSize,
    setError,
    resetAll,
    calculateSampleSize,
  } = useSampleSizeStore();

  // For most tests, no data file is required since they're mathematical calculations
  const requiresDataFile = (_selectedTest: SampleSizeTestType): boolean => {
    // All sample size calculations are mathematical and don't require data files
    return false;
  };

  // All tests can be calculated directly
  const canUseBackend = (_selectedTest: SampleSizeTestType): boolean => {
    return true;
  };

  // Unified input change handler
  const handleInputChange = (test: SampleSizeTestType, field: string, value: any) => {
    switch (test) {
      case 'ttest-sample-size':
        setTTestForm({ [field]: value });
        break;
      case 'proportion-sample-size':
        setProportionForm({ [field]: value });
        break;
      case 'paired-ttest-sample-size':
        setPairedTTestForm({ [field]: value });
        break;
      case 'anova-sample-size':
        setAnovaForm({ [field]: value });
        break;
      case 'chi-square-sample-size':
        setChiSquareForm({ [field]: value });
        break;
    }
  };

  return {
    ttestForm,
    setTTestForm,
    proportionForm,
    setProportionForm,
    pairedTTestForm,
    setPairedTTestForm,
    anovaForm,
    setAnovaForm,
    chiSquareForm,
    setChiSquareForm,
    isLoading,
    sampleSize,
    error,
    setLoading,
    setSampleSize,
    setError,
    resetAll,
    handleInputChange,
    canUseBackend,
    requiresDataFile,
    calculateSampleSize: (test: SampleSizeTestType, queueFor: string, queueType: string, id: string) => 
      calculateSampleSize(test, queueFor, queueType, id),
  };
}; 