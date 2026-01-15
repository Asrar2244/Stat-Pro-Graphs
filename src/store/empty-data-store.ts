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
  // New properties
  dataState?: 'draft' | 'published';
  projectId?: number | string;
  workspacePath?: string;
  saveRequest: number;

  setSpreadsheetData: (data: Matrix<CellBase>) => void;
  setColumns: (columns: Record<string, string>) => void;
  setCreateState: (value: IDetailEmptyData) => void;
  setDeleteNode: () => void;

  // New setters
  setDataState: (state: 'draft' | 'published' | undefined) => void;
  setProjectId: (id: number | string | undefined) => void;
  setWorkspacePath: (path: string | undefined) => void;
  triggerSave: () => void;
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
  // New properties for save prompt logic
  dataState: 'published', // Default to published to avoid blocking if unknown
  projectId: undefined,
  saveRequest: 0,
  workspacePath: '',

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
      // Also sync top-level dataState if provided
      const updates: any = { ...state, ...value };
      if (value.dataState) {
        updates.dataState = value.dataState;
      }
      return updates;
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
  // New actions
  setDataState: (dataState) => set({ dataState }),
  setProjectId: (projectId) => set({ projectId }),
  setWorkspacePath: (workspacePath) => set({ workspacePath }),
  triggerSave: () => set((state) => ({ saveRequest: state.saveRequest + 1 })),
}));
