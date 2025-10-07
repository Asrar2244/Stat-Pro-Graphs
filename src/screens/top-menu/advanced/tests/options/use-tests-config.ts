import cloneDeep from 'lodash.clonedeep';
import { create } from 'zustand';

interface IAssumptionChecking {
  "P_value_reject": number;
  "shaprio_walk": boolean;
  "kolmo_with_correction": boolean;
  "normality": boolean;
  "populationMean": string;
};

interface IResults {
  "summary_table": boolean;
  "confidence_level": number;
  "isConfidenceSelected": boolean;
  //To-Do: will be added later
  // "residual_in_column": any
};

interface IPostHocTests {
  "alpha_value": number;
  "isAlphaSelected": boolean;
}
interface IModelStats {
  assumptionChecking: IAssumptionChecking;
  results: IResults;
  postHocTests: IPostHocTests;
};


interface IBasicStatics {
  model: IModelStats;
  setReset: () => void;
  setModelBulk: (list: IAssumptionChecking | IResults | IPostHocTests, type: string) => void;
  setModel: (list: IModelStats) => void
}

export const initialConfig = {
  model: {
    assumptionChecking: {
      "P_value_reject": 0.05,
      "shaprio_walk": true,
      "kolmo_with_correction": false,
      "normality": true,
      populationMean: "50"
    },
    results: {
      "summary_table": true,
      "confidence_level": 95,
      "isConfidenceSelected": false
    },
    postHocTests: {
      "alpha_value": 0.050,
      "isAlphaSelected": false
    }
  }
}

export const useTestsStats = create<IBasicStatics>((set) => ({
  ...cloneDeep(initialConfig),
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
      return { ...initialConfig };
    });
  },
}));
