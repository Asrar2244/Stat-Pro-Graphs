import cloneDeep from 'lodash.clonedeep';
import { create } from 'zustand';

interface IBasicStatics {
  model: {
    mainSelectedList: Map<string, boolean>;
    availableList: Map<string, boolean>
  };
  setReset: () => void;
  setModelBulk: (list: Map<string, boolean>, type: string) => void;
  setModel: (list: Record<string, Map<string, boolean>>) => void
}
export type IBasicTypes = 'mainSelectedList';
const initial = {
  model: {
    mainSelectedList: new Map<string, boolean>(),
    availableList: new Map<string, boolean>(),
  }
};

export const useDescriptiveStatistics = create<IBasicStatics>((set) => ({
  ...(cloneDeep(initial)),
  setModel(payload): void {
    set((state: any) => {
      const model = state.model;
      return { ...state, model: { ...model, ...payload } };
    });
  },
  setModelBulk(payload, type): void {
    set((state: IBasicStatics) => {
      return { ...state, model: { ...cloneDeep(state.model), [type]: payload } };
    });
  },

  setReset: () => {
    set(() => {
      return { ...initial };
    });
  },
}));
