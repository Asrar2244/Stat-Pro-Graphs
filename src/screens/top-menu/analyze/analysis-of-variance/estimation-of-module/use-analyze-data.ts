import { useShallow } from 'zustand/react/shallow';
import { useEstimateModel } from './use-estimation-store';
import { API } from '@constants';
import { useAnalyzeSave } from '@hooks';
interface IOutputAnalyzeData {
  estimationOfModuleAnalyzeData: (tableName: string, queueFor: string, queueType: string, id: string) => void;
}
export const useEstimationOfModuleAnalyzeData = (): IOutputAnalyzeData => {
  const { model } = useEstimateModel(useShallow((state) => ({ model: state.model })));
  const { execute } = useAnalyzeSave();
  const estimationOfModuleAnalyzeData = async (
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
      function: 'estimate_model',
    };
    execute(tableName, parameters, {
      queueFor,
      url: `/api/${API.analysis}`,
      method: 'POST',
      queueType,
    }, id);
  };

  return { estimationOfModuleAnalyzeData };
};
