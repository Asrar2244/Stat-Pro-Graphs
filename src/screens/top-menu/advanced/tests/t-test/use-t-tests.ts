import cloneDeep from 'lodash.clonedeep';
import { create } from 'zustand';

interface IPopulationMean {
  population_mean: number
}

interface IModelStats {
  dataFormat: IDataFormat;
  populationMean: IPopulationMean
};

interface IDataFormat {
  values: {
    size: string;
    mean: string;
    deviation: string;
    standard_error: string;
  }
  sample: string[]
}

interface IBasicStatics {
  model: IModelStats;
  setReset: () => void;
  setModelBulk: (list: IDataFormat | IPopulationMean, type: string) => void;
  setModel: (list: IModelStats) => void
}

const initial = {
  model: {
    populationMean: {
      "population_mean": 50
    },
    dataFormat: {
      values: {
        size: "",
        mean: "",
        deviation: "",
        standard_error: ""
      },
      sample: []
    }
  }
}

export const useTTestsStats = create<IBasicStatics>((set) => ({
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
