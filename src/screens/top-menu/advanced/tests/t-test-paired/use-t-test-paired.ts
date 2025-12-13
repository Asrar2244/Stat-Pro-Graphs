import cloneDeep from 'lodash.clonedeep';
import { create } from 'zustand';

type IList = Map<string, boolean>;

interface IModelStats {
  dataFormat: IDataFormat;
};

interface IDataFormat {
  availableList?: IList;
  indexed: {
    subject: IList,
    data: IList,
    treatment: IList
  }
  raw_data: { 
    after: IList, 
    before: IList 
  }
}

interface IBasicStatics {
  model: IModelStats;
  setReset: () => void;
  setModelBulk: (list: any, type: string) => void;
  setModel: (list: IModelStats) => void
}

const initial = {
  model: {
    dataFormat: {
      availableList: new Map<string, boolean>(),
      indexed: {
        subject: new Map<string, boolean>(),
        data: new Map<string, boolean>(),
        treatment: new Map<string, boolean>(),
      },
      raw_data: { 
        after: new Map<string, boolean>(), 
        before: new Map<string, boolean>() 
      }
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
