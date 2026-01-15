import { useBestSubset } from './use-best-subset-hook';
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
  const { setModel, model, estimate } = useBestSubset(
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
      if (!column.columnId.startsWith('def_col_') && !model.availableList.has(column.columnId)) {
        columnMap.set(column.columnId, false);
      }
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
        estimation_type: 'bestsubset',
        confidence_level: parseFloat(estimate.confidence),
        max_features: parseInt(estimate.maxFeatures, 10),
        metric: estimate.metric,
        vif_threshold: parseFloat(estimate.vifThreshold),
        force_features: estimate.forceFeatures ? estimate.forceFeatures.split(',').map((s) => s.trim()) : [],
      },
      sub_type: 'bestsubset',
      additionalParameters: {
        parameter1: 'value1',
        parameter2: 'value2'
      }
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