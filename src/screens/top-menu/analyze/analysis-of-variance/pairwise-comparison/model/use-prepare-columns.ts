import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useEstimateModel } from '../use-pairwise-comparison-store';
import { IColumn } from '@hooks';
interface IUseEstimateModel {
  columns: IColumn[];
}

export const useEstimateModelPrepare = ({ columns }: IUseEstimateModel): (() => void) => {
  useEffect(() => {
    getActivateList();
  }, [columns]);
  const { setModel, model } = useEstimateModel(
    useShallow((state) => {
      const { setModel, model } = state;
      return {
        setModel,
        model,
      };
    }),
  );
  const getActivateList = (): void => {
    if (columns.length > 0) {
      const availList: any = {};
      columns.forEach((column) => {
        if (
          model.dependentList[column.columnId] === undefined &&
          model.covariateList[column.columnId] === undefined &&
          model.factorList[column.columnId] === undefined
        )
          availList[column.columnId] = false;
        else if (
          model.dependentList[column.columnId] ||
          model.covariateList[column.columnId] ||
          model.factorList[column.columnId]
        ) {
          delete availList[column.columnId];
        }
      });

      if (setModel) setModel({ availableList: availList });
    }
  };
  return getActivateList;
};
