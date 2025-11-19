import { create } from 'zustand';
import cloneDeep from 'lodash.clonedeep';

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
  maxFeatures: string;
  metric: string;
  vifThreshold: string;
  forceFeatures: string;
}
interface IBestSubset {
  model: IModel;
  estimate: IEstimate;
  setModelBulk(payload: Map<string, boolean>, listName: string): void;
  setModel: (payload: IPayload) => void;
  setEstimate: (payload: IPayload) => void;
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
    maxFeatures: '4',
    metric: 'bic',
    vifThreshold: '5.0',
    forceFeatures: '',
  },
};
export const useBestSubset = create<IBestSubset>((set) => ({
  ...(cloneDeep(initValues)),
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
  setReset(): void {
    set(initValues);
  },
}));