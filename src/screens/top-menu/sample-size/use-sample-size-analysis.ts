import { useSampleSizeEnhanced } from './use-sample-size-enhanced';
import { IActiveNode, useAnalyzeSave } from '@hooks';
import { SampleSizeTestType } from './types';
import { useStartProStore } from '@store/main-store';

interface ISampleSizeAnalysis {
  executeSampleSizeAnalysis: (testType: SampleSizeTestType, id: string) => void;
}

export const useSampleSizeAnalysis = ({
  config,
  queueFor,
  queueType,
}: IActiveNode & { queueFor: string; queueType: string }): ISampleSizeAnalysis => {
  const {
    ttestForm,
    proportionForm,
    pairedTTestForm,
    anovaForm,
    chiSquareForm,
  } = useSampleSizeEnhanced();

  const { execute } = useAnalyzeSave();
  const { setBlockUI } = useStartProStore();

  const executeSampleSizeAnalysis = async (testType: SampleSizeTestType, id: string): Promise<void> => {
    try {
      let formData: any;
      
      // Get the appropriate form data based on test type
      switch (testType) {
        case 'ttest-sample-size':
          formData = ttestForm;
          break;
        case 'proportion-sample-size':
          formData = proportionForm;
          break;
        case 'paired-ttest-sample-size':
          formData = pairedTTestForm;
          break;
        case 'anova-sample-size':
          formData = anovaForm;
          break;
        case 'chi-square-sample-size':
          formData = chiSquareForm;
          break;
        default:
          throw new Error('Unknown test type');
      }

      // Create parameters in the same format as regression
      const parameters = {
        operation: 'sample_size',
        test_type: testType,
        parameters: formData,
        input_data_type: 'parameters', // Sample size doesn't need data files
        // Add any additional parameters needed for sample size
        data_name: config.tabName || 'sample_size_calculation',
        db_name: config.tabName || 'sample_size_calculation',
        table_name: 'parameters',
      };

      // Use the same queued task system as regression
      await execute(
        config.tabName || 'sample_size_calculation',
        parameters,
        {
          queueFor,
          url: `/api/analysis`,
          method: 'POST',
          queueType,
        },
        id,
      );

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sample size calculation failed';
      setBlockUI({ value: true, msg: errorMessage });
      console.error('Sample size analysis error:', error);
    }
  };

  return { executeSampleSizeAnalysis };
};
