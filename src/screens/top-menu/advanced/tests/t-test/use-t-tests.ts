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
  availableList?: Map<string, boolean>;
  dataList?: Map<string, boolean>;
}

interface IBasicStatics {
  model: IModelStats;
  setReset: () => void;
  setModelBulk: (list: IDataFormat | IPopulationMean | Map<string, boolean>, type: string) => void;
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
      sample: [],
      availableList: new Map<string, boolean>(),
      dataList: new Map<string, boolean>()
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
      if (type === 'availableList' || type === 'dataList') {
        // Handle Map updates for availableList and dataList
        const newDataFormat = { ...cloneDeep(state.model.dataFormat) };
        if (type === 'availableList') {
          newDataFormat.availableList = payload as Map<string, boolean>;
        } else if (type === 'dataList') {
          newDataFormat.dataList = payload as Map<string, boolean>;
          // Update sample array for backward compatibility
          newDataFormat.sample = Array.from((payload as Map<string, boolean>).keys());
        }
        return { ...state, model: { ...cloneDeep(state.model), dataFormat: newDataFormat } };
      }
      return { ...state, model: { ...cloneDeep(state.model), [type]: payload } };
    });
  },
  setReset: () => {
    set(() => {
      return { ...initial };
    });
  },
}));
