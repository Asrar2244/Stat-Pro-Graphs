import { useShallow } from 'zustand/react/shallow';
import { useRidge } from './use-ridge-store-hook';
import { API } from '@constants';
import { useAnalyzeSave } from '@hooks';
interface IOutputAnalyzeData {
  ridgeAnalyzeData: (tableName: string, queueFor: string, queueType: string, id: string) => void;
}
export const useRidgeAnalyzeData = (): IOutputAnalyzeData => {
  const { ridge } = useRidge(useShallow((state) => ({ ridge: state })));
  const { execute } = useAnalyzeSave();
  const ridgeAnalyzeData = async (
    tableName: string,
    queueFor: string,
    queueType: string,
    id: string
  ): Promise<void> => {
    const db_path = tableName; //await collectionsLocation(tableName);
    const lambdas = ridge.lambdaIndividual
      ? ridge.lambdaIndividualValues.map((value) => Number(value))
      : [ridge.lambdaMinimum, ridge.lambdaMaximum, ridge.lambdaIncrement];

    const parameters = {
      db_name: db_path,
      dependent_var_names: Object.keys(ridge.dependentList),
      independent_var_names: Object.keys(ridge.independentList),
      regressionType: 'linear',
      ridgeparameters: {
        lambdas,
        save_coeff: true,
      },
      sub_type: 'ridge',
    };
    execute(tableName, parameters, {
      queueFor,
      url: `/api/${API.analysis}`,
      method: 'POST',
      queueType,
    }, id);
  };

  return { ridgeAnalyzeData };
};
