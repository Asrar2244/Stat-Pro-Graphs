import { useShallow } from 'zustand/react/shallow';
import { create } from 'zustand';

interface IModel {
  includeConst: boolean;
  availableList: Map<string, boolean>;
  dependentList: Map<string, boolean>;
  independentList: Map<string, boolean>;
}

interface IEstimate {
  confidence: string;
  vifThreshold: string;
}

interface IMultipleLinearStore {
  model: IModel;
  estimate: IEstimate;
  setModel: (update: Partial<IModel>) => void;
  setEstimate: (update: Partial<IEstimate>) => void;
  setModelBulk: (list: Map<string, boolean>, listName: string) => void;
  reset: () => void;
  isAnalyzeDisabled: boolean;
}

const initialModel: IModel = {
  includeConst: true,
  availableList: new Map(),
  dependentList: new Map(),
  independentList: new Map(),
};

const initialEstimate: IEstimate = {
  confidence: '0.95',
  vifThreshold: '5.0',
};

export const useMultipleLinear = create<IMultipleLinearStore>((set, get) => ({
  model: initialModel,
  estimate: initialEstimate,

  setModel: (update) =>
    set((state) => ({
      model: { ...state.model, ...update },
    })),

  setEstimate: (update) =>
    set((state) => ({
      estimate: { ...state.estimate, ...update },
    })),

  setModelBulk: (list, listName) =>
    set((state) => ({
      model: { ...state.model, [listName]: new Map(list) },
    })),

  reset: () =>
    set({
      model: initialModel,
      estimate: initialEstimate,
    }),

  get isAnalyzeDisabled() {
    const { model } = get();
    return model.dependentList.size === 0 || model.independentList.size === 0;
  },
}));