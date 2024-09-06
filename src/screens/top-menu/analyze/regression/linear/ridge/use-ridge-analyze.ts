import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { IColumn } from '../../../../../table-render/use-column-count';
import { useRidge } from './use-ridge-store-hook';

interface IUseRidge {
  columns: IColumn[];
}

export const useRidgePrepare = ({ columns }: IUseRidge): void => {
  useEffect(() => {
    getActivateList();
  }, [columns]);
  const { setRidge, ridge } = useRidge(
    useShallow((state) => {
      const { setRidge, ...others } = state;
      return {
        setRidge,
        ridge: others,
      };
    }),
  );
  const getActivateList = (): void => {
    if (columns.length > 0) {
      const availList: any = {};
      columns.forEach((column) => {
        if (
          ridge.dependentList[column.columnId] === undefined &&
          ridge.independentList[column.columnId] === undefined
        )
          availList[column.columnId] = false;
      });
      setRidge({ availableList: availList });
    }
  };
};

/**
 * "dependent_var_names": ["V1"],
    "independent_var_names": ["V2","V3"],
 */
