import { createContext } from 'react';
import { Matrix, CellBase } from 'react-spreadsheet';

export const initialEmptyDataStore: IEmptyDataStore = {
  data: [],
  selectedCell: undefined,
  columns: {},
  dataState: undefined,
};

export const EmptyDataContext = createContext<IEmptyDataStore>(initialEmptyDataStore);

export interface IEmptyDataStore {
  data: Matrix<CellBase>;
  selectedCell: Selection | { start: number; end: number } | undefined;
  setData?: (data: Matrix<CellBase>) => void;
  setSelectedCell?: (selectedCell: Selection | undefined) => void;
  columns: Record<string, string>;
  setColumns?: (columns: Record<string, string>) => void;
  dataState?: 'draft' | 'published';
  setDataState?: (dataState: undefined | 'draft' | 'published') => void;
  projectId?: number | string; // CRITICAL: Project ID per EmptyDataView tab
  setProjectId?: (projectId: number | string | undefined) => void;
  storageKey?: string; // CRITICAL: Unique storage key per tab for sessionStorage isolation
  workspacePath?: string; // CRITICAL: workspacePath (tabName) to load data from database
  nodeId?: string; // CRITICAL: Node ID from FlexLayout for robust identification
  nodeConfig?: any; // CRITICAL: Original node configuration for reference
}
