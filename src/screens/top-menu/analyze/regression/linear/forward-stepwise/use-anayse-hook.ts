import { useLinearLeastSquares } from './use-squares-hook';
import { useShallow } from 'zustand/react/shallow';
import { IActiveNode, useAnalyzeSave } from '@hooks';
import { useEffect } from 'react';
import { IColumn } from '../../../../../table-render/use-column-count';
import { EXCEL, API } from '@constants';
import { useStartProStore } from '@store/main-store';
interface IOutput {
  executeAnalysis: (id: string) => void;
}
export const usePrepareAnalysis = ({
  config,
  columns,
  queueFor,
  queueType,
}: IActiveNode & { columns: IColumn[]; queueFor: string; queueType: string }): IOutput => {
  const { setModel, model, estimate } = useLinearLeastSquares(
    useShallow((state) => ({
      model: state.model,
      estimate: state.estimate,
      setModel: state.setModel,
    })),
  );
  const { execute } = useAnalyzeSave();
  const { setBlockUI } = useStartProStore();

  useEffect(() => {
    const columnMap = new Map<string, boolean>();
    columns.forEach((column) => {
      if (!model.availableList.has(column.columnId)) columnMap.set(column.columnId, false);
    });
    setModel({
      availableList: columnMap,
      independentList: new Map<string, boolean>(),
      dependentList: new Map<string, boolean>(),
    });
  }, [columns.length]);

  const executeAnalysis = async (id: string): Promise<void> => {
    const tableName = config.tabName;

    const dependentVars = Array.from(model.dependentList.keys());
    if (dependentVars.length !== 1) {
      setBlockUI({ value: true, msg: 'Please select exactly one dependent variable.' });
      return;
    }

    const parameters = {
      data_name: tableName,
      input_data_type: 'file',
      operation: 'regression',
      sheet_name: EXCEL,
      db_name: tableName,
      table_name: EXCEL,
      dependent_var_names: dependentVars,
      independent_var_names: Array.from(model.independentList.keys()),
      regressionType: 'linear',
      linearparameters: {
        inc_constant: model.includeConst,
        confidence: parseFloat(estimate.confidence),
        tolerance: parseFloat(estimate.tolerance),
        estimation_type: 'stepwise',
        probability_threshold_enter: Number(estimate.propEnter),
        probability_threshold_remove: Number(estimate.propRemove),
        f_statistic_threshold_enter: Number(estimate.fStatisticEnter),
        f_statistic_threshold_remove: Number(estimate.fStatisticRemove),
        max_steps: Number(estimate.maxStep),
        force_features: estimate.force ? estimate.force.split(',').map(s => s.trim()) : [],
        direction: estimate.direction || 'forward',
      },
      sub_type: 'estimation',
    };
    await execute(
      config.tabName,
      parameters,
      {
        queueFor,
        url: `/api/${API.analysis}`,
        method: 'POST',
        queueType,
      },
      id,
    );
  };

  return { executeAnalysis };
};
