import { useLinearLeastSquares } from './use-squares-hook';
import { useShallow } from 'zustand/react/shallow';
import { IActiveNode } from '@hooks';
import { useTasks } from '@store';
import { useEffect } from 'react';
import { IColumn } from '../../../../../table-render/use-column-count';
import { EXCEL, API } from '@constants';
import { volumeDirectory } from '@utils';
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
  const { setModel, model, estimate, options, predict, resampling } = useLinearLeastSquares(
    useShallow((state) => ({
      model: state.model,
      estimate: state.estimate,
      options: state.options,
      predict: state.predict,
      resampling: state.resampling,
      setModel: state.setModel,
    })),
  );
  const { setQueueTask } = useTasks(useShallow((state) => ({ setQueueTask: state.setQueueTask })));

  useEffect(() => {
    const availList: any = {};
    columns.forEach((column) => {
      if (
        model.dependentList[column.columnId] === undefined &&
        model.independentList[column.columnId] === undefined
      )
        availList[column.columnId] = false;
    });
    setModel({ availableList: availList });
  }, [columns]);
  const executeAnalysis = async (): Promise<void> => {
    const volumeName = await volumeDirectory();
    const parameters = {
      data_name: `${volumeName}/collections/${config.tabName}`,
      input_data_type: 'file',
      operation: 'regression',
      sheet_name: EXCEL,
      db_name: `${volumeName}/collections/${config.tabName}`,
      table_name: EXCEL,
      dependent_var_names: Object.keys(model.dependentList),
      independent_var_names: Object.keys(model.independentList),
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
