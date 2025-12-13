import { useSampleSizeStore } from './use-sample-size-store';
import { SampleSizeTestType } from './types';
import { API } from '@constants/locale';
import { mainWorker } from '@workers/worker';
import { useShallow } from 'zustand/react/shallow';

export const useSampleSizeEnhanced = () => {
  // Zustand selectors and actions - use useShallow for proper reactivity
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
    getFormData,
  } = useSampleSizeStore(
    useShallow((state) => ({
      ttestForm: state.ttestForm,
      setTTestForm: state.setTTestForm,
      proportionForm: state.proportionForm,
      setProportionForm: state.setProportionForm,
      pairedTTestForm: state.pairedTTestForm,
      setPairedTTestForm: state.setPairedTTestForm,
      anovaForm: state.anovaForm,
      setAnovaForm: state.setAnovaForm,
      chiSquareForm: state.chiSquareForm,
      setChiSquareForm: state.setChiSquareForm,
      isLoading: state.isLoading,
      sampleSize: state.sampleSize,
      error: state.error,
      setLoading: state.setLoading,
      setSampleSize: state.setSampleSize,
      setError: state.setError,
      resetAll: state.resetAll,
      getFormData: state.getFormData,
    }))
  );

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

  // Convert test type to operation name (replace hyphens with underscores)
  const getOperationName = (test: SampleSizeTestType): string => {
    return test.replace(/-/g, '_');
  };

  // Calculate sample size - make direct API call and display result in modal
  const calculateSampleSize = async (test: SampleSizeTestType, _queueFor: string, _queueType: string, _id: string) => {
    setLoading(true);
    setError('');
    setSampleSize(null);
    
    try {
      const formData = getFormData(test);
      const operation = getOperationName(test);
      
      // Create parameters object with operation field
      const parameters = {
        operation,
        ...formData,
      };

      // Make direct API call to get immediate response
      const response = await mainWorker.axios(
        `${API.backendURL}/api/${API.analysis}`,
        parameters
      );

      // Check HTTP status code
      if (response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const responseData = response.data || response;

      // Check for backend errors in various formats
      console.log('[Sample Size] Response data:', responseData);
      
      // Format 1: { error: "...", status: "failed" }
      if (responseData.status === 'failed' && responseData.error) {
        console.log('[Sample Size] Error detected (status: failed):', responseData.error);
        throw new Error(String(responseData.error));
      }
      
      // Format 2: { error: "..." }
      if (responseData.error) {
        console.log('[Sample Size] Error detected (error field):', responseData.error);
        throw new Error(String(responseData.error));
      }
      
      // Format 3: { message: "...", status: "error" }
      if (responseData.status === 'error' && responseData.message) {
        console.log('[Sample Size] Error detected (status: error):', responseData.message);
        throw new Error(String(responseData.message));
      }

      // Extract sample size from successful response
      if (responseData && responseData.sample_size !== undefined) {
        setSampleSize({
          sample_size: responseData.sample_size,
          test_type: test,
          parameters: formData,
        });
        setLoading(false);
      } else {
        throw new Error('Invalid response from server - no sample_size field');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Calculation failed';
      console.error('[Sample Size] Calculation failed:', errorMessage);
      console.log('[Sample Size] About to call setError with:', errorMessage);
      
      // Set loading to false first
      setLoading(false);
      setSampleSize(null);
      
      // Then set the error
      setError(errorMessage);
      
      // Verify the error was set
      setTimeout(() => {
        const currentState = useSampleSizeStore.getState();
        console.log('[Sample Size] Store state after setError:', {
          error: currentState.error,
          isLoading: currentState.isLoading,
          sampleSize: currentState.sampleSize
        });
      }, 100);
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
    calculateSampleSize,
  };
}; 