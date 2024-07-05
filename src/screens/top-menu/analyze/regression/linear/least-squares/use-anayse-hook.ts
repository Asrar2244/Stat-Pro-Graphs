import { useLinearLeastSquares } from './use-squares-hook';
import { useShallow } from 'zustand/react/shallow';
import { IActiveNode } from '@hooks';
import { useTasks } from '@store';
import { useEffect } from 'react';
import { IColumn } from '../../../../../table-render/use-column-count';
import { EXCEL, API } from '@constants';
import { collectionsLocation } from '@utils';
//import { volumeName } from '@constants/locale';
interface IOutput {
  executeAnalysis: () => void;
}
export const usePrepareAnalysis = ({
  config,
  columns,
  queueFor,
  queueType,
}: IActiveNode & { columns: IColumn[]; queueFor: string; queueType: string }): IOutput => {
  const { setModelBulk, model, estimate, options, predict, resampling } = useLinearLeastSquares(
    useShallow((state) => ({
      model: state.model,
      estimate: state.estimate,
      options: state.options,
      predict: state.predict,
      resampling: state.resampling,
      setModelBulk: state.setModelBulk,
    })),
  );
  const { setQueueTask } = useTasks(useShallow((state) => ({ setQueueTask: state.setQueueTask })));

  useEffect(() => {
    const columnMap = new Map<string, boolean>();
    columns.forEach((column) => {
      if (!model.dependentList.has(column.columnId) && !model.independentList.has(column.columnId))
        columnMap.set(column.columnId, false);
    });
    setModelBulk(columnMap, 'availableList');
  }, [columns.length]);
  const executeAnalysis = async (): Promise<void> => {
    const tableName = await collectionsLocation(config.tabName);
    const parameters = {
      data_name: tableName,
      input_data_type: 'file',
      operation: 'regression',
      sheet_name: EXCEL,
      db_name: tableName,
      table_name: EXCEL,
      dependent_var_names: model.dependentList.keys(),
      independent_var_names: model.independentList.keys(),
      regressionType: 'linear_db',
      linearparameters: {
        inc_constant: model.includeConst,
        confidence: parseFloat(estimate.confidence),
        tolerance: parseFloat(estimate.tolerance),
        estimation: estimate.estimation,
        kolmogrov_smirnov: options.kolmogorovSmirnov,
        shaprio_wilk: options.shapiroWilk,
        anderson_darling: options.andersonDArling,
      },
      sub_type: 'none',
      additionalParameters: {
        ...predict,
        ...resampling,
      },
    };
    setQueueTask({
      parameters,
      tabId: config.id.toString(),
      queueFor,
      tabName: config.tabName,
      url: `${API.analysis}/api`,
      queueType,
    });
  };
  return { executeAnalysis };
};
