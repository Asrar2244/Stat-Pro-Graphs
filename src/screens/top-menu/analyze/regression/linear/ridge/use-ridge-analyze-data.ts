import { useShallow } from 'zustand/react/shallow';
import { useRidge } from './use-ridge-store-hook';
import { API } from '@constants';
import { collectionsLocation } from '@utils';
import { useAnalyzeSave } from '@hooks';
interface IOutputAnalyzeData {
  ridgeAnalyzeData: (tableName: string, tabId: string, queueFor: string, queueType: string) => void;
}
export const useRidgeAnalyzeData = (): IOutputAnalyzeData => {
  const { ridge } = useRidge(useShallow((state) => ({ ridge: state })));
  const { save } = useAnalyzeSave();
  const ridgeAnalyzeData = async (
    tableName: string,
    queueFor: string,
    queueType: string,
  ): Promise<void> => {
    const db_path = await collectionsLocation(tableName);
    const parameters = {
      db_name: db_path,
      dependent_var_names: Object.keys(ridge.dependentList),
      independent_var_names: Object.keys(ridge.independentList),
      regressionType: 'linear',
      ridgeparameters: {
        lambdas: [
          ridge.lambdaMinimum,
          ridge.lambdaMaximum,
          ridge.lambdaIncrement,
          ridge.lambdaIndividualValues,
        ],
        save_coeff: true,
      },
      sub_type: 'ridge',
    };
    save(tableName, parameters, {
      queueFor,
      url: `/api/${API.analysis}`,
      method: 'POST',
      queueType,
    });
  };

  return { ridgeAnalyzeData };
};
