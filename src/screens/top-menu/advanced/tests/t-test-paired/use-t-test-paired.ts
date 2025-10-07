import cloneDeep from 'lodash.clonedeep';
import { create } from 'zustand';

interface IModelStats {
  dataFormat: IDataFormat;
};

interface IDataFormat {
  indexed: {
    subject: string[],
    data: string[],
    treatment: string[]
  }
  raw_data: { after: string[], before: string[] }
}

interface IBasicStatics {
  model: IModelStats;
  setReset: () => void;
  setModelBulk: (list: IDataFormat, type: string) => void;
  setModel: (list: IModelStats) => void
}

const initial = {
  model: {
    dataFormat: {
      indexed: {
        subject: [],
        data: [],
        treatment: [],
      },
      raw_data: { after: [], before: [] }
    }
  }
}

export const usePairedTTestsStats = create<IBasicStatics>((set) => ({
  ...cloneDeep(initial),
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
