import { create } from 'zustand';
type IDetailEmptyData = {
  dataState?: 'draft' | 'published';
  processData?: boolean;
  nodeId: string;
  canDelete?: boolean;
};
interface IEmptyDataStore {
  nodes: IDetailEmptyData;
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
