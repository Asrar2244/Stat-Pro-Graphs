import { useShallow } from 'zustand/react/shallow';
import { useRidge } from './use-ridge-store-hook';
// import { API } from '@constants';
// import { useTasks } from '@store/common-msg-store';
import { collectionsLocation } from '@utils';
interface IOutputAnalyzeData {
  ridgeAnalyzeData: (tableName: string, tabId: string, queueFor: string, queueType: string) => void;
}
export const useRidgeAnalyzeData = (): IOutputAnalyzeData => {
  const { ridge } = useRidge(useShallow((state) => ({ ridge: state })));
  // const { setQueueTask } = useTasks(useShallow((state) => ({ setQueueTask: state.setQueueTask })));

  const ridgeAnalyzeData = async (
    tableName: string,
    // tabId: string,
    // queueFor: string,
    // queueType: string,
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
    // setQueueTask({
    //   parameters,
    //   queueFor,
    //   queueType,
    //   tabId,
    //   tabName: tableName,
    //   url: `${API.analysis}/api`,
    // });
  };

  return { ridgeAnalyzeData };
};
