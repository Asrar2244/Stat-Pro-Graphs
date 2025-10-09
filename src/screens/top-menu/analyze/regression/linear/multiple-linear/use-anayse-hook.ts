import { useMultipleLinear } from './use-multiple-linear-hook';
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
  const { setModel, model, estimate } = useMultipleLinear(
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
      db_name: tableName,
      sheet_name: EXCEL,
      dependent_var_names: dependentVars,
      independent_var_names: Array.from(model.independentList.keys()),
      regressionType: 'linear',
      estimationparameters: {
        confidence_level: parseFloat(estimate.confidence),
        vif_threshold: parseFloat(estimate.vifThreshold),
      },
      sub_type: 'multiple_linear_regression',
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

export const useMultipleLinearAnalyse = usePrepareAnalysis;