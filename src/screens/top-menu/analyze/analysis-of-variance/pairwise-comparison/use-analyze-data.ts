import { useShallow } from 'zustand/react/shallow';
import { useEstimateModel } from './use-pairwise-comparison-store';
import { API } from '@constants';
import { useAnalyzeSave } from '@hooks';
interface IOutputAnalyzeData {
  pairwiseComparisonModuleAnalyzeData: (tableName: string, queueFor: string, queueType: string, id: string) => void;
}
export const usePairwiseComparisonModuleAnalyzeData = (): IOutputAnalyzeData => {
  const { model } = useEstimateModel(useShallow((state) => ({ model: state.model })));
  const { execute } = useAnalyzeSave();
  const pairwiseComparisonModuleAnalyzeData = async (
    tableName: string,
    queueFor: string,
    queueType: string,
    id: string
  ): Promise<void> => {
    const db_path = tableName; //await collectionsLocation(tableName);
    const parameters = {
      db_name: db_path,
      dependent_var_names: Object.keys(model.dependentList),
      factors: Object.keys(model.factorList),
      covariate: Object.keys(model.covariateList),
      input_data_type: 'file',
      operation: 'anova',
      function: 'pairwise_comparision',
      additionalParameters: model.additionalParameters
    };
    execute(tableName, parameters, {
      queueFor,
      url: `/api/${API.analysis}`,
      method: 'POST',
      queueType,
    }, id);
  };

  return { pairwiseComparisonModuleAnalyzeData };
};
