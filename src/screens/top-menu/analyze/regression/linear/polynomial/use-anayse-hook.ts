import { usePolynomial } from './use-polynomial-hook';
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
  const { setModel, model, estimate } = usePolynomial(
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

    // Validate polynomial degree - ensure it's reasonable for the data
    const degree = 1; // Force degree to 1 to test if this fixes the backend error
    console.log('Original degree:', estimate.degree, 'Forced degree:', degree);

    const dependentVars = Array.from(model.dependentList.entries())
      .filter(([_, selected]) => selected)
      .map(([name, _]) => name);
    const independentVars = Array.from(model.independentList.entries())
      .filter(([_, selected]) => selected)
      .map(([name, _]) => name);

    // Validate variable selection
    if (dependentVars.length !== 1) {
      setBlockUI({ value: true, msg: 'Please select exactly one dependent variable.' });
      return;
    }
    if (independentVars.length !== 1) {
      console.error('Polynomial regression requires exactly 1 independent variable, got:', independentVars.length);
      return;
    }

    const parameters = {
      data_name: tableName,
      input_data_type: 'file',
      db_name: tableName,
      sheet_name: EXCEL,
      dependent_var_names: dependentVars,
      independent_var_names: independentVars,
      regressionType: 'linear',
      estimationparameters: {
        inference: estimate.inference,
        degree: degree,
        confidence_level: parseFloat(estimate.confidence),
        polynomial_type: estimate.polynomialType,
      },
      sub_type: 'polynomial',
    };

    // Debug: Log the current estimate values
    console.log('Polynomial estimate values:', {
      inference: estimate.inference,
      degree: estimate.degree,
      confidence: estimate.confidence,
      polynomialType: estimate.polynomialType
    });

    // Debug: Log variable selection details
    console.log('Dependent list entries:', Array.from(model.dependentList.entries()));
    console.log('Independent list entries:', Array.from(model.independentList.entries()));
    console.log('Selected dependent vars:', dependentVars);
    console.log('Selected independent vars:', independentVars);

    // Debug: Log the final parameters
    console.log('Polynomial parameters being sent:', parameters);

    try {
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
      console.log('✅ Polynomial regression analysis executed successfully');
    } catch (error) {
      console.error('❌ Polynomial regression analysis failed:', error);
    }
  };

  return { executeAnalysis };
};

export const usePolynomialAnalyse = usePrepareAnalysis;
