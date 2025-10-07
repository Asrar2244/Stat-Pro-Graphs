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

    // Enforce exactly one dependent variable
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
      regressionType: 'linear_db',
      linearparameters: {
        inc_constant: model.includeConst,
        confidence: parseFloat(estimate.confidence),
        tolerance: parseFloat(estimate.tolerance),
        estimation: estimate.estimation,
        kolmogrov_smirnov: options.kolmogorovSmirnov,
        shapiro_wilk: options.shapiroWilk,
        anderson_darling: options.andersonDArling,
      },
      sub_type: 'none',
      additionalParameters: {
        ...predict,
        ...resampling,
      },
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
