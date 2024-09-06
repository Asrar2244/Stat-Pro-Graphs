import { create } from 'zustand';

interface IPayload {
  [key: string]: any;
}
interface IModel {
  availableList: Map<string, boolean>;
  dependentList: Map<string, boolean>;
  independentList: Map<string, boolean>;
  includeConst: boolean;
  save: boolean;
  init: boolean;
}
interface IEstimate {
  confidence: string;
  tolerance: string;
  estimation: string;
  mixModel: boolean;
  direction: string;
  control: string;
  maxStep: string;
  force: string;
  probability: boolean;
  propEnter: string;
  propRemove: string;
  fStatistic: boolean;
  fStatisticEnter: string;
  fStatisticRemove: string;
}
interface IOptions {
  kolmogorovSmirnov: boolean;
  shapiroWilk: boolean;
  andersonDArling: boolean;
}
interface IPredict {
  predictForNewObservation: boolean;
  save: boolean;
  savePrediction: string;
  confidence: string;
}
interface IResampling {
  performResampling: boolean;
  method: string;
  bootstrap: string;
  noOfSamples: string;
  sampleSize: string;
  randomSeed: string;
  confidence: string;
}
interface ILinearLeastSquare {
  model: IModel;
  estimate: IEstimate;
  options: IOptions;
  predict: IPredict;
  resampling: IResampling;
  setModelBulk(payload: Map<string, boolean>, listName: string): void;
  setModel: (payload: IPayload) => void;
  setEstimate: (payload: IPayload) => void;
  setOptions: (payload: IPayload) => void;
  setPredict: (payload: IPayload) => void;
  setResampling: (payload: IPayload) => void;
  setReset: () => void;
}
const initValues = {
  model: {
    availableList: new Map<string, boolean>(),
    dependentList: new Map<string, boolean>(),
    independentList: new Map<string, boolean>(),
    includeConst: true,
    save: false,
    init: false,
  },
  estimate: {
    confidence: '0.95',
    tolerance: '1e-012',
    control: 'automatic',
    direction: 'backward',
    probability: true,
    propEnter: '0.15',
    propRemove: '0.15',
    fStatistic: false,
    fStatisticEnter: '4',
    fStatisticRemove: '3.9',
    estimation: 'complete',
    mixModel: false,
    force: '0',
    maxStep: '15',
  },
  options: {
    andersonDArling: false,
    kolmogorovSmirnov: false,
    shapiroWilk: false,
  },
  predict: {
    predictForNewObservation: false,
    save: false,
    savePrediction: 'Prediction',
    confidence: '0.95',
  },
  resampling: {
    performResampling: false,
    method: 'Bootstrap',
    bootstrap: 'Cases',
    confidence: '0.95',
    noOfSamples: '1',
    randomSeed: '',
    sampleSize: '',
  },
};
export const useLinearLeastSquares = create<ILinearLeastSquare>((set) => ({
  ...initValues,
  setModel(payload): void {
    set((state: any) => {
      const model = state.model;
      return { ...state, model: { ...model, ...payload } };
    });
  },
  setModelBulk(payload, listName): void {
    set((state: any) => {
      return { ...state, model: { ...state.model, [listName]: payload } };
    });
  },

  setEstimate(payload): void {
    set((state: any) => {
      const estimate = state.estimate;
      return { ...state, estimate: { ...estimate, ...payload } };
    });
  },
  setOptions(payload): void {
    set((state: any) => {
      const options = state.options;
      return { ...state, options: { ...options, ...payload } };
    });
  },
  setPredict(payload): void {
    set((state: any) => {
      const predict = state.predict;
      return { ...state, predict: { ...predict, ...payload } };
    });
  },
  setResampling(payload): void {
    set((state: any) => {
      const resampling = state.resampling;
      return { ...state, resampling: { ...resampling, ...payload } };
    });
  },
  setReset(): void {
    set(initValues);
  },
}));
