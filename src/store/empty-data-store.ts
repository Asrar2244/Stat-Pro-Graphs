import { create } from 'zustand';
import { Matrix, CellBase } from 'react-spreadsheet';

type IDetailEmptyData = {
  dataState?: 'draft' | 'published';
  processData?: boolean;
  nodeId: string;
  canDelete?: boolean;
};

interface IEmptyDataStore {
  nodes: IDetailEmptyData;
  spreadsheetData: Matrix<CellBase>;
  columns: Record<string, string>;
  setSpreadsheetData: (data: Matrix<CellBase>) => void;
  setColumns: (columns: Record<string, string>) => void;
  setCreateState: (value: IDetailEmptyData) => void;
  setDeleteNode: () => void;
}

export const useEmptyDataStore = create<IEmptyDataStore>((set) => ({
  nodes: {
    nodeId: '',
    dataState: 'draft',
    processData: false,
    canDelete: false,
  },
  spreadsheetData: [],
  columns: {},
  setSpreadsheetData(data: Matrix<CellBase>) {
    set((state) => ({
      ...state,
      spreadsheetData: data,
    }));
  },
  setColumns(columns: Record<string, string>) {
    set((state) => ({
      ...state,
      columns,
    }));
  },
  setCreateState(value: IDetailEmptyData) {
    set((state) => {
      return { ...state, ...value };
    });
  },
  setDeleteNode() {
    set((state) => {
      return {
        ...state,
        nodeId: '',
        dataState: 'draft',
        processData: false,
        canDelete: false,
      };
    });
  },
}));
